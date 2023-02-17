import { DEFAULT_RUN_SELECTOR_WIDTH, LAYOUT_START } from './const';

export const SET_SELECTED_SLEEVE = 'SET_SELECTED_SLEEVE';
export const SET_OPTIM_SETTINGS = 'SET_OPTIM_SETTINGS';
export const SET_ORIGINAL_OPTIM_SETTINGS = 'SET_ORIGINAL_OPTIM_SETTINGS';
export const SET_RUN_SETTINGS = 'SET_SELECTED_RUN_SETTINGS';
export const SET_COMP_RUN_SETTINGS = 'SET_COMP_RUN_SETTINGS';
export const SET_CAN_EXPORT_TARGETS = 'SET_CAN_EXPORT_TARGETS';
export const SET_OPTIMIZED = 'SET_OPTIMIZED';
export const SET_LAYOUT = 'SET_LAYOUT';
export const SET_DIRTY_MAP = 'SET_DIRTY_MAP';
export const SET_SLEEVE_SELECTOR_WIDTH = 'SET_SLEEVE_SELECTOR_WIDTH';
export const SET_RUN_SELECTOR_WIDTH = 'SET_RUN_SELECTOR_WIDTH';
export const SET_COMMENT = 'SET_COMMENT';
export const SET_FILTERED_LOG = 'SET_FILTERED_LOG';
export const SET_CURRENT_LOG_PAGE = 'SET_CURRENT_LOG_PAGE';
export const SET_HISTORY = 'SET_HISTORY';
export const SET_FILTERED_HISTORY = 'SET_FILTERED_HISTORY';
export const SET_FILTERED_COMP_RUNS = 'SET_FILTERED_COMPARE_RUNS';
export const SET_SELECTED_RUN = 'SET_SELECTED_RUN';
export const SET_SELECTED_RUN_SCROLL_TO = 'SET_SELECTED_RUN_SCROLL_TO';
export const SET_CURRENT_HISTORY_PAGE = 'SET_CURRENT_HISTORY_PAGE';
export const SET_CURRENT_COMP_SELECTOR_PAGE = 'SET_CURRENT_COMPARE_SELECTOR_PAGE';
export const SET_COMPARE_RUNS = 'SET_FILTERED_COMPARE_RUNS';
export const SET_COMPARE_RUN = 'SET_COMPARE_RUN';
export const SET_HISTORY_FILTER = 'SET_HISTORY_FILTER';
export const SET_COMP_SELECTOR_FILTER = 'SET_COMPARE_SELECTOR_FILTER';
export const SET_COMPARE = 'SET_COMPARE';
export const SET_DATA_TABLE = 'SET_DATA_TABLE';
export const SET_FILTERED_TABLE = 'SET_FILTERED_TABLE';
export const SET_DT_FILTERS = 'SET_DT_FILTERS';
export const SET_DT_COLUMNS = 'SET_DT_COLUMNS';
export const SET_CURRENT_PAGE = 'SET_CURRENT_PAGE';
export const SET_SORT = 'SET_SORT';
export const SET_AGGREGATES = 'SET_AGGREGATES';
export const SET_RUN_TABLE = 'SET_RUN_TABLE';
export const SET_RT_AGGREGATES = 'SET_RT_AGGREGATES';
export const SET_RT_COLUMNS = 'SET_RUN_TABLE_COLUMNS';
export const SET_FILTERED_RUN_TABLE = 'SET_FILTERED_RUN_TABLE';
export const SET_CURRENT_RT_PAGE = 'SET_CURRENT_RUN_TABLE_PAGE';
export const SET_RT_FILTERS = 'SET_RUN_TABLE_FILTERS';
export const SET_RT_SORT = 'SET_RUN_TABLE_SORT';
export const SET_OPTIM_SETTINGS_HIDDEN = 'SET_OPTIMIZER_SETTINGS_HIDDEN';
export const SET_RUN_SETTINGS_HIDDEN = 'SET_RUN_SETTINGS_HIDDEN';
export const SET_COMP_SETTINGS_HIDDEN = 'SET_COMPARE_SETTINGS_HIDDEN';
export const SET_COMP_TABLE = 'SET_COMP_TABLE';
export const SET_COMP_COLUMNS = 'SET_COMP_COLUMNS';
export const SET_FILTERED_COMP_TABLE = 'SET_FILTERED_COMP_TABLE';
export const SET_CURRENT_COMP_PAGE = 'SET_CURRENT_COMP_PAGE';
export const SET_COMP_FILTERS = 'SET_COMP_FILTERS';
export const SET_COMP_SORT = 'SET_COMP_SORT';
export const SET_COMP_SHOW_DIFF_ONLY = 'SET_COMP_SHOW_DIFF_ONLY';
export const SET_COMP_SORT_BY_RUN = 'SET_COMP_SORT_BY_RUN';
export const SET_COMP_FILTER_BY_RUN = 'SET_COMP_FILTER_BY_RUN';
export const SET_HIDDEN_COLUMNS = 'SET_HIDDEN_COLUMNS';
export const SET_NON_EXPORTABLE_COLUMNS = 'SET_NON_EXPORTABLE_COLUMNS';

const uncompare = (state: any) => {
  return {
    ...state,
    compare: false,
    compareRun: null,
    compSelectorFilter: null,
    currentCompSelectorPage: 1,
    currentCompPage: 1,
    compareRuns: null,
    compTable: [],
    filteredCompTable: [],
    compFilters: {},
    compSort: { column: null },
    compRunSettings: null,
    compShowDiffOnly: true,
    compSortByRun: 1,
    compFilterByRun: 1,
  };
};

const unworkflow = (state: any) => {
  return {
    ...state,
    dt: [],
    aggregates: [null, null],
    settings: null,
    optimized: false,
    currentPage: 1,
    filters: {},
    sort: { column: null },
    dirtyMap: new Map(),
    runSettingsHidden: false,
    runSelectorWidth: DEFAULT_RUN_SELECTOR_WIDTH,
    comment: '',
    history: null,
    selectedRun: null,
    runTable: [],
    selectedRunSettings: null,
    runTableFilters: {},
    runTableSort: { column: null },
    currentRunTablePage: 1,
  };
};

export const reducer = (state: any, action: any) => {
  switch (action.type) {
    case SET_SELECTED_SLEEVE: {
      return {
        ...uncompare(state),
        ...unworkflow(state),
        selectedSleeve: action.sleeve,
      };
    }
    case SET_SELECTED_RUN:
      return { ...state, selectedRun: action.run, runTableFilters: {}, runTableSort: { column: null }, currentRunTablePage: 1 };
    case SET_COMPARE:
      return action.show ? { ...state, compare: true } : uncompare(state);
    case SET_DATA_TABLE:
      return { ...state, dt: action.dt };
    case SET_FILTERED_TABLE:
      return { ...state, ft: action.ft };
    case SET_RUN_TABLE:
      return { ...state, runTable: action.table };
    case SET_RT_AGGREGATES:
      return { ...state, runAggregates: action.aggregates };
    case SET_RT_COLUMNS:
      return { ...state, runColumns: action.columns };
    case SET_FILTERED_RUN_TABLE:
      return { ...state, filteredRunTable: action.ft };
    case SET_CURRENT_RT_PAGE:
      return { ...state, currentRunTablePage: action.page };
    case SET_RT_FILTERS:
      return { ...state, runTableFilters: action.filters };
    case SET_RT_SORT:
      return { ...state, runTableSort: action.sort };
    case SET_COMP_TABLE:
      return { ...state, compTable: action.table };
    case SET_COMP_COLUMNS:
      return { ...state, compColumns: action.columns };
    case SET_FILTERED_COMP_TABLE:
      return { ...state, filteredCompTable: action.ft };
    case SET_CURRENT_COMP_PAGE:
      return { ...state, currentCompPage: action.page };
    case SET_COMP_FILTERS:
      return { ...state, compFilters: action.filters };
    case SET_COMP_SORT:
      return { ...state, compSort: action.sort };
    case SET_DT_COLUMNS:
      return { ...state, columns: action.columns };
    case SET_DT_FILTERS:
      return { ...state, filters: action.filters };
    case SET_OPTIM_SETTINGS:
      return { ...state, optimSettings: action.settings };
    case SET_ORIGINAL_OPTIM_SETTINGS:
      return { ...state, originalOptimSettings: action.settings };
    case SET_RUN_SETTINGS:
      return { ...state, selectedRunSettings: action.settings };
    case SET_COMP_RUN_SETTINGS:
      return { ...state, compRunSettings: action.settings };
    case SET_CURRENT_PAGE:
      return { ...state, currentPage: action.page };
    case SET_CAN_EXPORT_TARGETS:
      return { ...state, canExportTargets: action.ok };
    case SET_OPTIMIZED:
      return { ...state, optimized: action.optimized, comment: '' };
    case SET_LAYOUT:
      return action.layout === LAYOUT_START ? { ...unworkflow(state), layout: action.layout } : { ...state, layout: action.layout };
    case SET_SORT:
      return { ...state, sort: action.sort };
    case SET_DIRTY_MAP:
      return { ...state, dirtyMap: action.map };
    case SET_OPTIM_SETTINGS_HIDDEN:
      return { ...state, optimSettingsHidden: action.hidden };
    case SET_RUN_SETTINGS_HIDDEN:
      return { ...state, runSettingsHidden: action.hidden };
    case SET_COMP_SETTINGS_HIDDEN:
      return { ...state, compSettingsHidden: action.hidden };
    case SET_SLEEVE_SELECTOR_WIDTH:
      return { ...state, sleeveSelectorWidth: action.width };
    case SET_RUN_SELECTOR_WIDTH:
      return { ...state, runSelectorWidth: action.width };
    case SET_COMMENT:
      return { ...state, comment: action.comment };
    case SET_AGGREGATES:
      return { ...state, aggregates: action.aggregates };
    case SET_CURRENT_LOG_PAGE:
      return { ...state, currentLogPage: action.page };
    case SET_FILTERED_LOG:
      return { ...state, filteredLog: action.flog };
    case SET_HISTORY:
      return { ...state, history: action.history };
    case SET_FILTERED_HISTORY:
      return { ...state, filteredRuns: action.runs };
    case SET_FILTERED_COMP_RUNS:
      return { ...state, filteredCompRuns: action.runs };
    case SET_SELECTED_RUN_SCROLL_TO:
      return { ...state, selectedRunScrollTo: action.pos };
    case SET_CURRENT_HISTORY_PAGE:
      return { ...state, currentHistoryPage: action.page };
    case SET_CURRENT_COMP_SELECTOR_PAGE:
      return { ...state, currentCompSelectorPage: action.page };
    case SET_COMPARE_RUNS:
      return { ...state, compareRuns: action.runs };
    case SET_COMPARE_RUN:
      return { ...state, compareRun: action.run };
    case SET_HISTORY_FILTER:
      return { ...state, historyFilter: action.filter };
    case SET_COMP_SELECTOR_FILTER:
      return { ...state, compSelectorFilter: action.filter };
    case SET_COMP_SHOW_DIFF_ONLY:
      return { ...state, compShowDiffOnly: action.show };
    case SET_COMP_SORT_BY_RUN:
      return { ...state, compSortByRun: action.run };
    case SET_COMP_FILTER_BY_RUN:
      return { ...state, compFilterByRun: action.run };
    case SET_HIDDEN_COLUMNS:
      localStorage.setItem(action.type, action.columns.join(', '));
      return { ...state, hiddenColumns: action.columns };
    case SET_NON_EXPORTABLE_COLUMNS:
      localStorage.setItem(action.type, action.columns.join(', '));
      return { ...state, nonExportableColumns: action.columns };
    default:
      return state;
  }
};
