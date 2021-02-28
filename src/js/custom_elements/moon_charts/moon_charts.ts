import {MAJOR_TICKS, SWEEP_TICKS, VIEWBOX} from '../../modules/Constants';

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
      ],
      viewbox: VIEWBOX,
    });
  }
}

customElements.define('moon-charts', MoonCharts);
