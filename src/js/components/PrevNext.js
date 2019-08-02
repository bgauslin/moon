import { DateTimeUtils } from '../modules/DateTimeUtils';

/** @const {string} */
const DIRECTION_ATTR = 'direction';

/** @const {string} */
const LOCATION_ATTR = 'location';

/** @enum {string} */
const SvgPath = {
  LEFT: 'm21.08768,26.09236l-10.17537,-10.1165l10.12708,-10.06822',
  RIGHT: 'm10.91231,5.90764l10.17537,10.1165l-10.12708,10.06822',
};

/** @class */
class PrevNext extends HTMLElement {
  constructor() {
    super();

    /** @private {string} */
    this.direction_ = this.getAttribute(DIRECTION_ATTR);

    /** @private {string} */
    this.location_ = this.getAttribute(LOCATION_ATTR);

    /** @const {Element} */
    this.linkEl_ = null;

    /** @instance */
    this.dateTime_ = new DateTimeUtils();
  }

  static get observedAttributes() {
    return [LOCATION_ATTR];
  }

  /** @callback */
  connectedCallback() {
    this.render_();
    this.update_(this.location_);
  }

  /** @callback */
  attributeChangedCallback(name, oldValue, newValue) {
    this.update_(newValue);
  }

  /**
   * Renders a nav link.
   * @private
   */
  render_() {
    const path = (this.direction_ === 'prev') ? SvgPath.LEFT : SvgPath.RIGHT;

    const html = `\
      <a class="nav__link" href="" title="">\
        <svg class="nav__icon" viewBox="0 0 32 32">\
          <path class="nav__icon__path" d="${path}" />\
        </svg>
      </a>
    `;
    this.innerHTML = html.replace(/\s\s/g, '');

    this.linkEl_ = this.querySelector('a');
  }

  /**
   * Updates link and title relative to current date and location.
   * @param {string} location
   * @private
   */
  update_(location) {
    if (!this.linkEl_) {
      return;
    }

    const { year, month, day } = this.dateTime_.currentDate();
    
    // TODO: Set prevDate or nextDate based on currentDate and element's direction

    const url = new URL(`/${year}/${month}/${day}/${location}`, window.location.origin);
    this.linkEl_.setAttribute('href', url);
    // this.linkEl_.setAttribute('title', '');
  }
}

export { PrevNext };
