import { WHITE } from '../const';

const Icon = ({ style = {}, width, prev = false, end = false, color = `${WHITE}`, viewBox = '0 0 100 100' }) => {
  const displayPrev = prev ? 'initial' : 'none';
  const displayNext = prev ? 'none' : 'initial';
  const displayEnd = end ? 'initial' : 'none';

  return (
    <svg id="svg-navigate" style={{ ...style }} width={width} height={width} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
      <g fill={color}>
        <rect width="100%" fill="transparent" />
        <g style={{ display: displayNext }}>
          <path d="M0,0 L80,50 0,100" />
          <rect width="20" height="100" x="80" style={{ display: displayEnd }} />
        </g>
        <g style={{ display: displayPrev }}>
          <path d="M100,0 L20,50 100,100" />
          <rect width="20" height="100" x="0" style={{ display: displayEnd }} />
        </g>
      </g>
    </svg>
  );
};

export default Icon;
