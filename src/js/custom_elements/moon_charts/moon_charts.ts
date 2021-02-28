import {CENTER, MAJOR_TICK, MINOR_TICK, SVGLine, SWEEP_TICK, VIEWBOX} from '../../modules/Constants';

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
    const majorTicks = this.ticks(MAJOR_TICK, true);
    const minorTicks = this.ticks(MINOR_TICK);

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
  private ticks(tick: SVGLine, major: boolean = false) {
    const {x1, y1, x2, y2} = tick;
    const ticks = [];

    for (let i = 1; i <= DIVISIONS; i++) {
      const degrees = i * ANGLE;
      if (major && degrees % 90 === 0 ||
          !major && degrees % 90 !== 0) {
        const newLine = {
          x1,
          y1,
          x2,
          y2,
          transform: `rotate(${degrees}, ${CENTER}, ${CENTER})`,
        };
        ticks.push(newLine);
      }
    }
    return ticks;
  }
}

customElements.define('moon-charts', MoonCharts);
