import { BLUE, GREEN } from '../const';

const Icon = ({ style = {}, plus = true, color = BLUE, width, viewBox = '0 0 100 100' }) => (
  <svg style={{ ...style, display: 'block' }} width={width} height={width} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      {/* <rect width="100%" fill="#000" stroke="none" /> */}
      <path stroke={color} strokeWidth={6} d="M5,12 H61 V14 L41,38 V67 L25,77 V38 L5,12" />
      {plus && <path stroke={GREEN} strokeWidth={10} d="M74,56 V88 M58,72 H90" />}
    </g>
  </svg>
);

export default Icon;
