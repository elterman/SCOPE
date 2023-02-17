import { WHITE } from '../const';

const Icon = ({ style = {}, color = `${WHITE}`, width, viewBox = '0 0 100 100' }) => {
  return (
    <svg
      id="svg-spinner"
      className="spinner"
      style={{ ...style, display: 'block' }}
      width={width}
      height={width}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.75" fill={color}>
        <circle cx="50" cy="25" r="6" />
        <circle cx="68" cy="32" r="5.5" />
        <circle cx="75" cy="50" r="5" />
        <circle cx="68" cy="68" r="4.5" />
        <circle cx="50" cy="75" r="4" />
        <circle cx="32" cy="68" r="3.5" />
        <circle cx="25" cy="50" r="3" />
        <circle cx="32" cy="32" r="2.5" />
      </g>
    </svg>
  );
};

export default Icon;
