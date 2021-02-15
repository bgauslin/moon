const PERCENT_ATTR: string = 'percent';
const PHASE_ATTR: string = 'phase';

/**
 * Custom element that renders text for the moon phase and its percentage
 * relative to a full moon phase cycle.
 */
export class MoonInfo extends HTMLElement {
  private percent: string;
  private phase: string;

  constructor() {
    super();
  }

  static get observedAttributes(): string[] {
    return [PERCENT_ATTR, PHASE_ATTR];
  }

  attributeChangedCallback() {
    this.render();
  }

  /**
   * Displays current moon phase name and percentage, and makes the percent
   * element invisible if percentage is '0'.
   */
  private render() {
    this.percent = this.getAttribute(PERCENT_ATTR);
    this.phase = this.getAttribute(PHASE_ATTR);

    if (!this.percent || !this.phase) {
      return;
    }

    const visibility = (this.percent === '0') ? 'invisible' : '';
    const html = `\
      <div class="${this.className}__phase">\
        ${this.phase}\
      </div>\
      <div class="${this.className}__percent" ${visibility}>\
        ${this.percent}%\
      </div>\
    `;
    this.innerHTML = html.replace(/\s\s/g, '');
  }
}

customElements.define('moon-info', MoonInfo);
