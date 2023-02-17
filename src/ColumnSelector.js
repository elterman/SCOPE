import { useEffect, useState, useRef } from 'react';
import { useContext } from 'react';
import Popup from './Popup';
import SearchPanel from './SearchPanel';
import './FriendlyEditor.css';
import { StoreContext } from './Store';
import useForceUpdate from './useForceUpdate';
import _ from 'lodash';
import { SET_RUN_TABLE, SET_COMP_TABLE, SET_DATA_TABLE } from './reducer';
import { SET_HIDDEN_COLUMNS, SET_NON_EXPORTABLE_COLUMNS } from './reducer';
import useColumns from './useColumns';
import { BLUE, COLUMN_ORDER, FREEZE, GREEN, OFF_WHITE, RED } from './const';
import { getLabel, loadColumnOrder } from './Utils';
import { useSpring, animated } from 'react-spring';
import { useTooltip } from './Tooltip';
import { useAtom, useSetAtom } from 'jotai';
import { column_order, column_selector_on, column_selector_search, selected_tab } from './atoms';

const ColumnSelector = () => {
  const store = useContext(StoreContext);
  const { state, dispatch } = store;
  const { hiddenColumns, nonExportableColumns } = state;
  const { dt, compTable, runTable, aggregates, runAggregates } = state;
  const [hcols, setHidden] = useState([...hiddenColumns]);
  const [nxcols, setNonExportable] = useState([...nonExportableColumns]);
  const forceUpdate = useForceUpdate(true);
  const { columns, metadata, orderData } = useColumns(-FREEZE);
  const [orderedColumns, setOrderedColumns] = useState([...columns]);
  const [animate, setAnimate] = useState(0);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const l = useRef({ orderInit: false, order: loadColumnOrder() }).current;
  const { showTooltip, hideTooltip } = useTooltip();
  const [selectedTab, setSelectedTab] = useAtom(selected_tab);
  const setColumnSelectorOn = useSetAtom(column_selector_on);
  const [columnSelectorSearch, setColumnSelectorSearch] = useAtom(column_selector_search);
  const setColumnOrder = useSetAtom(column_order) || loadColumnOrder();

  useEffect(() => {
    window.addEventListener('resize', forceUpdate);
    return () => window.removeEventListener('resize', forceUpdate);
  }, [forceUpdate]);

  useEffect(() => {
    if (l.orderInit) {
      return;
    }

    l.orderInit = true;

    if (_.isEmpty(l.order) || _.isEqual(l.order, orderedColumns)) {
      return;
    }

    _.each(orderedColumns, (col) => {
      if (!_.includes(l.order, col)) {
        l.order.push(col);
      }
    });

    setOrderedColumns(l.order);
  }, [l, orderedColumns]);

  useEffect(() => {
    const upperSearch = columnSelectorSearch[0];

    if (!upperSearch || l.search === columnSelectorSearch) {
      return;
    }

    l.search = columnSelectorSearch;

    const column = _.find(
      orderedColumns,
      (col) => col.toUpperCase().includes(upperSearch) || getLabel(col, metadata).toUpperCase().includes(upperSearch)
    );

    if (column) {
      const id = `cs-${column}`;
      document.getElementById(id)?.scrollIntoView();
    }
  }, [columnSelectorSearch, orderedColumns, metadata, l]);

  const onExit = (ok) => {
    if (ok) {
      dispatch({ type: SET_HIDDEN_COLUMNS, columns: hcols });
      dispatch({ type: SET_NON_EXPORTABLE_COLUMNS, columns: nxcols });

      localStorage.setItem(COLUMN_ORDER, orderedColumns.join(', '));
      setColumnOrder(l.order = orderedColumns);

      if (!_.isEmpty(dt)) {
        orderData(dt, orderedColumns);
        orderData(aggregates, orderedColumns);
        dispatch({ type: SET_DATA_TABLE, dt });
      }

      if (!_.isEmpty(runTable)) {
        orderData(runTable, orderedColumns);
        orderData(runAggregates, orderedColumns);
        dispatch({ type: SET_RUN_TABLE, table: runTable });
      }

      if (!_.isEmpty(compTable)) {
        orderData(compTable, orderedColumns);
        dispatch({ type: SET_COMP_TABLE, table: compTable });
      }

      l.tab = selectedTab;
      setSelectedTab(-1);
    }

    setColumnSelectorOn(false);
    setColumnSelectorSearch({});
  };

  let r = document.getElementById('tabs-panel')?.getBoundingClientRect();

  if (!r) {
    return null;
  }

  const toggleAll = (show) => {
    const list = show ? hcols : nxcols;

    setAnimate(0);

    if (_.isEmpty(list)) {
      _.each(orderedColumns, (column) => list.push(column));
    } else {
      if (list.length < orderedColumns.length) {
        setAnimate(show ? 1 : 2);
      }

      list.length = 0;
    }

    if (show) {
      setHidden([...hcols]);
    } else {
      setNonExportable([...nxcols]);
    }
  };

  const toggleOne = (show, column) => {
    setAnimate(0);

    const list = show ? hcols : nxcols;

    if (_.includes(list, column)) {
      _.remove(list, (col) => col === column);
    } else {
      list.push(column);
    }

    if (show) {
      setHidden([...hcols]);
    } else {
      setNonExportable([...nxcols]);
    }
  };

  const gridStyle = 'auto / 1fr 200px 100px 100px';
  const upperSearch = columnSelectorSearch[0];

  const getMatches = () => {
    let matches = 0;

    _.each(orderedColumns, (column) => {
      let match = column.toUpperCase().includes(upperSearch);

      if (match) {
        matches += 1;
        return;
      }

      const label = getLabel(column, metadata);
      match = label.toUpperCase().includes(upperSearch);

      if (match) {
        matches += 1;
        return;
      }
    });

    const res = matches ? `${matches} match${matches > 1 ? 'es' : ''}` : null;
    return res;
  };

  const toggleSelected = (column) => {
    const cols = [...selectedColumns];

    if (_.includes(selectedColumns, column)) {
      _.remove(cols, (col) => col === column);
    } else {
      cols.push(column);
    }

    setSelectedColumns(_.sortBy(cols, (col) => _.indexOf(orderedColumns, col)));
  };

  const canMoveUp = () => !_.isEmpty(selectedColumns) && !_.some(selectedColumns, (col) => col === _.first(orderedColumns));

  const canMoveDown = () => !_.isEmpty(selectedColumns) && !_.some(selectedColumns, (col) => col === _.last(orderedColumns));

  const moveUp = (e) => {
    if (!canMoveUp()) {
      return;
    }

    const index = _.indexOf(orderedColumns, _.first(selectedColumns));

    _.remove(orderedColumns, (column) => _.some(selectedColumns, (col) => col === column));

    const cols = e.shiftKey
      ? selectedColumns.concat(orderedColumns)
      : orderedColumns
        .slice(0, index - 1)
        .concat(selectedColumns)
        .concat(orderedColumns.slice(index - 1));

    setOrderedColumns(cols);
  };

  const moveDown = (e) => {
    if (!canMoveDown()) {
      return;
    }

    let index = _.indexOf(orderedColumns, _.last(selectedColumns));
    const col = orderedColumns[index + 1];

    _.remove(orderedColumns, (column) => _.some(selectedColumns, (col) => col === column));

    if (e.shiftKey) {
      setOrderedColumns(orderedColumns.concat(selectedColumns));
      return;
    }

    index = _.indexOf(orderedColumns, col);

    const cols = orderedColumns
      .slice(0, index + 1)
      .concat(selectedColumns)
      .concat(orderedColumns.slice(index + 1));

    setOrderedColumns(cols);
  };

  const renderItems = () => {
    return (
      <>
        {_.map(orderedColumns, (column, i) => {
          const hidden = _.includes(hcols, column);
          const exportable = !_.includes(nxcols, column);
          const label = getLabel(column, metadata);
          let background = i % 2 ? '#232F3B' : '#263340';

          const propMatch = column.toUpperCase().includes(upperSearch);
          const labelMatch = label.toUpperCase().includes(upperSearch);

          const id = `cs-${column}`;

          if (propMatch || labelMatch) {
            background = '#000C';
          }

          const classes = `fe-extra-row ${_.includes(selectedColumns, column) ? 'cs-row-selected' : 'cs-row'}`;

          return (
            <div id={id} key={i} className={classes} style={{ background, grid: gridStyle }}>
              <div
                id={`cs-${column}-prop`}
                className="fe-extra-label cs-cell"
                style={{ color: `${propMatch ? BLUE : OFF_WHITE}` }}
                onClick={() => toggleSelected(column)}>
                {column}
              </div>
              <div
                id={`cs-${column}-label`}
                className="fe-extra-label cs-cell"
                style={{ color: `${labelMatch ? BLUE : OFF_WHITE}` }}
                onClick={() => toggleSelected(column)}>
                {label}
              </div>
              <ColumnSelectorCell show={true} on={!hidden} column={column} animate={animate === 1} toggle={toggleOne} />
              <ColumnSelectorCell show={false} on={exportable} column={column} animate={animate === 2} toggle={toggleOne} />
            </div>
          );
        })}
      </>
    );
  };

  const rh = r.height - 46;
  const ry = r.y + 46;
  const h = 800;
  const width = 700;
  const height = Math.min(h, rh - 40);
  const left = r.x + (r.width - width) / 2;
  const top = ry + (rh - height) / 2;
  const classUp = `cs-arrow ${canMoveUp() ? '' : 'cs-arrow-disabled'}`;
  const classDown = `cs-arrow ${canMoveDown() ? '' : 'cs-arrow-disabled'}`;

  return (
    <div className="modal-screen">
      <Popup ok="SAVE" style={{ left, top, width, height }} onExit={(ok) => onExit(ok)}>
        <div className="fe" style={{ margin: 0 }}>
          <SearchPanel
            searchType={column_selector_search}
            matches={getMatches()}
            style={{ gridArea: '1/1', placeSelf: 'center start', padding: '10px' }}
          />
          <div id="cs-tip">Click on "show" or "export" to toggle all cells in column</div>
          <div className="fe-extras-table" style={{ gridArea: `2/1` }}>
            <div className="grid-header fe-header-row" style={{ grid: `${gridStyle} 12px`, borderRadius: 0 }}>
              <div className="fe-extra-header-cell">field</div>
              <div className="fe-extra-header-cell">displayed as</div>
              <div className="cs-click-header" onClick={() => toggleAll(true)}>
                show
              </div>
              <div className="cs-click-header" onClick={() => toggleAll(false)}>
                export
              </div>
            </div>
            <div className="fe-extras root-scroll" style={{ gridArea: '2/1' }}>
              {renderItems()}
            </div>
          </div>
        </div>
        <div className="cs-move-panel">
          <div
            className={classUp}
            onClick={(e) => moveUp(e)}
            onMouseEnter={(e) => showTooltip({ e, text: 'Move selected up.\nHold Shift to move to the top.' })}
            onMouseLeave={hideTooltip}>
            ▲
          </div>
          <div
            className={classDown}
            onClick={(e) => moveDown(e)}
            onMouseEnter={(e) => showTooltip({ e, text: 'Move selected down.\nHold Shift to move to the bottom.' })}
            onMouseLeave={hideTooltip}>
            ▼
          </div>
          {selectedColumns.length > 0 && (
            <div
              className="popup-button"
              onClick={() => {
                setSelectedColumns([]);
                hideTooltip();
              }}
              onMouseEnter={(e) => showTooltip({ e, text: 'Click to unselect all.' })}
              onMouseLeave={hideTooltip}>{`${selectedColumns.length} selected`}</div>
          )}
        </div>
      </Popup>
    </div>
  );
};

const ColumnSelectorCell = (props) => {
  const { show, on, column, toggle, animate } = props;
  const { opacity } = useSpring({ opacity: 1, from: { opacity: animate ? 0 : 1 }, reset: true });

  return (
    <div className="fe-extra-label cs-cell cs-bool-cell" onClick={() => toggle(show, column)}>
      <animated.div style={{ justifySelf: 'center', color: `${on ? GREEN : RED}`, opacity }}>{on ? '✔' : '✖'}</animated.div>
    </div>
  );
};

export default ColumnSelector;
