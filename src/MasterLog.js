import { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { StoreContext } from './Store';
import { SET_FILTERED_LOG } from './reducer';
import { SET_CURRENT_LOG_PAGE } from './reducer';
import { doFetch } from './Scope.Api';
import SvgSpinner from './ICONS/SvgSpinner';
import _ from 'lodash';
import { OFF_WHITE, BLUE, TANGERINE } from './const';
import { reportError, syncScroll } from './Utils';
import dayjs from 'dayjs';
import Paginator from './Paginator';
import CheckBox from './CheckBox';
import { useToaster } from './Toaster';
import useForceUpdate from './useForceUpdate';
import AnimatedPanel from './AnimatedPanel';
import { useSpring, animated } from 'react-spring';
import { useTooltip } from './Tooltip';
import { auth_info, log_filter, log_page_size, master_log, selected_log_item, show_exports, show_runs, show_sso } from './atoms';
import { useAtom, useAtomValue } from 'jotai';

const MasterLog = () => {
  const store = useContext(StoreContext);
  const { state, dispatch } = store;
  const { filteredLog, currentLogPage, selectedSleeve } = state;
  const [logPageSize, setLogPageSize] = useAtom(log_page_size);
  const [rows, setRows] = useState([]);
  const addToast = useToaster();
  const forceUpdate = useForceUpdate(true);
  const [showRuns, setShowRuns] = useAtom(show_runs);
  const [showExports, setShowExports] = useAtom(show_exports);
  const [showSSO, setShowSSO] = useAtom(show_sso);
  const l = useRef({ showRuns, showExports, showSSO }).current;
  l.pageCount = Math.ceil(filteredLog ? filteredLog.length / logPageSize : 0);
  const { showTooltip, hideTooltip } = useTooltip();
  const auth = useAtomValue(auth_info);
  const [logFilter, setFilter] = useAtom(log_filter);
  const [log, setLog] = useAtom(master_log);
  const [selectedLogItem, setSelectedLogItem] = useAtom(selected_log_item);

  const { spring } = useSpring({ spring: 1, from: { spring: 0 } });

  const getLog = useCallback(() => {
    if (!auth?.isAuthenticated || l.fetching) {
      return;
    }

    const setFetching = (set) => {
      l.fetching = set;
      forceUpdate();
    };

    setFetching(true);

    loadLog({ auth, setLog, showRuns, showExports, showSSO, selectedSleeve }, (res) => {
      reportError(addToast, res);
      if (l.mounted) {
        setFetching(false);
      }
    });
  }, [auth, l, setLog, showRuns, showExports, showSSO, selectedSleeve, forceUpdate, addToast]);

  useEffect(() => {
    l.mounted = true;

    if (!log) {
      getLog();
    }

    return () => {
      l.mounted = false;
    };
  }, [log, l, getLog]);

  useEffect(() => {
    if (l.showRuns !== showRuns || l.showExports !== showExports || l.showSSO !== showSSO) {
      l.showRuns = showRuns;
      l.showExports = showExports;
      l.showSSO = showSSO;
      getLog();
    }
  }, [showRuns, showExports, showSSO, l, l.showRuns, l.showExports, l.showSSO, getLog]);

  useEffect(() => {
    const filter = logFilter ? logFilter[0] : null;

    const flog = filter
      ? _.filter(
        log,
        (run) =>
          _.includes(run.Timestamp?.toUpperCase(), filter) ||
          _.includes(run.FundName?.toUpperCase(), filter) ||
          _.includes(run.Alpha?.toUpperCase(), filter) ||
          _.includes(run.Bravo?.toUpperCase(), filter) ||
          _.includes(run.Operation.toUpperCase(), filter) ||
          _.includes(run.User?.toUpperCase(), filter) ||
          _.includes(run.Comment?.toUpperCase(), filter)
      )
      : log;

    dispatch({ type: SET_FILTERED_LOG, flog });
  }, [log, logFilter, dispatch]);

  useEffect(() => {
    if (!filteredLog) {
      return;
    }

    if (l.pageCount && currentLogPage > l.pageCount) {
      dispatch({ type: SET_CURRENT_LOG_PAGE, page: l.pageCount });
      return;
    }

    const index = (currentLogPage - 1) * logPageSize;
    const subset = filteredLog.slice(index, index + logPageSize);
    setRows(subset);
  }, [filteredLog, currentLogPage, dispatch, logPageSize, l.pageCount]);

  const handleSearchInput = (e) => {
    const filter = e.target.value;
    setFilter([filter?.toUpperCase(), filter]);
  };

  const handleSearchX = () => {
    if (!logFilter) {
      return;
    }

    setFilter(null);
    l.searchBox.focus();
  };

  const selectItem = (item) => {
    if (item !== selectedLogItem) {
      setSelectedLogItem(item);
    }
  };

  return (
    <div id="log-view" className="log-view">
      {log && (
        <AnimatedPanel id="log-toolbar" classes="section-header log-bar">
          <div id="log-inner-header" className="log-search">
            <input
              id="log-search-box"
              className="search-box"
              type="text"
              placeholder="search"
              spellCheck="false"
              onChange={handleSearchInput}
              value={logFilter ? logFilter[1] : ''}
              ref={(e) => (l.searchBox = e)}
            />
            <div id="log-search-x" className={`search-x ${logFilter ? 'search-x-enabled' : ''}`} onClick={handleSearchX}>
              ×
            </div>
          </div>
          <div style={{ margin: '0 0 0 10px', color: OFF_WHITE }}>Show:</div>
          <CheckBox checked={showRuns} label="runs" handleToggle={(show) => setShowRuns(show)} />
          <CheckBox
            checked={showExports}
            label="exports and posts to trading"
            handleToggle={(show) => setShowExports(show)}
          />
          {selectedSleeve && (
            <CheckBox
              checked={showSSO}
              label="selected sleeve only"
              handleToggle={(show) => setShowSSO(show)}
            />
          )}
        </AnimatedPanel>
      )}
      {log && (
        <div id="log-headers" className="log-item grid-header" style={{ gridArea: '2/1' }}>
          <div>Time</div>
          <div>Fund</div>
          <div>Alpha</div>
          <div>Bravo</div>
          <div>Operation</div>
          <div>User</div>
          <div>Comment</div>
          <div>&nbsp;</div>
        </div>
      )}
      <animated.div
        id="log-grid"
        ref={(e) => (l.grid = e)}
        className="dt-scroll-pane root-scroll"
        style={{ gridArea: '3/1', transform: spring.interpolate((s) => `translateX(${(1 - s) * 100}%)`) }}
        onScroll={(e) => syncScroll('log-headers', e.target.scrollLeft)}>
        {_.map(rows, (item, i) => {
          const selected = item.Timestamp === selectedLogItem?.Timestamp;
          const background = selected ? '#000' : i % 2 ? '#0003' : '#0004';
          const exp = item.Operation === 'Export To Excel';
          const post = item.Operation === 'Post To Trading';
          const color = selected ? BLUE : post ? TANGERINE : exp ? '#8e8a' : OFF_WHITE;
          const cursor = selected ? 'initial' : 'pointer';

          return (
            <div id={`log-grid-row${i + 1}`} key={i} className="log-item" style={{ background, color, cursor }} onClick={() => selectItem(item)}>
              <div>{item.Timestamp}</div>
              <div>{item.FundName}</div>
              <div>{item.Alpha}</div>
              <div>{item.Bravo}</div>
              <div>{item.Operation}</div>
              <div className="ellipsis">{item.User}</div>
              <div className="ellipsis" onMouseEnter={(e) => showTooltip({ e, text: item.Comment })} onMouseLeave={hideTooltip}>
                {item.Comment}
              </div>
            </div>
          );
        })}
      </animated.div>
      {l.fetching && <SvgSpinner width={160} style={{ gridArea: '3/1', placeSelf: 'center' }} />}
      {rows.length ? (
        <Paginator
          style={{ gridArea: '4/1' }}
          grid={l.grid}
          pageCount={l.pageCount}
          currentPage={currentLogPage}
          pageSize={logPageSize}
          rows={filteredLog.length}
          setPageSize={(size) => setLogPageSize(size)}
          setCurrentPage={(page) => dispatch({ type: SET_CURRENT_LOG_PAGE, page })}
        />
      ) : null}
    </div>
  );
};

export default MasterLog;

export const loadLog = (props, resolve = null) => {
  const { auth, setLog, showRuns, showExports, showSSO, selectedSleeve } = props;
  doFetch('GetRequestHistories', null, auth, (res) => {
    if (res.ok) {
      res.data = _.filter(res.data, (item) => {
        const op = item.Operation;
        if (op === 'ExecuteOptimizer') {
          if (showRuns) {
            item.Operation = 'Run Optimizer';
          } else {
            return false;
          }
        }

        if (op === 'ExportToExcel') {
          if (showExports) {
            item.Operation = 'Export To Excel';
          } else {
            return false;
          }
        }

        if (op === 'PostToTrading') {
          if (showExports) {
            item.Operation = 'Post To Trading';
          } else {
            return false;
          }
        }

        if (
          showSSO &&
          (item.FundName.toUpperCase() !== selectedSleeve.FundName.toUpperCase() ||
            item.Alpha.toUpperCase() !== selectedSleeve.Alpha.toUpperCase() ||
            item.Bravo.toUpperCase() !== selectedSleeve.Bravo.toUpperCase())
        ) {
          return false;
        }

        item.Timestamp = dayjs(item.Timestamp).format('YYYY-MM-DD HH:mm:ss');
        return true;
      });

      setLog(res.data);
    } else {
      setLog([]);
    }

    if (resolve) {
      resolve(res);
    }
  });
};
