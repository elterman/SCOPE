import { useSpring, animated } from 'react-spring';
import _ from 'lodash';
import { tooltip_info } from "./atoms";
import { useAtom, useAtomValue } from 'jotai';

const Tooltip = () => {
  const tooltipInfo = useAtomValue(tooltip_info);
  const { x, y, text, style } = tooltipInfo;

  const { opacity } = useSpring({
    opacity: `${text ? 1 : 0}`,
    delay: 100,
    immediate: !text,
  });

  const display = text ? 'initial' : 'none';
  const left = `${x}px`;
  const top = `${y}px`;

  const lines = text?.split('\n');

  return (
    <animated.div className="tooltip" style={{ display, left, top, opacity, ...style }}>
      {_.map(lines, (l, i) => (
        <div key={i}>{l}</div>
      ))}
    </animated.div>
  );
};

export default Tooltip;

export const useTooltip = () => {
  const [tooltipInfo, setTooltipInfo] = useAtom(tooltip_info);

  const hideTooltip = () => setTooltipInfo({});

  const showTooltip = (props) => {
    const { e } = props;

    if (e) {
      const { text, style } = props;

      let dx = props.dx || 0;
      let dy = props.dy || 35;

      const r = e.target.getBoundingClientRect();

      if (r) {
        text && setTooltipInfo({ text, x: r.x + dx, y: r.y + dy, style });
      }
    } else if (!_.isEmpty(tooltipInfo)) {
      hideTooltip();
    }
  };

  return { showTooltip, hideTooltip };
};