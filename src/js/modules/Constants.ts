export interface SVGLine {
  x1: number,
  y1: number,
  x2: number,
  y2: number,
}

// Values are coordinated with 'Chart' enum in 'src/stylus/config/constants.styl'
export enum Chart {
  LABEL_GAP = 8,
  MARGIN = 44,
  MINOR_TICK_LENGTH = 12,
  SIZE = 320,
  SWEEP_WIDTH = 72,
}

export const CENTER: number = Chart.MARGIN + (Chart.SIZE / 2);
export const VIEWBOX: number = Chart.SIZE + (Chart.MARGIN * 2);

export const MAJOR_TICK: SVGLine  = {
  x1: CENTER, y1: 0,
  x2: CENTER, y2: Chart.MARGIN,
};

export const MINOR_TICK: SVGLine  = {
  x1: CENTER, y1: VIEWBOX - Chart.MINOR_TICK_LENGTH,
  x2: CENTER, y2: VIEWBOX,
};

export const SWEEP_TICK: SVGLine = {  
  x1: CENTER, y1: Chart.MARGIN,
  x2: CENTER, y2: Chart.MARGIN + Chart.SWEEP_WIDTH,
};
