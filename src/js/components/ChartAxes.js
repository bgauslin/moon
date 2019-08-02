import { Chart } from '../modules/Chart';

/** @const {number} */
const VIEWBOX = Chart.SIZE + (Chart.MARGIN * 2);

/** @const {number} */
const MIDPOINT = VIEWBOX / 2;

// Top and left axis lines.
/** @const {number} */
const AXIS_FIRST_HALF_START = Chart.MARGIN;

/** @const {number} */
const AXIS_FIRST_HALF_END = Chart.MARGIN + Chart.SWEEP_WIDTH;

// Bottom and right axis lines.
/** @const {number} */
const AXIS_SECOND_HALF_START = MIDPOINT + ((Chart.SIZE / 2) - Chart.SWEEP_WIDTH)

/** @const {number} */
const AXIS_SECOND_HALF_END = VIEWBOX - Chart.MARGIN;

/** @const {Array<Object>} */
const Axes = [
  // Moving clockwise from the top.
  {
    x1: MIDPOINT, y1: AXIS_FIRST_HALF_START,
    x2: MIDPOINT, y2: AXIS_FIRST_HALF_END,
  },
  { x1: AXIS_SECOND_HALF_START, y1: MIDPOINT,
    x2: AXIS_SECOND_HALF_END, y2: MIDPOINT,
  },
  { x1: MIDPOINT, y1: AXIS_SECOND_HALF_START,
    x2: MIDPOINT, y2: AXIS_SECOND_HALF_END,
  },
  { x1: AXIS_FIRST_HALF_START, y1: MIDPOINT,
    x2: AXIS_FIRST_HALF_END, y2: MIDPOINT,
  }
];

// Top and left tick lines.
/** @const {number} */
const TICK_FIRST_HALF_START = 0;

/** @const {number} */
const TICK_FIRST_HALF_END = Chart.MARGIN;

// Bottom and right tick lines.
/** @const {number} */
const TICK_SECOND_HALF_START = VIEWBOX - Chart.MARGIN;

/** @const {number} */
const TICK_SECOND_HALF_END = VIEWBOX;

/** @const {Array<Object>} */
const Ticks = [
  { 
    x1: MIDPOINT, y1: TICK_FIRST_HALF_START,
    x2: MIDPOINT, y2: TICK_FIRST_HALF_END,
  },
  { x1: TICK_SECOND_HALF_START, y1: MIDPOINT,
    x2: TICK_SECOND_HALF_END, y2: MIDPOINT,
  },
  { x1: MIDPOINT, y1: TICK_SECOND_HALF_START,
    x2: MIDPOINT, y2: TICK_SECOND_HALF_END,
  },
  { x1: TICK_FIRST_HALF_START, y1: MIDPOINT,
    x2: TICK_FIRST_HALF_END, y2: MIDPOINT,
  }
];

/** @class */
class ChartAxes extends HTMLElement {
  constructor() {
    super();
  }

  /** @callback */
  connectedCallback() {
    this.render_();
  }

  /**
   * Renders SVG element for chart axes and ticks.
   * @private
   */
  render_() {
    let axisLines = '';
    let tickLines = '';

    Axes.forEach((axis) => {
      const { x1, y1, x2, y2 } = axis;
      const line = `<line class="axis" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
      axisLines += line;
    });

    Ticks.forEach((tick) => {
      const { x1, y1, x2, y2 } = tick;
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

export { ChartAxes };
