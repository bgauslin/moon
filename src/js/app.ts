import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {DataFetcher} from './data-fetcher';
import {Events, MoonData} from './shared';
import {Utils} from './utils';


/**
 * Lit custom element that controls the application.
 */
@customElement('luna-app') class App extends LitElement {
  private fetcher: DataFetcher;
  private keyHandler: EventListenerObject;
  private utils: Utils;

  @state() baseTitle: string = document.title;
  @state() defaultLocation: string = 'Buenos Aires';
  @state() intro: boolean = true;
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
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener(Events.KeyDown, this.keyHandler);
    this.getLocation();
    this.updateApp();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener(Events.KeyDown, this.keyHandler);
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

    // Set a guard attribute for playing element animations only once.
    if (this.intro) {
      this.setAttribute('intro', '');
      await this.updateComplete;

      const photo = this.querySelector('[id="photo"]');
      photo.addEventListener(Events.AnimationEnd, () => {
        this.removeAttribute('intro');
        this.intro = false;
      }, {once: true});
    }
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
      <luna-chart
        end="${sunset}"
        name="sun"
        start="${sunrise}"></luna-chart>
      <luna-chart
        end="${moonset}"
        name="moon"
        start="${moonrise}"></luna-chart>
      <luna-ticks></luna-ticks>
      <a href="./"
        id="date"
        title="Today"
        ?data-today=${isToday ?? true}  
        @click=${this.reset}>
        ${prettyDate}
      </a>
      <luna-location
        .location=${this.location}
        @location=${this.updateLocation}
        @progress=${this.updateProgress}></luna-location>
      ${this.renderButton('prev')}
      ${this.renderButton('next')}
      <luna-touch></luna-touch>
      <div
        class="progress-bar"
        ?data-loading=${this.loading}></div>
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
        @click=${() => this.navigate(direction)}>
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="${path}"/>
        </svg>
      </button>
    `;
  }
}
