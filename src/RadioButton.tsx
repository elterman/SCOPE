import React from 'react';
import { useSpring, animated } from 'react-spring';

const RadioButton = (props: any) => {
  const { checked, label, handleToggle, style, gap } = props;
  const { spring } = useSpring({ spring: checked ? 1 : 0, velocity: 50 });

  return (
    <div className="grid-cols checkbox" style={{ ...style }} onClick={() => !checked && handleToggle()}>
      <div className="radio-outer" />
      <animated.div className="radio-inner" style={{ transform: spring.interpolate((s: any) => `scale(${s})`) }} />
      <div style={{ gridArea: '1/2', marginLeft: `${gap || 10}px` }}>{label}</div>
    </div>
  );
};

export default RadioButton;
