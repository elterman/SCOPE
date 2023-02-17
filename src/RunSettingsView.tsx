import React from 'react';
import { useContext, useEffect } from 'react';
import JsonViewer from './JsonViewer';
import { StoreContext } from './Store';
import _ from 'lodash';
import { SETTINGS_WIDTH } from './const';
import { overflowWrap } from './Utils';

const RunSettingsView = () => {
  const store = useContext(StoreContext);
  const { state } = store;
  const { selectedRunSettings } = state;

  useEffect(overflowWrap);

  return (
    <div id="run-settings" className="settings-pane" style={{ width: SETTINGS_WIDTH }}>
      <div id="settings-viewer" className="root-scroll">
        {_.isEmpty(selectedRunSettings) ? null : <JsonViewer src={selectedRunSettings} />}
      </div>
    </div>
  );
};

export default RunSettingsView;
