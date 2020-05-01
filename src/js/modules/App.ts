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

    // Update the DOM.
    this.updateCopyright_();
    this.update_();
  }

  /**
   * Updates UI when URL changes.
   */
  private async update_(): Promise<any> {
    // Enable progress bar.
    document.body.setAttribute(LOADING_ATTR, '');

    // Get date and location, then fetch data.
    this.date_ = this.dateTime_.activeDate();
    this.location_ = this.locationEl_.getAttribute(LOCATION_ATTR);
    const moonData = await this.dataFetcher_.fetch(this.date_, this.location_);
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
   * Updates the date in the header.
   */
  private updateHeader_(): void {
    const headerLink = document.querySelector('.header__link');
    headerLink.textContent = this.dateTime_.prettyDate(
      this.date_,
      document.documentElement.lang,
      'long',
    );
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
      ['app-today', 'update', ''],
    ];

    items.forEach((item) => {
      const [selector, attribute, value] = item;
      document.querySelector(selector).setAttribute(attribute, value);
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
