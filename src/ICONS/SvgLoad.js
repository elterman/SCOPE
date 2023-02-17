import { BLUE } from '../const';

const Icon = ({ style = {}, width, color = BLUE, viewBox = '0 0 100 100' }) => {
  return (
    <svg id='svg-load' style={{ ...style }} width={width} height={width} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
      <g>
        <rect width="100%" fill="#0000" stroke="none" />
        <circle stroke={color} strokeWidth={9} fill="none" cx="50%" cy="50%" r="34%" />
        <path id="load" fill={color} d="M46,0 L53,0 55,14 44,14" />
        <use href="#load" transform="rotate(30,50,50)" />
        <use href="#load" transform="rotate(60,50,50)" />
        <use href="#load" transform="rotate(90,50,50)" />
        <use href="#load" transform="rotate(120,50,50)" />
        <use href="#load" transform="rotate(150,50,50)" />
        <use href="#load" transform="rotate(180,50,50)" />
        <use href="#load" transform="rotate(210,50,50)" />
        <use href="#load" transform="rotate(240,50,50)" />
        <use href="#load" transform="rotate(270,50,50)" />
        <use href="#load" transform="rotate(300,50,50)" />
        <use href="#load" transform="rotate(330,50,50)" />
        <path fill={color} d="M43,32 H57 V50 H68 L50,70 33,50 H43 V43,35" />
      </g>
    </svg>
  );
};

export default Icon;
