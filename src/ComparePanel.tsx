import React, { useEffect, useContext } from 'react';
import { StoreContext } from './Store';
import _ from 'lodash';
import { SET_COMPARE_RUNS, SET_COMP_SETTINGS_HIDDEN } from './reducer';
import CompareTableView from './CompareTableView';
import CompareSettingsView from './CompareSettingsView';
import { OFF_WHITE } from './const';
import SvgToggle from './ICONS/SvgToggle';
import RunSelector from './RunSelector';
import SvgSpinner from './ICONS/SvgSpinner';
import { useAtomValue } from 'jotai';
import { my_wait, run_fetching } from './atoms';

const ComparePanel = () => {
  const store = useContext(StoreContext);
  const { state, dispatch } = store;
  const { selectedRun, compareRun, history, compareRuns, compSettingsHidden } = state;
  const wait = useAtomValue(my_wait);
  const runFetching = useAtomValue(run_fetching);

  useEffect(() => {
    if (!compareRuns) {
      const runs = _.filter(history, (run) => run.Id !== selectedRun.Id);
      dispatch({ type: SET_COMPARE_RUNS, compareRuns, runs });
    }
  }, [history, selectedRun, compareRuns, dispatch]);

  const handleSettingsToggle = () => dispatch({ type: SET_COMP_SETTINGS_HIDDEN, hidden: !compSettingsHidden });

  if (!compareRun || wait) {
    return <RunSelector />;
  }

  if (runFetching) {
    return (
      <div className="section" style={{ gridArea: '1/1/span 3/1' }}>
        <SvgSpinner width={160} style={{ gridArea: '3/1', placeSelf: 'center' }} />
      </div>
    );
  }

  return (
    <div id="comp-panel" className="table-settings-panel" style={{ gridArea: '3/1' }}>
      <CompareTableView />
      {!compSettingsHidden && <CompareSettingsView />}
      <div
        id="comp-settings-toggle"
        className="settings-pane-toggle"
        style={{ transform: `translate(${compSettingsHidden ? 0 : 10}px, -46px)`, justifySelf: 'end' }}
        onClick={handleSettingsToggle}>
        <SvgToggle width={15} left={compSettingsHidden} color={compSettingsHidden ? '#f00' : OFF_WHITE} />
      </div>
    </div>
  );
};

export default ComparePanel;
