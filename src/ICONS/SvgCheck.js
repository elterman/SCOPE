import { GREEN } from '../const';

const Icon = ({ style = {}, width, color = GREEN, viewBox = '0 0 100 100' }) => {
  return (
    <svg id='svg-check' style={{ ...style }} width={width} height={width} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
      <g>
        <rect width="100%" fill="#0000" stroke="none" />
        <path strokeWidth={18} stroke={color} strokeLinecap="round" strokeLinejoin="round" fill="none" d="M18,60 L45,87 L85,27" />
      </g>
    </svg>
  );
};

export default Icon;
