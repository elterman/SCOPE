import React, { useEffect, useState, useContext, useRef } from 'react';
import { StoreContext } from './Store';
import { SET_FILTERED_TABLE } from './reducer';
import { OFF_WHITE, EXCLUDE_COLUMN, EDITABLE_CELL, TAB_HISTORY, GREEN, RED, GOLD, SMF_ASSIGNED } from './const';
import { INCLUDE_COLUMN_WIDTH, PACE_COLUMN, SMF_ELIGIBLE, SMF_SUBMITTED } from './const';
import _ from 'lodash';
import SvgCheck from './ICONS/SvgCheck';
import SvgX from './ICONS/SvgX';
import SvgSend from './ICONS/SvgSend';
import { columnWidth, getPrecision, getSeparateThousands, formatNumeric, updateDirtyMap, getIsPercent } from './Utils';
import { getRowColor } from './DataRow';
import useColumns from './useColumns';
import CheckBox from './CheckBox';
import { useTooltip } from './Tooltip';
import useSmfRequests from './useSmfRequests';
import { new_smf_requests, selected_tab } from './atoms';
import { useAtom, useAtomValue } from 'jotai';

const DataCell = (props: any) => {
  const { isin, ri, ci, value, rowDiff, columnSizes, freeze, columnMetadata } = props;
  const store = useContext(StoreContext);
  const { state, dispatch } = store;
  const { compare, dirtyMap } = state;
  const { getColumn } = useColumns(freeze);
  const column = getColumn(ci);
  const selectedTab = useAtomValue(selected_tab);
  const hist = selectedTab === TAB_HISTORY;
  const comp = compare && hist;
  const [edit, setEdit] = useState(false);
  const ft = comp ? state.filteredCompTable : hist ? state.filteredRunTable : state.ft;
  const { smfEligible } = useSmfRequests(ft);
  const precision = getPrecision(column, columnMetadata);
  const thou = getSeparateThousands(column, columnMetadata);
  const isPercent = getIsPercent(column, columnMetadata);
  const id = `cell-input-${ri}.${ci}`;
  const l: any = useRef({}).current;
  const exclude = column === EXCLUDE_COLUMN;
  const paceColumn = column === PACE_COLUMN;
  const canEdit = !hist && (exclude || column === EDITABLE_CELL);
  l.rob = _.find(ft, (o) => o.isins === isin);
  const [newSmfRequests, setNewSmfRequests] = useAtom(new_smf_requests);
  const { showTooltip, hideTooltip } = useTooltip();

  if (l.rob) {
    l.cellId = `${l.rob.isins} • ${column}`;
  }

  useEffect(() => {
    if (!edit) {
      l.inputBox?.blur();
    }
  }, [l, edit]);

  const handleClick = () => {
    if (!canEdit) {
      return;
    }

    if (exclude) {
      acceptChange();
      return;
    }

    if (edit) {
      return;
    }

    setEdit(true);

    l.inputBox.value = value;
    l.inputBox.focus();
  };

  const onBlur = (e: any) => {
    if (edit) {
      acceptChange();
    } else {
      l.inputBox.value = '';
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Escape') {
      setEdit(false);
      return;
    }

    if (e.key === 'Enter') {
      acceptChange();
    }
  };

  const acceptChange = () => {
    if (l.rob) {
      const robValue = l.rob[column];
      const newValue: any = exclude ? !robValue : Number(l.inputBox.value);

      if (!exclude) {
        l.inputBox.value = '';
      }

      l.rob[column] = newValue;
      dispatch({ type: SET_FILTERED_TABLE, ft: [...ft] });

      updateDirtyMap(dirtyMap, l.cellId, robValue, newValue, dispatch);
    }

    setEdit(false);
  };

  const toggleSmfRequest = (checked: boolean, e: any) => {
    let requests: any = [...newSmfRequests];

    if (e.ctrlKey === true) {
      requests = checked ? smfEligible() : [];
    } else if (_.includes(newSmfRequests, isin)) {
      requests = _.reject(newSmfRequests, (i) => i === isin);
    } else {
      requests.push(isin);
    }

    setNewSmfRequests(requests);
  };

  const width = exclude ? INCLUDE_COLUMN_WIDTH : columnWidth(columnSizes, column);
  const background = getRowColor(ri, rowDiff);
  const cursor = canEdit ? 'pointer' : 'initial';
  const color = dirtyMap.has(l.cellId) ? GOLD : l.rob && l.rob[EXCLUDE_COLUMN] ? 'pink' : OFF_WHITE;
  const border = `1px groove ${edit ? GOLD : '#0000'}`;
  const numeric = _.isNumber(value) || (_.isArray(value) && (_.isNumber(value[0]) || _.isNumber(value[1])));
  const textAlign = numeric ? 'end' : 'initial';
  const classes = `dt-cell${canEdit ? ' dt-editable-cell' : ''}`;

  return (
    <div id={`dt-cell-${column}`} className={classes} style={{ width, background, cursor, border }} onClick={handleClick}>
      {exclude ? (
        <div className="dt-cell-content" style={{ justifySelf: 'center' }}>
          {value ? <SvgX width="16" /> : <SvgCheck width="16" />}
        </div>
      ) : paceColumn ? (
        <div className="dt-cell-content" style={{ color, userSelect: 'text', justifySelf: 'center' }}>
          {value === SMF_ASSIGNED ? (
            <div
              onMouseEnter={(e) => showTooltip({ e, text: 'Value assigned but not available.\nFilter as 999999.', dx: -130, dy: 0 })}
              onMouseLeave={hideTooltip}>
              <SvgCheck width={16} />
            </div>
          ) : value === SMF_ELIGIBLE ? (
            <div
              onMouseEnter={(e) =>
                showTooltip({ e, text: 'Mark for SMF request.\nCtrl+Click to apply to all eligible.\nFilter as -1.', dx: -150, dy: 0 })
              }
              onMouseLeave={hideTooltip}>
              <CheckBox handleToggle={toggleSmfRequest} checked={_.includes(newSmfRequests, isin)} />
            </div>
          ) : value === SMF_SUBMITTED ? (
            <div
              onMouseEnter={(e) => showTooltip({ e, text: 'SMF request pending.\nFilter as -3.', dx: -130, dy: 0 })}
              onMouseLeave={hideTooltip}>
              <SvgSend width={16} />
            </div>
          ) : (
            value || null
          )}
        </div>
      ) : (
        <>
          {canEdit && !edit && (
            <input
              id={id}
              className="dt-cell-input"
              style={{ gridArea: '1/1', background, textAlign }}
              type="number"
              spellCheck="false"
              onKeyDown={handleKeyDown}
              ref={(e) => (l.inputBox = e)}
              onBlur={onBlur}
            />
          )}
          {!edit && (
            <div className="dt-cell-content" style={{ color, userSelect: 'text', justifySelf: `${numeric ? 'end' : 'initial'}` }}>
              {_.isArray(value) ? (
                <div style={{ color: GOLD, textAlign }}>
                  {formatNumeric(value[0], precision, thou, isPercent)}
                  <br />
                  {formatNumeric(value[1], precision, thou, isPercent)}
                </div>
              ) : (
                <div style={{ color: rowDiff === 'Missing' ? RED : rowDiff === 'Added' ? GREEN : color }}>
                  {formatNumeric(value, precision, thou, isPercent)}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DataCell;
