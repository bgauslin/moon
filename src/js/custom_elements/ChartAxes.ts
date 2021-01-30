import {Chart} from '../modules/Constants';

interface Coordinates {
  x1: number,
  y1: number,
  x2: number,
  y2: number,
}

// Container and centerpoint.
const VIEWBOX: number = Chart.SIZE + (Chart.MARGIN * 2);
const MIDPOINT: number = VIEWBOX / 2;

// Top and left axis lines.
const AXIS_FIRST_HALF_START: number = Chart.MARGIN;
const AXIS_FIRST_HALF_END: number = Chart.MARGIN + Chart.SWEEP_WIDTH;

// Bottom and right axis lines.
const AXIS_SECOND_HALF_START: number = MIDPOINT + ((Chart.SIZE / 2) - Chart.SWEEP_WIDTH)
const AXIS_SECOND_HALF_END: number = VIEWBOX - Chart.MARGIN;

// Axes values start at the top and go clockwise.
const AXES: Coordinates[] = [
  {
    x1: MIDPOINT, y1: AXIS_FIRST_HALF_START,
    x2: MIDPOINT, y2: AXIS_FIRST_HALF_END,
  },
  {
    x1: AXIS_SECOND_HALF_START, y1: MIDPOINT,
    x2: AXIS_SECOND_HALF_END, y2: MIDPOINT,
  },
  {
    x1: MIDPOINT, y1: AXIS_SECOND_HALF_START,
    x2: MIDPOINT, y2: AXIS_SECOND_HALF_END,
  },
  {
    x1: AXIS_FIRST_HALF_START, y1: MIDPOINT,
    x2: AXIS_FIRST_HALF_END, y2: MIDPOINT,
  },
];

// Top and left tick lines.
const TICK_FIRST_HALF_START: number = 0;
const TICK_FIRST_HALF_END: number = Chart.MARGIN;

// Bottom and right tick lines.
const TICK_SECOND_HALF_START: number = VIEWBOX - Chart.MARGIN;
const TICK_SECOND_HALF_END: number = VIEWBOX;

// Ticks values start at the top and go clockwise.
const TICKS: Coordinates[] = [
  {
    x1: MIDPOINT, y1: TICK_FIRST_HALF_START,
    x2: MIDPOINT, y2: TICK_FIRST_HALF_END,
  },
  {
    x1: TICK_SECOND_HALF_START, y1: MIDPOINT,
    x2: TICK_SECOND_HALF_END, y2: MIDPOINT,
  },
  {
    x1: MIDPOINT, y1: TICK_SECOND_HALF_START,
    x2: MIDPOINT, y2: TICK_SECOND_HALF_END,
  },
  {
    x1: TICK_FIRST_HALF_START, y1: MIDPOINT,
    x2: TICK_FIRST_HALF_END, y2: MIDPOINT,
  },
];

/**
 * Custom element that renders an SVG with vertical and horizontal ticks for
 * time axes (i.e., 12AM, 6AM, 12PM, 6PM).
 */
export class ChartAxes extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  /**
   * Renders SVG element for chart axes and ticks.
   */
  private render() {
    let axisLines: string = '';
    let tickLines: string = '';

    AXES.forEach((axis: Coordinates) => {
      const {x1, y1, x2, y2} = axis;
      const line = `<line class="axis" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
      axisLines += line;
    });

    TICKS.forEach((tick: Coordinates) => {
      const {x1, y1, x2, y2} = tick;
      const line = `<line class="tick" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
      tickLines += line;
    });

    const html = `\
      <svg viewbox="0 0 ${VIEWBOX} ${VIEWBOX}">\
        <g>${axisLines}</g>\
        <g>${tickLines}</g>\
      </svg>\
    `;

    this.innerHTML = html.replace(/\s\s/g, '');
  }
}
