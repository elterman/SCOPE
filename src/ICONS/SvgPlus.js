const Icon = ({ style = {}, width, color = '#56BF8B', viewBox = '0 0 100 100' }) => {
  return (
    <svg id="svg-plus" style={{ ...style }} width={width} height={width} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
      <g>
        <rect width="100%" fill="#0000" stroke="none" />
        <path strokeWidth={12} stroke={color} strokeLinecap="round" strokeLinejoin="round" fill="none" d="M50,20 V80 M20,50 H80" />
      </g>
    </svg>
  );
};

export default Icon;
