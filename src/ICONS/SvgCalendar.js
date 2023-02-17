import { GREEN } from '../const';

const Icon = ({ style = {}, width, color = GREEN, viewBox = '0 0 100 100' }) => {
  return (
    <svg id="svg-calendar" style={{ ...style }} width={width} height={width} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
      <g>
        <path fill={color} d="M 0,10 H15 V30 H35 V10 H65 V30 H85 V10 H100 V41 H0" />
        <path fill={color} d="M 20,0 H30 V23 H20" />
        <path fill={color} d="M 70,0 H80 V23 H70" />
        <path fill={color} d="M 0,10 H5 V100 H0" />
        <path fill={color} d="M 100,10 V100 H95 V10" />
        <path fill={color} d="M 0,100 H100 V95 H0" />
        <path strokeWidth={8} stroke={color} strokeLinecap="round" strokeLinejoin="round" fill="none" d="M 32,67 48,80 70,56" />
      </g>
    </svg>
  );
};

export default Icon;
