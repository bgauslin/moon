import { DataFetcher } from './DataFetcher';
import { DateTimeUtils } from './DateTimeUtils';
import { EventHandler } from './EventHandler';

const TITLE_DIVIDER = '·';

/** @class */
class App {
  constructor(api, locale) {
    /** @private {string} */
    this.locale_ = locale;

    /** @private {string} */
    this.baseTitle_ = document.title;

    /** @private {Object} */
    this.date_ = null;

    /** @private {string} */
    this.location_ = 'New York, NY'; // <= TODO: hard-coded for testing
    
    /** @private {Element} */
    this.headerLinkEl_ = document.querySelector('.header__link');

    /** @private {Element} */
    this.locationEl_ = document.querySelector('.location');

    /** @private {Element} */
    this.moonChartEl_ = document.querySelector('.chart--moon');

    /** @private {Element} */
    this.moonInfoEl_ = document.querySelector('.info');

    /** @private {Element} */
    this.moonPhotoEl_ = document.querySelector('.photo');

    /** @private {Element} */
    this.sunChartEl_ = document.querySelector('.chart--sun');

    /** @private @instance */
    this.dataFetcher_ = new DataFetcher(api, locale);

    /** @private @instance */
    this.dateTime_ = new DateTimeUtils();

    /** @private @instance */
    this.eventHandler_ = new EventHandler();

    /** @private {MutationObserver} */
    // this.locationObserver = new MutationObserver(() => this.update());
  }

  /**
   * Initializes UI on first run.
   * @public
   */
  init() {
    this.eventHandler_.hijackLinks();
    this.update();
  }

  /**
   * Updates UI when URL changes: enables the loader, gets the date and
   * location, then fetches API data via the data fetcher.
   * @async
   * @public
   */
  async update() {
    // Enable progress bar while we fetch data.
    // this.eventHandler_.loading(true);

    // Get the date from the address bar.
    this.date_ = this.dateTime_.currentDate();

    // Fetch data (and bail if there's nothing).
    const data = await this.dataFetcher_.fetch(this.date_, this.location_);
    if (!data) {
      // this.eventHandler_.loading(false);
      return;
    }

    // Map local constants to API data.
    const { hemisphere, moonrise, moonset, percent, phase, sunrise, sunset } = data;

    // Update custom element attributes so each component can do its thing.
    this.moonInfoEl_.setAttribute('percent', percent);
    this.moonInfoEl_.setAttribute('phase', phase);
    
    this.moonPhotoEl_.setAttribute('hemisphere', hemisphere);
    this.moonPhotoEl_.setAttribute('percent', percent);
    this.moonPhotoEl_.setAttribute('phase', phase);

    this.moonChartEl_.setAttribute('start', moonrise);
    this.moonChartEl_.setAttribute('end', moonset);

    this.sunChartEl_.setAttribute('start', sunrise);
    this.sunChartEl_.setAttribute('end', sunset);

    return;

    // Update the header and document title.
    this.headerLinkEl_.textContent = this.dateTime_.formatDate(
      this.date_,
      this.locale_,
      'long'
    );
    this.updateDocumentTitle({
      date: this.date_,
      locale: this.locale_,
      location: this.location_,
      percent,
      phase,
    });

    // Disable the progress bar and send a new Analytics pageview.
    // this.eventHandler_.loading(false);
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

    const dateLabel = (urlSegments.length === 1) ? 'Today' : this.dateTime_.formatDate(date, locale, 'short');
    let pageTitle = `${dateLabel} ${TITLE_DIVIDER} ${location} ${TITLE_DIVIDER} ${phase}`;

    if (percent > 0) {
      pageTitle += ` ${TITLE_DIVIDER} ${percent}%`;
    }

    document.title = pageTitle;
  }

  // TODO: Move this to UserLocation custom element.
  /**
   * Updates UI with new location and saves it to localStorage.
   * @private
   */
  updateLocation_() {
    const locationUrlified = this.location_.replace(/[\s]/g, '+');
    this.userLocationWidget.updateAddressBar(locationUrlified);
    this.userLocationWidget.savePreviousLocation(this.location_);
    localStorage.setItem('location', this.location_);
  }
}

export { App };
