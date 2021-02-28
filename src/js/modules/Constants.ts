// Values are coordinated with 'Chart' enum in 'src/stylus/config/constants.styl'
export enum Chart {
  LABEL_GAP = 8,
  MARGIN = 44,
  SIZE = 320,
  SWEEP_WIDTH = 72,
}

export interface SVGLine {
  x1: number,
  y1: number,
  x2: number,
  y2: number,
}

// Container and center point.
export const VIEWBOX: number = Chart.SIZE + (Chart.MARGIN * 2);
export const CENTER: number = VIEWBOX / 2;

export const SWEEP_TICK = {  
  x1: CENTER, y1: Chart.MARGIN,
  x2: CENTER, y2: Chart.MARGIN + Chart.SWEEP_WIDTH,
};

export const MAJOR_TICK = {
  x1: CENTER, y1: 0,
  x2: CENTER, y2: Chart.MARGIN,
};

export const MINOR_TICK = {
  x1: CENTER,
  y1: VIEWBOX - 12,
  x2: CENTER,
  y2: VIEWBOX,
};