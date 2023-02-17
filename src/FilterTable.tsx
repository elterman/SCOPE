import React, { useEffect, useState, useRef, useCallback } from 'react';
import _ from 'lodash';
import SvgX from './ICONS/SvgX';
import SvgSort from './ICONS/SvgSort';
import useForceUpdate from './useForceUpdate';
import { WHITE, YELLOW } from './const';
import { useSpring, animated } from 'react-spring';
import { useSetAtom } from 'jotai';
import { can_save_filters } from './atoms';

const FilterTable = (props: any) => {
  const { hostLocals, style } = props;
  const [onX, setOnX] = useState<number | null>(null);
  const [sort, setSort] = useState<boolean | null>(true);
  const forceUpdate = useForceUpdate(true);
  const l: any = useRef({}).current;
  let filters = hostLocals.filters;
  const setCanSaveFilters = useSetAtom(can_save_filters);

  const { spring } = useSpring({ spring: 1, from: { spring: 0 } });

  const validate = useCallback(
    (index: number) => {
      if (_.isEmpty(filters)) {
        return true;
      }

      const f = filters[index];
      f.valid = true;

      const min = _.get(f, 'min');
      const max = _.get(f, 'max');

      if (min !== undefined && isNaN(min)) {
        f.valid = false;
      }

      if (f.valid && max !== undefined && isNaN(max)) {
        f.valid = false;
      }

      if (f.valid && min === undefined && max === undefined) {
        f.valid = false;
      }

      if (f.valid && min !== undefined && max !== undefined && min > max) {
        f.valid = false;
      }

      setCanSaveFilters(f.valid);

      return f.valid;
    },
    [filters, setCanSaveFilters]
  );

  const validateUnique = useCallback(() => {
    _.each(filters, (f) => {
      f.duplicate = false;
    });

    _.each(filters, (f1) => {
      if (f1.duplicate) {
        return;
      }

      _.each(filters, (f2) => {
        if (f1 === f2 || f2.duplicate) {
          return;
        }

        if (_.isEqualWith(f1, f2, (f1, f2) => f1 !== f2 && f1.field === f2.field && f1.pctile === f2.pctile && f1.hard === f2.hard)) {
          f1.duplicate = f2.duplicate = true;
        }
      });
    });

    setCanSaveFilters(_.every(filters, (f) => f.valid && !f.duplicate));
  }, [filters, setCanSaveFilters]);

  useEffect(() => {
    for (let i = 0; i < filters.length; i++) {
      validate(i);
    }

    validateUnique();
  }, [filters.length, validate, validateUnique]);

  useEffect(() => {
    if (l.grid) {
      hostLocals.grid = l.grid;
    }
  }, [hostLocals, l.grid]);

  const togglePctile = (i: number) => {
    filters[i].pctile = !filters[i].pctile;
    forceUpdate();
    validateUnique();
  };

  const toggleHard = (i: number) => {
    filters[i].hard = !filters[i].hard;
    forceUpdate();
    validateUnique();
  };

  const deleteFilter = (i: any) => {
    _.remove(filters, (f, j) => j === i);
    validateUnique();
    setOnX(null);
  };

  const handleFieldHeaderClick = (e: any) => {
    const asc = sort === null ? true : !sort;
    filters = hostLocals.filters = _.orderBy(filters, ['field', 'pctile', 'hard'], asc ? 'asc' : 'desc');
    setSort(asc);
  };

  const onFilterCreated = () => {
    setTimeout(() => l.grid?.scrollTo(0, l.grid.scrollHeight), 1);
    setSort(null);
    validateUnique();
  };

  const makeInputId = (i: number, j: number) => `input-${i}-${j}`;

  const makeMinMaxId = (i: number, j: number) => `minmax-${i}-${j}`;

  const inputBox = (i: number, j: number) => {
    const id = makeInputId(i, j);
    return document.getElementById(id) as HTMLInputElement;
  };

  hostLocals.onFilterCreated = onFilterCreated;

  const setEdit = (set: any) => {
    l.edit = set;
    forceUpdate();
  };

  const handleMinMaxClick = (i: number, j: number) => {
    if (!l.edit) {
      const box = inputBox(i, j);
      box.style.visibility = 'visible';
      box.focus();
    }
  };

  const handleFocus = (i: number, j: number) => {
    setEdit({ i, j });
    const value = filters[i][j ? 'max' : 'min'];

    const input = inputBox(i, j);
    input.value = value === undefined ? '' : value;
  };

  const handleBlur = (i: number, j: number) => {
    const box = inputBox(i, j);
    box.style.visibility = 'hidden';

    if (l.edit) {
      acceptChange();
    } else {
      const input = box;
      input.value = '';
    }
  };

  const handleInputKeyDown = (e: any) => {
    if (e.key === 'Escape') {
      setEdit(null);
      e.target.value = '';
      e.target.blur();
      return;
    }

    if (e.key === 'Enter') {
      acceptChange();
    }
  };

  const acceptChange = () => {
    const { i, j } = l.edit;
    const input = inputBox(i, j);

    if (input.value === '') {
      delete filters[i][j ? 'max' : 'min'];
    } else {
      filters[i][j ? 'max' : 'min'] = Number(input.value);
    }

    setEdit(null);
    input.value = '';
    input.blur();

    if (validate(i)) {
      validateUnique();
    }
  };

  return (
    <div className="fe-table" style={{ ...style }}>
      <div className="grid-header fe-row fe-header-row">
        <div className="fe-cell fe-cell-field" style={{ cursor: 'pointer' }} onClick={handleFieldHeaderClick}>
          <div style={{ gridArea: '1/1' }}>field</div>
          {sort !== null && (
            <div id="fe-sort-svg" className="fe-sort">
              <SvgSort width={10} asc={sort} color={WHITE} />
            </div>
          )}
        </div>
        <div className="fe-cell fe-cell-header">pctile </div>
        <div className="fe-cell fe-cell-header">hard </div>
        <div className="fe-cell fe-cell-header">min </div>
        <div className="fe-cell fe-cell-header">max</div>
      </div>
      <animated.div
        ref={(e) => (l.grid = e)}
        className="fe-grid root-scroll"
        style={{ transform: spring.interpolate((s: any) => `translateX(${(s - 1) * 100}%)`) }}>
        {_.map(filters, (f, i: number) => {
          const background = i % 2 ? '#232F3B' : '#263340';
          const popacity = f.pctile ? 1 : 0.25;
          const hopacity = f.hard ? 1 : 0.25;
          const border = f.duplicate || (!f.valid && l.edit?.i !== i) ? '1px solid #F00' : 'none';
          return (
            <div key={i} className="fe-row" style={{ background, border }}>
              <div className="fe-cell fe-cell-field">{f.field}</div>
              <div className="fe-cell" onClick={() => togglePctile(i)}>
                <div style={{ opacity: popacity }}>{f.pctile ? 'Yes' : 'No'}</div>
              </div>
              <div className="fe-cell" onClick={() => toggleHard(i)}>
                <div style={{ opacity: hopacity }}>{f.hard ? 'Yes' : 'No'}</div>
              </div>
              {_.map([f.min, f.max], (m, j) => {
                const editing = i === l.edit?.i && j === l.edit?.j;
                return (
                  <React.Fragment key={j}>
                    <input
                      id={makeInputId(i, j)}
                      className="fe-cell-input"
                      style={{ gridArea: `1/${j + 4}`, background, borderColor: `${editing ? YELLOW : '#0000'}` }}
                      type="number"
                      spellCheck="false"
                      onKeyDown={handleInputKeyDown}
                      onFocus={() => handleFocus(i, j)}
                      onBlur={() => handleBlur(i, j)}
                    />
                    {!editing && (
                      <div
                        id={makeMinMaxId(i, j)}
                        key={j}
                        className="fe-cell"
                        style={{ gridArea: `1/${j + 4}` }}
                        onClick={() => handleMinMaxClick(i, j)}>
                        {m}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              <div className="fe-x" onMouseEnter={() => setOnX(i)} onMouseLeave={() => setOnX(null)} onClick={() => deleteFilter(i)}>
                <SvgX width={14} color={i === onX ? '#F00' : '#FFF2'} />
              </div>
            </div>
          );
        })}
      </animated.div>
    </div>
  );
};

export default FilterTable;
