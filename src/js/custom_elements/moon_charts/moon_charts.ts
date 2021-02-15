import {AXES, TICKS, VIEWBOX} from '../../modules/Constants';

export class MoonCharts extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const template = require('./moon_charts.pug');
    this.innerHTML += template({
      groups: [
        {id: 'axes', lines: AXES},
        {id: 'ticks', lines: TICKS},
      ],
      viewbox: VIEWBOX,
    });
  }
}

customElements.define('moon-charts', MoonCharts);
