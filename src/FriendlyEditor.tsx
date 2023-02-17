import React, { useEffect, useRef, useState } from 'react';
import { useContext } from 'react';
import Popup from './Popup';
import './FriendlyEditor.css';
import { SET_OPTIM_SETTINGS } from './reducer';
import { StoreContext } from './Store';
import useForceUpdate from './useForceUpdate';
import FilterTable from './FilterTable';
import _ from 'lodash';
import { replaceAll, updateDirtyMap } from './Utils';
import { useSpring, animated } from 'react-spring';
import Button from './Button';
import SvgAddFilter from './ICONS/SvgAddFilter';
import { useAtomValue, useSetAtom } from 'jotai';
import { can_save_filters, edit_settings } from './atoms';

interface OptimFilter {
  field: string;
  pctile: boolean;
  hard: boolean;
  min: number | undefined;
  max: number | undefined;
  valid: boolean;
  duplicate: boolean;
}

const NO_FILTER_COLUMNS = [
  'ticker',
  'isins',
  'cusip',
  'name',
  'coupon',
  'maturity',
  'dontHoldBond',
  'sector',
  'consolidateSector',
  'holdingDelta',
  'priceToCall',
  'nextCallDate',
  'consolidatedSector',
];

const EXTRAS = [
  [0, 'runForReplacements (ISIN only)', true],
  [0, 'fixHeldWeights', true],
  [1, 'currentAUM', false],
  [1, 'targetAUM', false],
  [1, 'turnover.max', false],
];

const FriendlyEditor = () => {
  const store = useContext(StoreContext);
  const { state, dispatch } = store;
  const { columns, optimSettings, dirtyMap } = state;
  const jsonFilters = optimSettings.constraints?.filters;
  const forceUpdate = useForceUpdate(true);
  const SHOW = 1,
    HIDE = -1,
    FADE = 0;
  const [selecting, setSelecting] = useState<number>(HIDE);
  const cols = _.difference(columns, NO_FILTER_COLUMNS).sort();
  const [runForReplacements, setRunForReplacements] = useState<boolean>(optimSettings.settings.runForReplacements);
  const [fixHeldWeights, setFixHeldWeights] = useState<boolean>(optimSettings.settings.fixHeldWeights);
  const l: any = useRef({ filters: new Array<OptimFilter>(), excluded: { isins: {}, isins4trading: { hard: true }, tickers: {} } }).current;
  const [currentTab, setCurrentTab] = useState<number>(0);
  const canSaveFilters = useAtomValue(can_save_filters);
  const setEditSettings = useSetAtom(edit_settings);

  const { spring } = useSpring({ spring: selecting === SHOW ? 1 : 0, from: { spring: 0 }, velocity: 50 });

  const { opacity } = useSpring({ opacity: selecting === FADE ? 0 : 1, onRest: () => selecting === FADE && setSelecting(HIDE) });

  useEffect(() => {
    window.addEventListener('resize', forceUpdate);
    return () => window.removeEventListener('resize', forceUpdate);
  }, [forceUpdate]);

  useEffect(() => {
    if (l.filters.length) {
      return;
    }

    const addFilters = (f: any) => {
      const { field } = f;
      const pctile = _.get(f, 'pctile', false);
      const min = _.get(f, 'min');
      const max = _.get(f, 'max');

      let minhard = undefined;
      let maxhard = undefined;
      let minsoft = undefined;
      let maxsoft = undefined;

      if (min) {
        let v = _.get(min, 'hard');

        if (v !== undefined) {
          minhard = v;
        }

        v = _.get(min, 'soft');

        if (v !== undefined) {
          minsoft = v;
        }
      }

      if (max) {
        let v = _.get(max, 'hard');

        if (v !== undefined) {
          maxhard = v;
        }

        v = _.get(max, 'soft');

        if (v !== undefined) {
          maxsoft = v;
        }
      }

      if (minhard !== undefined || maxhard !== undefined) {
        l.filters.push({ field, pctile, hard: true, min: minhard, max: maxhard, valid: true, duplicate: false });
      }

      if (minsoft !== undefined || maxsoft !== undefined) {
        l.filters.push({ field, pctile, hard: false, min: minsoft, max: maxsoft, valid: true, duplicate: false });
      }
    };

    _.each(jsonFilters, (f) => addFilters(f));

    if (l.filters.length) {
      l.filters = _.sortBy(l.filters, ['field', 'pctile', 'hard']);
    }
  }, [jsonFilters, l]);

  useEffect(() => {
    _.each(['excludedISINs', 'excludedISINsForTrading', 'excludedTickers'], (prop, i) => {
      let values = _.get(optimSettings.constraints, prop);
      const xob = i === 0 ? l.excluded.isins : i === 1 ? l.excluded.isins4trading : l.excluded.tickers;

      if (_.isObject(values)) {
        xob.hard = _.get(values, 'hard', i === 1);
        values = _.get(values, 'value');
      }

      xob.input.value = values === undefined ? '' : replaceAll(values, ',', ' ');
    });
  }, [l, optimSettings.constraints]);

  useEffect(() => {
    if (runForReplacements) {
      l.excluded.isins.hard = true;
      forceUpdate();
    }
  }, [runForReplacements, l, forceUpdate]);

  useEffect(() => {
    l.taum.value = _.get(optimSettings.settings?.aum, 'targetAUM');
  }, [l.taum, optimSettings.settings.aum]);

  useEffect(() => {
    l.caum.value = _.get(optimSettings.settings?.aum, 'currentAUM');
  }, [l.caum, optimSettings.settings.aum]);

  useEffect(() => {
    l.turnover.value = _.get(optimSettings.constraints?.turnover, 'max');
  }, [l.turnover, optimSettings.constraints?.turnover]);

  const onExit = (ok: boolean) => {
    const settings = { ...optimSettings };
    const excludes = [];

    if (ok) {
      for (let i = 0; i < 3; i++) {
        excludes[i] = (document.getElementById(`bonds-textarea-${i}`) as HTMLInputElement)?.value;
      }

      settings.settings.aum.currentAUM = Number(l.caum.value);
      settings.settings.aum.targetAUM = Number(l.taum.value);
      settings.constraints.turnover.max = Number(l.turnover.value);
      settings.settings.fixHeldWeights = fixHeldWeights;
      settings.settings.runForReplacements = runForReplacements;
    }

    setEditSettings(false);

    if (!ok) {
      return;
    }

    const filters: any = [];

    const makeFilter = (f: any, m: string) => {
      if (f[m] === undefined) {
        return null;
      }

      const xfob = _.find(filters, (xf) => f.field === xf.field && f.pctile === (xf.pctile || false));
      let fob = xfob || { field: f.field };

      if (!xfob) {
        filters.push(fob);

        if (f.pctile) {
          fob.pctile = true;
        }
      }

      if (!fob[m]) {
        fob[m] = {};
      }

      if (f.hard) {
        fob[m].hard = f[m];
      } else {
        fob[m].soft = f[m];
      }

      const item = _.find(settings.constraints.filters, (i) => f.field === i.field && f.pctile === !!i.pctile);

      if (!item) {
        return null;
      }

      const keys = _.reject(_.keys(item), (k) => k === 'field' || k === 'pctile' || k === 'min' || k === 'max');

      _.each(keys, (key) => {
        if (!fob.hasOwnProperty(key)) {
          fob[key] = item[key];
        }
      });
    };

    settings.constraints = { ...settings.constraints };

    _.each(l.filters, (f) => _.forEach(['min', 'max'], (m) => makeFilter(f, m)));
    settings.constraints.filters = filters;

    const xob = l.excluded;

    for (let i = 0; i < 3; i++) {
      let value = replaceAll(excludes[i].trim(), '\n', ',');
      value = replaceAll(value, ' ', ',');
      value = replaceAll(value, ',,', ',', true);

      if (i === 0) {
        settings.constraints.excludedISINs = { value, hard: xob.isins.hard || false };
      } else if (i === 1) {
        settings.constraints.excludedISINsForTrading = { value, hard: xob.isins4trading.hard };
      } else {
        settings.constraints.excludedTickers = { value, hard: xob.tickers.hard || false };
      }
    }

    updateDirtyMap(dirtyMap, 'settings', JSON.stringify(optimSettings), JSON.stringify(settings), dispatch);
    dispatch({ type: SET_OPTIM_SETTINGS, settings });
  };

  let r = document.getElementById('tabs-panel')?.getBoundingClientRect();

  if (!r) {
    return null;
  }

  const createFilter = (col: string) => {
    l.filters.push({ field: col, pctile: false, hard: false, min: undefined, max: undefined });

    setSelecting(FADE);

    l.onFilterCreated();
  };

  const handleModalClick = (e: any) => {
    if (typeof e.target.className === 'string' && e.target.className.includes('fe-col-selector-host')) {
      setSelecting(FADE);
    }
  };

  const handleAddFilter = (e: any) => {
    e?.stopPropagation();
    setSelecting(SHOW);
  };

  const handleClickTab = (index: any) => {
    if (currentTab !== index) {
      setCurrentTab(index);
    }
  };

  const setExtraRef = (e: any, i: number) => {
    switch (i) {
      case 2:
        l.caum = e;
        break;
      case 3:
        l.taum = e;
        break;
      case 4:
        l.turnover = e;
        break;
    }
  };

  const getFlagValue = (i: number) => {
    switch (i) {
      case 0:
        return runForReplacements;
      case 1:
        return fixHeldWeights;
    }
  };

  const setFlagValue = (i: number, value: boolean) => {
    switch (i) {
      case 0:
        setRunForReplacements(value);
        return;
      case 1:
        setFixHeldWeights(value);
        return;
    }
  };

  const rh = r.height - 46;
  const ry = r.y + 46;

  let h = 36 * ((l.filters.length || 0) + 1) + 220;
  h = Math.min(800, h);
  h = 800;

  const width = 736; // Math.min(800, r.width - 40);
  const height = Math.min(h, rh - 40);
  const left = r.x + (r.width - width) / 2;
  const top = ry + (rh - height) / 2;

  const displayStyle = (index: number) => `${currentTab === index ? 'grid' : 'none'}`;

  const renderExtraRows = () => {
    const grid = `auto / ${currentTab ? 150 : 250}px 1fr`;

    return (
      <>
        {_.map(EXTRAS, (xob, i: number) => {
          const tab = xob[0];
          const name = xob[1];
          const flag = xob[2];

          const display = displayStyle(Number(tab));
          const fvalue = getFlagValue(i);
          const background = i % 2 ? '#232F3B' : '#263340';

          return (
            <div key={i} className="fe-extra-row" style={{ display, background, grid }}>
              <div id={`fe-${name}`} className="fe-extra-label">
                {name}
              </div>
              {flag ? (
                <div className="fe-cell fe-extra-value" style={{ opacity: `${fvalue ? 1 : 0.25}` }} onClick={() => setFlagValue(i, !fvalue)}>
                  <div>{fvalue ? 'Yes' : 'No'}</div>
                </div>
              ) : (
                <input id={`input-${name}`} ref={(e) => setExtraRef(e, i)} className="fe-extra-input" type="number" spellCheck="false" />
              )}
            </div>
          );
        })}
      </>
    );
  };

  const hadnleBondsHardToggle = (i: number) => {
    const xob = l.excluded;

    if (i === 2) {
      xob.tickers.hard = !xob.tickers.hard;
    } else if (i === 0 && !runForReplacements) {
      xob.isins.hard = !xob.isins.hard;
    }

    forceUpdate();
  };

  return (
    <div className="modal-screen">
      <Popup ok="SAVE" style={{ left, top, width, height }} isOk={canSaveFilters} onExit={(ok: boolean) => onExit(ok)}>
        <div className="fe">
          <FilterTable hostLocals={l} style={{ marginBottom: '10px', display: `${displayStyle(0)}` }} />
          {currentTab === 0 && (
            <Button id="add-filter" classes="fe-add-button" tooltip="Add a filter" handleClick={handleAddFilter}>
              <SvgAddFilter width={20} />
            </Button>
          )}

          <div className="fe-extras" style={{ gridArea: '2/1', display: `${displayStyle(0)}` }}>
            {renderExtraRows()}
          </div>

          <div className="grid-header fe-row fe-header-row fe-bonds-header-row" style={{ display: `${displayStyle(0)}` }}>
            <div />
            <div className="fe-cell fe-cell-header">excluded items </div>
            <div className="fe-cell fe-cell-header">hard </div>
          </div>

          {_.map([0, 1, 2], (i) => {
            const background = i % 2 ? '#232F3B' : '#263340';
            const label = i ? (i === 1 ? 'ISINs for Trading' : 'Tickers') : 'ISINs';
            const xob = i === 0 ? l.excluded.isins : i === 1 ? l.excluded.isins4trading : l.excluded.tickers;
            const opacity = i === 1 ? 0 : xob.hard ? 1 : 0.25;
            const cursor = i === 0 ? (runForReplacements ? 'not-allowed' : 'pointer') : i === 1 ? 'unset' : 'pointer';
            return (
              <div id={`bonds-${i}`} key={i} className="fe-bonds-row" style={{ background, display: `${displayStyle(0)}` }}>
                <div id={`bonds-label-${i}`} className="fe-bonds-label">
                  {label}
                </div>
                <textarea
                  id={`bonds-textarea-${i}`}
                  ref={(e) => (xob.input = e)}
                  className="fe-bonds-input root-scroll"
                  style={{ background }}
                />
                <div className="fe-cell" style={{ opacity, cursor, border: 0 }} onClick={() => hadnleBondsHardToggle(i)}>
                  {opacity < 1 ? 'No' : 'Yes'}
                </div>
              </div>
            );
          })}

          <div className="fe-extras-table" style={{ display: `${displayStyle(1)}` }}>
            <div className="grid-header fe-header-row" style={{ grid: 'auto / 150px 1fr' }}>
              <div className="fe-extra-header-cell">field</div>
              <div className="fe-extra-header-cell">value </div>
            </div>
            <div className="fe-extras root-scroll" style={{ gridArea: '2/1' }}>
              {renderExtraRows()}
            </div>
          </div>
        </div>
        {selecting !== HIDE && (
          <animated.div
            className="fe-col-selector-host"
            onClick={handleModalClick}
            style={{ opacity, height: spring.interpolate((s: any) => `${s * 100}%`) }}>
            <div className="fe-col-selector root-scroll">
              {_.map(cols, (col, i) => {
                const off = Math.random();
                return (
                  <animated.div
                    key={i}
                    className="fe-col-selector-item"
                    onClick={() => createFilter(col)}
                    style={{ transform: spring.interpolate((s: any) => `translateX(${(s - 1) * off * 100}%)`) }}>
                    {col}
                  </animated.div>
                );
              })}
            </div>
          </animated.div>
        )}
        <div className="fe-tabs-border"></div>
        <div id="fe-tab-bar" className="fe-tab-bar">
          {_.map([0, 1], (_, i) => {
            const classes = `fe-tab ${i === currentTab ? 'fe-tab-selected' : ''}`;
            return (
              <div id={`fe-tabs-tab-${i + 1}`} key={i} className={classes} onClick={() => handleClickTab(i)}>
                {i ? (
                  <span style={{ marginBottom: '-8px' }}>• • •</span>
                ) : (
                  <SvgAddFilter plus={false} width={22} color="white" style={{ transform: 'translate(5px, 2px)' }} />
                )}
              </div>
            );
          })}
        </div>
      </Popup>
    </div>
  );
};

export default FriendlyEditor;
