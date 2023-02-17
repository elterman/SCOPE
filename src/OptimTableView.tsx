import React, { useEffect, useState, useRef, useContext } from 'react';
import { StoreContext } from './Store';
import _ from 'lodash';
import Paginator from './Paginator';
import { SET_DT_COLUMNS, SET_FILTERED_TABLE, SET_CURRENT_PAGE } from './reducer';
import { filterMatch } from './ColumnFilter';
import SvgSpinner from './ICONS/SvgSpinner';
import OptimTableSection from './OptimTableSection';
import { handleScroll } from './OptimTableSection';
import { getIsPercent } from './Utils';
import { FREEZE } from './const';
import { useAtom, useAtomValue } from 'jotai';
import { column_metadata, page_size } from './atoms';

const OptimTableView = () => {
  const store = useContext(StoreContext);
  const { state, dispatch } = store;
  const { dt, ft, columns, filters, currentPage, sort } = state;
  const [pageSize, setPageSize] = useAtom(page_size);
  const [rows, setRows] = useState([]);
  const l: any = useRef({}).current;
  l.pageCount = Math.ceil(ft ? ft.length / pageSize : 0);
  const [fetching, setFetching] = useState(false);
  const metadata = useAtomValue(column_metadata);

  useEffect(() => setFetching(false), [ft, currentPage, pageSize]);

  useEffect(() => {
    setFetching(true);

    const filterAndSort = () => {
      const filterColumns = _.keys(filters);

      let subset = _.isEmpty(filters)
        ? [...dt]
        : _.filter(dt, (rob, i) => {
            const match = _.every(filterColumns, (col) => {
              const filter = filters[col][0];
              const value = rob[col]?.toString()?.toUpperCase();
              return filterMatch(value, filter, getIsPercent(col, metadata));
            });

            return match;
          });

      if (sort.column) {
        subset = _.orderBy(subset, (ob) => ob[sort.column], sort.asc ? 'asc' : 'desc');
      }

      dispatch({ type: SET_FILTERED_TABLE, ft: subset });
    };

    _.delay(filterAndSort, 1);
  }, [dispatch, dt, filters, sort.asc, sort.column, metadata]);

  useEffect(() => {
    handleScroll(null, 0, 1);
    handleScroll(null, 0, -1);
  }, [dt]);

  useEffect(() => {
    if (!ft) {
      return;
    }

    if (l.pageCount && currentPage > l.pageCount) {
      dispatch({ type: SET_CURRENT_PAGE, page: l.pageCount });
      return;
    }

    const index = (currentPage - 1) * pageSize;
    const subset = ft.slice(index, index + pageSize);
    setRows(subset);

    if (ft?.length) {
      dispatch({ type: SET_DT_COLUMNS, columns: _.keys(ft[0]) });
    }
  }, [ft, filters, currentPage, dispatch, pageSize, l.pageCount]);

  return (
    <div id="optim-table" className="dt-pane">
      <div id="dt-freezer" className="dt-freezer" ref={(e) => (l.grid = e)}>
        <OptimTableSection rows={rows} columns={columns} freeze={FREEZE} />
        <OptimTableSection rows={rows} columns={columns} freeze={-FREEZE} />
        {columns.length > 0 ? <div className="frozen-overlay"></div> : null}
      </div>
      {fetching && <SvgSpinner width={160} style={{ gridArea: '1/1', placeSelf: 'center' }} />}
      {rows.length ? (
        <Paginator
          grid={l.grid}
          pageCount={l.pageCount}
          currentPage={currentPage}
          pageSize={pageSize}
          rows={ft.length}
          setPageSize={(size: number) => {
            setFetching(true);
            _.delay(() => setPageSize(size), 1);
          }}
          setCurrentPage={(page: number) => {
            setFetching(true);
            _.delay(() => dispatch({ type: SET_CURRENT_PAGE, page }), 1);
          }}
        />
      ) : null}
    </div>
  );
};

export default OptimTableView;
