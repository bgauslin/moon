import {DateUtils} from '../../modules/DateUtils';

/**
 * Custom element that renders 'previous' and 'next' navigation links for
 * showing the moon phase for the next or previous day.
 */
class PrevNext extends HTMLElement {
  private dateUtils: DateUtils;  
  private direction: string;
  private link: HTMLElement;

  constructor() {
    super();
    this.dateUtils = new DateUtils();
  }

  static get observedAttributes(): string[] {
    return ['location'];
  }

  connectedCallback() {
    this.direction = this.getAttribute('direction')!;
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    this.update(newValue);
  }

  /**
   * Renders a nav link.
   */
  private render() {
    const path = (this.direction === 'prev') ? 'M15,4 L7,12 L15,20' : 'M9,4 L17,12 L9,20';
    this.innerHTML = `
      <a href="" title="">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="${path}"/>
        </svg>
      </a>
    `;
    this.link = this.querySelector('a')!;
  }

  /**
   * Updates link and title relative to current date and location.
   */
  private update(location: string) {
    const date = (this.direction === 'prev') ? this.dateUtils.prevDate() : this.dateUtils.nextDate();      
    const title = `${this.dateUtils.prettyDate(date, document.documentElement.lang, 'long')} - ${location}`;

    this.link.setAttribute('href', `${this.dateUtils.makeUrl(date, location!)}`);
    this.link.title = title;
    this.link.ariaLabel = title;
  }
}

customElements.define('prev-next', PrevNext);
