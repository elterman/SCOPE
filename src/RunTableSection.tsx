import React, { useEffect, useRef } from 'react';
import { ROW_AGGR, ROW_BMARK, ROW_DELTA, ROW_HEAD } from './const';
import { useContext } from 'react';
import { StoreContext } from './Store';
import DataRow, { DataRows } from './DataRow';
import FilterRow from './FilterRow';
import _ from 'lodash';
import { handleScroll } from './OptimTableSection';
import useColumns from './useColumns';
import { useAtomValue } from 'jotai';
import { run_column_metadata, run_column_sizes } from './atoms';

const RunTableSection = (props: any) => {
  const { rows, freeze } = props;
  let columns = props.columns;
  columns = freeze > 0 ? _.take(columns, freeze) : freeze < 0 ? _.takeRight(columns, columns.length + freeze) : columns;
  const store = useContext(StoreContext);
  const { state } = store;
  const { runAggregates: aggregates } = state;
  const l: any = useRef({}).current;
  const suffix = freeze > 0 ? '-frozen' : '';
  const { isHidden } = useColumns(freeze);
  const runColumnMetadata = useAtomValue(run_column_metadata);
  const runColumnSizes = useAtomValue(run_column_sizes);

  useEffect(() => {
    if (freeze > 0) {
      l.grid.onwheel = (e: any) => document.getElementById('dt-grid')?.scrollBy(0, e.deltaY);
    }
  }, [freeze, l.grid]);

  if (!_.isEmpty(columns) && _.every(columns, (column) => isHidden(column))) {
    return null;
  }

  return (
    <div id={`dt-section${suffix}`} className="dt-section" style={{ gridArea: `${freeze > 0 ? '1/1' : '1/2'}` }}>
      {columns?.length > 0 && (
        <div id={`dt-headers${suffix}`} style={{ overflow: 'hidden' }}>
          <DataRow
            columnSizes={runColumnSizes}
            values={columns}
            type={ROW_HEAD}
            freeze={freeze}
            store={store}
            columnMetadata={runColumnMetadata}
          />
        </div>
      )}
      <div id={`dt-filters${suffix}`} style={{ overflow: 'hidden' }}>
        <FilterRow columnSizes={runColumnSizes} columns={columns} freeze={freeze} />
      </div>
      {columns?.length > 0 &&
        _.map([ROW_AGGR, ROW_DELTA, ROW_BMARK], (r, i) => {
          if (!aggregates || !aggregates[i]) {
            return null;
          }

          const id = `dt-aggr${i === 1 ? '-delta' : i === 2 ? '-bmark' : ''}${suffix}`;

          return (
            <div key={i} id={id} style={{ overflow: 'hidden' }}>
              <DataRow
                columnSizes={runColumnSizes}
                values={_.values(aggregates[i])}
                type={r}
                freeze={freeze}
                store={store}
                columnMetadata={runColumnMetadata}
              />
            </div>
          );
        })}
      <div
        ref={(e) => (l.grid = e)}
        id={`dt-grid${suffix}`}
        className="dt-scroll-pane root-scroll"
        style={{ overflow: `${freeze > 0 ? 'hidden' : 'auto'}` }}
        onScroll={(e) => freeze < 0 && handleScroll(e, null, freeze)}>
        <DataRows columnSizes={runColumnSizes} rows={rows} freeze={freeze} columns={columns} columnMetadata={runColumnMetadata} />
      </div>
      {freeze > 0 && <div style={{ height: '12px', gridArea: '7/1' }}></div>}
    </div>
  );
};

export default RunTableSection;
