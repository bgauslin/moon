/** @enum {string} */
const Attribute = {
  LOCATION: 'location',
  PERCENT: 'percent',
  PHASE: 'phase',
};

/** @enum {number} */
// NOTE: Keep values coordinated with 'Chart' enum in 'src/stylus/config/layout.styl'
const Chart = {
  LABEL_GAP: 8,
  MARGIN: 44,
  SIZE: 320,
  SWEEP_WIDTH: 72,
};

export { Attribute, Chart };
