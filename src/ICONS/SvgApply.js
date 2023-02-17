import { GREEN } from '../const';

const Icon = ({ style = {}, width, color = GREEN, disabled = false, viewBox = '0 0 100 100' }) => {
  if (disabled) {
    color ='#9A9A9A';
  }

  return (
    <svg id="applycheck" style={{ ...style, opacity: `${disabled ? 0.5 : 1}` }} width={width} height={width} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
      <g>
        <rect width="100%" fill="#0000" stroke="none" />
        <circle stroke={color} strokeWidth={9} fill="none" cx="50%" cy="50%" r="34%" />
        <path id="apply" fill={color} d="M46,0 L53,0 55,14 44,14" />
        <use href="#apply" transform="rotate(30,50,50)" />
        <use href="#apply" transform="rotate(60,50,50)" />
        <use href="#apply" transform="rotate(90,50,50)" />
        <use href="#apply" transform="rotate(120,50,50)" />
        <use href="#apply" transform="rotate(150,50,50)" />
        <use href="#apply" transform="rotate(180,50,50)" />
        <use href="#apply" transform="rotate(210,50,50)" />
        <use href="#apply" transform="rotate(240,50,50)" />
        <use href="#apply" transform="rotate(270,50,50)" />
        <use href="#apply" transform="rotate(300,50,50)" />
        <use href="#apply" transform="rotate(330,50,50)" />
        <path strokeWidth={10} stroke={color} strokeLinecap="round" strokeLinejoin="round" fill="none" d="M30,53 L45,65 L67,40" />
      </g>
    </svg>
  );
};

export default Icon;
