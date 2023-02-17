import { useEffect, useContext, useRef, useCallback } from 'react';
import { StoreContext } from './Store';
import { SET_HISTORY, SET_FILTERED_HISTORY, SET_FILTERED_COMP_RUNS } from './reducer';
import { doFetch } from './Scope.Api';
import SvgSpinner from './ICONS/SvgSpinner';
import _ from 'lodash';
import dayjs from 'dayjs';
import ComparePanel from './ComparePanel';
import CompareToolbar from './CompareToolbar';
import RunsPanel from './RunsPanel';
import RunsToolbar from './RunsToolbar';
import { reportError } from './Utils';
import { useToaster } from './Toaster';
import useForceUpdate from './useForceUpdate';
import AnimatedPanel from './AnimatedPanel';
import ColumnSelector from './ColumnSelector';
import { useTooltip } from './Tooltip';
import { auth_info, column_selector_on, show_all_history } from './atoms';
import { useAtomValue } from 'jotai';

const HistoryPanel = () => {
  const store = useContext(StoreContext);
  const { state, dispatch } = store;
  const { history, historyFilter, compareRuns, compSelectorFilter } = state;
  const { selectedRun, selectedSleeve, compare, compareRun } = state;
  const addToast = useToaster();
  const forceUpdate = useForceUpdate(true);
  const l = useRef({}).current;
  const { showTooltip, hideTooltip } = useTooltip();
  const auth = useAtomValue(auth_info);
  const columnSelectorOn = useAtomValue(column_selector_on);
  const showAllHistory = useAtomValue(show_all_history);

  const getHistory = useCallback(() => {
    const setFetching = (set) => {
      l.fetching = set;
      forceUpdate();
    };

    if (!auth?.isAuthenticated || l.fetching || !selectedSleeve || history) {
      return;
    }

    setFetching(true);

    loadHistory(auth, dispatch, selectedSleeve.Id, showAllHistory, (res) => {
      reportError(addToast, res);
      if (l.mounted) {
        setFetching(false);
      }
    });
  }, [addToast, auth, dispatch, l, selectedSleeve, forceUpdate, showAllHistory, history]);

  useEffect(() => {
    l.mounted = true;

    getHistory();

    return () => {
      l.mounted = false;
    };
  }, [l, getHistory]);

  useEffect(() => {
    const filter = historyFilter ? historyFilter[0] : null;

    const runs = filter
      ? _.filter(
        history,
        (item) =>
          _.includes(item.Timestamp?.toUpperCase(), filter) ||
          _.includes(item.Operation.toUpperCase(), filter) ||
          _.includes(item.User?.toUpperCase(), filter) ||
          _.includes(item.Comment?.toUpperCase(), filter)
      )
      : history;

    dispatch({ type: SET_FILTERED_HISTORY, runs });
  }, [history, historyFilter, dispatch]);

  useEffect(() => {
    const filter = compSelectorFilter ? compSelectorFilter[0] : null;

    const runs = filter
      ? _.filter(
        compareRuns,
        (run) =>
          _.includes(run.Timestamp?.toUpperCase(), filter) ||
          _.includes(run.Operation.toUpperCase(), filter) ||
          _.includes(run.User?.toUpperCase(), filter) ||
          _.includes(run.Comment?.toUpperCase(), filter)
      )
      : compareRuns;

    dispatch({ type: SET_FILTERED_COMP_RUNS, runs });
  }, [compareRuns, compSelectorFilter, dispatch]);

  if (!selectedSleeve) {
    return <div id="select-sleeve-prompt">Please select a sleeve on the left.</div>;
  }

  if (l.fetching) {
    return (
      <div className="section" style={{ gridArea: '3/1' }}>
        <SvgSpinner width={160} style={{ gridArea: '3/1', placeSelf: 'center' }} />
      </div>
    );
  }

  if (!history?.length) {
    return null;
  }

  const classes = `oh-item-info ${compareRun ? 'selected-run-compare-info' : ''}`;
  const sid = 'selected-run-info';
  const cid = 'compare-run-info';
  const stip = selectedRun?.Comment || 'No comment';
  const ctip = compareRun?.Comment || 'No comment';

  return (
    <div id="oh-view" className="log-view">
      <AnimatedPanel id="oh-toolbar" classes="section-header log-bar">
        {compare ? <CompareToolbar /> : <RunsToolbar />}
        {selectedRun && (
          <div
            id={sid}
            className={classes}
            onMouseEnter={(e) => showTooltip({ e, dx: stip.length > 50 ? -100 : 0, text: stip })}
            onMouseLeave={hideTooltip}>
            {`${selectedRun.Timestamp}  •  ${selectedRun.User}`}
          </div>
        )}
        {compareRun && (
          <div
            id={cid}
            className="oh-item-info compare-run-info"
            onMouseEnter={(e) => showTooltip({ e, dx: ctip.length > 50 ? -100 : 0, text: ctip })}
            onMouseLeave={hideTooltip}>{`${compareRun.Timestamp}  •  ${compareRun.User}`}</div>
        )}
      </AnimatedPanel>
      {compare ? <ComparePanel /> : <RunsPanel />}
      {columnSelectorOn && <ColumnSelector />}
    </div>
  );
};

export default HistoryPanel;

export const loadHistory = (auth, dispatch, sleeveId, all = false, resolve = null) => {
  doFetch(`GetRequestHistories?sleeveId=${sleeveId}&lookBackDays=${all ? 3650 : 60}`, null, auth, (res) => {
    if (res.ok) {
      res.data = _.filter(res.data, (item) => item.Operation === 'ExecuteOptimizer');
      _.each(res.data, (item) => {
        item.Timestamp = dayjs(item.Timestamp).format('YYYY-MM-DD HH:mm:ss');
        item.Operation = 'Run Optimizer';
      });
      dispatch({ type: SET_HISTORY, history: res.data });
    } else {
      dispatch({ type: SET_HISTORY, history: [] });
    }

    if (resolve) {
      resolve(res);
    }
  });
};
