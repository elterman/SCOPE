import { BLUE } from '../const';

const Icon = ({ style = {}, width, color = BLUE, viewBox = '0 0 148 148' }) => {
  return (
    <svg id="svg-logo" style={{ ...style, display: 'block' }} width={width} height={width} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
      <g stroke={color} strokeWidth="9" fill="none" strokeLinecap="round">
        <rect width="100%" fill="#0000" stroke="none" />
        <circle cx="50%" cy="50%" r="6" stroke="none" fill={color === BLUE ? '#F00' : color} />
        <circle cx="50%" cy="50%" r="18%" strokeWidth="7" />
        <circle cx="50%" cy="50%" r="36%" />
        <path d="M7,74 H59 M89,74 H141 M74,7 V59 M74,89 V141" />
      </g>
    </svg>
  );
};

export default Icon;
