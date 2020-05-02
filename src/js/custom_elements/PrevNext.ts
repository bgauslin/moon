import {DateUtils} from '../modules/DateUtils';

const DIRECTION_ATTR: string = 'direction';
const LOCATION_ATTR: string = 'location';
const SVG_PATH_LEFT: string = 'm21.08768,26.09236l-10.17537,-10.1165l10.12708,-10.06822';
const SVG_PATH_RIGHT: string = 'm10.91231,5.90764l10.17537,10.1165l-10.12708,10.06822';

/**
 * Custom element that renders 'previous' and 'next' navigation links for
 * showing the moon phase for the next or previous day.
 */
class PrevNext extends HTMLElement {
  private dateUtils_: DateUtils;  
  private direction_: string;
  private link_: HTMLElement;

  constructor() {
    super();
    this.dateUtils_ = new DateUtils();
  }

  static get observedAttributes(): string[] {
    return [LOCATION_ATTR];
  }

  connectedCallback(): void {
    this.direction_ = this.getAttribute(DIRECTION_ATTR);
    this.render_();
  }

  attributeChangedCallback(): void {
    this.update_();
  }

  /**
   * Renders a nav link.
   */
  private render_(): void {
    const path = (this.direction_ === 'prev') ? SVG_PATH_LEFT : SVG_PATH_RIGHT;
    const html = `\
      <a class="nav__link" href="" title="">\
        <svg class="nav__icon" viewBox="0 0 32 32">\
          <path class="nav__icon__path" d="${path}" />\
        </svg>\
      </a>\
    `;
    this.innerHTML = html.replace(/\s\s/g, '');

    this.link_ = this.querySelector('a');
  }

  /**
   * Updates link and title relative to current date and location.
   */
  private update_(): void {
    if (this.link_) {
      const date = (this.direction_ === 'prev') ? this.dateUtils_.prevDate() : this.dateUtils_.nextDate();
      const location = this.getAttribute(LOCATION_ATTR);

      const url = String(this.dateUtils_.makeUrl(date, location));
      const title = `${this.dateUtils_.prettyDate(date, document.documentElement.lang, 'long')} - ${location}`;

      const attributes = {
        'href': url,
        'title': title,
        'aria-label': title,
      }

      for (const property in attributes) {
        this.link_.setAttribute(property, attributes[property]);
      }
    }
  }
}

export {PrevNext};
