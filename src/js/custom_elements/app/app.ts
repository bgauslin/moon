import {DataFetcher, MoonData} from '../../modules/DataFetcher';
import {AppDate, DateUtils} from '../../modules/DateUtils';

interface TitleInfo {
  date: AppDate,
  locale: string,
  location: string,
}

const BASE_TITLE = 'Moon';
const LOADING_ATTR = 'loading';
const LOCATION_ATTR = 'location';
const TITLE_DIVIDER = '·';

/**
 * Custom element that controls the application.
 */
export class App extends HTMLElement {
  private clickListener: EventListenerObject;
  private date: AppDate;
  private dateUtils: DateUtils;
  private location: string;
  private popstateListener: EventListenerObject;
  private target: HTMLElement;
  private touchstartListener: EventListenerObject;
  private touchendListener: EventListenerObject;
  private userLocation: HTMLElement;
  private userLocationObserver: MutationObserver;

  constructor() {
    super();
    this.dateUtils = new DateUtils();
    this.userLocationObserver = new MutationObserver(() => this.update());
    this.clickListener = this.handleClick.bind(this);
    this.popstateListener = this.update.bind(this);
    this.touchstartListener = this.handleTouchstart.bind(this);
    this.touchendListener = this.handleTouchend.bind(this);
  }

  connectedCallback() {
    this.userLocation = <HTMLElement>document.querySelector('user-location');
    this.userLocationObserver.observe(this.userLocation, {attributes: true});
    document.addEventListener('click', this.clickListener);
    document.addEventListener('touchstart', this.touchstartListener);
    document.addEventListener('touchend', this.touchendListener);
    window.addEventListener('popstate', this.popstateListener);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.clickListener);
    window.removeEventListener('popstate', this.popstateListener);
    document.removeEventListener('click', this.clickListener);
    document.removeEventListener('touchstart', this.touchstartListener);
    document.removeEventListener('touchend', this.touchendListener);
    window.removeEventListener('popstate', this.popstateListener);
  }

  /**
   * Updates the app when the URL changes.
   */
  private async update(): Promise<any> {
    // Enable progress bar.
    document.body.setAttribute(LOADING_ATTR, '');

    // Get date and location, then fetch data.
    this.date = this.dateUtils.activeDate();
    
    const location = this.userLocation.getAttribute(LOCATION_ATTR);
    if (location) {
      this.location = location;
    }
    
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
    });
    
    // Disable the progress bar.
    document.body.removeAttribute(LOADING_ATTR);
  }
  
  /**
   * Updates an element with the current date in human-friendly format.
   */
  private updateCurrentDate() {
    const currentDateElement = document.querySelector('moon-date > a');
    if (currentDateElement) {
      currentDateElement.textContent = this.dateUtils.prettyDate(
        this.date,
        document.documentElement.lang,
        'long',
      );
    }
  }
  
  /**
   * Updates attributes on all custom elements so they can then update
   * themselves.
   */
  private updateElements(moonData: MoonData) {
    const {hemisphere, illumination, moonrise, moonset, percent, phase, sunrise, sunset} = moonData;

    const items = [
      ['moon-date', 'update', ''],
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
    ];

    items.forEach((item) => {
      const [selector, attribute, value] = item;
      const element = document.querySelector(selector);
      if (element) {
        element.setAttribute(attribute, value);
      }
    });
  }

  /** 
   * Updates document title with date and location.
   */
  private updateDocumentTitle(info: TitleInfo) {
    const {date, locale, location} = info;
    const dateLabel = this.dateUtils.prettyDate(date, locale, 'short');
    const pageTitle = `${BASE_TITLE} ${TITLE_DIVIDER} ${dateLabel} ${TITLE_DIVIDER} ${location}`;
    const urlSegments = window.location.pathname.split('/');
    urlSegments.shift();
    document.title = (urlSegments.length === 4) ? pageTitle : BASE_TITLE;
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
        history.replaceState(null, '', href);
        this.update();
      }
    }
  }

  /**
   * Adds class to elements on touchstart.
   */
  private handleTouchstart(event: TouchEvent) {
    const composed = event.composedPath();
    this.target = <HTMLElement>composed[0];

    if (this.target.tagName === 'A') {
      this.target.classList.add('touch');
    }
  }
  
  /**
   * Removes class fromm touched elements on touchend.
   */
  private handleTouchend() {
    this.target.classList.remove('touch');
  }
}

customElements.define('moon-app', App);
