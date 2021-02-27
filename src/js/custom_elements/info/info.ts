const PERCENT_ATTR = 'percent';
const PHASE_ATTR = 'phase';

/**
 * Custom element that renders text for the moon phase and its percentage
 * relative to a full moon phase cycle.
 */
export class MoonInfo extends HTMLElement {
  private template: any;

  constructor() {
    super();
    this.template = require('./info.pug');
  }

  static get observedAttributes(): string[] {
    return [PERCENT_ATTR, PHASE_ATTR];
  }

  attributeChangedCallback() {
    const percent = this.getAttribute(PERCENT_ATTR);
    const phase = this.getAttribute(PHASE_ATTR);
    if (percent && phase) {
      this.innerHTML = this.template({percent, phase});
    }
  }
}

customElements.define('moon-info', MoonInfo);
