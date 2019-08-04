import { Attribute } from '../modules/Constants';
import { EventType, EventHandler } from '../modules/EventHandler';

/** @const {number} */
const GEOCODER_PROXIMITY = 100;

/** @class */
class UserLocation extends HTMLElement {
  constructor() {
    super();

    /** @private {boolean} */
    this.hasSetup_ = false;

    /** @private {!string} */ 
    this.location_ = null;

    /** @private {?string} */
    this.previousLocation_ = null;
    
    /** @private {?Element} */ 
    this.form_ = null;

    /** @private {?Element} */ 
    this.geolocationButton_ = null;

    /** @private {?Element} */ 
    this.input_ = null;

    /** @private @instance */
    this.eventHandler_ = new EventHandler();
  }

  static get observedAttributes() {
    return [Attribute.LOCATION, Attribute.RESTORE];
  }

  /** @callback */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === Attribute.RESTORE) {
      this.restore_();
    }

    if (name === Attribute.LOCATION && !this.hasSetup_) {
      this.location_ = this.getAttribute(Attribute.LOCATION);
      this.render_();
      this.enableGeolocation_();
      this.addListeners_();
      this.hasSetup_ = true;
    }
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
      if (newLocation !== this.location_) {
        this.previousLocation_ = this.location_; // Save the previous location in case there's no data for it.
        this.location_ = newLocation;
        this.input_.blur();
        // TODO: update the location attribute, which will trigger App to call update()
        // this.setAttribute(Attribute.LOCATION, this.location_);
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
        this.restore_();
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
  
    // Alert user and restore input with previous location.
    const error = () => {
      alert('Uh oh. We were unable to retrieve your location. :(\n\nYou may need to enable Location Services on your device before you can use this feature.');
      this.restore_();
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
   * Fetches human-friendly location based on geo coordinates via API.
   * @param {!Object} coords
   * @param {!number} coords.lat - User's latitude.
   * @param {!number} coords.lng - User's longitude.
   * @async
   * @private
   */
  async reverseGeocode_(coords) {
    const { lat, lng } = coords;
    const endpoint = `${process.env.GEOCODER_API}?prox=${lat},${lng},${GEOCODER_PROXIMITY}&mode=retrieveAddresses&maxresults=1&gen=9&app_id=${process.env.GEOCODER_APP_ID}&app_code=${process.env.GEOCODER_APP_CODE}`;

    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      // TODO(geolocation): Update lookup for city, state, country and display long-form name of country.
      const address = data.Response.View[0].Result[0].Location.Address;
      this.location_ = `${address.City}, ${address.State}`;

      // Update input field and 'location' attribute (which will trigger App.update).
      this.input_.value = this.location_;
      this.setAttribute(Attribute.LOCATION, this.location_);

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
   * Restores previous location.
   * @private
   */
  restore_() {
    this.location_ = this.previousLocation_;
    this.input_.value = this.previousLocation_;
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
   * Renders HTML form element for user's location and sets references to
   * form elements.
   * @private
   */
  render_() {
    const html = `\      
      <form class="location__form">\
        <input name="location" value="${this.location_}" type="text" aria-label="Type a new location" required>\
        <button type="submit" role="button" aria-label="Update location">\
          ${this.svgIcon_('submit')}\
        </button>\
        <button type="reset" role="button" aria-label="Clear location">\
          ${this.svgIcon_('reset')}\
      </form>\
      <button class="geolocation" role="button" aria-label="Find my location" hidden>\
        ${this.svgIcon_('location')}\
      </button>\
    `;
    this.innerHTML = html.replace(/\s\s/g, '');

    this.form_ = this.querySelector('form');
    this.input_ = this.querySelector('input');
    this.geolocationButton_ = this.querySelector('button.geolocation');
  }

  /**
   * Renders an inline SVG icon.
   * @param {string} name
   * @private
   */
  svgIcon_(name) {
    let svgPath;
    switch (name) {
      case 'location':
        svgPath = `\
          <path d="M0 0h24v24H0z" fill="none"/>\
          <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>\    
        `;
        break;
    case 'reset':
      svgPath = `\
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>\
        <path d="M0 0h24v24H0z" fill="none"/>\
      `;
      break;
    case 'submit':
      svgPath = `\
        <path d="M0 0h24v24H0z" fill="none"/>\
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>\
      `;
      break;
    }

    const html = `\
      <svg class="icon icon--${name}" viewBox="0 0 24 24">\
        ${svgPath}\
      </svg>\
    `;

    return html.replace(/\s\s/g, '');
  }
}

export { UserLocation };
