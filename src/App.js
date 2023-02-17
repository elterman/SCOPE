import { useEffect, useContext, useState } from 'react';
import { StoreContext } from './Store';
import './App.css';
import Title from './Title';
import User from './User';
import SleeveSelector from './SleeveSelector';
import TabsPanel from './TabsPanel';
import SplitPane from 'react-split-pane';
import { SET_SLEEVE_SELECTOR_WIDTH } from './reducer';
import useForceUpdate from './useForceUpdate';
import { windowSize } from './Utils';
import Tooltip from './Tooltip';
import FilterHelp from './FilterHelp';
import Toaster, { useToaster } from './Toaster';
import { useAtom, useAtomValue } from 'jotai';
import { my_sleeves, signal_r } from './atoms';
import { LAYOUT_WORKFLOW } from './const';
import useSmfRequests from './useSmfRequests';
import * as signalR from '@microsoft/signalr';
import _ from 'lodash';
import { apiConfig } from './MsalConfig';

const App = () => {
  const store = useContext(StoreContext);
  const { state, dispatch } = store;
  const { layout, sleeveSelectorWidth } = state;
  const forceUpdate = useForceUpdate(true);
  const sleeves = useAtomValue(my_sleeves);
  const { dt, runTable } = state;
  const { updatePaceIds } = useSmfRequests();
  const [signalr, setSignalr] = useAtom(signal_r);
  const [completedSmfRequests, setCompltedSmfRequests] = useState(null);
  const addToast = useToaster();

  useEffect(() => {
    window.addEventListener('resize', forceUpdate);
    return () => window.removeEventListener('resize', forceUpdate);
  }, [forceUpdate]);

  useEffect(() => {
    if (signalr) {
      return;
    }

    setSignalr(true);

    var connection = new signalR.HubConnectionBuilder()
      .withUrl(apiConfig.resourceHub, { skipNegotiation: true, transport: signalR.HttpTransportType.WebSockets })
      .build();

    connection.on('Notify', isins => {
      setCompltedSmfRequests(isins);
      addToast({ message: `SMF request${(isins.length > 1 ? "s" : "")} completed for ${isins.join(", ")}.` });
    });

    connection.start().catch((err) => {
      console.error(err);
    });
  }, [addToast, setCompltedSmfRequests, setSignalr, signalr]);

  useEffect(() => {
    if (!completedSmfRequests) {
      return;
    }

    if (!_.isEmpty(dt)) {
      updatePaceIds(dt, null, completedSmfRequests);
    }

    if (!_.isEmpty(runTable)) {
      updatePaceIds(runTable, null, completedSmfRequests);
    }

    setCompltedSmfRequests(null);
  }, [completedSmfRequests, dt, runTable, setCompltedSmfRequests, updatePaceIds]);

  const onDragFinished = (size) => dispatch({ type: SET_SLEEVE_SELECTOR_WIDTH, width: size });

  const { x: wx } = windowSize();

  return (
    <div id="app-main" className="App">
      <div id="app-title-bar" style={{ display: 'grid' }}>
        <Title />
        <FilterHelp />
        <User />
      </div>
      {layout === LAYOUT_WORKFLOW ? (
        <TabsPanel />
      ) : sleeves ? (
        <SplitPane
          minSize={0}
          maxSize={wx - 30}
          size={sleeveSelectorWidth}
          style={{ position: 'initial', gridArea: '2/1' }}
          onDragFinished={onDragFinished}>
          <SleeveSelector />
          <TabsPanel />
        </SplitPane>
      ) : (
        <SleeveSelector />
      )}
      <Tooltip />
      <canvas id="canvas" className="canvas" />
      <Toaster />
    </div>
  );
};

export default App;
