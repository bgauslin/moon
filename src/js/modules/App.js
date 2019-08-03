import { Attribute } from './Constants';
import { DataFetcher } from './DataFetcher';
import { DateTimeUtils } from './DateTimeUtils';
import { EventHandler } from './EventHandler';

/** @const {string} */
const TITLE_DIVIDER = '·';

/** @class */
class App {
  constructor(api) {
    /** @private {string} */
    this.baseTitle_ = document.title;

    /** @private {Object} */
    this.date_ = null;

    /** @private {string} */
    // TODO: Fallback location is hard-coded for now for testing...
    this.location_ = localStorage.getItem(Attribute.LOCATION) || 'New York, NY';
    
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

    /** @private {MutationObserver} */
    this.observer_ = new MutationObserver(() => this.update());
  }

  /**
   * Initializes UI on first run.
   * @public
   */
  init() {
    this.eventHandler_.hijackLinks();
    this.observer_.observe(this.locationEl_, { attributes: true });
    this.locationEl_.setAttribute(Attribute.LOCATION, this.location_);
  }

  /**
   * Updates UI when URL changes: fetches API data, sets attributes on custom
   * elements with fetched data results, then updates the header and title.
   * @async
   * @public
   */
  async update() {
    // Enable progress bar while we fetch data.
    this.eventHandler_.loading(true);

    // Get the date from the address bar.
    this.date_ = this.dateTime_.currentDate();

    // Fetch data (and bail if there's nothing).
    const data = await this.dataFetcher_.fetch(this.date_, this.location_);
    if (!data) {
      this.eventHandler_.loading(false);
      return;
    }

    // Map local constants to API data.
    const { hemisphere, moonrise, moonset, percent, phase, sunrise, sunset } = data;

    // Update custom element attributes so each component can update itself.
    this.moonInfoEl_.setAttribute('percent', percent);
    this.moonInfoEl_.setAttribute('phase', phase);
    
    this.moonPhotoEl_.setAttribute('hemisphere', hemisphere);
    this.moonPhotoEl_.setAttribute('percent', percent);
    this.moonPhotoEl_.setAttribute('phase', phase);

    this.moonChartEl_.setAttribute('start', moonrise);
    this.moonChartEl_.setAttribute('end', moonset);

    this.sunChartEl_.setAttribute('start', sunrise);
    this.sunChartEl_.setAttribute('end', sunset);

    Array.from(this.navEls_).forEach((el) => {
      el.setAttribute('location', this.location_);
    });

    // Update the header and document title.
    this.headerLinkEl_.textContent = this.dateTime_.prettyDate(
      this.date_,
      document.documentElement.lang,
      'long'
    );

    this.updateDocumentTitle({
      date: this.date_,
      locale: document.documentElement.lang,
      location: this.location_,
      percent,
      phase,
    });

    // Save new location to localStorage.
    localStorage.setItem(Attribute.LOCATION, this.location_);

    // Disable the progress bar and send a new Analytics pageview.
    this.eventHandler_.loading(false);
    // this.eventHandler_.sendPageview(window.location.pathname, document.title);
  }

  /** 
   * Updates document title with info about the current moon phase.
   * @param {!Object} settings
   * @param {!Object} settings.date
   * @param {!number} settings.date.year
   * @param {!number} settings.date.month
   * @param {!number} settings.date.day
   * @param {!string} settings.locale
   * @param {!string} settings.location
   * @param {!string} settings.percent
   * @param {!string} settings.phase
   * @public
   */
  updateDocumentTitle(settings) {
    const { date, locale, location, percent, phase } = settings;
    const pathname = window.location.pathname;
    let urlSegments = pathname.split('/');
    urlSegments.shift();

    const dateLabel = (urlSegments.length === 1) ? 'Today' : this.dateTime_.prettyDate(date, locale, 'short');
    let pageTitle = `${dateLabel} ${TITLE_DIVIDER} ${location} ${TITLE_DIVIDER} ${phase}`;

    if (percent > 0) {
      pageTitle += ` ${TITLE_DIVIDER} ${percent}%`;
    }

    document.title = pageTitle;
  }
}

export { App };
