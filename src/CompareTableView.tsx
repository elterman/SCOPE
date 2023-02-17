import React, { useEffect, useState, useRef, useContext } from 'react';
import { StoreContext } from './Store';
import _ from 'lodash';
import Paginator from './Paginator';
import { SET_COMP_COLUMNS, SET_FILTERED_COMP_TABLE, SET_CURRENT_COMP_PAGE } from './reducer';
import { filterMatch } from './ColumnFilter';
import SvgSpinner from './ICONS/SvgSpinner';
import CompareTableSection from './CompareTableSection';
import { handleScroll } from './OptimTableSection';
import { getIsPercent } from './Utils';
import { FREEZE } from './const';
import { useAtom, useAtomValue } from 'jotai';
import { comp_column_metadata, comp_page_size } from './atoms';

const CompareTableView = () => {
  const store = useContext(StoreContext);
  const { state, dispatch } = store;
  const { compTable: dt, filteredCompTable: ft, compColumns: columns } = state;
  const { compFilters: filters, currentCompPage: currentPage, compSort: sort } = state;
  const [pageSize, setCompPageSize] = useAtom(comp_page_size);
  const { compShowDiffOnly, compSortByRun, compFilterByRun } = state;
  const [rows, setRows] = useState([]);
  const l: any = useRef({}).current;
  l.pageCount = Math.ceil(ft ? ft.length / pageSize : 0);
  const [fetching, setFetching] = useState(false);
  const metadata = useAtomValue(comp_column_metadata);

  useEffect(() => setFetching(false), [ft, currentPage, pageSize]);

  useEffect(() => {
    setFetching(true);

    const filterAndSort = () => {
      const set = compShowDiffOnly ? _.filter(dt, (rob) => rob.diffType !== 'None') : [...dt];
      const filterColumns = _.keys(filters);

      let subset = _.isEmpty(filters)
        ? set
        : _.filter(set, (rob, i) => {
            const match = _.every(filterColumns, (col) => {
              const filter = filters[col][0];
              let value = rob[col];
              if (_.isArray(value)) {
                value = value[compFilterByRun - 1];
              }
              value = value?.toString()?.toUpperCase();
              return filterMatch(value, filter, getIsPercent(col, metadata));
            });

            return match;
          });

      if (sort.column) {
        subset = _.orderBy(
          subset,
          (rob) => {
            let value = rob[sort.column];
            if (_.isArray(value)) {
              value = value[compSortByRun - 1];
            }
            return value;
          },
          sort.asc ? 'asc' : 'desc'
        );
      }

      dispatch({ type: SET_FILTERED_COMP_TABLE, ft: subset });
    };

    _.delay(filterAndSort, 1);
  }, [dispatch, dt, filters, sort.asc, sort.column, compShowDiffOnly, compSortByRun, compFilterByRun, metadata]);

  useEffect(() => {
    handleScroll(null, 0, 1);
    handleScroll(null, 0, -1);
  }, [dt]);

  useEffect(() => {
    if (!ft) {
      return;
    }

    if (l.pageCount && currentPage > l.pageCount) {
      dispatch({ type: SET_CURRENT_COMP_PAGE, page: l.pageCount });
      return;
    }

    const index = (currentPage - 1) * pageSize;
    const subset = ft.slice(index, index + pageSize);
    setRows(subset);

    if (ft?.length) {
      const columns = _.keys(ft[0]);
      dispatch({ type: SET_COMP_COLUMNS, columns });
    }
  }, [ft, filters, currentPage, dispatch, pageSize, l.pageCount]);

  const hasData = ft?.length;

  return (
    <div id="dt-pane" className="dt-pane">
      <div id="dt-freezer" className="dt-freezer" ref={(e) => (l.grid = e)}>
        <CompareTableSection rows={rows} columns={columns} freeze={FREEZE} hasData={hasData} fetching />
        <CompareTableSection rows={rows} columns={columns} freeze={-FREEZE} hasData={hasData} fetching />
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
            _.delay(() => setCompPageSize(size), 1);
          }}
          setCurrentPage={(page: number) => {
            setFetching(true);
            _.delay(() => dispatch({ type: SET_CURRENT_COMP_PAGE, page }), 1);
          }}
        />
      ) : null}
    </div>
  );
};

export default CompareTableView;
