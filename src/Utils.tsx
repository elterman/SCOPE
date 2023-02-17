import React from 'react';
import dayjs from 'dayjs';
import { SET_DIRTY_MAP } from './reducer';
import XLSX from 'xlsx';
import _ from 'lodash';
import { AuthenticationResult } from '@azure/msal-browser';
import { COLUMN_ORDER, COLUMN_WIDTH, EDITABLE_CELL } from './const';
import { optim_column_sizes } from './atoms';

export const sleep = (ms: any) => new Promise((resolve) => setTimeout(resolve, ms));

export const syncScroll = (id: any, pos: any) => {
  let ob = document.getElementById(id);
  ob?.scrollTo(pos, 0);
};

export const updateDirtyMap = (
  map: Map<string, { oldValue: string; newValue: number | boolean | string }>,
  key: string,
  originalValue: string,
  newValue: string,
  dispatch: any
) => {
  originalValue = `${originalValue}`;
  newValue = `${newValue}`;

  if (map.has(key)) {
    const mob = map.get(key);

    if (mob) {
      if (mob.oldValue === newValue) {
        map.delete(key);
      } else {
        mob.newValue = newValue;
      }
    }
  } else if (originalValue !== newValue) {
    map.set(key, { oldValue: originalValue, newValue });
  }

  dispatch({ type: SET_DIRTY_MAP, map: new Map(map) });
};

export const prevWorkday = () => {
  const today = dayjs();
  const dow = today.day();
  const off = dow === 0 ? 2 : dow === 1 ? 3 : 1;
  return today.subtract(off, 'day').format('YYYY-MM-DD');
};

export const formatLongDate = (year: number, month: number, day: number) =>
  dayjs(`${year}-${month}-${day}`, 'YYYY-MM-DD').format('MMMM D, YYYY');

export const isFutureDate = (y: any, m: any, d: any) => {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();
  const future = y > todayYear || (y === todayYear && m - 1 > todayMonth) || (y === todayYear && m - 1 === todayMonth && d > todayDay);
  return future;
};

export const windowSize = () => {
  var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight;

  return { x, y };
};

export const reportError = (addToast: any, res: any) => {
  if (res?.ok) {
    return;
  }

  const msg = res?.data?.ErrorMessage || 'Unknown Error';
  const details = res?.data?.ErrorDetails || '';

  return addToast({
    type: 'error',
    renderCallback: () => {
      return (
        <div>
          {msg}
          {details && <br />}
          {details}
        </div>
      );
    },
  });
};

export const exportToExcel = (props: any) => {
  const { data, aggregates, settings, settings2, sleeve, asOfDate, run1, run2, meta, nonExportableColumns } = props;

  let xldata = [];
  const sep = new Array(_.size(data[0])).fill('--------------------');

  let aggr = false;
  let delta = false;
  let bmark = false;

  if (aggregates && aggregates[0]) {
    xldata.push(aggregates[0]);
    aggr = true;

    if (aggregates[1]) {
      xldata.push(aggregates[1]);
      delta = true;
    }

    if (aggregates[2]) {
      xldata.push(aggregates[2]);
      bmark = true;
    }

    xldata.push(sep);
  }

  xldata = [...xldata, ...data];

  const allKeys = _.keys(xldata[0]);
  const keys = _.reject(allKeys, (key) => nonExportableColumns.includes(key));
  const headers = _.map(keys, (k: string) => getLabel(k, meta));
  const data1 = [headers, sep];

  _.each(xldata, (row, i) => {
    const values = _.reject(_.values(row), (v, j) => nonExportableColumns.includes(allKeys[j]));

    if (i === 0 && aggr) {
      values[0] = 'Optimized Portfolio';
    }

    if (i === 1 && delta) {
      values[0] = 'Change from Current';
    }

    if (i === 2 && bmark) {
      values[0] = 'Universe/Benchmark';
    }

    _.each(values, (value, i) => {
      if (_.isArray(value)) {
        values[i] = `${value[0]} • ${value[1]}`;
      }
    });

    data1.push(values);
  });

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.aoa_to_sheet(data1);
  XLSX.utils.book_append_sheet(wb, ws1, 'Data');

  const data2 = [[JSON.stringify(settings)]];

  if (settings2) {
    data2.push([JSON.stringify(settings2)]);
  }

  const ws2 = XLSX.utils.aoa_to_sheet(data2);
  ws2['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 100 } }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Settings');

  let filename = sleeveInfo(sleeve);

  if (run1) {
    filename = `${filename} • ${replaceAll(run1.Timestamp, ':', '·')}`;

    if (run2) {
      filename = `${filename} • ${replaceAll(run2.Timestamp, ':', '·')}`;
    }
  } else if (asOfDate) {
    filename = `${filename} • ${asOfDate}`;
  }

  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const replaceAll = (str: string, from: any, to: string, compress: boolean = false) => {
  if (!Array.isArray(from)) {
    from = [from];
  }

  let res: any = str;

  from.forEach((substr: string) => {
    res = res.replaceAll(substr, to);
  });

  if (compress) {
    if (to !== '') {
      const two = `${to}${to}`;

      while (_.includes(res, two)) {
        res = res.replaceAll(two, to).trim();
      }
    }

    res = res.trim();
  }

  return res;
};

export const sleeveInfo = (sleeve: any) => `${sleeve.FundName} • ${sleeve.Alpha} • ${sleeve.Bravo}`;

export const getAccess = (auth: any, resolve: any) => auth.getAccessToken().then((ar: AuthenticationResult) => resolve(ar));

export const columnWidth = (columnSizes: any, column: string) => {
  if (!columnSizes) {
    return COLUMN_WIDTH;
  }

  const width = _.get(columnSizes, column, 0);
  return width ? `${width}px` : COLUMN_WIDTH;
};

export const textWidth = (text: string, font: string | null = null) => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas?.getContext('2d');

  if (!context) {
    return 0;
  }

  context.font = font || '13px Roboto';
  const tm = context.measureText(text);

  return tm.width + 5;
};

export const setColumnSizes = (props: any) => {
  const { table, aggregates, metadata, type, setter } = props;
  const sizes: any = {};

  const doSetSize = (key: string, text: string, header: boolean = false) => {
    const width = textWidth(text, header ? '15px Roboto' : null) + 10;
    const size = _.get(sizes, key);
    sizes[key] = Math.max(size || 90, width);
  };

  const process = (data: any) => {
    _.each(data, (row) => {
      _.each(row, (value, key) => {
        if (key === 'maturity' && value) {
          const formatDate = (d: string | null) => (d ? dayjs(d).format('YYYY-MM-DD') : d);

          if (_.isArray(value)) {
            row[key] = value = [formatDate(value[0]), formatDate(value[1])];
          } else {
            row[key] = value = formatDate(value);
          }
        }

        const setSize = (value: any) => {
          doSetSize(
            key,
            key === EDITABLE_CELL && type === optim_column_sizes
              ? value
              : formatNumeric(value, getPrecision(key, metadata), getSeparateThousands(key, metadata), getIsPercent(key, metadata))
          );
        };

        if (_.isArray(value)) {
          _.each(value, (v) => setSize(v));
        } else {
          setSize(value);
        }
      });
    });
  };

  _.each(metadata, (ob, key) => doSetSize(key, ob.columnLabel || key, true));

  process(table);
  process(aggregates);

  setter(sizes);
};

export const unExponent = (table: any) => {
  _.each(table, (row) => {
    const fix = (value: number) => {
      if (value === null) {
        return value;
      }

      const str = value.toString();
      const i = str.lastIndexOf('e-');

      if (i < 0) {
        return value;
      }

      const j = str.indexOf('.');
      const precision = Number(str.slice(i + 2)) + (j < 0 ? 0 : i - j - 1);
      return value.toFixed(precision);
    };

    _.each(['holdingDelta', 'optimizationDelta'], (col) => {
      const delta = row[col];

      if (delta == null) {
        return;
      }

      if (_.isArray(delta)) {
        for (let i = 0; i < 2; i++) {
          row[col][i] = fix(delta[i]);
        }
      } else {
        row[col] = fix(delta);
      }
    });
  });
};

export const formatNumeric = (val: any, precision: number | undefined, separateThousands: boolean, isPercent: boolean) => {
  const numeric = _.isNumber(val);

  if (numeric && isPercent) {
    val *= 100;
  }

  let value = precision === undefined || !numeric ? val : val.toFixed(precision);

  if (numeric && separateThousands) {
    var parts = value.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    value = parts.join('.');
  }

  return value;
};

export const getPrecision = (column: string, metadata: any) => _.get(metadata, `${column}.precision`);

export const getSeparateThousands = (column: string, metadata: any) => _.get(metadata, `${column}.thousandsSeparator`);

export const getIsPercent = (column: string, metadata: any) => _.get(metadata, `${column}.isPercent`, false);

export const overflowWrap = () => {
  const strings = document.getElementsByClassName('string-value') as HTMLCollection;
  _.each(strings, (s) => ((s as HTMLElement).style.overflowWrap = 'anywhere'));
};

export const getLabel = (column: string, metadata: any) => _.get(metadata, `${column}.columnLabel`, column);

export const loadColumnOrder = () => {
  const order = localStorage.getItem(COLUMN_ORDER);
  return order ? order.split(', ') : [];
};
