/** @const {string} */
const PERCENT_ATTR = 'percent';

/** @const {string} */
const PHASE_ATTR = 'phase';

/** @class */
class MoonInfo extends HTMLElement {
  constructor() {
    super();

    /** @private {string} */
    this.percent_ = '';

    /** @private {string} */
    this.phase_ = '';
  }

  static get observedAttributes() {
    return [PERCENT_ATTR, PHASE_ATTR];
  }

  /** @callback */
  attributeChangedCallback() {
    this.render_();
  }

  /**
   * TODO...
   * @private
   */
  render_() {
    this.percent_ = this.getAttribute(PERCENT_ATTR);
    this.phase_ = this.getAttribute(PHASE_ATTR);

    const visibility = (this.percent_ === '0') ? 'invisible' : '';
    const html = `\
      <div class="${this.className}__phase">${this.phaseLabel_()}</div>\
      <div class="${this.className}__percent" ${visibility}>${this.percent_}%</div>\
    `;
    this.innerHTML = html.replace(/\s\s/g, '');
  }
  
  /**
   * TODO: We may not need this...
   * Returns moon phase with first letter of each word capitalized.
   * @return {string} 
   * @private
   */
  phaseLabel_() {
    const name = this.phase_;
    const nameToArray = name.split(' ');
    let nameFormatted = '';

    for (let i = 0; i < nameToArray.length; i++) {
      const word = nameToArray[i];
      const wordFormatted = word.charAt(0).toUpperCase() + word.slice(1);
      nameFormatted += wordFormatted;
      if (i < nameToArray.length - 1) {
        nameFormatted += ' ';
      }
    }

    return nameFormatted;
  }
}

export { MoonInfo };
