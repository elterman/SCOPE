import React from 'react';
import { useSpring, animated } from 'react-spring';

const AnimatedPanel = (props: any) => {
  const { id, classes, children, style } = props;
  const { spring } = useSpring({ spring: 0, from: { spring: 1 } });

  return (
    <animated.div id={id} className={classes} style={{ ...style, transform: spring.interpolate((s:any) => `translateX(${s * 5}%)`) }}>
      {children}
    </animated.div>
  );
};

export default AnimatedPanel;
