/** @const {string} */
const PERCENT_ATTR = 'percent';

/** @const {string} */
const PHASE_ATTR = 'phase';

/** @class */
class MoonInfo extends HTMLElement {
  constructor() {
    super();

    /** @private {string} */
    this.percent_ = this.getAttribute(PERCENT_ATTR);

    /** @private {string} */
    this.phase_ = this.getAttribute(PHASE_ATTR);
  }

  static get observedAttributes() {
    return [PERCENT_ATTR, PHASE_ATTR];
  }

  /** @callback */
  attributeChangedCallback() {
    // this.render_();
  }

  /**
   * TODO...
   * @private
   */
  render_() {
    const visibility = (this.percent_ === 0) ? 'invisible' : '';
    const html = `\
      <div class="info__phase">${this.phaseLabel_}</div>\
      <div class="info__percent" ${visibility}>${this.percent_}%</div>\
    `;
    this.innerHTML = html.replace(/\s\s/g, '');
  }
  
  /**
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
