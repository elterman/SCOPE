import { useState } from 'react';
import DatePicker from './DatePicker';
import { useSpring, animated } from 'react-spring';
import { useAtom, useSetAtom } from 'jotai';
import { as_of_date, date_picker_visible } from './atoms';

const DatePickerView = () => {
  let [date, setDate] = useAtom(as_of_date);
  const [exit, setExit] = useState();
  const showDatePicker = useSetAtom(date_picker_visible);

  const { opacity } = useSpring({
    opacity: exit ? 0 : 1,
    from: { opacity: 0 },
    onRest: () => exit && showDatePicker(false),
  });

  const onExitDatePicker = (month, year, day) => {
    setExit(true);

    if (month && year && day) {
      setDate(`${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`);
    }
  };

  const handleModalClick = (e) => {
    if (typeof e.target.className === 'string' && e.target.className.includes('modal-screen')) {
      setExit(true);
    }
  };

  const off = document.getElementById('btn-date-picker')?.getBoundingClientRect();

  if (!off) {
    return null;
  }

  return (
    <animated.div id="date-picker-screen" className="modal-screen" style={{ cursor: 'initial', opacity }} onClick={handleModalClick}>
      <DatePicker
        style={{ left: `${off?.left - 10}px`, top: `${off?.top + 40}px`, opacity }}
        year={date.slice(0, 4)}
        month={date.slice(5, 7)}
        day={date.slice(8)}
        onExit={onExitDatePicker}
      />
    </animated.div>
  );
};

export default DatePickerView;
