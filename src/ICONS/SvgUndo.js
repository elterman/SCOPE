const Icon = ({ style = {}, width, color = '#7affcc', viewBox = '0 0 100 100' }) => {
  return (
    <svg id="svg-undo" style={{ ...style }} width={width} height={width} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
      <g strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* <circle cx="50" cy="50" r="44" stroke="pink" /> */}
        <g stroke={color}>
          <path d="M 18,20 A 44 44, 0, 1, 1, 6 55" />
          <polyline fill={color} points="10,6 10,28 32,28 10,6" />
        </g>
      </g>
    </svg>
  );
};

export default Icon;
