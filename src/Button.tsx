import React from 'react';
import { useTooltip } from './Tooltip';

const Button = (props: any) => {
  const { showTooltip, hideTooltip } = useTooltip();
  const { id, children, style, classes, disabled = false, label, handleClick, tooltip = '' } = props;

  return (
    <>
      <div
        id={id}
        className={`button ${disabled ? 'button-disabled' : ''} ${classes}`}
        onClick={(e) => !disabled && handleClick(e)}
        style={style}
        onMouseEnter={(e) => showTooltip({ e, text: tooltip })}
        onMouseLeave={hideTooltip}>
        {children}
        {label && <div style={{ margin: '0 0 0 10px', opacity: `${disabled ? 0.35 : 1}` }}>{label}</div>}
      </div>
    </>
  );
};

export default Button;
