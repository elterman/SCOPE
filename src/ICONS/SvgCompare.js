import { DISABLED_COLOR, GOLD } from '../const';

const Icon = ({ style = {}, color1 = GOLD, color2 = GOLD, disabled = false, width, viewBox = '0 0 100 100' }) => (
  <svg
    style={{ ...style, opacity: `${disabled ? 0.5 : 1}`, display: 'block' }}
    width={width}
    height={width}
    viewBox={viewBox}
    xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" fill="#0000" stroke="none" />
    <rect y="12%" width="100%" height="30%" fill={disabled ? DISABLED_COLOR : color1} />
    <rect y="58%" width="100%" height="30%" fill={disabled ? '#9A9A9A' : color2} />
  </svg>
);

export default Icon;
