import {Coordinates, MAJOR_TICKS, MINOR_TICK, SWEEP_TICKS, VIEWBOX} from '../../modules/Constants';

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
    const template = require('./moon_charts.pug');
    this.innerHTML += template({
      groups: [
        {id: 'sweep-ticks', lines: SWEEP_TICKS},
        {id: 'major-ticks', lines: MAJOR_TICKS},
        {id: 'minor-ticks', lines: this.minorTicks()},
      ],
      viewbox: VIEWBOX,
    });
  }

  private minorTicks() {
    const count = 24;
    const rotation = 360 / count;
    const {line, center} = MINOR_TICK;
    const ticks = [];

    for (let i = 1; i <= count; i++) {
      const degrees = i * rotation;
      if (degrees % 90 !== 0) {
        const newLine = {
          x1: line.x1,
          y1: line.y1,
          x2: line.x2,
          y2: line.y2,
          transform: `rotate(${degrees}, ${center.x}, ${center.y})`,
        };
        ticks.push(newLine);
      }
    }

    return ticks;
  }
}

customElements.define('moon-charts', MoonCharts);
