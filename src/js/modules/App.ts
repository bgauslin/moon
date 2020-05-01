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

const DEFAULT_LOCATION: string = 'New York, NY';
const LOADING_ATTR: string = 'loading';
const LOCATION_ATTR: string = 'location';
const LOCAL_STORAGE_ITEM: string = 'location';
const TITLE_DIVIDER: string = '·';
const TODAY_CLASSNAME: string = 'today';

// TODO: Refactor App class as a custom element.
/**
 * Primary class that controls the entire application.
 */
class App {
  private dataFetcher_: DataFetcher;
  private date_: AppDate;
  private dateTime_: DateTimeUtils;
  private location_: string;
  private locationEl_: HTMLElement;
  private locationObserver_: MutationObserver;
  private popstateListener_: any;
  private startYear_: string;
  private updateListener_: any;
  private utils_: Utils;

  constructor(year: string) {
    this.dataFetcher_ = new DataFetcher();
    this.dateTime_ = new DateTimeUtils();
    this.locationObserver_ = new MutationObserver(() => this.update_());
    this.popstateListener_ = this.update_.bind(this);
    this.startYear_ = year;
    this.updateListener_ = this.update_.bind(this);
    this.utils_ = new Utils();
  }

  /**
   * Initializes UI on first run. Observing the 'location' element and setting
   * an attribute on it will trigger the 'update' method to fetch data and
   * populate the UI on initial page load.
   */
  public init(): void {
    this.utils_.init();

    // Set up listeners.
    window.addEventListener('popstate', this.popstateListener_, false);
    document.addEventListener('update', this.updateListener_);

    // Set up location.
    this.locationEl_ = document.querySelector('.location');
    this.locationObserver_.observe(this.locationEl_, {attributes: true});
    this.location_ = this.initialLocation_();
    this.locationEl_.setAttribute(LOCATION_ATTR, this.location_);

    // Update copyright and set up initial view for standalone app.
    this.updateCopyright_();
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

    // 4 URL segments are year, month, day, location
    if (urlSegments.length === 4) {
      return urlSegments[3].replace(/[+]/g, ' ');
    } else {
      return localStorage.getItem(LOCAL_STORAGE_ITEM) || DEFAULT_LOCATION;
    }
  }

  // TODO: Relocate this method to Utils.
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
  private async update_(): Promise<any> {
    // Enable progress bar while we fetch data.
    document.body.setAttribute(LOADING_ATTR, '');

    // Get the date and location.
    this.date_ = this.dateTime_.activeDate();
    this.location_ = this.locationEl_.getAttribute(LOCATION_ATTR);

    // Fetch data (and bail if there's nothing).
    const moonData = await this.dataFetcher_.fetch(this.date_, this.location_);
    if (!moonData) {
      document.body.removeAttribute(LOADING_ATTR);
      return;
    }

    // Update custom element attributes so they can update themselves.
    this.updateElements_(moonData);

    // TODO: Move this to a custom element.
    // Update the date in the header.
    const headerLink = document.querySelector('.header__link');
    headerLink.textContent = this.dateTime_.prettyDate(
      this.date_,
      document.documentElement.lang,
      'long',
    );

    // Update the document title.
    this.updateDocumentTitle_({
      date: this.date_,
      locale: document.documentElement.lang,
      location: this.location_,
      percent: moonData.percent,
      phase: moonData.phase,
    });

    // TODO: Remove/refactor this call via new custom element.
    // Highlight elements if the UI is currently displaying info for today.
    this.highlightToday_(this.date_);

    // Save new location to localStorage.
    localStorage.setItem(LOCAL_STORAGE_ITEM, this.location_);

    // Disable the progress bar and send a new Analytics pageview.
    document.body.removeAttribute(LOADING_ATTR);
    this.utils_.sendPageview(window.location.pathname, document.title);
  }
  
  /**
   * Updates attributes on all custom elements with moon data for the current
   * date and location so they can then update themselves.
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
    ];

    items.forEach((item) => {
      const [selector, attribute, value] = item;
      document.querySelector(selector).setAttribute(attribute, value);
    });
  }

  // TODO: Refactor as custom element wrapped around the relevant elements.
  /**
   * Adds/removes class if current date is today.
   */
  private highlightToday_(date: AppDate): void {
    const selectors: string[] = [
      '.header__title',
      '.info__phase',
      '.info__percent',
    ];
    const now = new Date();
    const dateNow = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };
    const isToday = (date.year === dateNow.year &&
        date.month === dateNow.month && date.day === dateNow.day);

    selectors.forEach((selector) => {
      const el = document.querySelector(selector);
      if (isToday) {
        el.classList.add(TODAY_CLASSNAME);
      } else {
        el.classList.remove(TODAY_CLASSNAME);
      }
    }); 
  }

  /**
   * Updates copyright blurb with the current year.
   */
  private updateCopyright_(): void {
    const copyright = document.querySelector('.copyright__years');
    const currentYear = new Date().getFullYear().toString().substr(-2);
    copyright.textContent = `© ${this.startYear_}–${currentYear}`;
  }

  /** 
   * Updates document title with info about the current moon phase.
   */
  private updateDocumentTitle_(info: TitleInfo): void {
    const {date, locale, location, percent, phase} = info;
    const dateLabel = this.dateTime_.prettyDate(date, locale, 'short');
    let pageTitle = `${dateLabel} ${TITLE_DIVIDER} ${location} ${TITLE_DIVIDER} ${phase}`;
    if (percent > 0) {
      pageTitle += ` ${TITLE_DIVIDER} ${percent}%`;
    }
    document.title = pageTitle;
  }
}

export {App};
