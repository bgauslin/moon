import { DateTimeUtils } from '../modules/DateTimeUtils';

/** @const {string} */
// const NEXT = 'nav--next';

/** @const {string} */
// const PREVIOUS = 'nav--prev';

/** @const {string} */
const DATE_ATTR = 'date';

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
    // this.date_ = this.getAttribute(DATE_ATTR);

    /** @private {string} */
    // this.direction_ = this.getAttribute(DIRECTION_ATTR);

    /** @private {string} */
    // this.location_ = this.getAttribute(LOCATION_ATTR);

    /** @const {Element} */
    this.linkEl_ = null;

    /** @instance */
    this.dateTime_ = new DateTimeUtils();
  }

  static get observedAttributes() {
    return [DATE_ATTR, LOCATION_ATTR];
  }

  /** @callback */
  connectedCallback() {
    // this.render_();
  }

  /** @callback */
  attributeChangedCallback() {
    // this.update_();
  }

  /**
   * Renders a nav link.
   * @private
   */
  render_() {
    const path = (this.direction_ === 'left') ? SvgPath.LEFT : SvgPath.RIGHT;

    this.innerHTML = `
      <a class="nav__link" href="#" title="${label}">
        <svg class="nav__link__svg" viewBox="0 0 32 32">
          <path class="nav__link__svg__path" d="${path}" />
        </svg>
      </a>
    `;
    this.linkEl_ = this.querySelector('a');
  }

  /**
   * Updates link and title relative to current date and location.
   * @private
   */
  update_() {
    // TODO: convert 'date' and 'location' attributes, then set them on the link.
    const { year, month, day } = this.dateTime_.currentDate(this.date_);

    const url = new URL(`/${year}/${month}/${day}/${location}`, window.location.origin);
    this.linkEl_.setAttribute('href', url);
    this.linkEl_.setAttribute('title', '');
  }
}

export { PrevNext };
