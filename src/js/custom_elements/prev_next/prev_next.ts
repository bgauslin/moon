import {DateUtils} from '../../modules/DateUtils';

const DIRECTION_ATTR = 'direction';
const LOCATION_ATTR = 'location';

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

  connectedCallback() {
    this.direction = this.getAttribute(DIRECTION_ATTR);
    this.render();
  }

  attributeChangedCallback() {
    this.update();
  }

  /**
   * Renders a nav link.
   */
  private render() {
    const template = require('./prev_next.pug');
    this.innerHTML = template({direction: this.direction});
    this.link = this.querySelector('a');
  }

  /**
   * Updates link and title relative to current date and location.
   */
  private update() {
    if (this.link) {
      const date = this.direction === 'prev' ? this.dateUtils.prevDate() : this.dateUtils.nextDate();
      const location = this.getAttribute(LOCATION_ATTR);
      const title = `${this.dateUtils.prettyDate(date, document.documentElement.lang, 'long')} - ${location}`;

      const attributes = {
        'href': String(this.dateUtils.makeUrl(date, location)),
        'title': title,
        'aria-label': title,
      }

      for (const property in attributes) {
        this.link.setAttribute(property, attributes[property]);
      }
    }
  }
}

customElements.define('prev-next', PrevNext);
