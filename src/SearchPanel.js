import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { column_selector_search } from './atoms';
import _ from 'lodash';

const SearchPanel = (props) => {
  const { searchType, matches, style } = props;
  const [search, setSearch] = useAtom(searchType);
  const selectorSearch = searchType === column_selector_search ? search : null;
  const [filter, setFilter] = useState('');
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    setFilter(selectorSearch ? selectorSearch[1] : '');
  }, [selectorSearch]);

  const handleChange = (e) => {
    clearTimeout(timer);

    const f = e.target.value;
    setFilter(f);

    const fupper = f?.toUpperCase();

    if (selectorSearch?.[0] !== fupper) {
      setTimer(_.delay(() => setSearch(f ? [fupper, f] : {}), 500));
    }
  };

  const handleBlur = () => {
    if (!selectorSearch) {
      setFilter('');
    }
  };

  const handleX = () => {
    if (!filter) {
      return;
    }

    setFilter('');
    setSearch({});
  };

  if (!selectorSearch) {
    return null;
  }

  const background = '#0008';

  return (
    <div className="search-panel" style={style}>
      <input
        className="search-box"
        style={{ background, width: '165px' }}
        type="text"
        placeholder='search'
        spellCheck="false"
        onChange={handleChange}
        onBlur={handleBlur}
        value={filter || ''}
      />
      <div className={`search-x ${filter ? 'search-x-enabled' : ''}`} style={{ background }} onClick={handleX}>
        <div>×</div>
      </div>
      <div className="search-matches">
        {matches}
      </div>
    </div>
  );
};

export default SearchPanel;
