import { GREEN } from '../const';

const Icon = ({ style = {}, color = GREEN, width, rotate = 0, viewBox = '0 0 100 100' }) => {
  const transform = `rotate(${rotate},50,50)`;

  return (
    <svg style={{ ...style, display: 'block' }} width={width} height={width} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
      {/* <rect width="100%" fill="#000" stroke="none" /> */}
      <path
        transform={transform}
        stroke={color}
        strokeWidth={20}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        d="M90,50 H10 L40,20 L10,50 L40,80"
      />
    </svg>
  );
};

export default Icon;
