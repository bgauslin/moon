// TODO: Convert all of this to a custom element.

import { EventType, EventHandler } from '../modules/EventHandler';

/** @enum {string} */ 
const Attribute = {
  ENABLED: 'enabled',
  HIDDEN: 'hidden',
};

/** @enum {string} */ 
const CssSelector = {
  FORM: '.location__form',
  GEOLOCATION: '.geolocation',
  HEADER: '.header',
  INPUT: '[name="location"]',
};

/** @const {number} */
const GEOCODER_PROXIMITY = 100;

/** @const {string} */ 
const LOCAL_STORAGE_ITEM = 'location';

/** @const {string} */ 
const SVG_ICON_LOCATION = `
  <svg class="icon icon--location" viewBox="0 0 24 24">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
  </svg>`;

/** @const {string} */ 
const SVG_ICON_RESET =`
  <svg class="icon icon--reset" viewBox="0 0 24 24">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
  </svg>`;

/** @const {string} */ 
const SVG_ICON_SUBMIT = `
  <svg class="icon icon--submit" viewBox="0 0 24 24">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>`;

/** @class */
class UserLocation {
  constructor() {
    /** @private {!string} */ 
    this.fallbackLocation_ = this.getAttribute('location');
    
    /** @private {?Element} */ 
    this.form_ = null;

    /** @private {?Element} */ 
    this.geolocationButton_ = null;

    /** @private {?Element} */ 
    this.input_ = null;

    /** @private {?string} */ 
    this.userLocation_ = null;

    /** @private {?string} */
    this.previousLocation_ = null;

    /** @instance */
    this.eventHandler_ = new EventHandler();
  }

  init() {
    this.getInitialLocation_();
    // this.eventHandler_.updateLocation(this.userLocation_);
    this.renderLocationEl_(this.userLocation_);
    this.enableGeolocation_();
    this.addListeners_();
  }

  /**
   * Updates location widget with user-provided location if it has changed.
   * @private
   */
  addListeners_() {
    // Get new location on submit and blur the input.
    this.form_.addEventListener(EventType.SUBMIT, (e) => {
      e.preventDefault();
      const newLocation = this.input_.value;
      if (newLocation !== this.userLocation_) {
        this.userLocation_ = newLocation;
        this.input_.blur();
      }
    });

    // Clear input and focus it.
    this.form_.addEventListener(EventType.RESET, (e) => {
      e.preventDefault();
      this.input_.value = '';
      this.input_.focus();
    });

    // Show geolocation button on input focus.
    this.input_.addEventListener(EventType.FOCUS, () => {
      this.geolocationButton_.setAttribute(Attribute.ENABLED, '');
    });

    // Restore previous location if input is empty when blurred and hide
    // geolocation button.
    this.input_.addEventListener(EventType.BLUR, () => {
      if (this.input_.value === '') {
        this.restoreLocation();
      }
      this.geolocationButton_.removeAttribute(Attribute.ENABLED);
    });

    // Geolocation button listener.
    this.geolocationButton_.addEventListener(EventType.CLICK, (e) => {
      e.preventDefault();
      this.getGeolocation_();
    });
  }

  /**
   * Shows geolocation button if browser supports Geolocation API.
   * @private
   */
  enableGeolocation_() {
    if (navigator.geolocation) {
      this.geolocationButton_.removeAttribute(Attribute.HIDDEN);
    }
  }

  /**
   * Fetches human-friendly location based on geo coordinates provided by the
   * Geolocation API.
   * @async
   * @private
   */
  async getGeolocation_() {
    this.eventHandler_.loading(true);
    this.input_.value = 'Retrieving location...';

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };
  
    // Alert user and populate input with fallback location.
    const error = () => {
      alert('Uh oh. We were unable to retrieve your location. :(\n\nYou may need to enable Location Services on your device before you can use this feature.');
      this.userLocation_ = this.fallbackLocation_;
      this.restoreLocation();
      this.eventHandler_.loading(false);
    }

    // Get user's location as city/state/country.
    const success = (position) => {
      this.reverseGeocode_({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    }

    // Get user's current geolocation coordinates.
    await navigator.geolocation.getCurrentPosition(success, error, options);
  }

  /**
   * Gets initial location from either URL segment or localStorage, uses
   * fallback if neither exist.
   * @private 
   */
  getInitialLocation_() {
    const userLocationSegment = this.lastUrlSegment_().replace(/[+]/g, ' ');
    const userLocationStored = localStorage.getItem(LOCAL_STORAGE_ITEM);

    let location;
    if (userLocationSegment) {
      location = userLocationSegment;
    } else if (userLocationStored) {
      location = userLocationStored;
    } else {
      location = this.fallbackLocation_;
    }

    this.userLocation_ = location;
    this.previousLocation_ = location;

    localStorage.setItem(LOCAL_STORAGE_ITEM, this.userLocation_);
  }

  /**
   * Gets last URL segment from the address bar.
   * @return {string}
   * @private
   */
  lastUrlSegment_() {
    const pathname = window.location.pathname;
    const urlSegments = pathname.split('/');
    return urlSegments[urlSegments.length - 1];
  }

  /**
   * Renders HTML form element for user's location and sets references to
   * form elements.
   * @param {!string} userLocation
   * @private
   */
  renderLocationEl_(userLocation) {
    const headerEl = document.querySelector(CssSelector.HEADER);

    const userLocationHtml = `
      <div class="location">
        <form class="location__form">
          <input name="location" value="${userLocation}" type="text" aria-label="Type a new location" required>
          <button type="submit" role="button" aria-label="Update location">${SVG_ICON_SUBMIT}</button>
          <button type="reset" role="button" aria-label="Clear location">${SVG_ICON_RESET}</button>
        </form>
        <button class="geolocation" role="button" aria-label="Find my location" hidden>${SVG_ICON_LOCATION}</button>
      </div>
    `;
    headerEl.innerHTML += userLocationHtml;

    this.form_ = document.querySelector(CssSelector.FORM);
    this.geolocationButton_ = document.querySelector(CssSelector.GEOLOCATION);
    this.input_ = document.querySelector(CssSelector.INPUT);
  }

  /**
   * Restores user's previous location.
   * @public
   */
  restoreLocation() {
    this.input_.value = this.previousLocation_;
  }

  /**
   * Fetches human-friendly location based on geo coordinates via API.
   * @param {!Object} coords
   * @param {!number} coords.lat - User's latitude.
   * @param {!number} coords.lng - User's longitude.
   * @async
   * @private
   */
  async reverseGeocode_(coords) {
    const { lat, lng } = coords;
    const endpoint = `${process.env.API_GEOCODER}?prox=${lat},${lng},${GEOCODER_PROXIMITY}&mode=retrieveAddresses&maxresults=1&gen=9&app_id=${process.env.APP_ID}&app_code=${process.env.APP_CODE}`;

    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      // TODO(geolocation): Update lookup for city, state, country and display long-form name of country.
      const address = data.Response.View[0].Result[0].Location.Address;
      this.userLocation_ = `${address.City}, ${address.State}`;
      this.input_.value = this.userLocation_;
      this.eventHandler_.updateLocation(this.userLocation_);
      this.eventHandler_.loading(false);
    } catch (e) {
      alert('Currently unable to fetch data. :(');
    }
  }

  /**
   * Updates previous location.
   * @param {!string} location
   * @public
   */
  savePreviousLocation(location) {
    this.previousLocation_ = location;
  }

  /**
   * Removes 'location' URL segment and replaces it with new URL segment.
   * @param {!string} userLocationPathname
   * @public
   */
  updateAddressBar(userLocationPathname) {
    const userLocationSegment = this.lastUrlSegment_();

    if (userLocationSegment && userLocationSegment !== userLocationPathname) {
      const pathname = window.location.pathname;
      let urlSegments = pathname.split('/');
      urlSegments.splice(-1, 1); // remove last segment
      urlSegments.push(userLocationPathname); // replace last segment
      const newPathname = urlSegments.join('/');
      history.pushState(null, null, newPathname);
    }
  }

  // TODO: This moved here from elsewhere. Update/remove as needed.
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

export { UserLocation };
