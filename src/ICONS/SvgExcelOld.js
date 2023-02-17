import { GREEN } from '../const';

const Icon = ({ style = {}, color = GREEN, disabled = false, width, viewBox = '0 0 200 200' }) => (
  <svg
    id="svg-excel-old"
    style={{ ...style, display: 'block', opacity: `${disabled ? 0.5 : 1}` }}
    width={width}
    height={width}
    viewBox={viewBox}
    xmlns="http://www.w3.org/2000/svg">
    <path
      fill={color}
      d="M 0,23 32,65 50,65 60,83 70,63 88,63 69,98 85,133 67,133 59,113 49,131 31,131 50,98 32,65 0,23 0,177 113,195 113,4 0,23"
    />
        <path
          fill={color}
          d="M 119,26 199,26 199,172 119,172 119,160 187,160 187,38 119,38"
        />
        <path
          fill={color}
          d="M 147,35 h9 V161 h-9 "
        />
        <path
          fill={color}
          d="M 118.8,63 h69 v9 H118.8"
        />
        <path
          fill={color}
          d="M 118.8,96 h69 v9 H118.8 "
        />
        <path
          fill={color}
          d="M 118.8,129 h69 v9 H118.8 "
        />
  </svg>
);

export default Icon;
