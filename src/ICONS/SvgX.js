const Icon = ({ style = {}, width, color = '#f00', viewBox = '0 0 100 100' }) => {
  return (
    <svg id="svg-x" style={{ ...style }} width={width} height={width} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
      <g>
        <rect width="100%" fill="#0000" stroke="none" />
        <path strokeWidth={18} stroke={color} strokeLinecap="round" strokeLinejoin="round" fill="none" d="M20,20 L80,80 M80,20 L20,80" />
      </g>
    </svg>
  );
};

export default Icon;
