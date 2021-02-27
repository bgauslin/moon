import {DateUtils} from '../../modules/DateUtils';

// const SELECTOR_ATTR = 'selector';
const TODAY_CLASSNAME = 'today';
const UPDATE_ATTR = 'update';

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
    return [UPDATE_ATTR];
  }

  connectedCallback() {
    this.setup();
  }

  attributeChangedCallback() {
    if (this.hasAttribute(UPDATE_ATTR)) {
      this.update();
    }
  }

  private setup() {
    this.link = document.createElement('a');
    this.link.setAttribute('href', '/');
    this.link.setAttribute('title', 'Today');
    this.appendChild(this.link);
  }

  private update() {
    const active = this.date.activeDate();
    const today = this.date.todaysDate();
    const isToday = `${active.year}${active.month}${active.day}` === `${today.year}${today.month}${today.day}`;
  
    if (isToday) {
      this.link.classList.add(TODAY_CLASSNAME);
    } else {
      this.link.classList.remove(TODAY_CLASSNAME);
    }

    this.removeAttribute(UPDATE_ATTR);
  }
}

customElements.define('moon-date', DateDisplay);
