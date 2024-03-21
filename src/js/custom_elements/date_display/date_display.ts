import {DateUtils} from '../../modules/DateUtils';

/**
 * Custom element that highlights elements if the UI is currently displaying
 * info for today.
 */
export class DateDisplay extends HTMLElement {
  private date: DateUtils;
  private link: HTMLElement;

  constructor() {
    super();
    this.date = new DateUtils();
  }

  static get observedAttributes(): string[] {
    return ['update'];
  }

  connectedCallback() {
    this.setup();
  }

  attributeChangedCallback() {
    if (this.hasAttribute('update')) {
      this.update();
    }
  }

  private setup() {
    this.link = document.createElement('a');
    this.link.title = 'Today';
    this.link.setAttribute('href', '/');
    this.appendChild(this.link);
  }

  private update() {
    const active = this.date.activeDate();
    const today = this.date.todaysDate();
    const isToday = `${active.year}${active.month}${active.day}` === `${today.year}${today.month}${today.day}`;
  
    if (isToday) {
      this.link.classList.add('today');
    } else {
      this.link.classList.remove('today');
    }

    this.removeAttribute('update');
  }
}

customElements.define('moon-date', DateDisplay);
