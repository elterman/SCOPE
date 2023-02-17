import React, { useReducer } from 'react';
import { reducer, SET_HIDDEN_COLUMNS, SET_NON_EXPORTABLE_COLUMNS } from './reducer';
import { DEFAULT_RUN_SELECTOR_WIDTH } from './const';
import { DEFAULT_SLEEVE_SELECTOR_WIDTH } from './const';

export interface ScopeStore {
  state: any;
  dispatch: any;
}

export const StoreContext = React.createContext<ScopeStore>({ state: null, dispatch: null });

const useStore = () => {
  let cols = localStorage.getItem(SET_HIDDEN_COLUMNS);
  const hcols = cols ? cols.split(', ') : [];
  cols = localStorage.getItem(SET_NON_EXPORTABLE_COLUMNS);
  const nxcols = cols ? cols.split(', ') : [];

  const initState = {
    currentPage: 1,
    currentLogPage: 1,
    currentHistoryPage: 1,
    currentCompSelectorPage: 1,
    currentCompPage: 1,
    currentRunTablePage: 1,
    columns: [],
    compColumns: [],
    runColumns: [],
    filters: {},
    compFilters: {},
    runTableFilters: {},
    sort: { column: null },
    compSort: { column: null },
    runTableSort: { column: null },
    dirtyMap: new Map(),
    sleeveSelectorWidth: DEFAULT_SLEEVE_SELECTOR_WIDTH,
    runSelectorWidth: DEFAULT_RUN_SELECTOR_WIDTH,
    aggregates: [null, null],
    selectedRunSettings: null,
    compShowDiffOnly: true,
    compSortByRun: 1,
    compFilterByRun: 1,
    hiddenColumns: hcols,
    nonExportableColumns: nxcols,
  };

  const [state, dispatch] = useReducer(reducer, initState);
  return { state, dispatch };
};

export default useStore;
