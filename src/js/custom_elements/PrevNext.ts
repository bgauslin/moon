import {Attribute} from '../modules/Constants';
import {DateTimeUtils} from '../modules/DateTimeUtils';
import {Utils} from '../modules/Utils';

const SVG_PATH_LEFT: string = 'm21.08768,26.09236l-10.17537,-10.1165l10.12708,-10.06822';
const SVG_PATH_RIGHT: string = 'm10.91231,5.90764l10.17537,10.1165l-10.12708,10.06822';

/**
 * Custom element that renders 'previous' and 'next' navigation links for
 * showing the moon phase for the next or previous day.
 */
class PrevNext extends HTMLElement {
  private dateTime_: DateTimeUtils;  
  private direction_: string;
  private linkEl_: HTMLElement;
  private location_: string;
  private utils_: Utils;

  constructor() {
    super();
    this.dateTime_ = new DateTimeUtils();
    this.utils_ = new Utils();
  }

  static get observedAttributes(): string[] {
    return [Attribute.LOCATION];
  }

  connectedCallback(): void {
    this.direction_ = this.getAttribute(Attribute.DIRECTION);
    this.render_();
    this.update_(this.location_);
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    this.update_(newValue);
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

    this.linkEl_ = this.querySelector('a');
  }

  /**
   * Updates link and title relative to current date and location.
   */
  private update_(location?: string): void {
    if (!location || !this.linkEl_) {
      return;
    }

    const date = ((this.direction_ === 'prev') ? this.dateTime_.prevDate() : this.dateTime_.nextDate());
    const url = String(this.utils_.makeUrl(date, location));
    const title = `${this.dateTime_.prettyDate(date, document.documentElement.lang, 'long')} - ${location}`;

    this.linkEl_.setAttribute('href', url);
    this.linkEl_.setAttribute('title', title);
    this.linkEl_.setAttribute('aria-label', title);
  }
}

export {PrevNext};
