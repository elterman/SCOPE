import React, { useState } from 'react';
import './Popup.css';
import { useSpring, animated } from 'react-spring';

const Popup = (props: any) => {
  const { children, style = {}, ok, onExit, isOk = true } = props;
  const [exit, setExit] = useState<number>(0);
  const OK = 1,
    CANCEL = -1;

  const { spring } = useSpring({ spring: 1, from: { spring: 0 } });

  const { opacity } = useSpring({
    opacity: exit ? 0 : 1,
  });

  return (
    <animated.div className="popup" style={{ ...style, opacity, height: spring.interpolate((s: any) => `${s * style.height}px`) }}>
      {children}
      <div className="popup-buttons">
        <div
          className={`popup-button ${isOk ? '' : 'popup-button-disabled'}`}
          onClick={() => {
            if (!isOk) {
              return;
            }

            setExit(OK);
            onExit(true);
          }}>
          {ok}
        </div>
        <div
          className="popup-button"
          onClick={() => {
            setExit(CANCEL);
            onExit(false);
          }}>
          CANCEL
        </div>
      </div>
    </animated.div>
  );
};

export default Popup;
