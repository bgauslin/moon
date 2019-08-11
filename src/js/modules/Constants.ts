enum Attribute {
  COLOR = 'color',
  DIRECTION = 'direction',
  ENABLED = 'enabled',
  END = 'end',
  HIDDEN = 'hidden',
  ILLUMINATION = 'illumination',
  LOADING = 'loading',
  LOCATION = 'location',
  PERCENT = 'percent',
  PHASE = 'phase',
  READY = 'ready',
  RESTORE = 'restore',
  START = 'start',
};

// Values are coordinated with 'Chart' enum in 'src/stylus/config/constants.styl'
enum Chart {
  LABEL_GAP = 8,
  MARGIN = 44,
  SIZE = 320,
  SWEEP_WIDTH = 72,
};

export { Attribute, Chart };
