import {DataFetcher, MoonData} from './DataFetcher';
import {AppDate, DateTimeUtils} from './DateTimeUtils';
import {Utils} from './Utils';

interface TitleInfo {
  date: AppDate,
  locale: string,
  location: string,
  percent: number,
  phase: string,
}

const LOADING_ATTR: string = 'loading';
const LOCATION_ATTR: string = 'location';
const TITLE_DIVIDER: string = '·';

// TODO: Refactor App class as a custom element.
/**
 * Primary class that controls the entire application.
 */
class App {
  private utils_: Utils;
  private clickListener_: any;
  private date_: AppDate;
  private dateTimeUtils_: DateTimeUtils;
  private location_: string;
  private locationEl_: HTMLElement;
  private locationObserver_: MutationObserver;
  private popstateListener_: any;

  constructor() {
    this.dateTimeUtils_ = new DateTimeUtils();
    this.clickListener_ = this.handleClick_.bind(this);
    this.popstateListener_ = this.update_.bind(this);
    this.locationObserver_ = new MutationObserver(() => this.update_());
    this.utils_ = new Utils();
  }

  /**
   * Initializes the app when it first loads.
   */
  public init(): void {
    this.utils_.init();
    document.addEventListener('click', this.clickListener_);
    window.addEventListener('popstate', this.popstateListener_, false);

    this.locationEl_ = document.querySelector('.location');
    this.locationObserver_.observe(this.locationEl_, {attributes: true});
    this.update_();
  }

  /**
   * Updates the app when the URL changes.
   */
  private async update_(): Promise<any> {
    // Enable progress bar.
    document.body.setAttribute(LOADING_ATTR, '');

    // Get date and location, then fetch data.
    this.date_ = this.dateTimeUtils_.activeDate();
    this.location_ = this.locationEl_.getAttribute(LOCATION_ATTR);
    const moonData = await new DataFetcher().fetch(this.date_, this.location_);
    if (!moonData) {
      document.body.removeAttribute(LOADING_ATTR);
      return;
    }

    // Update the DOM and send a pageview.
    this.updateHeader_();
    this.updateElements_(moonData);
    this.updateDocumentTitle_({
      date: this.date_,
      locale: document.documentElement.lang,
      location: this.location_,
      percent: moonData.percent,
      phase: moonData.phase,
    });
    
    this.utils_.sendPageview(window.location.pathname, document.title);
    
    // Disable the progress bar.
    document.body.removeAttribute(LOADING_ATTR);
  }
  
  /**
   * Updates an element with the current date in human-friendly format.
   */
  private updateHeader_(): void {
    const currentDateElement = document.querySelector('.header__link');
    currentDateElement.textContent = this.dateTimeUtils_.prettyDate(
      this.date_,
      document.documentElement.lang,
      'long',
    );
  }
  
  /**
   * Updates attributes on all custom elements so they can then update
   * themselves.
   */
  private updateElements_(moonData: MoonData): void {
    const {hemisphere, illumination, moonrise, moonset, percent, phase, sunrise, sunset} = moonData;

    const items = [
      ['.info', 'percent', String(percent)],
      ['.info', 'phase', String(phase)],
      ['.photo', 'hemisphere', hemisphere],
      ['.photo', 'illumination', String(illumination)],
      ['.photo', 'percent', String(percent)],
      ['.photo', 'phase', phase],
      ['[name=moon]', 'start', moonrise],
      ['[name=moon]', 'end', moonset],
      ['[name=sun]', 'start', sunrise],
      ['[name=sun]', 'end', sunset],
      ['[direction=next]', 'location', this.location_],
      ['[direction=prev]', 'location', this.location_],
      ['app-today', 'update', ''],
    ];

    items.forEach((item) => {
      const [selector, attribute, value] = item;
      document.querySelector(selector).setAttribute(attribute, value);
    });
  }

  /** 
   * Updates document title with info about the current moon phase.
   */
  private updateDocumentTitle_(info: TitleInfo): void {
    const {date, locale, location, percent, phase} = info;
    const dateLabel = this.dateTimeUtils_.prettyDate(date, locale, 'short');
    let pageTitle = `${dateLabel} ${TITLE_DIVIDER} ${location} ${TITLE_DIVIDER} ${phase}`;
    if (percent > 0) {
      pageTitle += ` ${TITLE_DIVIDER} ${percent}%`;
    }
    document.title = pageTitle;
  }

  /**
   * Adds SPA behavior to clicked links.
   */
  private handleClick_(e: Event): void {
    const target = e.target as HTMLElement;
    const href = target.getAttribute('href');
    if (href) {
      const linkUrl = new URL(href, window.location.origin);
      if (linkUrl.hostname === window.location.hostname) {
        e.preventDefault();
        history.pushState(null, null, href);
        this.update_();
      }
    }
  }
}

export {App};
