import { OFF_WHITE } from '../const';

const Icon = ({ style = {}, color = `${OFF_WHITE}`, width, left = false, invert = false, viewBox = '0 0 50 100' }) => {
  const colors = invert ? ['red', color] : [color, 'red'];

  return (
    <svg style={{ ...style, display: 'block' }} width={width} height={width * 2} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" fill="#0000" stroke="none" />
      <g transform={`rotate(${left ? 180 : 0},25,50)`}>
        <path fill="#222" d="M0,0 a50,50 0 0 1 0,100" />
        <path fill={left ? colors[1] : colors[0]} d="M15,30 L35,50 15,70" /> :
      </g>
    </svg>
  );
};

export default Icon;
