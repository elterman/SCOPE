import React, { useContext } from 'react';
import { StoreContext } from './Store';
import SvgToggle from './ICONS/SvgToggle';
import { DEFAULT_RUN_SELECTOR_WIDTH, OFF_WHITE } from './const';
import RunTableView from './RunTableView';
import RunSettingsView from './RunSettingsView';
import { SET_RUN_SELECTOR_WIDTH, SET_RUN_SETTINGS_HIDDEN } from './reducer';
import SvgSpinner from './ICONS/SvgSpinner';
import { useAtomValue } from 'jotai';
import { run_fetching } from './atoms';

const RunDetailsPanel = (props: any) => {
  const { wx } = props;
  const store = useContext(StoreContext);
  const { state, dispatch } = store;
  const { selectedRun, runSelectorWidth, runSettingsHidden } = state;
  const runFetching = useAtomValue(run_fetching);

  const handleDetailsToggle = () => dispatch({ type: SET_RUN_SELECTOR_WIDTH, width: runSelectorWidth ? wx - 10 : DEFAULT_RUN_SELECTOR_WIDTH });

  const handleSettingsToggle = () => dispatch({ type: SET_RUN_SETTINGS_HIDDEN, hidden: !runSettingsHidden });

  if (!selectedRun) {
    return null;
  }

  if (runFetching) {
    return (
      <div className="section" style={{ gridArea: '3/1' }}>
        <SvgSpinner width={160} style={{ gridArea: '3/1', placeSelf: 'center' }} />
      </div>
    );
  }

  return (
    <div id="run-details" className="table-settings-panel">
      <RunTableView />
      {!runSettingsHidden && <RunSettingsView />}
      <div id="run-details-toggle" className="settings-pane-toggle" style={{ transform: 'translate(0, -46px)' }} onClick={handleDetailsToggle}>
        <SvgToggle width={15} color={runSelectorWidth ? OFF_WHITE : '#f00'} />
      </div>
      <div
        id="run-settings-toggle"
        className="settings-pane-toggle"
        style={{ transform: `translate(${runSettingsHidden ? 0 : 10}px, -46px)`, justifySelf: 'end' }}
        onClick={handleSettingsToggle}>
        <SvgToggle width={15} left={runSettingsHidden} color={runSettingsHidden ? '#f00' : OFF_WHITE} />
      </div>
    </div>
  );
};

export default RunDetailsPanel;
