import { useContext } from 'react';
import { StoreContext } from './Store';
import { FREEZE, TAB_HISTORY } from './const';
import _ from 'lodash';
import { column_metadata, column_order, comp_column_metadata, run_column_metadata, selected_tab } from './atoms';
import { useAtomValue } from 'jotai';
import { loadColumnOrder } from './Utils';

const useColumns = (freeze: number = FREEZE) => {
  const store = useContext(StoreContext);
  const { state } = store;
  const { compare, hiddenColumns, nonExportableColumns } = state;
  const selectedTab = useAtomValue(selected_tab);
  const columnOrder = useAtomValue(column_order) || loadColumnOrder();
  const hist = selectedTab === TAB_HISTORY;
  const comp = compare && hist;
  const allColumns = comp ? state.compColumns : hist ? state.runColumns : state.columns;
  const columns = freeze > 0 ? _.take(allColumns, freeze) : freeze < 0 ? _.takeRight(allColumns, allColumns.length + freeze) : allColumns;
  const metadata = useAtomValue(comp ? comp_column_metadata : hist ? run_column_metadata : column_metadata);

  const getColumn = (index: number) => columns[index];

  const isHidden = (column: string | null, index: number = -1) => {
    if (!column && index >= 0) {
      column = getColumn(index);
    }

    return _.includes(hiddenColumns, column);
  };

  const isExportable = (column: string | null, index: number = -1) => {
    if (!column && index >= 0) {
      column = getColumn(index);
    }

    return !_.includes(nonExportableColumns, column);
  };

  const orderData = (table: any[], order: string[] | null = null) => {
    if (_.isEmpty(order)) {
      order = columnOrder;
    }

    if (_.isEmpty(order)) {
      return;
    }

    _.each(table, (row) => {
      let pairs = _.toPairs(row);
      pairs = _.takeRight(pairs, pairs.length - FREEZE);

      pairs = _.sortBy(pairs, (p) => {
        const i = _.indexOf(order, p[0]);
        return i < 0 ? Number.MAX_SAFE_INTEGER : i;
      });

      _.each(pairs, (p) => {
        const key = p[0];
        delete row[key];
        row[key] = p[1];
      });
    });
  };

  return { columns, metadata, getColumn, isHidden, isExportable, orderData };
};

export default useColumns;
