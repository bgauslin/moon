import {DataFetcher, MoonData} from '../../modules/DataFetcher';
import {AppDate, DateUtils} from '../../modules/DateUtils';

interface TitleInfo {
  date: AppDate,
  locale: string,
  location: string,
}

const BASE_TITLE = 'Moon';

/**
 * Custom element that controls the application.
 */
export class App extends HTMLElement {
  private date: AppDate;
  private dateElement: HTMLElement;
  private dateUtils: DateUtils;
  private location: string;
  private moon: HTMLElement;
  private next: HTMLElement;
  private percentElement: HTMLElement;
  private phaseElement: HTMLElement;
  private photo: HTMLElement;
  private popstateListener: EventListenerObject;
  private prev: HTMLElement;
  private progress: HTMLElement;
  private sun: HTMLElement;
  private target: HTMLElement;
  private touchstartListener: EventListenerObject;
  private touchendListener: EventListenerObject;
  private userLocation: HTMLElement;
  private userLocationObserver: MutationObserver;

  constructor() {
    super();
    this.dateUtils = new DateUtils();
    this.popstateListener = this.update.bind(this);
    this.touchstartListener = this.handleTouchstart.bind(this);
    this.touchendListener = this.handleTouchend.bind(this);
    this.userLocationObserver = new MutationObserver(() => this.update());
  }

  connectedCallback() {
    this.addEventListener('click', this.handleClick);
    this.addEventListener('touchstart', this.touchstartListener, {passive: true});
    this.addEventListener('touchend', this.touchendListener, {passive: true});
    window.addEventListener('popstate', this.popstateListener);

    this.setup();
    this.userLocationObserver.observe(this.userLocation, {attributes: true});
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('touchstart', this.touchstartListener);
    this.removeEventListener('touchend', this.touchendListener);
    window.removeEventListener('popstate', this.popstateListener);
  }

  /**
   * Renders elements into the DOM and sets references to them for updating.
   */
  private setup() {
    this.innerHTML = `
      <div id="phase"></div>
      <div id="percent"></div>
      <moon-photo></moon-photo>
      <donut-chart name="sun"></donut-chart>
      <donut-chart name="moon"></donut-chart>
      <ticks-chart></ticks-chart>
      <a href="/" title="Today" id="date"></a>
      <user-location default="New Orleans, LA"></user-location>
      <prev-next direction="prev"></prev-next>
      <prev-next direction="next"></prev-next>
      <div class="progress-bar"></div>
    `;

    this.dateElement = <HTMLElement>this.querySelector('#date');
    this.moon = <HTMLElement>this.querySelector('donut-chart[name="moon"]');
    this.next = <HTMLElement>this.querySelector('[direction="next"]');
    this.percentElement = <HTMLElement>this.querySelector('#percent');
    this.phaseElement = <HTMLElement>this.querySelector('#phase');
    this.photo = <HTMLElement>this.querySelector('moon-photo');
    this.prev = <HTMLElement>this.querySelector('[direction="prev"]');
    this.progress = <HTMLElement>this.querySelector('.progress-bar');
    this.sun = <HTMLElement>this.querySelector('donut-chart[name="sun"]');
    this.userLocation = <HTMLElement>this.querySelector('user-location');
  }

  /**
   * Updates the app when the URL changes.
   */
  private async update(): Promise<any> {
    // Enable progress bar.
    this.progress.dataset.loading = '';

    // Get date and location, then fetch data.
    this.date = this.dateUtils.activeDate();
    
    const location = this.userLocation.getAttribute('location');
    if (location) {
      this.location = location;
    }
    
    const moonData = await new DataFetcher().fetch(this.date, this.location);
    if (!moonData) {
      delete this.progress.dataset.loading;
      return;
    }

    // Update the DOM.
    this.updateCurrentDate();
    this.updateElements(moonData);
    this.updateDocumentTitle({
      date: this.date,
      locale: document.documentElement.lang,
      location: this.location,
    });
    
    // Disable the progress bar.
    delete this.progress.dataset.loading;
  }
  
  /**
   * Updates an element with the current date in human-friendly format.
   */
  private updateCurrentDate() {
    const active = this.dateUtils.activeDate();
    const today = this.dateUtils.todaysDate();
    const isToday = `${active.year}${active.month}${active.day}` === `${today.year}${today.month}${today.day}`;
  
    if (isToday) {
      this.dateElement.classList.add('today');
    } else {
      this.dateElement.classList.remove('today');
    }

    this.dateElement.textContent = this.dateUtils.prettyDate(
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
    const {hemisphere, illumination, moonrise, moonset, percent, phase,
        sunrise, sunset} = moonData;
    
    this.phaseElement.textContent = `${phase}`;
    this.percentElement.textContent = `${percent}%`;

    this.next.setAttribute('location', this.location);
    this.prev.setAttribute('location', this.location);
    
    this.photo.setAttribute('hemisphere', hemisphere);
    this.photo.setAttribute('percent', `${percent}`);

    this.moon.setAttribute('start', moonrise);
    this.moon.setAttribute('end', moonset);

    this.sun.setAttribute('start', sunrise);
    this.sun.setAttribute('end', sunset);
  }

  /** 
   * Updates document title with date and location.
   */
  private updateDocumentTitle(info: TitleInfo) {
    const {date, locale, location} = info;
    const dateLabel = this.dateUtils.prettyDate(date, locale, 'short');
    const pageTitle = `${BASE_TITLE} · ${dateLabel} · ${location}`;
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
