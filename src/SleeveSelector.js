import { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { StoreContext } from './Store';
import { SET_SELECTED_SLEEVE, SET_SLEEVE_SELECTOR_WIDTH, SET_COMPARE } from './reducer';
import { SET_RUN_SELECTOR_WIDTH } from './reducer';
import _ from 'lodash';
import { OFF_WHITE, BLUE, DEFAULT_SLEEVE_SELECTOR_WIDTH, DEFAULT_RUN_SELECTOR_WIDTH, TAB_OPTIMIZE, TAB_HISTORY } from './const';
import { doFetch } from './Scope.Api';
import SvgSpinner from './ICONS/SvgSpinner';
import SvgToggle from './ICONS/SvgToggle';
import { reportError, syncScroll } from './Utils';
import useForceUpdate from './useForceUpdate';
import { windowSize } from './Utils';
import { useToaster } from './Toaster';
import AnimatedPanel from './AnimatedPanel';
import { useSpring, animated } from 'react-spring';
import { useTooltip } from './Tooltip';
import { auth_info, my_sleeves, selected_tab, sleeve_filter } from './atoms';
import { useAtom, useAtomValue } from 'jotai';

const SleeveSelector = () => {
  const store = useContext(StoreContext);
  const { state, dispatch } = store;
  const { selectedSleeve, sleeveSelectorWidth } = state;
  const [filteredSleeves, setFilteredSleeves] = useState();
  const addToast = useToaster();
  const l = useRef({}).current;
  const forceUpdate = useForceUpdate(true);
  const { showTooltip, hideTooltip } = useTooltip();
  const auth = useAtomValue(auth_info);
  const [selectedTab, setSelectedTab] = useAtom(selected_tab);
  const [sleeves, setSleeves] = useAtom(my_sleeves);
  const [sleeveFilter, setSleeveFilter] = useAtom(sleeve_filter);

  const { spring } = useSpring({ spring: 1, from: { spring: 0 } });

  useEffect(() => {
    window.addEventListener('resize', forceUpdate);
    return () => window.removeEventListener('resize', forceUpdate);
  }, [forceUpdate]);

  const getSleeves = useCallback(() => {
    const setFetching = (set) => {
      l.fetching = set;
      forceUpdate();
    };

    if (l.fetching) {
      return;
    }

    setFetching(true);

    loadSleeves(auth, setSleeves, (res) => {
      reportError(addToast, res);

      if (l.mounted) {
        setFetching(false);
      }
    });
  }, [addToast, auth, forceUpdate, l, setSleeves]);

  useEffect(() => {
    l.mounted = true;

    if (auth?.isAuthenticated && !sleeves) {
      getSleeves();
    }

    return () => {
      l.mounted = false;
    };
  }, [auth, sleeves, l, getSleeves]);

  useEffect(() => {
    if (!sleeves) {
      return;
    }

    const filter = sleeveFilter ? sleeveFilter[0] : null;

    const fs = _.pickBy(
      sleeves,
      (s) =>
        !filter ||
        _.includes(s.FundName?.toUpperCase(), filter) ||
        _.includes(s.Alpha?.toUpperCase(), filter) ||
        _.includes(s.Bravo?.toUpperCase(), filter) ||
        _.includes(s.LastStep?.toUpperCase(), filter) ||
        _.includes(s.User?.toUpperCase(), filter) ||
        _.includes(s.Comment?.toUpperCase(), filter)
    );

    setFilteredSleeves(fs);
  }, [sleeves, sleeveFilter]);

  const setFilter = (filter) => setSleeveFilter(filter);

  const selectSleeve = (sleeve) => {
    if (sleeve !== selectedSleeve) {
      hideTooltip();
      dispatch({ type: SET_COMPARE, show: false });
      dispatch({ type: SET_SELECTED_SLEEVE, sleeve });

      if (selectedTab !== TAB_OPTIMIZE && selectedTab !== TAB_HISTORY) {
        setSelectedTab(TAB_OPTIMIZE);
      }
    }
  };

  const handleSearchInput = (e) => {
    const filter = e.target.value;
    setFilter([filter?.toUpperCase(), filter]);
  };

  const handleSearchX = () => {
    if (!sleeveFilter) {
      return;
    }

    setFilter(null);
    l.searchBox.value = '';
    l.searchBox.focus();
  };

  const { x: wx } = windowSize();
  const handleToggle = () => {
    dispatch({ type: SET_SLEEVE_SELECTOR_WIDTH, width: sleeveSelectorWidth === wx - 30 ? DEFAULT_SLEEVE_SELECTOR_WIDTH : 0 });

    if (sleeveSelectorWidth === wx - 30) {
      dispatch({ type: SET_RUN_SELECTOR_WIDTH, width: DEFAULT_RUN_SELECTOR_WIDTH });
    }
  };

  if (l.fetching) {
    return (
      <div className="section">
        <SvgSpinner width={160} style={{ gridArea: '3/1', placeSelf: 'center' }} />
      </div>
    );
  }

  return (
    <div id="ss-pane" className="section">
      {sleeves && (
        <AnimatedPanel id="ss-header" classes="section-header">
          <div id="ss-inner-header" className="sleeve-selector-header">
            <input
              id="ss-search-box"
              className="search-box"
              type="text"
              placeholder="search"
              spellCheck="false"
              onChange={handleSearchInput}
              value={sleeveFilter ? sleeveFilter[1] : ''}
              ref={(e) => (l.searchBox = e)}
            />
            <div id="ss-search-x" className={`search-x ${sleeveFilter ? 'search-x-enabled' : ''}`} onClick={handleSearchX}>
              ×
            </div>
          </div>
        </AnimatedPanel>
      )}
      {sleeves && (
        <div id="ss-headers" className="ss-item grid-header" style={{ gridArea: '2/1' }}>
          <div>Fund</div>
          <div>Alpha</div>
          <div>Bravo</div>
          <div>Last Operation</div>
          <div>User</div>
          <div>Comment</div>
          <div>&nbsp;</div>
        </div>
      )}
      <animated.div
        id="ss-grid"
        className="section-content root-scroll"
        onScroll={(e) => syncScroll('ss-headers', e.target.scrollLeft)}
        style={{ transform: spring.interpolate((s) => `translateX(${(s - 1) * 100}%)`) }}>
        {_.map(filteredSleeves, (s, i) => {
          const selected = s.Id === selectedSleeve?.Id;
          const background = selected ? '#000' : i % 2 ? '#0003' : '#0004';
          const color = selected ? BLUE : OFF_WHITE;
          const cursor = selected ? 'initial' : 'pointer';
          return (
            <div id={`ss-grid-row${i + 1}`} key={i} className="ss-item" style={{ background, color, cursor }} onClick={() => selectSleeve(s)}>
              <div>{s.FundName}</div>
              <div>{s.Alpha}</div>
              <div>{s.Bravo}</div>
              <div>{s.LastStep}</div>
              <div className="ellipsis">{s.User}</div>
              <div className="ellipsis" onMouseEnter={(e) => showTooltip({ e, text: s.Comment })} onMouseLeave={hideTooltip}>
                {s.Comment}
              </div>
            </div>
          );
        })}
      </animated.div>
      {sleeves && (
        <div
          id="settings-toggle"
          className="settings-pane-toggle"
          style={{ gridArea: '1/1/span 3/1', justifySelf: 'end' }}
          onClick={handleToggle}>
          <SvgToggle width={15} left={true} invert={true} color={sleeveSelectorWidth === wx - 30 ? '#f00' : OFF_WHITE} />
        </div>
      )}
    </div>
  );
};

export default SleeveSelector;

export const loadSleeves = (auth, setSleeves, resolve = null) => {
  doFetch('GetSleeves', null, auth, (res) => {
    if (res.ok) {
      _.each(res.data, (item) => {
        if (item.LastStep === 'ExecuteOptimizer') {
          item.LastStep = 'Run Optimizer';
        } else if (item.LastStep === 'ExportToExcel') {
          item.LastStep = 'Expot To Excel';
        }
      });

      setSleeves(res.data);
    } else {
      setSleeves([]);
    }

    if (resolve) {
      resolve(res);
    }
  });
};
