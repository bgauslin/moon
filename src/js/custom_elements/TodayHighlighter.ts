import {DateTimeUtils} from '../modules/DateTimeUtils';

const SELECTOR_ATTR: string = 'selector';
const TODAY_CLASSNAME: string = 'today';
const UPDATE_ATTR: string = 'update';

/**
 * Custom element that highlights elements if the UI is currently displaying
 * info for today.
 */
class TodayHighlighter extends HTMLElement {
  private date_: DateTimeUtils;
  private selectors_: string[];

  constructor() {
    super();
    this.date_ = new DateTimeUtils();
  }

  static get observedAttributes(): string[] {
    return [UPDATE_ATTR];
  }

  connectedCallback(): void {
    this.selectors_ = this.getAttribute(SELECTOR_ATTR).split(',');
    this.removeAttribute(SELECTOR_ATTR);
  }

  attributeChangedCallback(): void {
    if (this.hasAttribute(UPDATE_ATTR)) {
      this.update_();
    }
  }

  private update_(): void {
    const active = this.date_.activeDate();
    const today = this.date_.todaysDate();
    const isToday = `${active.year}${active.month}${active.day}` === `${today.year}${today.month}${today.day}`;

    this.selectors_.forEach((selector) => {
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

export {TodayHighlighter};
