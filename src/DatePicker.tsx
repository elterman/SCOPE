import React, { useEffect, useState } from 'react';
import './DatePicker.css';
import _ from 'lodash';
import { formatLongDate, isFutureDate } from './Utils';
import SvgAngle from './ICONS/SvgAngle';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const getWeekOfMonth = (date: Date) => {
  var firstWeekday = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  var offsetDate = date.getDate() + firstWeekday - 1;
  return Math.floor(offsetDate / 7);
};

const DatePicker = (props: any) => {
  const { year, month, day, style, onExit } = props;
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();
  const [selectedDay, selectDay] = useState(Number(day) || todayDay);
  const [selectedMonth, selectMonth] = useState(Number(month) || todayMonth);
  const [selectedYear, selectYear] = useState(Number(year) || todayYear);
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const futureSelected = isFutureDate(selectedYear, selectMonth, selectDay);

  useEffect(() => {
    if (selectedDay > daysInMonth) {
      selectDay(daysInMonth);
    }
  }, [selectedYear, selectedMonth, selectedDay, daysInMonth]);

  return (
    <div className="mp" style={style}>
      <div className="mp-header">
        <div className={`mp-long-date${futureSelected ? ' mp-future' : ''}`}>{formatLongDate(selectedYear, selectedMonth, selectedDay)}</div>
        <div className="mp-year-selector">
          <div style={{ gridArea: '1/1', transform: 'rotate(180deg)', marginRight: '3px' }} onClick={() => selectYear(selectedYear - 5)}>
            <SvgAngle width={14} />
          </div>
          {_.map([-2, -1, 0, 1, 2], (off) => {
            const future = selectedYear + off > todayYear;
            return (
              <div
                key={off}
                className={`mp-year ${off ? '' : 'mp-year-selected'}${future ? ' mp-future' : ''}`}
                onClick={() => selectYear(selectedYear + off)}>
                {selectedYear + off}
              </div>
            );
          })}
          <div style={{ gridArea: '1/7', marginLeft: '3px' }} onClick={() => selectYear(selectedYear + 5)}>
            <SvgAngle width={14} />
          </div>
        </div>
      </div>
      <div className="mp-month-selector">
        {_.map(MONTHS, (m, i) => {
          const selected = i === selectedMonth - 1;
          const future = selectedYear > todayYear || (selectedYear === todayYear && i > todayMonth);
          const classes = `mp-month mp-item${selected ? ' mp-item-selected' : ''}${future ? (selected ? ' mp-future' : ' mp-dark-future') : ''}`;
          const row = Math.floor(i / 4) + 1;
          const col = (i % 4) + 1;
          const gridArea = `${row}/${col}`;
          return (
            <div key={i} className={classes} style={{ gridArea }} onClick={() => selectMonth(i + 1)}>
              {m}
            </div>
          );
        })}
      </div>
      <div className="mp-day-selector">
        <>
          {_.map(DOW, (d, i) => {
            return (
              <div key={i} className="mp-dow" style={{ gridArea: `1/${i + 1}` }}>
                {d}
              </div>
            );
          })}
          {_.map(_.range(1, 32), (d, i) => {
            if (i + 1 > daysInMonth) {
              return null;
            }

            const selected = i === selectedDay - 1;
            const future =
              selectedYear > todayYear ||
              (selectedYear === todayYear && selectedMonth - 1 > todayMonth) ||
              (selectedYear === todayYear && selectedMonth - 1 === todayMonth && i + 1 > todayDay);
            const date = new Date(selectedYear, selectedMonth - 1, i + 1);
            const day = date.getDay();
            const weekday = day > 0 && day < 6;
            const classes = `mp-day mp-item${selected ? ' mp-item-selected' : ''}${future ? (selected ? ' mp-future' : ' mp-dark-future') : ''}${
              weekday ? '' : ' mp-weekend'
            }`;
            const col = day + 1;
            const row = getWeekOfMonth(date) + 2;
            const gridArea = `${row}/${col}`;

            return (
              <div
                key={i}
                className={classes}
                style={{ gridArea }}
                onClick={() => i + 1 !== selectedDay && weekday && onExit(selectedMonth, selectedYear, i + 1)}>
                {d}
              </div>
            );
          })}
        </>
      </div>
      <div className="mp-buttons">
        <div className="mp-button" onClick={() => onExit(selectedMonth, selectedYear, selectedDay)}>
          OK
        </div>
        <div className="mp-button" onClick={onExit}>
          CANCEL
        </div>
      </div>
    </div>
  );
};

export default DatePicker;
