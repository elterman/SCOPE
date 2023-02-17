const Icon = ({ style = {}, disabled = false, width, viewBox = '0 0 360 360' }) => (
  <svg
    id="svg-excel-new"
    style={{ ...style, display: 'block', opacity: `${disabled ? 0.5 : 1}` }}
    width={width}
    height={width}
    viewBox={viewBox}
    xmlns="http://www.w3.org/2000/svg">
    <g>
      <path fill={disabled ? '#BBBBBB' : '#68E7B1'} d="M96,20 h128 v80 h-139 v-68 a12,12 0 0 1 12, -12" />
      <path fill={disabled ? '#D2D2D2' : '#7AFFCC'} d="M224,20 h124 a12,12 0 0 1 12,12 v68 h-136" />
      <path fill={disabled ? '#BBBBBB' : '#68E7B1'} d="M224,100 h136 v80 h-136" />
      <path fill={disabled ? '#9B9B9B' : '#57C08C'} d="M224,180 h136 v80 h-136" />
      <path fill={disabled ? '#898989' : '#5FA082'} d="M224,260 h136 v68 a12,12 0 0 1 -12,12 H84 a12,12 0 0 1 -12,-12 V180 h152" />
      <path fill={disabled ? '#949494' : '#55B787'} d="M96,100 h128 v80 h-136" />
      <path
        fill={disabled ? '#939393' : '#54B684'}
        d="M11,89 h162 a12,12 0 0 1 12,12 v162 a12,12 0 0 1 -12,12 h-162 a12,12 0 0 1 -12,-12, v-162 a12,12 0 0 1 12, -12"
      />
      <path
        fill="#2F343A"
        d="M49,130 L72,130 91,168 113,130 133,130 133,132 104,179 104,180 134,227 134,229 113,229 91,190 69,229 48,230 48,227 79,180 79,179 50,131"
      />
    </g>
  </svg>
);

export default Icon;
