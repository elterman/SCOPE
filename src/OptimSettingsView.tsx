import React, { useContext, useEffect } from 'react';
import { StoreContext } from './Store';
import JsonViewer from './JsonViewer';
import { SET_OPTIM_SETTINGS } from './reducer';
import { overflowWrap, updateDirtyMap } from './Utils';
import _ from 'lodash';
import { SETTINGS_WIDTH } from './const';
import SvgEditFilters from './ICONS/SvgEditFilters';
import SvgUndo from './ICONS/SvgUndo';
import FriendlyEditor from './FriendlyEditor';
import { useTooltip } from './Tooltip';
import { useAtom } from 'jotai';
import { edit_settings } from './atoms';

const OptimSettingsView = () => {
  const store = useContext(StoreContext);
  const { state, dispatch } = store;
  const { optimSettings, originalOptimSettings, dirtyMap } = state;
  const { showTooltip, hideTooltip } = useTooltip();
  const [editSettings, setEditSettings] = useAtom(edit_settings);

  useEffect(overflowWrap);

  const handleEdit = (info: any) => {
    updateDirtyMap(dirtyMap, 'settings', JSON.stringify(optimSettings), JSON.stringify(info.updated_src), dispatch);
    dispatch({ type: SET_OPTIM_SETTINGS, settings: info.updated_src });

    return true;
  };

  const handleReset = () => {
    updateDirtyMap(dirtyMap, 'settings', JSON.stringify(optimSettings), JSON.stringify(originalOptimSettings), dispatch);
    dispatch({ type: SET_OPTIM_SETTINGS, settings: _.cloneDeep(originalOptimSettings) });
  };

  return (
    <div id="optim-settings" className="settings-pane" style={{ width: SETTINGS_WIDTH }}>
      <div id="settings-viewer" className="root-scroll" style={{ gridArea: '1/1' }}>
        {_.isEmpty(optimSettings) ? null : <JsonViewer src={optimSettings} showTypes={true} onEdit={handleEdit} />}
      </div>
      <div
        className="settings_icon"
        onClick={() => setEditSettings(true)}
        onMouseEnter={(e) => showTooltip({ e, text: 'Edit filters (and more)...', dx: -125 })}
        onMouseLeave={hideTooltip}>
        <SvgEditFilters width={22} />
      </div>
      <div
        className="settings_icon"
        style={{ marginTop: '35px' }}
        onClick={handleReset}
        onMouseEnter={(e) => showTooltip({ e, text: 'Reset settings', dx: -70 })}
        onMouseLeave={hideTooltip}>
        <SvgUndo width={18} />
      </div>
      {editSettings && <FriendlyEditor />}
    </div>
  );
};

export default OptimSettingsView;
