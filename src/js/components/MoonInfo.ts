import { Attribute } from '../modules/Constants';

class MoonInfo extends HTMLElement {
  private percent_: string;
  private phase_: string;

  constructor() {
    super();
  }

  static get observedAttributes(): string[] {
    return [Attribute.PERCENT, Attribute.PHASE];
  }

  attributeChangedCallback(): void {
    this.render_();
  }

  /**
   * Displays current moon phase name and percentage, and makes the percent
   * element invisible if percentage is '0'.
   */
  private render_(): void {
    this.percent_ = this.getAttribute(Attribute.PERCENT);
    this.phase_ = this.getAttribute(Attribute.PHASE);

    if (!this.percent_ || !this.phase_) {
      return;
    }

    const visibility = (this.percent_ === '0') ? 'invisible' : '';
    const html = `\
      <div class="${this.className}__phase">\
        ${this.phase_}\
      </div>\
      <div class="${this.className}__percent" ${visibility}>\
        ${this.percent_}%\
      </div>\
    `;
    this.innerHTML = html.replace(/\s\s/g, '');
  }
}

export { MoonInfo };
