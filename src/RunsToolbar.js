import { useState, useContext, useRef } from 'react';
import { StoreContext } from './Store';
import { SET_HISTORY_FILTER, SET_COMPARE } from './reducer';
import { SET_OPTIM_SETTINGS, SET_RT_FILTERS } from './reducer';
import SvgCompare from './ICONS/SvgCompare';
import SvgApply from './ICONS/SvgApply';
import SvgUnfilter from './ICONS/SvgUnfilter';
import SvgExcelNew from './ICONS/SvgExcelNew';
import SvgColumns from './ICONS/SvgColumns';
import { COLUMNS_BUTTON_TOOLTIP, TAB_OPTIMIZE } from './const';
import Button from './Button';
import { useToaster } from './Toaster';
import _ from 'lodash';
import CheckBox from './CheckBox';
import { loadHistory } from './HistoryPanel';
import { exportToExcel, reportError } from './Utils';
import dayjs from 'dayjs';
import SvgTrade from './ICONS/SvgTrade';
import SvgSpinner from './ICONS/SvgSpinner';
import SvgSend from './ICONS/SvgSend';
import usePostToTrading from './usePostToTrading';
import useSmfRequests from './useSmfRequests';
import { as_of_date, auth_info, column_selector_on, my_wait, new_smf_requests, run_column_metadata, run_trading_list, selected_tab, show_all_history } from './atoms';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useTooltip } from './Tooltip';

const RunsToolbar = () => {
  const store = useContext(StoreContext);
  const { state, dispatch } = store;
  const { selectedSleeve, historyFilter, selectedRunSettings, runAggregates, nonExportableColumns } = state;
  const { selectedRun, dt, runTable, filteredRunTable, runTableFilters } = state;
  const newSmfRequests = useAtomValue(new_smf_requests);
  const wait = useAtomValue(my_wait);
  const canApplySettings = selectedRun && !wait;
  const addToast = useToaster();
  const l = useRef({}).current;
  const postToTrading = usePostToTrading(true);
  const [posting, setPosting] = useState(false);
  const runTradingList = useAtomValue(run_trading_list);
  const canPostToTrading = !posting && runTradingList?.length;
  const [submitting, setSubmitting] = useState(false);
  const canSubmit = !submitting && newSmfRequests.length;
  const { submitSmfRequest, buttonLabel } = useSmfRequests(runTable);
  const { hideTooltip } = useTooltip();
  const setFilter = (filter) => dispatch({ type: SET_HISTORY_FILTER, filter });
  const asOfDate = useAtomValue(as_of_date);
  const auth = useAtomValue(auth_info);
  const setSelectedTab = useSetAtom(selected_tab);
  const setColumnSelectorOn = useSetAtom(column_selector_on);
  const [showAllHistory, setShowAllHistory] = useAtom(show_all_history);
  const runColumnMetadata = useAtomValue(run_column_metadata);

  const handleSearchInput = (e) => {
    const filter = e.target.value;
    setFilter([filter?.toUpperCase(), filter]);
  };

  const handleSearchX = () => {
    if (!historyFilter) {
      return;
    }

    setFilter(null);
    l.searchBox.focus();
  };

  const applySettings = () => {
    if (!canApplySettings) {
      return;
    }

    hideTooltip();

    const BASE_COUNT = 719529;
    const diff = dayjs(asOfDate).diff(dayjs('1970-01-01'), 'day');
    const runDate = BASE_COUNT + diff;

    dispatch({ type: SET_OPTIM_SETTINGS, settings: { ...selectedRunSettings, runDate } });
    setSelectedTab(TAB_OPTIMIZE);

    setTimeout(() => addToast({ type: 'success', duration: 3000, message: `Applied settings from ${selectedRun.Timestamp}.` }), 1000);
  };

  const showCompare = () => {
    if (selectedRun) {
      hideTooltip();
      dispatch({ type: SET_COMPARE, show: true });
    }
  };

  const removeFilters = () => {
    if (!_.isEmpty(runTableFilters)) {
      dispatch({ type: SET_RT_FILTERS, filters: [] });
    }
  };

  const handleToggleAllHistory = () => {
    const all = !showAllHistory;
    setShowAllHistory(all);
    loadHistory(auth, dispatch, selectedSleeve.Id, all, (res) => reportError(addToast, res));
  };

  const handleSubmitSmfRequest = () => {
    setSubmitting(true);
    submitSmfRequest(() => setSubmitting(false));
  };

  const handlePostToTrading = () => {
    setPosting(true);
    postToTrading((res) => setPosting(false));
  };

  return (
    <>
      <CheckBox label="Last 60 days only" checked={!showAllHistory} handleToggle={handleToggleAllHistory} />
      <div id="oh-inner-header" className="log-search" style={{ gridArea: '1/2' }}>
        <input
          id="oh-search-box"
          className="search-box"
          type="text"
          placeholder="search"
          spellCheck="false"
          onChange={handleSearchInput}
          value={historyFilter ? historyFilter[1] : ''}
          ref={(e) => (l.searchBox = e)}
        />
        <div id="oh-search-x" className={`search-x ${historyFilter ? 'search-x-enabled' : ''}`} onClick={handleSearchX}>
          ×
        </div>
      </div>
      <Button
        id="oh-compare"
        style={{ gridArea: '1/3' }}
        label="Compare..."
        handleClick={showCompare}
        disabled={!selectedRun}
        tooltip="Proceed to select a second run to compare with the currently selected one">
        <SvgCompare width={14} />
      </Button>
      {dt.length > 0 && (
        <Button
          id="oh-apply"
          style={{ gridArea: '1/4' }}
          label="Apply Selected Settings"
          handleClick={applySettings}
          disabled={!canApplySettings}
          tooltip="Swicth to Optimize and apply the selected run's optimizer settings">
          <SvgApply width={18} disabled={!canApplySettings} />
        </Button>
      )}
      {runTable?.length > 0 && (
        <Button
          id="run-btn-smf-request"
          disabled={!canSubmit}
          label={submitting ? 'Submitting...' : buttonLabel()}
          style={{ gridArea: `1/${dt.length > 0 ? 5 : 4}`, minWidth: '200px' }}
          handleClick={handleSubmitSmfRequest}>
          {submitting ? <SvgSpinner width={18} /> : <SvgSend width={16} disabled={!canSubmit} />}
        </Button>
      )}
      {runTable?.length > 0 && (
        <Button
          id="run-btn-ptt"
          disabled={!canPostToTrading}
          label={posting ? 'Posting...' : 'Post to Trading'}
          style={{ gridArea: `1/${dt.length > 0 ? 6 : 5}` }}
          tooltip={canPostToTrading ? null : 'Some holdings were not available in Aladdin during this optimization. Cannot Post to Trading.'}
          handleClick={handlePostToTrading}>
          {posting ? <SvgSpinner width={18} /> : <SvgTrade width={18} disabled={!canPostToTrading} />}
        </Button>
      )}
      {runTable?.length > 0 && (
        <Button
          id="opt-btn-export"
          style={{ gridArea: `1/${dt.length > 0 ? 7 : 8}`, padding: '0 7px' }}
          tooltip="Export filtered data and settings"
          handleClick={() =>
            exportToExcel({
              data: filteredRunTable,
              aggregates: runAggregates,
              settings: selectedRunSettings,
              sleeve: selectedSleeve,
              run1: selectedRun,
              meta: runColumnMetadata,
              nonExportableColumns,
            })
          }>
          <SvgExcelNew width={18} />
        </Button>
      )}

      {runTable?.length > 0 && (
        <Button
          id="opt-btn-columns"
          style={{ gridArea: `1/${dt.length > 0 ? 7 : 6}`, padding: '0 7px' }}
          handleClick={() => {
            setColumnSelectorOn(true);
          }}
          tooltip={COLUMNS_BUTTON_TOOLTIP}>
          <SvgColumns width={18} />
        </Button>
      )
      }

      {
        runTable?.length > 0 && (
          <Button
            id="opt-btn-remove-filters"
            style={{ gridArea: `1/${dt.length > 0 ? 8 : 7}`, padding: '0 7px' }}
            disabled={_.isEmpty(runTableFilters)}
            tooltip="Remove all filters"
            handleClick={removeFilters}>
            <SvgUnfilter width={18} disabled={_.isEmpty(runTableFilters)} />
          </Button>
        )
      }
    </>
  );
};

export default RunsToolbar;
