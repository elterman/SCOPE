import { GOLD } from "../const";

const Icon = ({ style = {}, width, color = GOLD, viewBox = "0 0 100 100" }) => {
  return (
    <svg style={{ ...style }} width={width} height={width} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg"    >
      <rect width="100%" height="100%" fill="#0000" stroke="none" />
      <g fill={color}>
        <rect height="18" width="30" y="10" />
        <rect height="18" width="30" y="30" />
        <rect height="18" width="30" y="50" />
        <rect height="18" width="30" y="70" />
        </g>

      <g fill='#fff6'>
        <rect height="18" width="30" y="10" x='35'/>
        <rect height="18" width="30" y="30" x='35'/>
        <rect height="18" width="30" y="50" x='35'/>
        <rect height="18" width="30" y="70" x='35'/>
        </g>

      <g fill={color}>
        <rect height="18" width="30" y="10" x='70'/>
        <rect height="18" width="30" y="30" x='70'/>
        <rect height="18" width="30" y="50" x='70'/>
        <rect height="18" width="30" y="70" x='70'/>
      </g>
    </svg>
  );
};

export default Icon;
