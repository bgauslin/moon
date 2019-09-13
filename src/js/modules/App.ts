import { Attribute } from './Constants';
import { DataFetcher } from './DataFetcher';
import { AppDate, DateTimeUtils } from './DateTimeUtils';
import { EventHandler } from './EventHandler';

interface TitleInfo {
  date: AppDate,
  locale: string,
  location: string,
  percent: number,
  phase: string,
}

const DEFAULT_LOCATION: string = 'New York, NY';

const TITLE_DIVIDER: string = '·';

const HIGHLIGHTED: string[] = [
  '.header__title',
  '.info__phase',
  '.info__percent',
];

class App {
  private dataFetcher_: any;
  private date_: AppDate;
  private dateTime_: any;
  private eventHandler_: any;
  private footerEl_: HTMLElement;
  private headerLinkEl_: HTMLElement;
  private location_: string;
  private locationEl_: HTMLElement;
  private moonChartEl_: Element
  private moonInfoEl_: HTMLElement;
  private moonPhotoEl_: HTMLElement;
  private navEls_: NodeList;
  private sunChartEl_: Element
  private locationObserver_: MutationObserver;

  constructor() {
    this.footerEl_ = document.querySelector('.footer');
    this.headerLinkEl_ = document.querySelector('.header__link');
    this.locationEl_ = document.querySelector('.location');
    this.moonChartEl_ = document.querySelector('[name=moon]');
    this.moonInfoEl_ = document.querySelector('.info');
    this.moonPhotoEl_ = document.querySelector('.photo');
    this.navEls_ = document.querySelectorAll('[direction]');
    this.sunChartEl_ = document.querySelector('[name=sun]');

    this.dataFetcher_ = new DataFetcher();
    this.dateTime_ = new DateTimeUtils();
    this.eventHandler_ = new EventHandler();

    this.locationObserver_ = new MutationObserver(() => this.update());
  }

  /**
   * Initializes UI on first run. Observing the 'location' element and setting
   * an attribute on it will trigger the 'update' method to fetch data and
   * populate the UI on initial page load.
   */
  public init(): void {
    this.eventHandler_.hijackLinks();
    this.locationObserver_.observe(this.locationEl_, { attributes: true });

    this.location_ = this.initialLocation_();
    this.locationEl_.setAttribute(Attribute.LOCATION, this.location_);

    this.renderFooterText_();
    this.standaloneStartup_();
  }

    /**
     * On first run, location may or may not be set. If not, check if there's a
     * location in the address bar and use that. Then check localStorage, and
     * if that doesn't exist, use fallback location. On all subsequent updates,
     * location is set via custom element attribute since location can also be
     * user-defined.
     */
  private initialLocation_(): string {
    const urlSegments = window.location.pathname.split('/');
    urlSegments.shift();

    if (urlSegments.length === 4) {
      return urlSegments[3].replace(/[+]/g, ' ');
    } else {
      return localStorage.getItem(Attribute.LOCATION) || DEFAULT_LOCATION;
    }
  }

  /**
   * Redirects view to '/' if app is launched as a standalone app. Otherwise,
   * a user may have saved the app with a full URL, which means they will start
   * at that URL every time they launch the app instead of on the current day.
   */
  private standaloneStartup_(): void {
    if ((<any>window).navigator.standalone == true || window.matchMedia('(display-mode: standalone)').matches) {
      history.replaceState(null, null, '/');
    }
  }

  /**
   * Updates UI when URL changes: fetches API data, sets attributes on custom
   * elements with fetched data results, then updates the header and title.
   */
  public async update(): Promise<any> {
    // Enable progress bar while we fetch data.
    document.body.setAttribute(Attribute.LOADING, '');

    // Get the date from the address bar.
    this.date_ = this.dateTime_.activeDate();

    // Get location from custom element attribute.
    this.location_ = this.locationEl_.getAttribute(Attribute.LOCATION);

    // Fetch data (and bail if there's nothing).
    const data = await this.dataFetcher_.fetch(this.date_, this.location_);
    if (!data) {
      document.body.removeAttribute(Attribute.LOADING);
      return;
    }

    // Map local constants to API data.
    let { hemisphere, illumination, moonrise, moonset, percent, phase, sunrise, sunset } = data;

    // Log values to the console for debugging.
    if (document.body.hasAttribute('debug')) {
      console.clear();
      console.log('hemisphere', hemisphere);  
      console.log('illumination', illumination);  
      console.log('moonrise', moonrise);
      console.log('moonset', moonset);
      console.log('percent', percent);
      console.log('phase', phase);
      console.log('sunrise', sunrise);
      console.log('sunset', sunset);
    }

    // Update custom element attributes so each component can update itself.
    this.moonInfoEl_.setAttribute('percent', percent);
    this.moonInfoEl_.setAttribute('phase', phase);
    
    this.moonPhotoEl_.setAttribute('hemisphere', hemisphere);
    this.moonPhotoEl_.setAttribute('illumination', illumination);
    this.moonPhotoEl_.setAttribute('percent', percent);
    this.moonPhotoEl_.setAttribute('phase', phase);

    this.moonChartEl_.setAttribute('start', moonrise);
    this.moonChartEl_.setAttribute('end', moonset);

    this.sunChartEl_.setAttribute('start', sunrise);
    this.sunChartEl_.setAttribute('end', sunset);

    this.navEls_.forEach((el) => {
      (<Element>el).setAttribute('location', this.location_);
    });

    // Update the date in the header.
    this.headerLinkEl_.textContent = this.dateTime_.prettyDate(
      this.date_,
      document.documentElement.lang,
      'long',
    );

    // Update the document title.
    this.updateDocumentTitle_({
      date: this.date_,
      locale: document.documentElement.lang,
      location: this.location_,
      percent,
      phase,
    });

    // Highlight elements if the UI is currently displaying info for today.
    this.highlightToday_(this.date_);

    // Save new location to localStorage.
    localStorage.setItem(Attribute.LOCATION, this.location_);

    // Disable the progress bar and send a new Analytics pageview.
    document.body.removeAttribute(Attribute.LOADING);
    this.eventHandler_.sendPageview(window.location.pathname, document.title);
  }
  
  /**
   * Adds/removes class if current date is today.
   */
  private highlightToday_(date: AppDate): void {
    const now = new Date();
    const dateNow = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };
    const isToday = (date.year === dateNow.year && date.month === dateNow.month && date.day === dateNow.day);

    HIGHLIGHTED.forEach((selector) => {
      const el = document.querySelector(selector);
      if (isToday) {
        el.classList.add('today');
      } else {
        el.classList.remove('today');
      }
    }); 
  }

  /**
   * Renders text into the footer via JS to avoid a FOUC.
   */
  private renderFooterText_(): void {
    const yearsEl = this.footerEl_.querySelector('.copyright__years');
    const ownerEl = this.footerEl_.querySelector('.copyright__owner');
    const yearStart = '2018';
    const yearEnd = new Date().getFullYear().toString().substr(-2);
    yearsEl.textContent = `© ${yearStart}–${yearEnd}`;
    ownerEl.textContent = 'Ben Gauslin';
  }

  /** 
   * Updates document title with info about the current moon phase.
   */
  private updateDocumentTitle_(info: TitleInfo): void {
    const { date, locale, location, percent, phase } = info;
    const dateLabel = this.dateTime_.prettyDate(date, locale, 'short');
    let pageTitle = `${dateLabel} ${TITLE_DIVIDER} ${location} ${TITLE_DIVIDER} ${phase}`;
    if (percent > 0) {
      pageTitle += ` ${TITLE_DIVIDER} ${percent}%`;
    }
    document.title = pageTitle;
  }
}

export { App };
