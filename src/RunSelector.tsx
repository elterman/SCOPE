import React, { useEffect, useState, useContext, useRef } from 'react';
import { StoreContext } from './Store';
import { SET_CURRENT_COMP_SELECTOR_PAGE, SET_COMPARE_RUN, SET_COMP_TABLE } from './reducer';
import { SET_SELECTED_RUN, SET_RT_AGGREGATES } from './reducer';
import { SET_RUN_TABLE, SET_SELECTED_RUN_SCROLL_TO, SET_RUN_SETTINGS } from './reducer';
import { SET_CURRENT_HISTORY_PAGE, SET_RUN_SELECTOR_WIDTH } from './reducer';
import _ from 'lodash';
import { OFF_WHITE, BLUE, DEFAULT_RUN_SELECTOR_WIDTH } from './const';
import { reportError, setColumnSizes, syncScroll } from './Utils';
import Paginator from './Paginator';
import SvgToggle from './ICONS/SvgToggle';
import { doFetch } from './Scope.Api';
import { useToaster } from './Toaster';
import { useSpring, animated } from 'react-spring';
import { unExponent } from './Utils';
import useColumns from './useColumns';
import useSmfRequests from './useSmfRequests';
import { useTooltip } from './Tooltip';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { comp_column_sizes, run_column_sizes, run_fetching, run_trading_list } from './atoms';
import { auth_info, comp_column_metadata, comp_selector_page_size, history_page_size, my_wait, run_column_metadata } from './atoms';

const RunSelector = (props: any) => {
  const { wx } = props;
  const store = useContext(StoreContext);
  const { state, dispatch } = store;
  const { compare, selectedRun, compareRun, selectedRunScrollTo, runSelectorWidth, runTable } = state;
  const s = state;
  const filteredRuns = compare ? s.filteredCompRuns : s.filteredRuns;
  const [pageSize, setPageSize] = useAtom(compare ? comp_selector_page_size : history_page_size);
  const currPage = compare ? s.currentCompSelectorPage : s.currentHistoryPage;
  const [rows, setRows] = useState([]);
  const addToast = useToaster();
  const { orderData } = useColumns();
  const l: any = useRef({}).current;
  l.pageCount = Math.ceil(filteredRuns ? filteredRuns.length / pageSize : 0);
  const { updatePaceIds } = useSmfRequests(runTable);
  const { showTooltip, hideTooltip } = useTooltip();
  const { spring } = useSpring({ spring: 1, from: { spring: 0 }, immediate: compare ? compareRun : selectedRun });
  const setWait = useSetAtom(my_wait);
  const auth = useAtomValue(auth_info);
  const setRunColumnMetadata = useSetAtom(run_column_metadata);
  const setCompColumnMetadata = useSetAtom(comp_column_metadata);
  const setRunColumnSizes = useSetAtom(run_column_sizes);
  const setCompColumnSizes = useSetAtom(comp_column_sizes);
  const setTradingList = useSetAtom(run_trading_list);
  const setRunFetching = useSetAtom(run_fetching);

  useEffect(() => {
    if (!filteredRuns) {
      return;
    }

    if (l.pageCount && currPage > l.pageCount) {
      dispatch({ type: compare ? SET_CURRENT_COMP_SELECTOR_PAGE : SET_CURRENT_HISTORY_PAGE, page: l.pageCount });
      return;
    }

    const index = (currPage - 1) * pageSize;
    const subset = filteredRuns.slice(index, index + pageSize);
    setRows(subset);
  }, [filteredRuns, currPage, dispatch, pageSize, l.pageCount, compare]);

  useEffect(() => {
    if (!compare && selectedRunScrollTo) {
      l.grid?.scrollTo(0, selectedRunScrollTo);
    }
  }, [rows, l.grid, selectedRunScrollTo, compare]);

  const selectRun = (run: any) => {
    if (compare) {
      selectCompareRun(run);
      return;
    }

    if (run === selectedRun) {
      return;
    }

    hideTooltip();
    dispatch({ type: SET_SELECTED_RUN, run });
    dispatch({ type: SET_SELECTED_RUN_SCROLL_TO, pos: l.grid.scrollTop });

    getRunDetails(run);
  };

  const selectCompareRun = (run: any) => {
    setWait(true);
    _.delay(() => setWait(false), 200);

    hideTooltip();
    dispatch({ type: SET_COMPARE_RUN, run });
    setRunFetching(true);

    doFetch(`CompareOptimizerRuns?baseHistoryId=${selectedRun.Id}&compareHistoryId=${run.Id}`, null, auth, (res: any) => {
      setRunFetching(false);

      if (res.ok) {
        const dt = res.data.DataTable;
        unExponent(dt);
        orderData(dt);

        dispatch({ type: SET_COMP_TABLE, table: dt });
        setCompColumnMetadata(res.data.ColumnMetadata);

        setColumnSizes({
          table: res.data.DataTable,
          aggregates: null,
          metadata: res.data.ColumnMetadata,
          type: comp_column_sizes,
          setter: setCompColumnSizes,
        });
      } else {
        reportError(addToast, res);
      }
    });
  };

  const getRunDetails = (run: any) => {
    setWait(true);
    setRunFetching(true);

    doFetch(`GetRunDetails?requestHistoryId=${run.Id}`, null, auth, (res: any) => onDataReceived(run, res));
  };

  const onDataReceived = (run: any, res: any) => {
    if (res.ok) {
      run.settings = res.data.OptimizerSettings;
      dispatch({ type: SET_RUN_SETTINGS, settings: run.settings });

      const dt = res.data.DataTable;
      unExponent(dt);
      orderData(res.data.DataTable);
      updatePaceIds(dt);

      dispatch({ type: SET_RUN_TABLE, table: dt });

      const aggregates = [res.data.Aggregates, res.data.AggregateDeltas, res.data.BenchmarkAggregates];
      orderData(aggregates);
      dispatch({ type: SET_RT_AGGREGATES, aggregates });

      setTradingList(res.data.TradingList);

      setRunColumnMetadata(res.data.ColumnMetadata);
      setColumnSizes({
        table: res.data.DataTable,
        aggregates,
        metadata: res.data.ColumnMetadata,
        type: run_column_sizes,
        setter: setRunColumnSizes,
      });
    } else {
      reportError(addToast, res);
    }

    setWait(false);
    setRunFetching(false);
  };

  const handleToggle = () => {
    dispatch({ type: SET_RUN_SELECTOR_WIDTH, width: runSelectorWidth === wx - 10 ? DEFAULT_RUN_SELECTOR_WIDTH : 0 });
  };

  return (
    <div id="runs-selector" className="runs-grid">
      <div id="oh-headers" className="log-item oh-item grid-header" style={{ gridArea: '1/1' }}>
        <div>Optimizer Run</div>
        <div>User</div>
        <div>Comment</div>
        <div>&nbsp;</div>
      </div>
      <animated.div
        id="oh-grid"
        className="dt-scroll-pane root-scroll"
        style={{ gridArea: '2/1', transform: spring.interpolate((s: any) => `translateX(${(1 - s) * 100}%)`) }}
        ref={(e) => (l.grid = e)}
        onScroll={(e: any) => syncScroll('oh-headers', e.target.scrollLeft)}>
        {_.map(rows, (run: any, i: any) => {
          const selected = run.Timestamp === (compare ? compareRun?.Timestamp : selectedRun?.Timestamp);
          const background = selected ? '#000' : i % 2 ? '#0003' : '#0004';
          const exp = run.Operation === 'Export To Excel';
          const color = selected ? BLUE : exp ? '#8e8a' : OFF_WHITE;
          const cursor = selected ? 'initial' : 'pointer';

          return (
            <div
              id={`id-grid-row${i + 1}`}
              key={i}
              className="log-item oh-item"
              style={{ background, color, cursor }}
              onClick={() => selectRun(run)}>
              <div>{run.Timestamp}</div>
              <div className="ellipsis">{run.User}</div>
              <div className="ellipsis" onMouseEnter={(e) => showTooltip({ e, text: run.Comment })} onMouseLeave={hideTooltip}>
                {run.Comment}
              </div>
            </div>
          );
        })}
      </animated.div>
      {rows.length > 0 && (
        <Paginator
          grid={l.grid}
          style={{ gridArea: '3/1' }}
          pageCount={l.pageCount}
          currentPage={currPage}
          pageSize={pageSize}
          rows={filteredRuns.length}
          setPageSize={(size: number) => setPageSize(size)}
          setCurrentPage={(page: number) => dispatch({ type: compare ? SET_CURRENT_COMP_SELECTOR_PAGE : SET_CURRENT_HISTORY_PAGE, page })}
        />
      )}
      {!compare && selectedRun && (
        <div
          id="run-selector-toggle"
          className="settings-pane-toggle"
          style={{ gridArea: '1/1/span 3/1', justifySelf: 'end', transform: 'translate(0, -46px)' }}
          onClick={handleToggle}>
          <SvgToggle width={15} left={true} invert={true} color={runSelectorWidth === wx - 10 ? '#f00' : OFF_WHITE} />
        </div>
      )}
    </div>
  );
};

export default RunSelector;
