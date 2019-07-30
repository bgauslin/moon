import { DateTimeUtils } from './DateTimeUtils';

/** @enum {string} */ 
const Nav = {
  NEXT: 'nav--next',
  PREVIOUS: 'nav--prev',
};

/** @class */
class Controls extends DateTimeUtils {
  constructor() {
    super();
  }

  /**
   * Inserts 'prev' and 'next' nav controls into the DOM.
   * @public
   */
  init() {
    this.renderControl_({
      arrow: 'left',
      classname: Nav.PREVIOUS,
      label: 'Previous day',
    });

    this.renderControl_({
      arrow: 'right',
      classname: Nav.NEXT,
      label: 'Next day',
    });
  }

  /**
   * Renders a nav control into the DOM.
   * @param {!Object} settings
   * @param {!string} settings.arrow
   * @param {!string} settings.classname
   * @param {!string} settings.label
   * @private
   */
  renderControl_(settings) {
    const { arrow, classname, label } = settings;
    const control = `<a class="nav__link" href="#" title="${label}">${this.svgArrow_(arrow)}</a>`;
    const el = document.querySelector(`.${classname}`);
    el.innerHTML = control;
  }

  /**
   * Renders inline SVG for an arrow icon.
   * @param {!string} direction - 'left' or 'right'
   * @return {string} SVG element.
   * @private
   */
  svgArrow_(direction) {
    const leftArrow = 'm21.08768,26.09236l-10.17537,-10.1165l10.12708,-10.06822';
    const rightArrow = 'm10.91231,5.90764l10.17537,10.1165l-10.12708,10.06822';
    const svgPath = (direction === 'left') ? leftArrow : rightArrow;
    return `
      <svg class="nav__link__svg" viewBox="0 0 32 32">
        <path class="nav__link__svg__path" d="${svgPath}" />
      </svg>
    `;
  }

  /**
   * Updates all controls with date and location as a URL path.
   * @param {!string} location
   * @public
   */
  updateAllControls(location) {
    this.updateControl_(Nav.PREVIOUS, this.prevDate(), location);
    this.updateControl_(Nav.NEXT, this.nextDate(), location);
  }

  /**
   * Updates individual control relative to current date and location.
   * @param {!string} selector
   * @param {!Object} date
   * @param {!number} date.year
   * @param {!number} date.month
   * @param {!number} date.day
   * @param {!string} location
   * @private
   */
  updateControl_(selector, date, location) {
    const { year, month, day } = date;
    const url = new URL(`/${year}/${month}/${day}/${location}`, window.location.origin);
    const domEl = document.querySelector(`.${selector}`);
    const linkEl = domEl.querySelector('a');
    linkEl.setAttribute('href', url);
  }
}

export { Controls };
