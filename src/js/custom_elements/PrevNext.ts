import {DateUtils} from '../modules/DateUtils';

const DIRECTION_ATTR: string = 'direction';
const LOCATION_ATTR: string = 'location';
const SVG_PATH_LEFT: string = 'm21.08768,26.09236l-10.17537,-10.1165l10.12708,-10.06822';
const SVG_PATH_RIGHT: string = 'm10.91231,5.90764l10.17537,10.1165l-10.12708,10.06822';

/**
 * Custom element that renders 'previous' and 'next' navigation links for
 * showing the moon phase for the next or previous day.
 */
export class PrevNext extends HTMLElement {
  private dateUtils: DateUtils;  
  private direction: string;
  private link: HTMLElement;

  constructor() {
    super();
    this.dateUtils = new DateUtils();
  }

  static get observedAttributes(): string[] {
    return [LOCATION_ATTR];
  }

  connectedCallback(): void {
    this.direction = this.getAttribute(DIRECTION_ATTR);
    this.render();
  }

  attributeChangedCallback(): void {
    this.update();
  }

  /**
   * Renders a nav link.
   */
  private render(): void {
    const path = (this.direction === 'prev') ? SVG_PATH_LEFT : SVG_PATH_RIGHT;
    const html = `\
      <a class="nav__link" href="" title="">\
        <svg class="nav__icon" viewBox="0 0 32 32">\
          <path class="nav__icon__path" d="${path}" />\
        </svg>\
      </a>\
    `;
    this.innerHTML = html.replace(/\s\s/g, '');

    this.link = this.querySelector('a');
  }

  /**
   * Updates link and title relative to current date and location.
   */
  private update(): void {
    if (this.link) {
      const date = (this.direction === 'prev') ? this.dateUtils.prevDate() : this.dateUtils.nextDate();
      const location = this.getAttribute(LOCATION_ATTR);

      const url = String(this.dateUtils.makeUrl(date, location));
      const title = `${this.dateUtils.prettyDate(date, document.documentElement.lang, 'long')} - ${location}`;

      const attributes = {
        'href': url,
        'title': title,
        'aria-label': title,
      }

      for (const property in attributes) {
        this.link.setAttribute(property, attributes[property]);
      }
    }
  }
}
