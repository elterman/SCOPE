import React, { useEffect, useRef, useContext } from 'react';
import { StoreContext } from './Store';
import SplitPane from 'react-split-pane';
import RunSelector from './RunSelector';
import RunDetailsPanel from './RunDetailsPanel';
import { DEFAULT_RUN_SELECTOR_WIDTH } from './const';
import useForceUpdate from './useForceUpdate';
import { SET_RUN_SELECTOR_WIDTH } from './reducer';

const RunsPanel = () => {
  const store = useContext(StoreContext);
  const { state, dispatch } = store;
  const { selectedRun, sleeveSelectorWidth, runSelectorWidth } = state;
  const forceUpdate = useForceUpdate(true);
  const l: any = useRef({}).current;
  const wx = l.ctrl ? l.ctrl.splitPane.clientWidth : DEFAULT_RUN_SELECTOR_WIDTH + 10;

  useEffect(() => {
    return forceUpdate();
  }, [sleeveSelectorWidth, forceUpdate]);

  if (!selectedRun) {
    return <RunSelector />;
  }

  const onDragFinished = (size: number) => dispatch({ type: SET_RUN_SELECTOR_WIDTH, width: size });

  return (
    <SplitPane
      ref={(e) => (l.ctrl = e)}
      primary="first"
      minSize={0}
      maxSize={wx - 10}
      size={runSelectorWidth}
      onDragFinished={onDragFinished}
      style={{ position: 'initial', gridArea: '3/1' }}>
      <RunSelector wx={wx} />
      <RunDetailsPanel wx={wx} />
    </SplitPane>
  );
};

export default RunsPanel;
