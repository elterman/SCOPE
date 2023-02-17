import React from 'react';
import _, { isNumber } from 'lodash';
import DataCell from './DataCell';
import DataHeaderCell from './DataHeaderCell';
import AggregateCell from './AggregateCell';
import { ROW_HEAD, ROW_DATA, ROW_AGGR, ROW_DELTA, HEADER_COLOR, ROW_BMARK } from './const';
import useColumns from './useColumns';
import { useTooltip } from './Tooltip';

const DataRow = (props: any) => {
  const { style, isin, freeze, type, index, diff, columnSizes, columnMetadata } = props;
  const head = type === ROW_HEAD;
  const aggr = type === ROW_AGGR;
  const delta = type === ROW_DELTA;
  const bmark = type === ROW_BMARK;
  const aggrRow = aggr || delta || bmark;
  const label = aggrRow && freeze >= 0;
  const fontSize = head ? '15px' : '13px';
  const height = head ? '36px' : diff === 'Value' ? '48px' : '32px';
  const background = getRowColor(type === ROW_DATA ? index : type, diff);
  const { isHidden } = useColumns(freeze);
  const { showTooltip, hideTooltip } = useTooltip();

  let values = props.values;

  if (type !== ROW_HEAD) {
    values = freeze > 0 ? _.take(values, freeze) : freeze < 0 ? _.takeRight(values, values.length + freeze) : values;
  }

  const tooltip = aggr
    ? 'Aggregate values calculated using optimized weight'
    : delta
    ? 'Summary of changes calculated using holding delta'
    : bmark
    ? 'Universe/Benchmark for metrics of the index'
    : null;

  return (
    <div style={{ display: 'grid' }}>
      <div id={`dt-${type === ROW_DATA ? 'row-' + index : type}`} className="data-row" style={{ ...style, fontSize, height, background }}>
        {_.map(values, (v, i: number) => {
          if (isHidden(null, i)) {
            return null;
          }

          return head ? (
            <DataHeaderCell key={i} value={v} columnSizes={columnSizes} columnMetadata={columnMetadata} />
          ) : aggrRow ? (
            <AggregateCell key={i} ci={i} value={v} type={type} columnSizes={columnSizes} freeze={freeze} columnMetadata={columnMetadata} />
          ) : (
            <DataCell
              key={i}
              isin={isin}
              ri={index}
              ci={i}
              value={v}
              rowDiff={diff}
              columnSizes={columnSizes}
              freeze={freeze}
              columnMetadata={columnMetadata}
            />
          );
        })}
        {type !== ROW_DATA && freeze <= 0 ? (
          <div className="dt-cell bordered-cell" style={{ background }}>
            &nbsp;
          </div>
        ) : null}
      </div>
      {label && (
        <div className="aggr-label" onMouseEnter={(e) => showTooltip({ e, text: tooltip, dx: 130, dy: -10 })} onMouseLeave={hideTooltip}>
          {aggr ? 'Optimized Portfolio' : delta ? 'Change from Current' : bmark ? 'Universe/Benchmark' : ''}
        </div>
      )}
    </div>
  );
};

export const getRowColor = (indexOrType: number | string, diff: string = 'None') => {
  const hasDiff = diff && diff !== 'None';

  if (isNumber(indexOrType)) {
    return indexOrType % 2 ? (hasDiff ? '#111' : '#232F3B') : hasDiff ? '#0e0e0e' : '#263340';
  }

  switch (indexOrType) {
    case ROW_HEAD:
      return HEADER_COLOR;
    case ROW_AGGR:
      return '#3e3e50';
    case ROW_DELTA:
      return '#354545';
    case ROW_BMARK:
      return '#50503e';
    default:
      return '#0000';
  }
};

export default DataRow;

export const DataRows = (props: any) => {
  const { columnSizes, rows, freeze, columns, columnMetadata } = props;

  return (
    <>
      {rows.length ? (
        _.map(rows, (r: any, i) => (
          <DataRow
            key={i}
            columnSizes={columnSizes}
            isin={r.isins}
            values={_.values(r)}
            freeze={freeze}
            index={i}
            type={ROW_DATA}
            diff={r.diffType}
            columnMetadata={columnMetadata}
          />
        ))
      ) : (
        <DataRow
          columnSizes={columnSizes}
          values={_.range(0, columns.length)}
          type={ROW_DATA}
          style={{ visibility: 'hidden' }}
          columnMetadata={columnMetadata}
        />
      )}
    </>
  );
};
