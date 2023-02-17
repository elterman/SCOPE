import React, { useEffect, useState, useContext } from 'react';
import { StoreContext } from './Store';
import { SET_DT_FILTERS, SET_CURRENT_PAGE, SET_COMP_FILTERS } from './reducer';
import { SET_CURRENT_COMP_PAGE, SET_CURRENT_RT_PAGE, SET_RT_FILTERS } from './reducer';
import _ from 'lodash';
import { OPERATORS, NUM_FILTER_CHARS, TAB_HISTORY, HEADER_COLOR } from './const';
import { replaceAll } from './Utils';
import { useTooltip } from './Tooltip';
import { useAtomValue, useSetAtom } from 'jotai';
import { show_filter_help, selected_tab } from './atoms';

const ColumnFilter = (props: any) => {
  const store = useContext(StoreContext);
  const { state, dispatch } = store;
  const { compare } = state;
  const selectedTab = useAtomValue(selected_tab);
  const hist = selectedTab === TAB_HISTORY;
  const comp = compare && hist;
  const filters = comp ? state.compFilters : hist ? state.runTableFilters : state.filters;
  const { column } = props;
  const [filter, setFilter] = useState<string>('');
  const { showTooltip, hideTooltip } = useTooltip();
  const setShowFilterHelp = useSetAtom(show_filter_help);

  useEffect(() => {
    setFilter(filters?.[column] ? filters[column][1] : '');
  }, [column, filters]);

  const handleChange = (e: any) => {
    setFilter(e.target.value);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'F1') {
      e.preventDefault();
      setShowFilterHelp(true);
      return;
    }

    if (e.key === 'Escape') {
      setFilter(filters[column] === undefined ? '' : filters[column][1]);
      return;
    }

    if (e.key === 'Enter') {
      if (filters[column]?.[0] === filter?.toUpperCase()) {
        return;
      }

      if (filter) {
        filters[column] = [normalizeFilter(), filter];
      } else {
        delete filters[column];
      }

      setFilters();
    }
  };

  const normalizeFilter = () => {
    if (filter === null) {
      return filter;
    }

    let fx = replaceAll(filter, '>=', '≥');
    fx = replaceAll(fx, '<=', '≤');
    fx = replaceAll(fx, '<>', '#');
    fx = replaceAll(fx, ' ', '', true);

    if (fx && _.some(OPERATORS, (op) => fx[0] === op) && _.every(fx, (ch) => NUM_FILTER_CHARS.includes(ch))) {
      return fx;
    }

    return filter?.toUpperCase();
  };

  const handleBlur = (e: any) => {
    if (!filters[column]) {
      setFilter('');
    }
  };

  const handleX = () => {
    if (!filter) {
      return;
    }

    setFilter('');

    delete filters[column];
    setFilters();
  };

  const setFilters = () => {
    dispatch({ type: comp ? SET_CURRENT_COMP_PAGE : hist ? SET_CURRENT_RT_PAGE : SET_CURRENT_PAGE, page: 1 });
    dispatch({ type: comp ? SET_COMP_FILTERS : hist ? SET_RT_FILTERS : SET_DT_FILTERS, filters: { ...filters } });
  };

  const style = { height: '30px', borderRadius: 0, background: '#0004' };
  const xOpacity = filters[column] ? 1 : 0;

  const tooltip = !comp && column === 'paceID' ? 'To filter, use:\n \n–1 for Eligible\n–2 for Pending\n–  for both' : null;

  return (
    <div id={`cf-${column}`} className="dt-filter" style={{ border: `solid ${HEADER_COLOR}`, borderWidth: '0 1px 1px 0' }}>
      <input
        id={`cf-search-box-${column}`}
        className="search-box"
        style={{ ...style, fontSize: '13px' }}
        type="text"
        placeholder=" filter"
        spellCheck="false"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        value={filter}
        onMouseEnter={(e) => showTooltip({ e, text: tooltip, dx: -40, style: { fontFamily: 'Roboto Mono', fontSize: '12px' } })}
        onMouseLeave={hideTooltip}
      />
      <div id={`ss-search-x-${column}`} className={`search-x ${filter ? 'search-x-enabled' : ''}`} style={{ ...style }} onClick={handleX}>
        <div style={{ opacity: xOpacity }}>×</div>
      </div>
    </div>
  );
};

export default ColumnFilter;

export const filterMatch = (value: string, filter: string, isPercent: boolean) => {
  if (isPercent) {
    const i = value.indexOf('.');
    value = `${value.slice(0, i)}${value.slice(i + 1, i + 3)}.${value.slice(i + 3)}`;
  }

  if (!_.some(OPERATORS, (op) => filter[0] === op)) {
    const len = filter.length;
    const exact = len && filter[0] === '"' && filter[len - 1] === '"';

    if (exact) {
      const f = filter.slice(1, len - 1);
      return value === f || (_.isEmpty(value) && _.isEmpty(f));
    }

    return value?.includes(filter);
  }

  // try numeric filter

  const n = Number(value);

  if (isNaN(n)) {
    return false;
  }

  const nums = _.split(filter.substring(1), /<|≤|=|#|≥|>/);
  const ops = _.filter(filter, (ch) => _.some(OPERATORS, (op) => ch === op));

  if (nums.length !== ops.length) {
    return false;
  }

  for (let i = 0; i < ops.length; i++) {
    const num = Number(nums[i]);

    if (isNaN(num)) {
      return false;
    }

    switch (ops[i]) {
      case '<':
        if (n >= num) {
          return false;
        }
        break;
      case '≤':
        if (n > num) {
          return false;
        }
        break;
      case '=':
        if (n !== num) {
          return false;
        }
        break;
      case '#':
        if (n === num) {
          return false;
        }
        break;
      case '≥':
        if (n < num) {
          return false;
        }
        break;
      case '>':
        if (n <= num) {
          return false;
        }
        break;
    }
  }

  return true;
};
