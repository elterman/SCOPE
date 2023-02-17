import React from 'react';
import SvgCheck from './ICONS/SvgCheck';
import { WHITE } from './const';
import { useSpring, animated } from 'react-spring';

const CheckBox = (props: any) => {
  const { checked, disabled, label, handleToggle, style, gap } = props;
  const { spring } = useSpring({ spring: checked ? 1 : 0, velocity: 50 });
  const classes = `grid-cols checkbox ${disabled ? 'checkbox-disabled' : ''}`;
  const boxClasses = `check-box ${disabled ? 'check-box-disabled' : ''}`;

  return (
    <div className={classes} style={{ ...style }} onClick={(e) => handleToggle(!checked, e)}>
      <div className={boxClasses} />
      <animated.div
        style={{
          gridArea: '1/1',
          justifySelf: 'center',
          transformOrigin: '30% 70%',
          transform: spring.interpolate((s: any) => `scale(${s})`),
        }}>
        <SvgCheck width={12} color={WHITE} />
      </animated.div>
      {label && <div style={{ gridArea: '1/2', marginLeft: `${gap || 10}px` }}>{label}</div>}
    </div>
  );
};

export default CheckBox;
