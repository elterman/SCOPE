import { useContext } from 'react';
import { StoreContext } from './Store';
import _ from 'lodash';
import { loadLog } from './MasterLog';
import { reportError } from './Utils';
import { useToaster } from './Toaster';
import { LAYOUT_WORKFLOW, TAB_LOG } from './const';
import { auth_info, master_log, selected_tab, show_exports, show_runs, show_sso } from './atoms';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

const TabBar = (props) => {
  const store = useContext(StoreContext);
  const { state } = store;
  const { selectedSleeve, layout, compare } = state;
  const { style } = props;
  const addToast = useToaster();
  const workflow = layout === LAYOUT_WORKFLOW;
  const tabs = ['Master Log', 'Optimize', `Optimization History${compare ? '  •  Compare' : ''}`];
  const auth = useAtomValue(auth_info);
  const [selectedTab, setSelectedTab] = useAtom(selected_tab);
  const showRuns = useAtomValue(show_runs);
  const showExports = useAtomValue(show_exports);
  const showSSO = useAtomValue(show_sso);
  const setLog = useSetAtom(master_log);

  const handleClickTab = (index) => {
    if (selectedTab !== index) {
      setSelectedTab(index);

      if (index === TAB_LOG) {
        loadLog({ auth, setLog, showRuns, showExports, showSSO, selectedSleeve }, (res) => reportError(addToast, res));
      }
    }
  };

  return (
    <div id="tabs-bar" className="tab-bar" style={{ ...style }}>
      {_.map(tabs, (_, i) => {
        const classes = `tab ${tabs[i] === tabs[Number(selectedTab)] ? 'tab-selected' : ''}`;
        return i === 0 && workflow ? null : (
          <div id={`tabs-tab-${i + 1}`} key={i} className={classes} onClick={() => handleClickTab(i)}>
            {tabs[i]}
          </div>
        );
      })}
    </div>
  );
};

export default TabBar;
