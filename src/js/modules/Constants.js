/** @enum {string} */
const Attribute = {
  COLOR: 'color',
  DIRECTION: 'direction',
  ENABLED: 'enabled',
  END: 'end',
  HIDDEN: 'hidden',
  LOADING: 'loading',
  LOCATION: 'location',
  PERCENT: 'percent',
  PHASE: 'phase',
  RESTORE: 'restore',
  START: 'start',
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
