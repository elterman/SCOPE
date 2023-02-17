import React, { useContext } from 'react';
import { StoreContext } from './Store';
import SvgSort from './ICONS/SvgSort';
import { SET_COMP_SORT, SET_RT_SORT, SET_SORT } from './reducer';
import { EDITABLE_CELL, EXCLUDE_COLUMN, GOLD, GREEN, INCLUDE_COLUMN_WIDTH, RED, ROW_HEAD, WHITE } from './const';
import { getRowColor } from './DataRow';
import { TAB_HISTORY } from './const';
import { columnWidth, getLabel } from './Utils';
import { useTooltip } from './Tooltip';
import { selected_tab } from './atoms';
import { useAtomValue } from 'jotai';

const DataHeaderCell = (props: any) => {
  const { columnSizes, columnMetadata } = props;
  const store = useContext(StoreContext);
  const { state, dispatch } = store;
  const { compare } = state;
  const selectedTab = useAtomValue(selected_tab);
  const hist = selectedTab === TAB_HISTORY;
  const comp = compare && hist;
  const sort = comp ? state.compSort : hist ? state.runTableSort : state.sort;
  const { showTooltip, hideTooltip } = useTooltip();

  let column = props.value;
  const missing = column.includes(':Missing');
  const added = column.includes(':Added');
  column = column.split(':')[0];

  const handleClick = () => {
    if (sort?.column === column) {
      sort.asc = !sort.asc;
    } else {
      sort.column = column;
      sort.asc = true;
    }

    dispatch({ type: comp ? SET_COMP_SORT : hist ? SET_RT_SORT : SET_SORT, sort: { ...sort } });
  };

  const background = missing || added ? '#222' : getRowColor(ROW_HEAD);
  const color = missing ? RED : added ? GREEN : !hist && (column === EDITABLE_CELL || column === EXCLUDE_COLUMN) ? GOLD : WHITE;
  const header = getLabel(column, columnMetadata);
  const tooltip = `${column}${missing ? '\n(missing in run 2)' : ''}${added ? '\n(added in run 2)' : ''}`;

  let width = columnWidth(columnSizes, column);

  if (column === EXCLUDE_COLUMN) {
    column = 'include';
    width = INCLUDE_COLUMN_WIDTH;
  }

  return (
    <div
      id={`dt-cell-${column}`}
      className="dt-cell dt-header-cell"
      style={{ width, background, cursor: 'pointer', justifyContent: 'center' }}
      onClick={handleClick}>
      {sort.column === column ? (
        <div id={`dt-sort-${column}`} className="sort-svg">
          <SvgSort width={10} asc={sort.asc} />
        </div>
      ) : null}
      <div className="dt-cell-content" style={{ color }} onMouseEnter={(e) => showTooltip({ e, text: tooltip })} onMouseLeave={hideTooltip}>
        {header}
      </div>
    </div>
  );
};

export default DataHeaderCell;
