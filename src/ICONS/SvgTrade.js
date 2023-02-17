import { RED, GREEN, WHITE, GOLD } from '../const';

const Icon = ({ style = {}, disabled = false, width, color1 = GREEN, color2 = RED, color3 = GOLD, viewBox = '0 0 100 100' }) => {
  return (
    <svg style={{ ...style, display: 'block' }} width={width} height={width} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
      {/* <rect width="100%" height="100%" fill="#000" stroke="none" /> */}
      <g opacity={disabled ? 0.23 : 1}>
        <g strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* <circle cx="50" cy="50" r="44" stroke="pink" /> */}
          <g stroke={disabled ? WHITE : color1}>
            <path d="M6,55 C 2,9 57,-9 82,20 " />
            <polyline fill={color1} points="90,6 90,28 68,28 90,6" />
          </g>
          <g stroke={disabled ? WHITE : color2}>
            <path d="M94,45 C 98,91 43,109 18,80 " />
            <polyline fill={color2} points="10,94 10,72 32,72 10,94" />
          </g>
        </g>
        <g fill={disabled ? WHITE : color3} strokeWidth={15}>
          <text x="31" y="70" fontSize="60" fontWeight="bold">
            $
          </text>
        </g>
      </g>
    </svg>
  );
};

export default Icon;
