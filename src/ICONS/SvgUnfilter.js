import { BLUE, DISABLED_COLOR } from '../const';

const Icon = ({ style = {}, color = BLUE, disabled = true, width, viewBox = '0 0 100 100' }) => (
  <svg style={{ ...style, display: 'block' }} width={width} height={width} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      {/* <rect width="100%" fill="#000" stroke="none" /> */}
      <path stroke={disabled ? DISABLED_COLOR : color} strokeWidth={6} d="M5,12 H61 V14 L41,38 V77 L25,67 V38 L5,12" />
      <path stroke={disabled ? '#4C4C4C' : '#f00'} strokeWidth={10} d="M90,88 L60,58 M90,58 L60,88" />
    </g>
  </svg>
);

export default Icon;
