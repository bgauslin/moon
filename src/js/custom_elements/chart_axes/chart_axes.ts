import {AXES, TICKS, VIEWBOX} from '../../modules/Constants';

/**
 * Custom element that renders an SVG with vertical and horizontal ticks for
 * time axes (i.e., 12AM, 6AM, 12PM, 6PM).
 */
export class ChartAxes extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const template = require('./chart_axes.pug');
    this.innerHTML = template({
      groups: [
        {id: 'axes', lines: AXES},
        {id: 'ticks', lines: TICKS},
      ],
      viewbox: VIEWBOX,
    });
  }
}

customElements.define('chart-axes', ChartAxes);
