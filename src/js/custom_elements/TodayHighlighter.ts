import {DateUtils} from '../modules/DateUtils';

const SELECTOR_ATTR: string = 'selector';
const TODAY_CLASSNAME: string = 'today';
const UPDATE_ATTR: string = 'update';

/**
 * Custom element that highlights elements if the UI is currently displaying
 * info for today.
 */
export class TodayHighlighter extends HTMLElement {
  private date: DateUtils;
  private selectors: string[];

  constructor() {
    super();
    this.date = new DateUtils();
  }

  static get observedAttributes(): string[] {
    return [UPDATE_ATTR];
  }

  connectedCallback() {
    this.selectors = this.getAttribute(SELECTOR_ATTR).split(',');
    this.removeAttribute(SELECTOR_ATTR);
  }

  attributeChangedCallback() {
    if (this.hasAttribute(UPDATE_ATTR)) {
      this.update();
    }
  }

  private update() {
    const active = this.date.activeDate();
    const today = this.date.todaysDate();
    const isToday = `${active.year}${active.month}${active.day}` === `${today.year}${today.month}${today.day}`;

    this.selectors.forEach((selector) => {
      const element = document.querySelector(selector);
      if (isToday) {
        element.classList.add(TODAY_CLASSNAME);
      } else {
        element.classList.remove(TODAY_CLASSNAME);
      }
    });

    this.removeAttribute(UPDATE_ATTR);
  }
}
