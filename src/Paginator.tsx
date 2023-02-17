import React, { useEffect, useState, useContext, useRef } from 'react';
import { StoreContext } from './Store';
import SvgNavigate from './ICONS/SvgNavigate';
import _ from 'lodash';
import { PAGINATOR_SHOW_ALL_WIDTH, PAGINATOR_SHOW_ROW_RANGE_WIDTH } from './const';
import useForceUpdate from './useForceUpdate';

const Paginator = (props: any) => {
  const { grid, pageCount, currentPage, pageSize, rows, setPageSize, setCurrentPage, style } = props;
  const store = useContext(StoreContext);
  const { state } = store;
  const { runSettingsHidden, compSettingsHidden, optimSettingsHidden } = state;
  const { sleeveSelectorWidth, runSelectorWidth } = state;
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState(false);
  const forceUpdate = useForceUpdate(true);
  const wx = grid?.getBoundingClientRect().width;
  const l: any = useRef({}).current;

  useEffect(() => {
    l.mounted = true;

    return () => {
      l.mounted = false;
    };
  }, [l]);

  useEffect(() => {
    l.mounted && forceUpdate();
  }, [l.mounted, forceUpdate, sleeveSelectorWidth, runSelectorWidth, runSettingsHidden, compSettingsHidden, optimSettingsHidden]);

  useEffect(() => {
    l.mounted && setPage(currentPage);
    l.mounted && setEdit(false);
  }, [currentPage, l.mounted]);

  const doSetEdit = (set: boolean) => {
    l.mounted && setEdit(set);
  };

  const handleInput = (e: any) => {
    if (e.key === 'Enter') {
      navigate(e.target.value);
    } else if (e.key === 'Escape') {
      doSetEdit(false);
    }
  };

  const handleBoxClick = () => {
    doSetEdit(true);

    const input = l.pgnInput as HTMLInputElement;

    if (input) {
      input.value = '';
      input.focus();
    }
  };

  const navigate = (page: any) => {
    if (page === 'first') {
      page = 1;
    } else if (page === 'last') {
      page = pageCount;
    } else if (page === 'next') {
      page = currentPage + 1;
    } else if (page === 'prev') {
      page = currentPage - 1;
    }

    page = Math.min(pageCount, Math.max(page, 1));

    if (page) {
      setCurrentPage(page);
    }
  };

  const classesPrev = `paginator-button ${page < 2 ? 'paginator-button-disabled' : ''}`;
  const classesNext = `paginator-button ${page < pageCount ? '' : 'paginator-button-disabled'}`;
  const minRow = (currentPage - 1) * pageSize + 1;
  let maxRow = Math.min(minRow + pageSize - 1, rows);

  return (
    <div className="paginator-bar" style={{ ...style }}>
      {wx > PAGINATOR_SHOW_ALL_WIDTH && (
        <div id="page-sizer" className="page-sizer">
          {_.map([25, 50, 100, 200], (size) => {
            const selected = size === pageSize;
            const classes = `page-sizer-button ${selected ? 'page-sizer-button-selected' : ''}`;
            return (
              <div key={size} className={classes} onClick={() => setPageSize(size)}>
                {size}
              </div>
            );
          })}
          <div style={{ marginLeft: '8px' }}>{'rows per page'}</div>
        </div>
      )}
      <div id="pgn-control" className="paginator">
        <div id="pgn-first" className={classesPrev} onClick={() => navigate('first')}>
          <SvgNavigate width="12" prev end />
        </div>
        <div id="pgn-prev" className={classesPrev} onClick={() => navigate('prev')}>
          <SvgNavigate width="12" prev style={{ margin: '0 10px 0 5px' }} />
        </div>
        <div id="pgn-page" style={{ userSelect: 'none' }}>
          Page
        </div>
        <div style={{ display: 'grid', margin: '0 10px' }}>
          <input
            ref={(e) => (l.pgnInput = e)}
            className="paginator-box"
            style={{ gridArea: '1/1', background: '#000' }}
            type="text"
            pattern="[0-9]+"
            onKeyDown={handleInput}
            onBlur={() => doSetEdit(false)}
          />
          {!edit && (
            <div
              id="pgn-box"
              className="paginator-box"
              style={{ gridArea: '1/1', cursor: 'pointer', userSelect: 'none' }}
              onClick={handleBoxClick}>
              {page}
            </div>
          )}
        </div>
        <div id="pgn-of-pages" style={{ userSelect: 'none' }}>{`of ${pageCount}`}</div>
        <div id="pgn-next" className={classesNext} onClick={() => navigate('next')}>
          <SvgNavigate width="12" style={{ margin: '0 5px 0 10px' }} />
        </div>
        <div id="pgn-last" className={classesNext} onClick={() => navigate('last')}>
          <SvgNavigate width="12" end />
        </div>
      </div>
      {wx > PAGINATOR_SHOW_ROW_RANGE_WIDTH && (
        <div id="page-counter" className="page-counter">
          {'Rows '}
          {minRow}
          {'–'}
          {maxRow}
          {' of '}
          {rows}
        </div>
      )}
    </div>
  );
};

export default Paginator;
