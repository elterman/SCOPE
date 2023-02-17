import React, { useEffect, useRef } from 'react';
import { useContext } from 'react';
import { StoreContext } from './Store';
import { ROW_AGGR, ROW_BMARK, ROW_DELTA, ROW_HEAD } from './const';
import DataRow, { DataRows } from './DataRow';
import FilterRow from './FilterRow';
import { syncScroll } from './Utils';
import _ from 'lodash';
import useColumns from './useColumns';
import { useAtomValue } from 'jotai';
import { column_metadata, optim_column_sizes } from './atoms';

const OptimTableSection = (props: any) => {
  const { rows, freeze } = props;
  let columns = props.columns;
  columns = freeze > 0 ? _.take(columns, freeze) : freeze < 0 ? _.takeRight(columns, columns.length + freeze) : columns;
  const store = useContext(StoreContext);
  const { state } = store;
  const { aggregates } = state;
  const l: any = useRef({}).current;
  const suffix = freeze > 0 ? '-frozen' : '';
  const { isHidden } = useColumns(freeze);
  const columnMetadata = useAtomValue(column_metadata);
  const optimColumnSizes = useAtomValue(optim_column_sizes);

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
      <div id={`dt-headers${suffix}`} style={{ overflow: 'hidden' }}>
        <DataRow columnSizes={optimColumnSizes} values={columns} columnMetadata={columnMetadata} type={ROW_HEAD} freeze={freeze} />
      </div>
      <div id={`dt-filters${suffix}`} style={{ overflow: 'hidden' }}>
        <FilterRow columnSizes={optimColumnSizes} columns={columns} freeze={freeze} />
      </div>
      {_.map([ROW_AGGR, ROW_DELTA, ROW_BMARK], (r, i) => {
        const id = `dt-aggr${i === 1 ? '-delta' : i === 2 ? '-bmark' : ''}${suffix}`;

        return aggregates && aggregates[i] ? (
          <div key={i} id={id} style={{ overflow: 'hidden' }}>
            <DataRow
              columnSizes={optimColumnSizes}
              values={_.values(aggregates[i])}
              type={r}
              freeze={freeze}
              store={store}
              columnMetadata={columnMetadata}
            />
          </div>
        ) : null;
      })}
      <div
        ref={(e) => (l.grid = e)}
        id={`dt-grid${suffix}`}
        className="dt-scroll-pane root-scroll"
        style={{ overflow: `${freeze > 0 ? 'hidden' : 'auto'}` }}
        onScroll={(e) => freeze < 0 && handleScroll(e, null, freeze)}>
        <DataRows columnSizes={optimColumnSizes} rows={rows} freeze={freeze} columns={columns} columnMetadata={columnMetadata} />
      </div>
      {freeze > 0 && <div style={{ height: '12px', gridArea: '7/1' }}></div>}
    </div>
  );
};

export default OptimTableSection;

export const handleScroll = (e: any, pos: number | null = null, freeze: number = 0) => {
  if (e?.target?.type === 'text') {
    return;
  }

  const suffix = freeze > 0 ? '-frozen' : '';

  if (pos === null) {
    pos = e.target.scrollLeft;
  } else {
    syncScroll(`dt-grid${suffix}`, pos);
  }

  syncScroll(`dt-headers${suffix}`, pos);
  syncScroll(`dt-filters${suffix}`, pos);
  syncScroll(`dt-aggr${suffix}`, pos);
  syncScroll(`dt-aggr-delta${suffix}`, pos);
  syncScroll(`dt-aggr-bmark${suffix}`, pos);

  if (freeze < 0) {
    let ob = document.getElementById('dt-grid-frozen');
    ob?.scrollTo(0, e?.target?.scrollTop ?? 0);
  }
};
