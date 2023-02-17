import { OFF_WHITE } from '../const';

const Icon = ({ style = {}, width, color = OFF_WHITE, viewBox = '0 0 100 100' }) => {
  return (
    <svg id="svg-user" style={{ ...style }} width={width} height={width} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
      <g strokeWidth={6} stroke={color} fill="none">
        <circle cx={50} cy={34} r={14} />
        <path d='M18,80 C 30,50 70,50 82,80' />
        <circle cx={50} cy={50} r={46} />
      </g>
    </svg>
  );
};

export default Icon;
