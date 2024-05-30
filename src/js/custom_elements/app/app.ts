import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {DataFetcher, MoonData} from '../../modules/DataFetcher';
import {AppDate, DateUtils} from '../../modules/DateUtils';


const BASE_TITLE = document.title;
const DEFAULT_LOCATION = 'New Orleans, LA';

/**
 * Custom element that controls the application.
 */
@customElement('moon-app')
class MoonApp extends LitElement {
  private dateUtils: DateUtils;
  private popstateListener: EventListenerObject;
  private touchendListener: EventListenerObject;
  private touchstartListener: EventListenerObject;

  @state() loading: boolean;
  @state() location: string;
  @state() moonData: MoonData;
  @state() touchTarget: HTMLElement;

  constructor() {
    super();
    this.dateUtils = new DateUtils();
    this.popstateListener = this.updateApp.bind(this);
    this.touchstartListener = this.handleTouchstart.bind(this);
    this.touchendListener = this.handleTouchend.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('popstate', this.popstateListener);
    this.addEventListener('touchstart', this.touchstartListener, {passive: true});
    this.addEventListener('touchend', this.touchendListener, {passive: true});
    this.updateApp();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('popstate', this.popstateListener);
    this.removeEventListener('touchstart', this.touchstartListener);
    this.removeEventListener('touchend', this.touchendListener);
  }

  protected createRenderRoot() {
    return this;
  }

  /**
   * Enables the progress bar while fetching moon data for the current date and
   * location, then updates the document title and disables the progress bar.
   */
  private async updateApp(): Promise<any> {
    this.loading = true;
    
    const date = this.dateUtils.activeDate();
    this.location = DEFAULT_LOCATION; // TODO: Get location from widget.
    this.moonData = await new DataFetcher().fetch(date, this.location);

    if (this.moonData) {
      this.updateDocumentTitle(date);
    }

    this.loading = false;
  }

  protected render() {
    if (!this.moonData) {
      return;
    }

    const {hemisphere, moonrise, moonset, percent, phase, sunrise, sunset} = this.moonData;
    const active = this.dateUtils.activeDate();
    const today = this.dateUtils.todaysDate();
    const isToday = `${active.year}${active.month}${active.day}` === `${today.year}${today.month}${today.day}`;
    const prettyDate = this.dateUtils.prettyDate(active, document.documentElement.lang, 'long');

    return html`
      <div id="phase">${phase}</div>
      <div id="percent">${percent}%</div>

      <moon-photo
        hemisphere="${hemisphere}"
        percent="${percent}"></moon-photo>
      
      <donut-chart
        name="sun"
        start="${sunrise}"
        end="${sunset}"></donut-chart>
      <donut-chart
        name="moon"
        start="${moonrise}"
        end="${moonset}"></donut-chart>
      <ticks-chart></ticks-chart>
      
      <a href="/"
        id="date"
        title="Today"
        ?data-today="${isToday ?? true}"
        @click="${this.reset}">${prettyDate}</a>

      <user-location
        default="${DEFAULT_LOCATION}"></user-location>

      ${this.renderButton('prev')}
      ${this.renderButton('next')}

      <div
        class="progress-bar"
        ?data-loading="${this.loading}"></div>
    `;
  }

  private renderButton(direction: string) {
    let path = 'M9,4 L17,12 L9,20';
    let date = this.dateUtils.nextDate();

    if (direction === 'prev') {
      path = 'M15,4 L7,12 L15,20';
      date = this.dateUtils.prevDate();
    }

    const label = this.dateUtils.prettyDate(date, document.documentElement.lang, 'long');

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

  private navigate(event: Event) {
    const target = <HTMLElement>event.target;
    const direction = target.dataset.direction;
    
    const date = (direction === 'prev') ? this.dateUtils.prevDate() : this.dateUtils.nextDate();
    const href = this.dateUtils.makeUrl(date, this.location);

    const linkUrl = new URL(href, window.location.origin);
    if (linkUrl.hostname === window.location.hostname) {
      history.replaceState(null, '', href);
      this.updateApp();
    }
  }

  private reset(event: Event) {
    event.preventDefault();
    history.replaceState(null, '', '/');
    this.updateApp();
  }

  private updateDocumentTitle(date: AppDate) {
    const dateLabel =
        this.dateUtils.prettyDate(date, document.documentElement.lang, 'short');
    const pageTitle = `${BASE_TITLE} · ${dateLabel} · ${this.location}`;
    const urlSegments = window.location.pathname.split('/');
    urlSegments.shift();

    document.title = (urlSegments.length === 4) ? pageTitle : BASE_TITLE;
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
}
