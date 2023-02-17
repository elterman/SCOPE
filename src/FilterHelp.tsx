import React from 'react';
import { useSpring, animated } from 'react-spring';
import { useAtom } from 'jotai';
import { show_filter_help } from './atoms';

const FilterHelp = () => {
  const [filterHelp, setshowFilterHelp] = useAtom(show_filter_help);

  const { opacity } = useSpring({ opacity: filterHelp ? 1 : 0, from: { opacity: 0 } });

  if (!filterHelp) {
    return null;
  }

  const s = '      ';
  const samples = `Sample filters:${s}US001${s}"T"${s}=67.89${s}<>0${s}>=0.23 <=0.45${s}>–0.5 <>0 <0.5`;

  return (
    <animated.div className="info" style={{ opacity }}>
      {samples}
      <div className="info-x" onClick={() => setshowFilterHelp(false)}>
        ×
      </div>
    </animated.div>
  );
};

export default FilterHelp;
