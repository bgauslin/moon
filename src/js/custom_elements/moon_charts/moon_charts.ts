import {Chart} from '../../modules/Constants';

interface Tick {
  start: number,
  end: number,
}

const HOUR_TICK: Tick = {  
  start: Chart.MARGIN,
  end: Chart.MARGIN - (Chart.SWEEP_WIDTH / 4),
};

const OUTER_TICK: Tick = {
  start: 0,
  end: Chart.MARGIN,
};

const SWEEP_TICK: Tick = {  
  start: Chart.MARGIN,
  end: Chart.MARGIN + Chart.SWEEP_WIDTH,
};

const CENTER: number = Chart.MARGIN + (Chart.SIZE / 2);
const VIEWBOX: number = Chart.SIZE + (Chart.MARGIN * 2);

const DIVISIONS: number = 24;
const ANGLE: number = 360 / DIVISIONS;

export class MoonCharts extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.setup();
  }

  /**
   * Renders an SVG containing grouped lines.
   */
  private setup() {
    const sweepTicks = this.ticks(SWEEP_TICK, true);
    const majorTicks = this.ticks(OUTER_TICK, true);
    const minorTicks = this.ticks(HOUR_TICK);

    const template = require('./moon_charts.pug');
    this.innerHTML += template({
      groups: [
        {id: 'sweep-ticks', lines: sweepTicks},
        {id: 'major-ticks', lines: majorTicks},
        {id: 'minor-ticks', lines: minorTicks},
      ],
      viewbox: VIEWBOX,
    });
  }

  /**
   * Generates an array of coordinates for rendering SVG <line> elements.
   * By default, a line for each hour is rendered unless the lines are 'major',
   * which only renders a line every 90 degrees.
   */
  private ticks(tick: Tick, major: boolean = false) {
    const {start, end} = tick;
    const ticks = [];

    for (let i = 1; i <= DIVISIONS; i++) {
      const degrees = i * ANGLE;
      if (major && degrees % 90 === 0 ||
          !major && degrees % 90 !== 0) {
        const newLine = {
          x1: CENTER,
          y1: start,
          x2: CENTER,
          y2: end,
          transform: `rotate(${degrees}, ${CENTER}, ${CENTER})`,
        };
        ticks.push(newLine);
      }
    }
    return ticks;
  }
}

customElements.define('moon-charts', MoonCharts);
