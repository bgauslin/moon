import { Helpers } from '../modules/Helpers';
import { Attribute } from '../modules/Constants';

/** @class */
class MoonInfo extends HTMLElement {
  constructor() {
    super();

    /** @private {string} */
    this.percent_ = '';

    /** @private {string} */
    this.phase_ = '';

    /** @private @instance */
    this.helpers_ = new Helpers();
  }

  static get observedAttributes() {
    return [Attribute.PERCENT, Attribute.PHASE];
  }

  /** @callback */
  attributeChangedCallback() {
    this.render_();
  }

  /**
   * Displays current moon phase name and percentage, and makes the percent
   * element invisible if percentage is '0'.
   * @private
   */
  render_() {
    this.percent_ = this.getAttribute(Attribute.PERCENT);
    this.phase_ = this.getAttribute(Attribute.PHASE);

    if (this.percent_ === null || this.phase_ === null) {
      return;
    }

    const visibility = (this.percent_ === '0') ? 'invisible' : '';
    const html = `\
      <div class="${this.className}__phase">\
        ${this.helpers_.titleCase(this.phase_)}\
      </div>\
      <div class="${this.className}__percent" ${visibility}>\
        ${this.percent_}%\
      </div>\
    `;
    this.innerHTML = html.replace(/\s\s/g, '');
  }
}

export { MoonInfo };
