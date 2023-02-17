/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useContext, useState, useRef } from 'react';
import { StoreContext } from './Store';
import { SET_OPTIM_SETTINGS, SET_ORIGINAL_OPTIM_SETTINGS } from './reducer';
import { SET_DATA_TABLE } from './reducer';
import { SET_LAYOUT, SET_SLEEVE_SELECTOR_WIDTH } from './reducer';
import TabBar from './TabBar';
import OptimizePanel from './OptimizePanel';
import { TAB_OPTIMIZE, OFF_WHITE, TAB_LOG, TAB_HISTORY, DEFAULT_SLEEVE_SELECTOR_WIDTH, LAYOUT_WORKFLOW } from './const';
import { doFetch } from './Scope.Api';
import SvgSpinner from './ICONS/SvgSpinner';
import SvgToggle from './ICONS/SvgToggle';
import MasterLog from './MasterLog';
import HistoryPanel from './HistoryPanel';
import useForceUpdate from './useForceUpdate';
import { reportError, setColumnSizes, sleeveInfo, windowSize } from './Utils';
import { useToaster } from './Toaster';
import AnimatedPanel from './AnimatedPanel';
import useColumns from './useColumns';
import _ from 'lodash';
import useSmfRequests from './useSmfRequests';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  as_of_date,
  auth_info,
  column_metadata,
  include_orders,
  include_trades,
  optim_column_sizes,
  security_id,
  selected_tab,
  use_aladdin,
} from './atoms';

const TabsPanel = () => {
  const store = useContext(StoreContext);
  const { state, dispatch } = store;
  const { selectedSleeve, sleeveSelectorWidth, layout } = state;
  const [fetching, setFetching] = useState(false);
  const addToast = useToaster();
  const forceUpdate = useForceUpdate(true);
  const l: any = useRef({}).current;
  const { orderData } = useColumns();
  const { updatePaceIds } = useSmfRequests();
  const aladdin = useAtomValue(use_aladdin);
  const asOfDate = useAtomValue(as_of_date);
  const auth = useAtomValue(auth_info);
  const [selectedTab, setSelectedTab] = useAtom(selected_tab);
  const includeTrades = useAtomValue(include_trades);
  const includeOrders = useAtomValue(include_orders);
  const setSecurityId = useSetAtom(security_id);
  const setColumnMetadata = useSetAtom(column_metadata);
  const setOptimColumnSizes = useSetAtom(optim_column_sizes);

  useEffect(() => {
    l.mounted = true;

    return () => {
      l.mounted = false;
    };
  }, [l]);

  useEffect(() => {
    window.addEventListener('resize', forceUpdate);
    return () => window.removeEventListener('resize', forceUpdate);
  }, [forceUpdate]);

  useEffect(() => {
    if (selectedTab < 0) {
      setSelectedTab(l.tab);
    } else {
      l.tab = selectedTab;
    }
  }, [dispatch, l.tab, selectedTab]);

  const getDetails = () => {
    setFetching(true);

    doFetch(
      'PrepareOptimizer',
      {
        FundName: selectedSleeve.FundName,
        Alpha: selectedSleeve.Alpha,
        Bravo: selectedSleeve.Bravo,
        AsOfDate: asOfDate,
        HoldingsSource: aladdin ? 'Aladdin' : 'ATS',
        PositionType: includeOrders ? 'SOD_TRADES_ORDERS' : includeTrades ? 'SOD_TRADES' : 'SOD',
      },
      auth,
      (res: any) => onDataReceived(res)
    );
  };

  const onDataReceived = (res: any) => {
    if (l.mounted) {
      setFetching(false);
    }

    dispatch({ type: SET_LAYOUT, layout: LAYOUT_WORKFLOW });

    if (res.ok) {
      const dt = res.data?.DataTable;

      dt && orderData(dt);
      dt && updatePaceIds(dt);

      dispatch({ type: SET_DATA_TABLE, dt });
      dispatch({ type: SET_OPTIM_SETTINGS, settings: res.data?.OptimizerSettings });
      dispatch({ type: SET_ORIGINAL_OPTIM_SETTINGS, settings: _.cloneDeep(res.data?.OptimizerSettings) });
      setColumnMetadata(res.data.ColumnMetadata);
      setSecurityId(res.data.SecurityID);
      setColumnSizes({
        table: res.data?.DataTable,
        aggregates: null,
        metadata: res.data.ColumnMetadata,
        type: optim_column_sizes,
        setter: setOptimColumnSizes,
      });
    } else {
      reportError(addToast, res);
    }
  };

  const { x: wx } = windowSize();

  const handleToggle = () => dispatch({ type: SET_SLEEVE_SELECTOR_WIDTH, width: sleeveSelectorWidth ? wx - 30 : DEFAULT_SLEEVE_SELECTOR_WIDTH });

  return (
    <div id="tabs-panel" className="section">
      <div style={{ gridArea: '1/1', height: '36px', border: `0 solid ${OFF_WHITE}`, borderWidth: '0 0 1px 0', boxSizing: 'border-box' }}></div>
      <AnimatedPanel
        id="tabs-panel-header"
        classes="section-header"
        style={{ grid: 'auto / auto 1fr auto', alignItems: 'center', background: '#0000' }}>
        <TabBar style={{ gridArea: '1/1', margin: '0 0 0 -3px' }} />
        {selectedSleeve && (
          <div id="sleeve-info" className="sleeve-info" style={{ gridArea: '1/3' }}>
            {sleeveInfo(selectedSleeve)}
          </div>
        )}
      </AnimatedPanel>
      {selectedTab === TAB_LOG && <MasterLog />}
      {selectedTab === TAB_OPTIMIZE && <OptimizePanel getDetails={getDetails} />}
      {selectedTab === TAB_HISTORY && <HistoryPanel />}
      {fetching && <div id="modal-screen" className="modal-screen" />}
      {fetching && <SvgSpinner width={160} style={{ gridArea: '1/1/span 3/1', placeSelf: 'center' }} />}
      {layout !== LAYOUT_WORKFLOW && (
        <div id="tabs-toggle" className="settings-pane-toggle" style={{ gridArea: '1/1/span 3/1' }} onClick={handleToggle}>
          <SvgToggle width={15} color={sleeveSelectorWidth ? OFF_WHITE : '#f00'} />
        </div>
      )}
    </div>
  );
};

export default TabsPanel;
