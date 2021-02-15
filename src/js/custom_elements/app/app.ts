import {DataFetcher, MoonData} from '../../modules/DataFetcher';
import {AppDate, DateUtils} from '../../modules/DateUtils';
import {Utils} from '../../modules/Utils';

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
export class App extends HTMLElement {
  private date: AppDate;
  private dateUtils: DateUtils;
  private location: string;
  private popstateListener: any;
  private userLocation: HTMLElement;
  private userLocationObserver: MutationObserver;
  private utils: Utils;

  constructor() {
    super();
    this.dateUtils = new DateUtils();
    this.userLocationObserver = new MutationObserver(() => this.update());
    this.utils = new Utils();
    this.popstateListener = this.update.bind(this);
    this.addEventListener('click', this.handleClick);
    window.addEventListener('popstate', this.popstateListener, false);
  }

  /**
   * Initializes the app when it first loads.
   */
  connectedCallback() {
    this.setup();
    this.userLocation = this.querySelector('user-location');
    this.userLocationObserver.observe(this.userLocation, {attributes: true});
    this.utils.init();
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.handleClick);
    window.removeEventListener('popstate', this.popstateListener, false);
  }

  /**
   * Remove 'no JS' attribute and element from the DOM.
   */
  private setup() {
    document.body.removeAttribute('no-js');
    document.body.querySelector('noscript').remove();
  }

  /**
   * Updates the app when the URL changes.
   */
  private async update(): Promise<any> {
    // Enable progress bar.
    document.body.setAttribute(LOADING_ATTR, '');

    // Get date and location, then fetch data.
    this.date = this.dateUtils.activeDate();
    this.location = this.userLocation.getAttribute(LOCATION_ATTR);
    const moonData = await new DataFetcher().fetch(this.date, this.location);
    if (!moonData) {
      document.body.removeAttribute(LOADING_ATTR);
      return;
    }

    // Update the DOM and send a pageview.
    this.updateCurrentDate();
    this.updateElements(moonData);
    this.updateDocumentTitle({
      date: this.date,
      locale: document.documentElement.lang,
      location: this.location,
      percent: moonData.percent,
      phase: moonData.phase,
    });
    
    this.utils.sendPageview(window.location.pathname, document.title);
    
    // Disable the progress bar.
    document.body.removeAttribute(LOADING_ATTR);
  }
  
  /**
   * Updates an element with the current date in human-friendly format.
   */
  private updateCurrentDate() {
    const currentDateElement = this.querySelector('header h1 a');
    currentDateElement.textContent = this.dateUtils.prettyDate(
      this.date,
      document.documentElement.lang,
      'long',
    );
  }
  
  /**
   * Updates attributes on all custom elements so they can then update
   * themselves.
   */
  private updateElements(moonData: MoonData) {
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
      ['prev-next[direction=next]', 'location', this.location],
      ['prev-next[direction=prev]', 'location', this.location],
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
  private updateDocumentTitle(info: TitleInfo) {
    const {date, locale, location, percent, phase} = info;
    const dateLabel = this.dateUtils.prettyDate(date, locale, 'short');
    let pageTitle = `${dateLabel} ${TITLE_DIVIDER} ${location} ${TITLE_DIVIDER} ${phase}`;
    if (percent > 0) {
      pageTitle += ` ${TITLE_DIVIDER} ${percent}%`;
    }
    document.title = pageTitle;
  }

  /**
   * Adds SPA behavior to clicked links.
   */
  private handleClick(e: Event) {
    const target = e.target as HTMLElement;
    const href = target.getAttribute('href');
    if (href) {
      const linkUrl = new URL(href, window.location.origin);
      if (linkUrl.hostname === window.location.hostname) {
        e.preventDefault();
        history.pushState(null, null, href);
        this.update();
      }
    }
  }
}

customElements.define('moon-app', App);
