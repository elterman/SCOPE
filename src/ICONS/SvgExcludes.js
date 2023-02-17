const Icon = ({ style = {}, width, color = 'pink', viewBox = '0 0 100 100' }) => {
  return (
    <svg id="svg-load" style={{ ...style }} width={width} height={width} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
      <g>
      <circle stroke={color} strokeWidth={9} fill="none" cx="50%" cy="50%" r="34%" />
        <path id="xtooth" fill={color} d="M46,0 L53,0 55,14 44,14" />
        <use href="#xtooth" transform="rotate(30,50,50)" />
        <use href="#xtooth" transform="rotate(60,50,50)" />
        <use href="#xtooth" transform="rotate(90,50,50)" />
        <use href="#xtooth" transform="rotate(120,50,50)" />
        <use href="#xtooth" transform="rotate(150,50,50)" />
        <use href="#xtooth" transform="rotate(180,50,50)" />
        <use href="#xtooth" transform="rotate(210,50,50)" />
        <use href="#xtooth" transform="rotate(240,50,50)" />
        <use href="#xtooth" transform="rotate(270,50,50)" />
        <use href="#xtooth" transform="rotate(300,50,50)" />
        <use href="#xtooth" transform="rotate(330,50,50)" />
        <path strokeWidth={10} stroke={color} strokeLinecap="round" strokeLinejoin="round" fill="none" d="M38,38 L62,62 M62,38 L38,62" />
      </g>
    </svg>
  );
};

export default Icon;
