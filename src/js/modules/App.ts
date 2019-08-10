import { Attribute } from './Constants';
import { DataFetcher } from './DataFetcher';
import { DateTimeUtils } from './DateTimeUtils';
import { EventHandler } from './EventHandler';
import { Helpers } from './Helpers';

/** @const {string} */
const TITLE_DIVIDER = '·';

/** @const {string} */
const DEFAULT_LOCATION = 'New York, NY';

/** @const {Array<string>} */
const HIGHLIGHTED = ['.header__title', '.info__phase', '.info__percent'];

/** @class */
class App {
  constructor(api) {
    /**
     * On first run, location may or may not be set in localStorage. If not,
     * set it to the fallback. On all subsequent updates, location is pulled
     * from a custom element attribute since location can be user-defined.
     * @private {string}
     */
    this.location_ = localStorage.getItem(Attribute.LOCATION) || DEFAULT_LOCATION;
    
    /** @private {Object} */
    this.date_ = null;
    
    /** @private {Element} */
    this.headerLinkEl_ = document.querySelector('.header__link');

    /** @private {Element} */
    this.locationEl_ = document.querySelector('.location');

    /** @private {Element} */
    this.moonChartEl_ = document.querySelector('[name=moon]');

    /** @private {Element} */
    this.moonInfoEl_ = document.querySelector('.info');

    /** @private {Element} */
    this.moonPhotoEl_ = document.querySelector('.photo');

    /** @private {NodeList} */
    this.navEls_ = document.querySelectorAll('[direction]');

    /** @private {Element} */
    this.sunChartEl_ = document.querySelector('[name=sun]');

    /** @private @instance */
    this.dataFetcher_ = new DataFetcher(api);

    /** @private @instance */
    this.dateTime_ = new DateTimeUtils();

    /** @private @instance */
    this.eventHandler_ = new EventHandler();

    /** @private @instance */
    this.helpers_ = new Helpers();

    /** @private {MutationObserver} */
    this.observer_ = new MutationObserver(() => this.update());
  }

  /**
   * Initializes UI on first run. Observing the 'location' element and setting
   * an attribute on it will trigger the 'update' method to fetch data and
   * populate the UI on initial page load.
   * @public
   */
  init() {
    this.eventHandler_.hijackLinks();
    this.observer_.observe(this.locationEl_, { attributes: true });
    this.locationEl_.setAttribute(Attribute.LOCATION, this.location_);
    this.renderFooterText_();
    // this.standaloneStartup_();
  }

  /**
   * Redirects view to '/' if app is launched as a standalone app. Otherwise,
   * a user may have saved the app with a full URL, which means they will start
   * at that URL every time they launch the app instead of on the current day.
   * @private
   */
  standaloneStartup_() {
    if (window.navigator.standalone == true || window.matchMedia('(display-mode: standalone)').matches) {
      history.replaceState(null, null, '/');
    }
  }

  /**
   * Updates UI when URL changes: fetches API data, sets attributes on custom
   * elements with fetched data results, then updates the header and title.
   * @async
   * @public
   */
  async update() {
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
    const { hemisphere, illumination, moonrise, moonset, percent, phase, sunrise, sunset } = data;

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

    Array.from(this.navEls_).forEach((el) => {
      el.setAttribute('location', this.location_);
    });

    // Update the date in the header.
    this.headerLinkEl_.textContent = this.dateTime_.prettyDate(
      this.date_,
      document.documentElement.lang,
      'long'
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
   * @param {!Date} date
   * @private
   */
  highlightToday_(date) {
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
   * @private
   */
  renderFooterText_() {
    const yearsEl = document.querySelector('.copyright__years');
    const ownerEl = document.querySelector('.copyright__owner');
    const yearStart = '2018';
    const yearEnd = new Date().getFullYear().toString().substr(-2);
    yearsEl.textContent = `© ${yearStart}–${yearEnd}`;
    ownerEl.textContent = 'Ben Gauslin';
  }

  /** 
   * Updates document title with info about the current moon phase.
   * @param {!Object} settings
   * @param {!Date} settings.date
   * @param {!string} settings.locale
   * @param {!string} settings.location
   * @param {!string} settings.percent
   * @param {!string} settings.phase
   * @private
   */
  updateDocumentTitle_(settings) {
    const { date, locale, location, percent, phase } = settings;
    const dateLabel = this.dateTime_.prettyDate(date, locale, 'short');
    let pageTitle = `${dateLabel} ${TITLE_DIVIDER} ${location} ${TITLE_DIVIDER} ${phase}`;
    if (percent > 0) {
      pageTitle += ` ${TITLE_DIVIDER} ${percent}%`;
    }
    document.title = pageTitle;
  }
}

export { App };