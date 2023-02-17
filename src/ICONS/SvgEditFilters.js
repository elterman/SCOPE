import { BLUE, GOLD } from '../const';

const Icon = ({ style = {}, width, viewBox = '0 0 100 100' }) => {
  return (
    <svg id="svg-edit-filters" style={{ ...style }} width={width} height={width} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
        <path
          stroke={BLUE}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          d="M5,3 H61 V5 L41,29 V58 L25,68 V29 L5,3"
        />
        <g fill={GOLD} transform='scale(0.83) translate(22,20)'>
          <path d="M21,100 30,75 46,91" />
          <path d="M34,72 70,35 86,51 49,87" />
          <path d="M74,32 82,24 98,40 90,48" />
        </g>
    </svg>
  );
};

export default Icon;
