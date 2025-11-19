import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {DataFetcher, MoonData} from '../../modules/DataFetcher';
import {Utils} from '../../modules/Utils';


/**
 * Custom element that controls the application.
 */
@customElement('moon-app')
class App extends LitElement {
  private fetcher: DataFetcher;
  private keyHandler: EventListenerObject;
  private touchendHandler: EventListenerObject;
  private touchstartHandler: EventListenerObject;
  private utils: Utils;

  @state() baseTitle: string = document.title;
  @state() defaultLocation: string = 'Montevideo';
  @state() loading: boolean;
  @state() location: string;
  @state() moonData: MoonData;
  @state() photoCount: number = 26;
  @state() storageItem: string = 'location';
  @state() touchTarget: HTMLElement;

  constructor() {
    super();
    this.fetcher = new DataFetcher();
    this.utils = new Utils();
    this.keyHandler = this.handleKey.bind(this);
    this.touchstartHandler = this.handleTouchstart.bind(this);
    this.touchendHandler = this.handleTouchend.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this.keyHandler);
    this.addEventListener('location', this.updateLocation);
    this.addEventListener('progress', this.updateProgress);
    this.addEventListener('touchstart', this.touchstartHandler, {passive: true});
    this.addEventListener('touchend', this.touchendHandler, {passive: true});
    this.getLocation();
    this.updateApp();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.keyHandler);
    this.removeEventListener('location', this.updateLocation);
    this.removeEventListener('progress', this.updateProgress);
    this.removeEventListener('touchstart', this.touchstartHandler);
    this.removeEventListener('touchend', this.touchendHandler);
  }

  protected createRenderRoot() {
    return this;
  }

  /**
   * On first run, location may or may not be set. If not, check if there's a
   * location in the address bar and use that. Then check localStorage, and
   * if that doesn't exist, use the default location.
   */
  private getLocation() {
    const location = new URL(window.location.href).searchParams.get('w');

    if (location) {
      this.location = location.replace(/[+]/g, ' ');
     } else {
      this.location = localStorage.getItem(this.storageItem) || this.defaultLocation;
     }
  }

  private async updateApp(): Promise<any> {
    this.loading = true;
    
    const date = this.utils.activeDate();
    this.moonData = await this.fetcher.fetch(date, this.location);
    
    // Update document title in browser history.
    if (this.moonData) {
      const label = this.utils.prettyDate(date, document.documentElement.lang, 'short');
      const title = `${this.baseTitle} · ${label} · ${this.location}`;
      const url = new URL(window.location.href);
      document.title = url.hash ? title : this.baseTitle;
    }

    // Save location for later visits.
    localStorage.setItem(this.storageItem, this.location);

    this.loading = false;
  }

  private async updateLocation(event: CustomEvent) {
    await this.updateComplete;
    this.location = event.detail.location;

    const url = new URL(window.location.href);
    url.searchParams.set('w', this.utils.urlify(this.location));
    history.replaceState(null, '', url);

    this.updateApp();
  }

  /**
   * Shows/hides the progress bar when fetching data.
   */
  private updateProgress(event: CustomEvent) {
    this.loading = event.detail.enabled;
  }

  private navigate(direction: string) {
    const date = (direction === 'prev') ? this.utils.prevDate() : this.utils.nextDate();
    const url = this.utils.makeUrl(date, this.location);

    if (url.hostname === window.location.hostname) {
      history.replaceState(null, '', url);
      this.updateApp();
    }
  }

  private reset(event: Event) {
    event.preventDefault();
    history.replaceState(null, '', window.location.pathname);
    this.updateApp();
  }

  private handleKey(event: KeyboardEvent) {
    const {code} = event;

    // Ignore keyboard events if location field is active.
    if (document.activeElement.tagName === 'INPUT') {
      return;
    }

    if (code === 'ArrowRight') {
      this.navigate('next');
    }

    if (code === 'ArrowLeft') {
      this.navigate('prev');
    }

    if (code === 'Space') {
      this.reset(event);
    }
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
    if (!this.moonData) return;

    const {hemisphere, illumination, moonrise, moonset, percent, phase, sunrise, sunset} = this.moonData;
    const active = this.utils.activeDate();
    const today = this.utils.todaysDate();
    const isToday = `${active.year}${active.month}${active.day}` === `${today.year}${today.month}${today.day}`;
    const prettyDate = this.utils.prettyDate(active, document.documentElement.lang, 'long');

    // Set frame number for the photo to an integer between 1 and 26.
    const currentFrame = Math.floor((percent / 100) * this.photoCount) + 1;
    const frame = (currentFrame === 0) ? this.photoCount : currentFrame;

    return html`
      <div id="phase">${phase}</div>
      <div id="illumination">${illumination}% illumination</div>
      <div
        id="photo"
        data-frame="${frame}"
        data-hemisphere="${hemisphere}"></div>
      <moon-chart
        end="${sunset}"
        name="sun"
        start="${sunrise}"></moon-chart>
      <moon-chart
        end="${moonset}"
        name="moon"
        start="${moonrise}"></moon-chart>
      <moon-ticks></moon-ticks>
      <a href="/"
        ?data-today="${isToday ?? true}"  
        id="date"
        title="Today"
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
        @click="${() => this.navigate(direction)}">
        <svg aria-hidden="true" viewbox="0 0 24 24">
          <path d="${path}"/>
        </svg>
      </button>
    `;
  }
}
