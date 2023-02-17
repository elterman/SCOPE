import { BLUE } from '../const';

const Icon = ({ style = {}, width, color = BLUE, disabled = false, viewBox = '0 0 100 100' }) => {
  if (disabled) {
    color = '#8C8C8C';
  }

  return (
    <svg id="svg-run" style={{ ...style }} width={width} height={width} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
      <g>
        <rect width="100%" fill="#0000" stroke="none" />
        <circle stroke={color} strokeWidth={9} fill="none" cx="50%" cy="50%" r="34%" />
        <path id="run" fill={color} d="M46,0 L53,0 55,14 44,14" />
        <use href="#run" transform="rotate(30,50,50)" />
        <use href="#run" transform="rotate(60,50,50)" />
        <use href="#run" transform="rotate(90,50,50)" />
        <use href="#run" transform="rotate(120,50,50)" />
        <use href="#run" transform="rotate(150,50,50)" />
        <use href="#run" transform="rotate(180,50,50)" />
        <use href="#run" transform="rotate(210,50,50)" />
        <use href="#run" transform="rotate(240,50,50)" />
        <use href="#run" transform="rotate(270,50,50)" />
        <use href="#run" transform="rotate(300,50,50)" />
        <use href="#run" transform="rotate(330,50,50)" />
        <path fill={color} d="M40,33 L67,50 40,67" />
      </g>
    </svg>
  );
};

export default Icon;
