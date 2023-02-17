import React, { useEffect, useRef } from 'react';
import DataRow, { DataRows } from './DataRow';
import FilterRow from './FilterRow';
import _ from 'lodash';
import { ROW_HEAD } from './const';
import { handleScroll } from './OptimTableSection';
import useColumns from './useColumns';
import { useAtomValue } from 'jotai';
import { comp_column_metadata, comp_column_sizes } from './atoms';

const CompareTableSection = (props: any) => {
  const { rows, freeze, compShowDiffOnly, hasData, fetching } = props;
  let columns = props.columns;
  columns = freeze > 0 ? _.take(columns, freeze) : freeze < 0 ? _.takeRight(columns, columns.length + freeze) : columns;
  const compColumnSizes = useAtomValue(comp_column_sizes);
  const l: any = useRef({}).current;
  const suffix = freeze > 0 ? '-frozen' : '';
  const { isHidden } = useColumns(freeze);
  const compColumnMetadata = useAtomValue(comp_column_metadata);

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
        <DataRow columnSizes={compColumnSizes} values={columns} type={ROW_HEAD} freeze={freeze} columnMetadata={compColumnMetadata} />
      </div>
      <div id={`dt-filters${suffix}`} style={{ overflow: 'hidden' }}>
        <FilterRow columnSizes={compColumnSizes} columns={columns} freeze={freeze} />
      </div>
      {compShowDiffOnly && !hasData ? (
        <div className="nodiff">{`${fetching ? '' : 'No differences'}`}</div>
      ) : (
        <div
          ref={(e) => (l.grid = e)}
          id={`dt-grid${suffix}`}
          className="dt-scroll-pane root-scroll"
          style={{ overflow: `${freeze > 0 ? 'hidden' : 'auto'}` }}
          onScroll={(e) => freeze < 0 && handleScroll(e, null, freeze)}>
          <DataRows columnSizes={compColumnSizes} rows={rows} columns={columns} freeze={freeze} columnMetadata={compColumnMetadata} />
        </div>
      )}
      {freeze > 0 && <div style={{ height: '12px', gridArea: '7/1' }}></div>}
    </div>
  );
};

export default CompareTableSection;
