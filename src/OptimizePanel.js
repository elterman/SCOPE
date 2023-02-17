import { useEffect, useContext, useState } from 'react';
import { StoreContext } from './Store';
import OptimTableView from './OptimTableView';
import OptimSettingsView from './OptimSettingsView';
import SvgLoad from './ICONS/SvgLoad';
import SvgArrow from './ICONS/SvgArrow';
import SvgUnfilter from './ICONS/SvgUnfilter';
import SvgSpinner from './ICONS/SvgSpinner';
import SvgRun from './ICONS/SvgRun';
import SvgSend from './ICONS/SvgSend';
import SvgTrade from './ICONS/SvgTrade';
import SvgExcelNew from './ICONS/SvgExcelNew';
import SvgToggle from './ICONS/SvgToggle';
import SvgColumns from './ICONS/SvgColumns';
import { doFetch } from './Scope.Api';
import { SET_DATA_TABLE, SET_OPTIM_SETTINGS, SET_LAYOUT } from './reducer';
import { SET_DIRTY_MAP, SET_COMMENT, SET_DT_FILTERS, SET_AGGREGATES, SET_OPTIM_SETTINGS_HIDDEN, SET_CAN_EXPORT_TARGETS } from './reducer';
import { SET_OPTIMIZED, SET_CURRENT_PAGE, SET_SELECTED_SLEEVE } from './reducer';
import { useToaster } from './Toaster';
import AsOfDate from './AsOfDate';
import { loadSleeves } from './SleeveSelector';
import _ from 'lodash';
import { loadLog } from './MasterLog';
import { loadHistory } from './HistoryPanel';
import dayjs from 'dayjs';
import { COLUMNS_BUTTON_TOOLTIP, LAYOUT_START, LAYOUT_WORKFLOW, OFF_WHITE } from './const';
import Button from './Button';
import { exportToExcel, getAccess, prevWorkday, reportError, setColumnSizes } from './Utils';
import AnimatedPanel from './AnimatedPanel';
import DatePickerView from './DatePickerView';
import { unExponent } from './Utils';
import useColumns from './useColumns';
import RadioButton from './RadioButton';
import CheckBox from './CheckBox';
import usePostToTrading from './usePostToTrading';
import ColumnSelector from './ColumnSelector';
import useSmfRequests from './useSmfRequests';
import { as_of_date, auth_info, can_post_to_trading, column_metadata, column_selector_on, date_picker_visible, include_orders, include_trades, master_log, optim_column_sizes, trading_list } from './atoms';
import { my_sleeves, new_smf_requests, security_id, show_all_history, show_exports, show_runs, show_sso, use_aladdin } from './atoms';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useTooltip } from './Tooltip';

const OptimizePanel = (props) => {
  const { getDetails } = props;
  const store = useContext(StoreContext);
  const { state, dispatch } = store;
  const datePickerVisible = useAtomValue(date_picker_visible);
  const { dt, ft, optimSettings, optimized, layout, filters } = state;
  const { selectedSleeve, dirtyMap, optimSettingsHidden, comment, aggregates } = state;
  const { canExportTargets, nonExportableColumns } = state;
  const newSmfRequests = useAtomValue(new_smf_requests);
  const [fetching, setFetching] = useState(false);
  const addToast = useToaster();
  const postToTrading = usePostToTrading(false);
  const { orderData } = useColumns();
  const [abortController, setAbortController] = useState(null);
  const { updatePaceIds, submitSmfRequest, buttonLabel } = useSmfRequests(dt);
  const [submitting, setSubmitting] = useState(false);
  const canSubmit = !submitting && newSmfRequests.length;
  const { hideTooltip } = useTooltip();
  const [aladdin, setAladdin] = useAtom(use_aladdin);
  const [includeTrades, setIncludeTrades] = useAtom(include_trades);
  const [includeOrders, setIncludeOrders] = useAtom(include_orders);
  const [canPostToTrading, setCanPostToTrading] = useAtom(can_post_to_trading);
  let [asOfDate, setDate] = useAtom(as_of_date);
  const auth = useAtomValue(auth_info);
  const showRuns = useAtomValue(show_runs);
  const showExports = useAtomValue(show_exports);
  const showSSO = useAtomValue(show_sso);
  const [columnSelectorOn, setColumnSelectorOn] = useAtom(column_selector_on);
  const [securityId, setSecurityId] = useAtom(security_id);
  const showAllHistory = useAtomValue(show_all_history);
  const [sleeves, setSleeves] = useAtom(my_sleeves);
  const setLog = useSetAtom(master_log);
  const [columnMetadata, setColumnMetadata] = useAtom(column_metadata);
  const setOptimColumnSizes = useSetAtom(optim_column_sizes);
  const setTradingList = useSetAtom(trading_list);

  useEffect(() => { !asOfDate && setDate(prevWorkday()); }, [asOfDate, setDate]);

  useEffect(() => {
    const sleeve = _.find(sleeves, (s) => s.Id === selectedSleeve?.Id);

    if (sleeve && sleeve !== selectedSleeve) {
      dispatch({ type: SET_SELECTED_SLEEVE, sleeve });
    }
  }, [sleeves, dispatch, selectedSleeve]);

  const onLoad = () => getDetails();

  const onExit = () => {
    hideTooltip();
    dispatch({ type: SET_LAYOUT, layout: LAYOUT_START });
    loadSleeves(auth, setSleeves, (res) => reportError(addToast, res));
  };

  const runOptimizer = () => {
    setFetching(true);
    setCanPostToTrading(false);

    const controller = new AbortController();
    const { signal } = controller;
    setAbortController(controller);

    doFetch(
      'ExecuteOptimizer',
      { DataTable: dt, Aggregates: aggregates[0], OptimizerSettings: optimSettings, SecurityID: securityId, Comment: comment },
      auth,
      (res) => onDataReceived(res),
      signal
    );
  };

  const onDataReceived = (res) => {
    setFetching(false);

    dispatch({ type: SET_CURRENT_PAGE, page: 1 });
    dispatch({ type: SET_DIRTY_MAP, map: new Map() });

    if (res.ok || res.data.ErrorMessage.includes('Post to Trading is unavailable')) {
      getAccess(auth, (ar) => {
        if (ar.idTokenClaims.roles.includes('ExcelExport')) {
          dispatch({ type: SET_CAN_EXPORT_TARGETS, ok: true });
        }
      });

      dispatch({ type: SET_OPTIMIZED, optimized: true });
      setCanPostToTrading(res.ok);

      const dt = res.data.DataTable;
      unExponent(dt);
      orderData(dt);
      updatePaceIds(dt);

      dispatch({ type: SET_DATA_TABLE, dt });
      dispatch({ type: SET_OPTIM_SETTINGS, settings: res.data.OptimizerSettings });
      setSecurityId(res.data.SecurityID);
      setTradingList(res.data.TradingList);

      const aggregates = [res.data.Aggregates, res.data.AggregateDeltas, res.data.BenchmarkAggregates];
      orderData(aggregates);
      dispatch({ type: SET_AGGREGATES, aggregates });

      setColumnMetadata(res.data.ColumnMetadata);
      setColumnSizes({
        table: res.data?.DataTable, aggregates, metadata: res.data.ColumnMetadata,
        type: optim_column_sizes, setter: setOptimColumnSizes
      });

      if (!res.ok) {
        reportError(addToast, res);
      }

      loadLog({ auth, setLog, showRuns, showExports, showSSO, selectedSleeve }, (res) => reportError(addToast, res));
      loadHistory(auth, dispatch, selectedSleeve.Id, showAllHistory, (res) => reportError(addToast, res));
    } else {
      reportError(addToast, res);
    }
  };

  const handleAbort = () => {
    abortController?.abort();
    setFetching(false);
  };

  const handlePostToTrading = () => {
    if (!targetExportOk) {
      return;
    }

    setFetching(true);
    postToTrading((res) => setFetching(false));
  };

  const removeFilters = () => {
    if (!_.isEmpty(filters)) {
      dispatch({ type: SET_DT_FILTERS, filters: [] });
    }
  };

  const handleSettingsToggle = () => dispatch({ type: SET_OPTIM_SETTINGS_HIDDEN, hidden: !optimSettingsHidden });

  const toggleIncludeTrades = () => {
    if (!aladdin) {
      return;
    }

    const include = !includeTrades;
    setIncludeTrades(include);

    if (!include) {
      setIncludeOrders(false);
    }
  };

  const toggleIncludeOrders = () => {
    if (!aladdin || !includeTrades) {
      return;
    }

    setIncludeOrders(!includeOrders);
  };

  const handleSubmitSmfRequest = () => {
    setSubmitting(true);
    submitSmfRequest(() => setSubmitting(false));
  };

  if (!selectedSleeve) {
    return <div id="select-sleeve-prompt">Please select a sleeve on the left.</div>;
  }

  const workflow = layout === LAYOUT_WORKFLOW;
  const targetExportOk = dirtyMap.size === 0 && canPostToTrading;
  const canRun = true;
  const tooltip = workflow ? 'End optimizer workflow' : 'Load data and settings for the selected sleeve, and initiate optimizer workflow';

  return (
    <>
      <AnimatedPanel id="opt-toolbar" classes="section-header optimize-bar">
        {workflow ? (
          <Button id="opt-btn-exit" label="Exit" style={{ gridArea: '1/1' }} tooltip={tooltip} handleClick={onExit}>
            <SvgArrow width={16} color={'#F00'} />
          </Button>
        ) : (
          <Button id="opt-btn-load" label="Start Optimizer Workflow" style={{ gridArea: '1/1' }} tooltip={tooltip} handleClick={onLoad}>
            <SvgLoad width={18} />
          </Button>
        )}
        {workflow ? null : (
          <div className="optimize-sources">
            <RadioButton label="Aladdin SOD" checked={aladdin} handleToggle={() => {
              setAladdin(true);
              setDate(prevWorkday());
            }} />
            <CheckBox
              label="include trades"
              checked={includeTrades}
              disabled={!aladdin}
              handleToggle={toggleIncludeTrades}
              style={{ marginLeft: '10px' }}
            />
            <CheckBox
              label="include orders"
              checked={includeTrades && includeOrders}
              disabled={!aladdin || !includeTrades}
              handleToggle={toggleIncludeOrders}
              style={{ marginLeft: '10px' }}
            />
            <RadioButton label="GDM/ATS" checked={!aladdin} handleToggle={() => setAladdin(false)} style={{ margin: '0 10px 0 15px' }} />
            <AsOfDate />
          </div>
        )}
        {dt?.length > 0 && (
          <Button
            id="opt-btn-export"
            style={{ gridArea: '1/2', padding: '0 7px' }}
            tooltip="Export filtered data and settings"
            handleClick={() =>
              exportToExcel({
                data: ft,
                aggregates,
                settings: optimSettings,
                sleeve: selectedSleeve,
                asOfDate,
                meta: columnMetadata,
                nonExportableColumns,
              })
            }>
            <SvgExcelNew width={18} />
          </Button>
        )}

        {dt.length > 0 && (
          <Button
            id="opt-btn-columns"
            style={{ gridArea: '1/3', padding: '0 7px' }}
            handleClick={() => {
              setColumnSelectorOn(true);
            }}
            tooltip={COLUMNS_BUTTON_TOOLTIP}>
            <SvgColumns width={18} />
          </Button>
        )}

        {dt?.length > 0 && (
          <Button
            id="opt-btn-remove-filters"
            style={{ gridArea: '1/4', padding: '0 7px' }}
            disabled={_.isEmpty(filters)}
            tooltip="Remove all filters"
            handleClick={removeFilters}>
            <SvgUnfilter width={18} disabled={_.isEmpty(filters)} />
          </Button>
        )}
        {dt?.length > 0 && (
          <input
            id="opt-comment-box"
            className="search-box comment-box"
            type="text"
            placeholder=" comment"
            spellCheck="false"
            value={comment}
            onChange={(e) => dispatch({ type: SET_COMMENT, comment: e.target.value })}
          />
        )}
        {dt?.length > 0 && (
          <div style={{ gridArea: '1/6', color: `${OFF_WHITE}`, fontSize: '13px' }}>{dayjs(asOfDate).format('MMMM D, YYYY')}</div>
        )}
        {dt?.length > 0 && optimized && (
          <Button
            id="opt-btn-smf-request"
            disabled={!canSubmit}
            label={submitting ? 'Submitting...' : buttonLabel()}
            style={{ gridArea: '1/7', minWidth: '200px' }}
            handleClick={handleSubmitSmfRequest}>
            {submitting ? <SvgSpinner width={18} /> : <SvgSend width={16} disabled={!canSubmit} />}
          </Button>
        )}
        {dt?.length > 0 && canExportTargets && optimized && (
          <Button
            id="opt-btn-pi-export"
            label="Post to Trading"
            disabled={!targetExportOk}
            style={{ gridArea: '1/8' }}
            handleClick={handlePostToTrading}>
            <SvgTrade width={18} disabled={!targetExportOk} />
          </Button>
        )}
        {dt?.length > 0 && (
          <Button id="opt-btn-run" label="Run Optimizer" disabled={!canRun} style={{ gridArea: '1/9' }} handleClick={runOptimizer}>
            <SvgRun width={18} disabled={!canRun} />
          </Button>
        )}
      </AnimatedPanel>
      {datePickerVisible && <DatePickerView />}
      {
        dt?.length > 0 && (
          <div id="optim-panel" className="table-settings-panel" style={{ gridArea: '3/1' }}>
            <OptimTableView />
            {!optimSettingsHidden && <OptimSettingsView />}
            <div
              id="optim-settings-toggle"
              className="settings-pane-toggle"
              style={{ transform: `translate(${optimSettingsHidden ? 0 : 10}px, -46px)`, justifySelf: 'end' }}
              onClick={handleSettingsToggle}>
              <SvgToggle width={15} left={optimSettingsHidden} color={optimSettingsHidden ? '#f00' : OFF_WHITE} />
            </div>
            {columnSelectorOn && <ColumnSelector />}
          </div>
        )
      }
      {fetching && <div className="modal-screen" />}
      {fetching && <SvgSpinner width={160} style={{ gridArea: '3/1', placeSelf: 'center' }} />}
      {
        fetching && (
          <Button classes="abort" handleClick={handleAbort}>
            Cancel Request
          </Button>
        )
      }
    </>
  );
};

export default OptimizePanel;
