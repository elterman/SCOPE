import React from 'react';
import _ from 'lodash';
import ColumnFilter from './ColumnFilter';
import { EXCLUDE_COLUMN, INCLUDE_COLUMN_WIDTH } from './const';
import { columnWidth } from './Utils';
import useColumns from './useColumns';

const FilterRow = (props: any) => {
  const { columns, columnSizes, freeze } = props;
  const { isHidden } = useColumns(freeze);

  return (
    <div id="dt-filters-row" style={{ display: 'grid', gridAutoFlow: 'column', justifyContent: 'start' }}>
      {_.map(columns, (column: string, i) => {
        const hidden = isHidden(column);
        const exclude = column === EXCLUDE_COLUMN;
        const width = hidden ? 0 : exclude ? INCLUDE_COLUMN_WIDTH : columnWidth(columnSizes, column);

        return (
          <div id={`dt-filter-${column}`} key={i} style={{ width }}>
            {hidden ? null : exclude ? <div className="exclude-filter-cell" /> : <ColumnFilter column={column} />}
          </div>
        );
      })}
      {columns?.length > 0 && freeze <= 0 ? (
        <div className="dt-cell bordered-cell" style={{ background: '#0004' }}>
          &nbsp;
        </div>
      ) : null}
    </div>
  );
};

export default FilterRow;
