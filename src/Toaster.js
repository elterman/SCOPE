import { useState, useContext, useEffect, useRef } from 'react';
import _ from 'lodash';
import { BLUE, GREEN, RED, TANGERINE } from './const';
import { useSpring, animated, config } from 'react-spring';
import useForceUpdate from './useForceUpdate';
import { StoreContext } from './Store';
import { useAtom, useSetAtom } from 'jotai';
import { my_toast } from './atoms';

const shades = ['#882532', '#B5704E', '#306A4E', '#166E9C'];

const Toaster = () => {
  const l = useRef({ toasts: [] }).current;
  const forceUpdate = useForceUpdate();
  const store = useContext(StoreContext);
  const { dispatch } = store;
  const [toast, setToast] = useAtom(my_toast);

  useEffect(() => {
    if (toast) {
      l.toasts.push(toast);
      setToast(null);
    }
  }, [dispatch, l.toasts, setToast, toast]);

  if (!l.toasts.length) {
    return null;
  }

  const app = _.first(document.getElementsByClassName('App'));
  const w = app.getBoundingClientRect().width;
  const left = `${(w - 360) / 2}px`;

  return (
    <div className="toaster root-scroll" style={{ left }}>
      {_.map(l.toasts, (t) => (
        <Toast key={t.key} toast={t} toasts={l.toasts} onRemove={forceUpdate} />
      ))}
    </div>
  );
};

export default Toaster;

const Toast = (props) => {
  const { toast, toasts, onRemove } = props;
  const { message, type, duration, renderCallback } = toast;
  const [fade, setFade] = useState(false);
  const l = useRef({}).current;
  const forceUpdate = useForceUpdate();
  const color = type === 'error' ? RED : type === 'warning' ? TANGERINE : type === 'success' ? GREEN : BLUE;
  const background = type === 'error' ? shades[0] : type === 'warning' ? shades[1] : type === 'success' ? shades[2] : shades[3];

  const remove = () => {
    _.remove(toasts, (t) => t === toast);
    setFade(true);
  };

  const handleClick = (e) => {
    if (e.target.id !== 'toast-x') {
      l.cannotExpire = true;
      forceUpdate();
    }
  };

  const { spring } = useSpring({
    spring: 1,
    from: { spring: 0 },
    onRest: () => duration && setTimeout(() => !l.cannotExpire && remove(), duration),
  });

  const { opacity } = useSpring({
    opacity: fade ? 0 : 1,
    from: { opacity: fade ? 1 : 0 },
    config: fade ? config.stiff : config.default,
    onRest: () => fade && onRemove(),
  });

  const transform = spring.interpolate((s) => `translateY(${(s - 1) * 50}px)`);
  const zIndex = 1000 - toasts.indexOf(toast);
  const style = { fontSize: `${type === 'success' ? '14px' : '18px'}`, fontWeight: `${type === 'success' ? 'bold' : 'normal'}` };
  const classes = `toast-x ${duration && !l.cannotExpire ? 'toast-x-exp' : ''}`;

  return (
    <animated.div style={{ display: 'grid', opacity, transform, zIndex }} onClick={handleClick}>
      <div className="toast" style={{ background, borderColor: color }}>
        <div className="toast-message root-scroll">{renderCallback ? renderCallback() : message}</div>
        <div id="toast-x" className={classes} onClick={remove}>
          ×
        </div>
      </div>
      <div className="toast-icon" style={style}>
        {type === 'error' ? '×' : type === 'warning' ? '!' : type === 'success' ? '✔' : 'i'}
      </div>
    </animated.div>
  );
};

export const useToaster = () => {
  const setToast = useSetAtom(my_toast);

  const addToast = (props) => {
    const { type, message, duration, renderCallback } = props;
    setToast({ key: Math.random(), type: type || 'info', message, renderCallback, duration });
  };

  return addToast;
};
