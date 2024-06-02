import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {DataFetcher, MoonData} from '../../modules/DataFetcher';
import {AppDate, DateUtils} from '../../modules/DateUtils';


const DEFAULT_LOCATION = 'New York';
const STORAGE_ITEM = 'location';

/**
 * Custom element that controls the application.
 */
@customElement('moon-app')
class MoonApp extends LitElement {
  private fetcher: DataFetcher;
  private utils: DateUtils;
  private popstateListener: EventListenerObject;
  private touchendListener: EventListenerObject;
  private touchstartListener: EventListenerObject;

  @state() baseTitle = document.title;
  @state() loading: boolean;
  @state() location: string;
  @state() moonData: MoonData;
  @state() touchTarget: HTMLElement;

  constructor() {
    super();
    this.fetcher = new DataFetcher();
    this.utils = new DateUtils();
    this.popstateListener = this.updateApp.bind(this);
    this.touchstartListener = this.handleTouchstart.bind(this);
    this.touchendListener = this.handleTouchend.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('location', this.updateLocation);
    window.addEventListener('popstate', this.popstateListener);
    this.addEventListener('progress', this.updateProgress);
    this.addEventListener('touchstart', this.touchstartListener, {passive: true});
    this.addEventListener('touchend', this.touchendListener, {passive: true});
    this.initialLocation();
    this.updateApp();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('location', this.updateLocation);
    window.removeEventListener('popstate', this.popstateListener);
    this.removeEventListener('progress', this.updateProgress);
    this.removeEventListener('touchstart', this.touchstartListener);
    this.removeEventListener('touchend', this.touchendListener);
  }

  protected createRenderRoot() {
    return this;
  }

  private updateProgress(event: CustomEvent) {
    this.loading = event.detail.enabled;
  }

  private async updateApp(): Promise<any> {
    this.loading = true;
    
    const date = this.utils.activeDate();
    this.moonData = await this.fetcher.fetch(date, this.location);
    if (this.moonData) {
      this.updateDocumentTitle(date);
    }

    // Update the address bar.
    const segments = window.location.pathname.split('/');
    segments.splice(-1, 1);
    segments.push(this.utils.urlify(this.location));
    history.replaceState(null, '', segments.join('/'));

    // Save location for later visits.
    localStorage.setItem(STORAGE_ITEM, this.location);

    this.loading = false;
  }

  /**
   * On first run, location may or may not be set. If not, check if there's a
   * location in the address bar and use that. Then check localStorage, and
   * if that doesn't exist, use fallback location.
   */
  private initialLocation() {
    const segments = window.location.pathname.split('/');
    segments.shift();

    // 4 URL segments are year, month, day, location
    if (segments.length === 4) {
      this.location = segments[3].replace(/[+]/g, ' ');
    } else {
      this.location = localStorage.getItem(STORAGE_ITEM) || DEFAULT_LOCATION;
    }
  }

  private async updateLocation(event: CustomEvent) {
    await this.updateComplete;
    this.location = event.detail.location;
    this.updateApp();
  }

  private navigate(event: Event) {
    const target = <HTMLElement>event.target;
    const direction = target.dataset.direction;
    
    const date = (direction === 'prev') ? this.utils.prevDate() : this.utils.nextDate();
    const href = this.utils.makeUrl(date, this.location);

    const linkUrl = new URL(href, window.location.origin);
    if (linkUrl.hostname === window.location.hostname) {
      history.replaceState(null, '', href);
      this.updateApp();
    }
  }

  /**
   * Removes all segments from URL for when active date is today.
   */
  private reset(event: Event) {
    event.preventDefault();
    history.replaceState(null, '', '/');
    this.updateApp();
  }

  private updateDocumentTitle(date: AppDate) {
    const dateLabel =
        this.utils.prettyDate(date, document.documentElement.lang, 'short');
    const pageTitle = `${this.baseTitle} · ${dateLabel} · ${this.location}`;
    const urlSegments = window.location.pathname.split('/');
    urlSegments.shift();

    document.title = (urlSegments.length === 4) ? pageTitle : this.baseTitle;
  }

  private handleTouchstart(event: TouchEvent) {
    this.touchTarget = <HTMLElement>event.composedPath()[0];

    if (['A', 'BUTTON'].includes(this.touchTarget.tagName)) {
      this.touchTarget.classList.add('touch');
    }
  }

  private handleTouchend() {
    this.touchTarget.classList.remove('touch');
  }

  protected render() {
    if (!this.moonData) {
      return;
    }

    const {hemisphere, moonrise, moonset, percent, phase, sunrise, sunset} = this.moonData;
    const active = this.utils.activeDate();
    const today = this.utils.todaysDate();
    const isToday = `${active.year}${active.month}${active.day}` === `${today.year}${today.month}${today.day}`;
    const prettyDate = this.utils.prettyDate(active, document.documentElement.lang, 'long');

    return html`
      <div id="phase">${phase}</div>
      <div id="percent">${percent}%</div>

      <moon-photo
        hemisphere="${hemisphere}"
        percent="${percent}"></moon-photo>
      
      <moon-chart
        name="sun"
        start="${sunrise}"
        end="${sunset}"></moon-chart>
      <moon-chart
        name="moon"
        start="${moonrise}"
        end="${moonset}"></moon-chart>
      <moon-ticks></moon-ticks>
      
      <a href="/"
        id="date"
        title="Today"
        ?data-today="${isToday ?? true}"
        @click="${this.reset}">${prettyDate}</a>

      <moon-location .location="${this.location}"></moon-location>

      ${this.renderButton('prev')}
      ${this.renderButton('next')}

      <div
        class="progress-bar"
        ?data-loading="${this.loading}"></div>
    `;
  }

  private renderButton(direction: string) {
    let path = 'M9,4 L17,12 L9,20';
    let date = this.utils.nextDate();

    if (direction === 'prev') {
      path = 'M15,4 L7,12 L15,20';
      date = this.utils.prevDate();
    }

    const label = this.utils.prettyDate(date, document.documentElement.lang, 'long');

    return html`
      <button
        aria-label="${label}"
        data-direction="${direction}"  
        title="${label}"
        type="button"
        @click="${this.navigate}">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="${path}"/>
        </svg>
      </button>
    `;
  }
}
