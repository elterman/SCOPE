import React, { useContext } from 'react';
import { StoreContext } from './Store';
import { EXCLUDE_COLUMN, INCLUDE_COLUMN_WIDTH, TAB_HISTORY } from './const';
import { getRowColor } from './DataRow';
import { columnWidth, getPrecision, formatNumeric, getSeparateThousands, getIsPercent } from './Utils';
import _ from 'lodash';
import { useAtomValue } from 'jotai';
import { selected_tab } from './atoms';

const AggregateCell = (props: any) => {
  const { type, ci, columnSizes, freeze, columnMetadata } = props;
  let value = props.value;
  const store = useContext(StoreContext);
  const { state } = store;
  const selectedTab = useAtomValue(selected_tab);
  let columns = selectedTab === TAB_HISTORY ? state.runColumns : state.columns;
  columns = freeze > 0 ? _.take(columns, freeze) : freeze < 0 ? _.takeRight(columns, columns.length + freeze) : columns;
  const column = columns[ci];
  const precision = getPrecision(column, columnMetadata);
  const thou = getSeparateThousands(column, columnMetadata);
  const isPercent = getIsPercent(column, columnMetadata);
  const width = column === EXCLUDE_COLUMN ? INCLUDE_COLUMN_WIDTH : columnWidth(columnSizes, column);
  const background = getRowColor(type);

  return (
    <div id={`dt-cell-${column}`} className="dt-cell bordered-cell" style={{ width, background }}>
      <div className="dt-cell-content" style={{ justifySelf: `${_.isNumber(value) ? 'end' : 'initial'}` }}>
        {formatNumeric(value, precision, thou, isPercent)}
      </div>
    </div>
  );
};

export default AggregateCell;
