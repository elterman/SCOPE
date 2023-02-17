import { useContext, useState } from 'react';
import { StoreContext } from './Store';
import { SET_SELECTED_SLEEVE, SET_SLEEVE_SELECTOR_WIDTH } from './reducer';
import { SET_CURRENT_LOG_PAGE } from './reducer';
import { SET_LAYOUT, SET_SELECTED_RUN } from './reducer';
import SvgLogo from './ICONS/SvgLogo';
import { loadSleeves } from './SleeveSelector';
import { loadLog } from './MasterLog';
import { loadColumnOrder, reportError } from './Utils';
import { useToaster } from './Toaster';
import { DEFAULT_SLEEVE_SELECTOR_WIDTH, LAYOUT_START } from './const';
import { useSpring, animated } from 'react-spring';
import { useTooltip } from './Tooltip';
import { useAtomValue, useSetAtom } from 'jotai';
import { useResetAtom } from 'jotai/utils';
import { as_of_date, auth_info, column_order, log_filter, master_log, my_sleeves, selected_log_item, selected_tab, show_exports, show_runs, show_sso, sleeve_filter } from './atoms';

const Title = () => {
  const store = useContext(StoreContext);
  const { dispatch, state } = store;
  const { selectedSleeve } = state;
  const addToast = useToaster();
  const [flip, setFlip] = useState(0);
  const { hideTooltip } = useTooltip();
  const { opacity } = useSpring({ opacity: 1, from: { opacity: 0 }, delay: 100, config: { duration: 1000 } });
  const auth = useAtomValue(auth_info);
  const resetDate = useResetAtom(as_of_date);
  const resetSelectedTab = useResetAtom(selected_tab);
  const setColumnOrder = useSetAtom(column_order) || loadColumnOrder();
  const resetShowRuns = useResetAtom(show_runs);
  const resetShowExports = useResetAtom(show_exports);
  const resetShowSSO = useResetAtom(show_sso);
  const setSleeves = useSetAtom(my_sleeves);
  const resetLogFilter = useResetAtom(log_filter);
  const setLog = useSetAtom(master_log);
  const resetSelectedLogItem = useResetAtom(selected_log_item);
  const resetSleeveFilter = useResetAtom(sleeve_filter);

  const { spring } = useSpring({
    spring: flip,
    onRest: () => setFlip(0),
    immediate: !flip,
    config: { friction: 80 },
  });

  const goHome = (e) => {
    if (flip) {
      return;
    }

    setFlip(e.clientX > 147 ? 1 : -1);

    hideTooltip();

    dispatch({ type: SET_LAYOUT, layout: LAYOUT_START });
    dispatch({ type: SET_SELECTED_SLEEVE, sleeve: null });
    dispatch({ type: SET_SELECTED_RUN, sleeve: null });
    dispatch({ type: SET_CURRENT_LOG_PAGE, page: 1 });
    dispatch({ type: SET_SLEEVE_SELECTOR_WIDTH, width: DEFAULT_SLEEVE_SELECTOR_WIDTH });

    resetSelectedLogItem();
    resetSelectedTab();
    resetShowRuns();
    resetShowExports();
    resetShowSSO();
    resetDate();
    resetLogFilter();
    resetSleeveFilter();

    loadSleeves(auth, setSleeves, (res) => reportError(addToast, res));
    loadLog({ auth, setLog, showRuns: true, showExports: true, showSSO: false, selectedSleeve }, (res) => reportError(addToast, res));

    setColumnOrder(loadColumnOrder());
  };

  return (
    <div id="title" className="title" style={{ perspective: '450px' }}>
      <animated.div
        id="animated-title"
        style={{ display: 'grid', alignItems: 'center', opacity, transform: spring.interpolate((s) => `rotateY(${s * 360}deg)`) }}>
        <div id="title-scope" onClick={goHome} style={{ gridArea: '1/1', transform: 'translate(0, 6px)' }}>
          <span>S</span>
          <span style={{ fontSize: '30px', marginRight: '5px' }}>.</span>
          <span>C</span>
          <span style={{ fontSize: '30px', marginRight: '5px' }}>.</span>
          <span style={{ opacity: 0 }}>O</span>
          <span style={{ fontSize: '30px', marginRight: '5px' }}>.</span>
          <span>P</span>
          <span style={{ fontSize: '30px', marginRight: '5px' }}>.</span>
          <span>E</span>
          <span style={{ fontSize: '30px' }}>.</span>
        </div>
        <div id="title-logo" className="app-logo" onClick={goHome}>
          <SvgLogo width={54} color="#0004" style={{ gridArea: '1/1', transform: 'translate(2px, 2px)' }} />
          <SvgLogo width={54} style={{ gridArea: '1/1', zIndex: 1 }} />
        </div>
      </animated.div>
    </div>
  );
};

export default Title;
