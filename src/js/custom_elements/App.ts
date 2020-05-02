import {DataFetcher, MoonData} from '../modules/DataFetcher';
import {AppDate, DateTimeUtils} from '../modules/DateTimeUtils';
import {Utils} from '../modules/Utils';

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

/**
 * Custom element that controls the application.
 */
class App extends HTMLElement {
  private date_: AppDate;
  private dateTimeUtils_: DateTimeUtils;
  private location_: string;
  private popstateListener_: any;
  private userLocation_: HTMLElement;
  private userLocationObserver_: MutationObserver;
  private utils_: Utils;

  constructor() {
    super();
    this.dateTimeUtils_ = new DateTimeUtils();
    this.userLocationObserver_ = new MutationObserver(() => this.update_());
    this.utils_ = new Utils();
    this.popstateListener_ = this.update_.bind(this);
    this.addEventListener('click', this.handleClick_);
    window.addEventListener('popstate', this.popstateListener_, false);
  }

  /**
   * Initializes the app when it first loads.
   */
  connectedCallback(): void {
    this.setupDom_();
    this.userLocation_ = this.querySelector('user-location');
    this.userLocationObserver_.observe(this.userLocation_, {attributes: true});
    this.utils_.init();
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.handleClick_);
    window.removeEventListener('popstate', this.popstateListener_, false);
  }

  /**
   * Remove 'no JS' attribute and element from the DOM.
   */
  private setupDom_(): void {
    document.body.removeAttribute('no-js');
    document.body.querySelector('noscript').remove();
  }

  /**
   * Updates the app when the URL changes.
   */
  private async update_(): Promise<any> {
    // Enable progress bar.
    document.body.setAttribute(LOADING_ATTR, '');

    // Get date and location, then fetch data.
    this.date_ = this.dateTimeUtils_.activeDate();
    this.location_ = this.userLocation_.getAttribute(LOCATION_ATTR);
    const moonData = await new DataFetcher().fetch(this.date_, this.location_);
    if (!moonData) {
      document.body.removeAttribute(LOADING_ATTR);
      return;
    }

    // Update the DOM and send a pageview.
    this.updateCurrentDate_();
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
  private updateCurrentDate_(): void {
    const currentDateElement = this.querySelector('.header__link');
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
      ['moon-info', 'percent', String(percent)],
      ['moon-info', 'phase', String(phase)],
      ['moon-photo', 'hemisphere', hemisphere],
      ['moon-photo', 'illumination', String(illumination)],
      ['moon-photo', 'percent', String(percent)],
      ['moon-photo', 'phase', phase],
      ['donut-chart[name=moon]', 'start', moonrise],
      ['donut-chart[name=moon]', 'end', moonset],
      ['donut-chart[name=sun]', 'start', sunrise],
      ['donut-chart[name=sun]', 'end', sunset],
      ['prev-next[direction=next]', 'location', this.location_],
      ['prev-next[direction=prev]', 'location', this.location_],
      ['app-today', 'update', ''],
    ];

    items.forEach((item) => {
      const [selector, attribute, value] = item;
      this.querySelector(selector).setAttribute(attribute, value);
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
