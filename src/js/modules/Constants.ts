// Values are coordinated with 'Chart' enum in 'src/stylus/config/constants.styl'
export enum Chart {
  LABEL_GAP = 8,
  MARGIN = 44,
  SIZE = 320,
  SWEEP_WIDTH = 72,
}

// Math for chart axes based on values in the Chart enum.
interface Coordinates {
  x1: number,
  y1: number,
  x2: number,
  y2: number,
}

// Container and center point.
export const VIEWBOX: number = Chart.SIZE + (Chart.MARGIN * 2);
const MIDPOINT: number = VIEWBOX / 2;

// Four overlay 90 degree ticks in the moon/set sweep area.
const SWEEP_INNER_EDGE: number = MIDPOINT + ((Chart.SIZE / 2) - Chart.SWEEP_WIDTH);
export const SWEEP_TICKS: Coordinates[] = [
  { // top
    x1: MIDPOINT, y1: Chart.MARGIN,
    x2: MIDPOINT, y2: Chart.MARGIN + Chart.SWEEP_WIDTH,
  },
  { // right
    x1: SWEEP_INNER_EDGE, y1: MIDPOINT,
    x2: VIEWBOX - Chart.MARGIN, y2: MIDPOINT,
  },
  { // bottom
    x1: MIDPOINT, y1: SWEEP_INNER_EDGE,
    x2: MIDPOINT, y2: VIEWBOX - Chart.MARGIN,
  },
  { // left
    x1: Chart.MARGIN, y1: MIDPOINT,
    x2: Chart.MARGIN + Chart.SWEEP_WIDTH, y2: MIDPOINT,
  },
];

// Four major 90 degree ticks outside the sweep area.
export const MAJOR_TICKS: Coordinates[] = [
  { // top
    x1: MIDPOINT, y1: 0,
    x2: MIDPOINT, y2: Chart.MARGIN,
  },
  { // right
    x1: VIEWBOX - Chart.MARGIN, y1: MIDPOINT,
    x2: VIEWBOX, y2: MIDPOINT,
  },
  { // bottom
    x1: MIDPOINT, y1: VIEWBOX - Chart.MARGIN,
    x2: MIDPOINT, y2: VIEWBOX,
  },
  { // left
    x1: 0, y1: MIDPOINT,
    x2: Chart.MARGIN, y2: MIDPOINT,
  },
];
