import { formatLongDate } from './Utils';
import Button from './Button';
import SvgCalendar from './ICONS/SvgCalendar';
import { DISABLED_COLOR, GREEN } from './const';
import { useAtomValue, useSetAtom } from 'jotai';
import { as_of_date, date_picker_visible, use_aladdin } from './atoms';

const AsOfDate = () => {
  const asOfDate = useAtomValue(as_of_date);
  const aladdin = useAtomValue(use_aladdin);
  const showDatePicker = useSetAtom(date_picker_visible);

  return (
    <Button
      id="btn-date-picker"
      label={formatLongDate(asOfDate?.slice(0, 4), asOfDate?.slice(5, 7), asOfDate?.slice(8))}
      tooltip="Select As-Of Date"
      disabled={aladdin}
      handleClick={() => !aladdin && showDatePicker(true)}>
      <SvgCalendar width={18} color={aladdin ? DISABLED_COLOR : GREEN} />
    </Button>
  );
};

export default AsOfDate;
