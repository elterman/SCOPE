import React, { useContext, useRef } from 'react';
import { StoreContext } from './Store';
import { SET_COMP_SHOW_DIFF_ONLY, SET_COMP_SORT_BY_RUN } from './reducer';
import { SET_COMPARE, SET_COMP_FILTERS, SET_COMP_FILTER_BY_RUN, SET_COMP_SELECTOR_FILTER } from './reducer';
import SvgArrow from './ICONS/SvgArrow';
import SvgUnfilter from './ICONS/SvgUnfilter';
import Button from './Button';
import { COLUMNS_BUTTON_TOOLTIP, GOLD, OFF_WHITE } from './const';
import _ from 'lodash';
import CheckBox from './CheckBox';
import RadioButton from './RadioButton';
import { exportToExcel } from './Utils';
import SvgExcelNew from './ICONS/SvgExcelNew';
import SvgColumns from './ICONS/SvgColumns';
import { useTooltip } from './Tooltip';
import { useAtomValue, useSetAtom } from 'jotai';
import { column_selector_on, comp_column_metadata } from './atoms';

const CompareToolbar = () => {
  const store = useContext(StoreContext);
  const { state, dispatch } = store;
  const { selectedRun, compareRun, compTable, compFilters, selectedRunSettings, compRunSettings } = state;
  const { compShowDiffOnly, compSortByRun, compFilterByRun, selectedSleeve, filteredCompTable, compSelectorFilter } = state;
  const { nonExportableColumns } = state;
  const l: any = useRef({}).current;
  const { hideTooltip } = useTooltip();
  const setColumnSelectorOn = useSetAtom(column_selector_on);
  const compColumnMetadata = useAtomValue(comp_column_metadata);

  const setSelectorFilter = (filter: any) => dispatch({ type: SET_COMP_SELECTOR_FILTER, filter });

  const handleSearchInput = (e: any) => {
    const filter = e.target.value;
    setSelectorFilter([filter?.toUpperCase(), filter]);
  };

  const handleSearchX = () => {
    if (!compSelectorFilter) {
      return;
    }

    setSelectorFilter(null);
    l.searchBox.focus();
  };

  const uncompare = () => {
    hideTooltip();
    dispatch({ type: SET_COMPARE, show: false });
  };

  const removeFilters = () => {
    if (!_.isEmpty(compFilters)) {
      dispatch({ type: SET_COMP_FILTERS, filters: [] });
    }
  };

  return (
    <>
      <Button id="opt-btn-exit-compare" label="Back to History" style={{ gridArea: '1/1' }} handleClick={uncompare}>
        <SvgArrow width={16} />
      </Button>
      {compareRun ? (
        <>
          {compTable?.length > 0 && (
            <>
              <Button
                id="opt-btn-export"
                style={{ padding: '0 7px' }}
                tooltip="Export filtered data and settings"
                handleClick={() =>
                  exportToExcel({
                    data: filteredCompTable,
                    settings: selectedRunSettings,
                    settings2: compRunSettings,
                    sleeve: selectedSleeve,
                    run1: selectedRun,
                    run2: compareRun,
                    meta: compColumnMetadata,
                    nonExportableColumns,
                  })
                }>
                <SvgExcelNew width={18} />
              </Button>

              <Button
                id="opt-btn-columns"
                style={{ padding: '0 7px' }}
                handleClick={() => {
                  setColumnSelectorOn(true);
                }}
                tooltip={COLUMNS_BUTTON_TOOLTIP}>
                <SvgColumns width={18} />
              </Button>

              <Button
                id="opt-btn-remove-filters"
                style={{ padding: '0 7px' }}
                disabled={_.isEmpty(compFilters)}
                tooltip="Remove all filters"
                handleClick={removeFilters}>
                <SvgUnfilter width={18} disabled={_.isEmpty(compFilters)} />
              </Button>
              <CheckBox
                style={{ marginLeft: '10px' }}
                checked={compShowDiffOnly}
                label="Show diff. only"
                handleToggle={(show: boolean) => dispatch({ type: SET_COMP_SHOW_DIFF_ONLY, show })}
              />
              <div className="toolbar-separator"></div>
              <div className="grid-cols">
                <div style={{ color: OFF_WHITE, fontSize: '14px', marginRight: '5px', whiteSpace: 'nowrap' }}>Use run</div>
                <RadioButton
                  checked={compSortByRun === 1}
                  label="1"
                  gap={5}
                  handleToggle={() => dispatch({ type: SET_COMP_SORT_BY_RUN, run: 1 })}
                />
                <RadioButton
                  checked={compSortByRun === 2}
                  label="2"
                  gap={5}
                  handleToggle={() => dispatch({ type: SET_COMP_SORT_BY_RUN, run: 2 })}
                />
                <div style={{ color: OFF_WHITE, fontSize: '14px', marginLeft: '5px', whiteSpace: 'nowrap' }}>to sort</div>
              </div>
              <div className="toolbar-separator"></div>
              <div className="grid-cols">
                <div style={{ color: OFF_WHITE, fontSize: '14px', marginRight: '5px', whiteSpace: 'nowrap' }}>Use run</div>
                <RadioButton
                  checked={compFilterByRun === 1}
                  label="1"
                  gap={5}
                  handleToggle={() => dispatch({ type: SET_COMP_FILTER_BY_RUN, run: 1 })}
                />
                <RadioButton
                  checked={compFilterByRun === 2}
                  label="2"
                  gap={5}
                  handleToggle={() => dispatch({ type: SET_COMP_FILTER_BY_RUN, run: 2 })}
                />
                <div style={{ color: OFF_WHITE, fontSize: '14px', marginLeft: '5px', whiteSpace: 'nowrap' }}>to filter</div>
              </div>
              <div className="toolbar-separator"></div>
            </>
          )}
        </>
      ) : (
        <>
          <div id="oh-inner-header" className="log-search" style={{ gridArea: '1/2' }}>
            <input
              id="oh-search-box"
              className="search-box"
              type="text"
              placeholder="search"
              spellCheck="false"
              onChange={handleSearchInput}
              value={compSelectorFilter ? compSelectorFilter[1] : ''}
              ref={(e) => (l.searchBox = e)}
            />
            <div id="oh-search-x" className={`search-x ${compSelectorFilter ? 'search-x-enabled' : ''}`} onClick={handleSearchX}>
              ×
            </div>
          </div>
          <div style={{ color: GOLD, whiteSpace: 'nowrap', marginLeft: '10px' }}>Select a second run to compare data and settings</div>
        </>
      )}
    </>
  );
};

export default CompareToolbar;
