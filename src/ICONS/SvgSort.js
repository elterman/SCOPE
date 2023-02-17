const Icon = ({ style = {}, asc = true, width, color = 'red', viewBox = '0 0 100 100' }) => {
  return (
    <svg id='svg-sort' style={{ ...style, display: 'block' }} width={width} height={width} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
      <g>
        <rect width="100%" fill="#0000" stroke="none" />
        {!asc && <path fill={color} d="M0,10 L50,90 100,10" />}
        {asc && <path fill={color} d="M0,90 L50,10 100,90" />}
      </g>
    </svg>
  );
};

export default Icon;
