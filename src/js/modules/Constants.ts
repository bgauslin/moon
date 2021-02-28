// Values are coordinated with 'Chart' enum in 'src/stylus/config/constants.styl'
export enum Chart {
  LABEL_GAP = 8,
  MARGIN = 44,
  SIZE = 320,
  SWEEP_WIDTH = 72,
}

// Math for chart axes based on values in the Chart enum.
export interface Coordinates {
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  rotate?: number,
}

// Container and center point.
export const VIEWBOX: number = Chart.SIZE + (Chart.MARGIN * 2);
const CENTER: number = VIEWBOX / 2;

// Four overlay 90 degree ticks in the moon/set sweep area.
const SWEEP_INNER_EDGE: number = CENTER + ((Chart.SIZE / 2) - Chart.SWEEP_WIDTH);
export const SWEEP_TICKS: Coordinates[] = [
  { // top
    x1: CENTER, y1: Chart.MARGIN,
    x2: CENTER, y2: Chart.MARGIN + Chart.SWEEP_WIDTH,
  },
  { // right
    x1: SWEEP_INNER_EDGE, y1: CENTER,
    x2: VIEWBOX - Chart.MARGIN, y2: CENTER,
  },
  { // bottom
    x1: CENTER, y1: SWEEP_INNER_EDGE,
    x2: CENTER, y2: VIEWBOX - Chart.MARGIN,
  },
  { // left
    x1: Chart.MARGIN, y1: CENTER,
    x2: Chart.MARGIN + Chart.SWEEP_WIDTH, y2: CENTER,
  },
];

// Four major 90 degree ticks outside the sweep area.
export const MAJOR_TICKS: Coordinates[] = [
  { // top
    x1: CENTER, y1: 0,
    x2: CENTER, y2: Chart.MARGIN,
  },
  { // right
    x1: VIEWBOX - Chart.MARGIN, y1: CENTER,
    x2: VIEWBOX, y2: CENTER,
  },
  { // bottom
    x1: CENTER, y1: VIEWBOX - Chart.MARGIN,
    x2: CENTER, y2: VIEWBOX,
  },
  { // left
    x1: 0, y1: CENTER,
    x2: Chart.MARGIN, y2: CENTER,
  },
];

// Single minor tick for generating multiple ticks.
const MINOR_TICK_LENGTH = 12;
export const MINOR_TICK = {
  center: {
    x: CENTER,
    y: CENTER,
  },
  line: {
    x1: CENTER,
    y1: VIEWBOX - MINOR_TICK_LENGTH,
    x2: CENTER,
    y2: VIEWBOX,
  },
};