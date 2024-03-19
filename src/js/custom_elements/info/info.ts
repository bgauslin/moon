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
  }

  static get observedAttributes(): string[] {
    return [PERCENT_ATTR, PHASE_ATTR];
  }

  attributeChangedCallback() {
    const percent = this.getAttribute(PERCENT_ATTR);
    const phase = this.getAttribute(PHASE_ATTR);
    if (percent && phase) {
      const visibility = percent === '0' ? 'visibility="invisible"' : '';
      this.innerHTML = `
        <div id="phase">${phase}</div>
        <div id="percent" ${visibility}>
          ${percent}%
        </div>
      `;
    }
  }
}

customElements.define('moon-info', MoonInfo);
