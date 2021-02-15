import {DateUtils} from '../../modules/DateUtils';

interface UserCoordinates {
  lat: number,
  lng: number,
}

const DEFAULT_ATTR: string = 'default';
const ENABLED_ATTR: string = 'enabled';
const GEOCODER_PROXIMITY: number = 100;
const HIDDEN_ATTR: string = 'hidden';
const LOADING_ATTR: string = 'loading';
const LOCAL_STORAGE_ITEM: string = 'location';
const LOCATION_ATTR: string = 'location';
const RESTORE_ATTR: string = 'restore';

const ICONS = new Map();
ICONS.set('location', 'M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z');
ICONS.set('reset', 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z');
ICONS.set('submit', 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z');

/**
 * Custom element that gets the user's location either via text input or via
 * the Geolocation API and a reverse geocoding API to convert lat/lng
 * coordinates to a named location.
 */
export class UserLocation extends HTMLElement {
  private dateUtils: DateUtils;
  private defaultLocation: string;
  private formEl: HTMLFormElement;
  private geolocationButtonEl: HTMLButtonElement;
  private hasSetup: boolean;
  private inputEl: HTMLInputElement;
  private location: string;
  private previousLocation: string;

  constructor() {
    super();
    this.hasSetup = false;
    this.dateUtils = new DateUtils();
  }

  static get observedAttributes(): string[] {
    return [LOCATION_ATTR, RESTORE_ATTR];
  }

  connectedCallback() {
    this.defaultLocation = this.getAttribute(DEFAULT_ATTR);
    this.removeAttribute(DEFAULT_ATTR);
    this.setAttribute(LOCATION_ATTR, this.initialLocation());
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === RESTORE_ATTR) {
      this.restore();
    }

    if (name === LOCATION_ATTR && !this.hasSetup) {
      this.location = this.getAttribute(LOCATION_ATTR);
      this.previousLocation = this.location;
      this.render();
      this.enableGeolocation();
      this.addListeners_();
      this.hasSetup = true;
    }
  }

  /**
   * Updates location widget with user-provided location if it has changed.
   */
  private addListeners_() {
    // Get new location on submit, blur the input, and update the attribute
    // to trigger App.update().
    this.formEl.addEventListener('submit', (e: Event) => {
      e.preventDefault();
      const newLocation = this.inputEl.value;
      if (newLocation !== this.location) {
        this.location = newLocation;
        this.update();
        this.inputEl.blur();
      }
    });

    // Clear the input and focus it when the reset icon/button is clicked.
    this.formEl.addEventListener('reset', (e: Event) => {
      e.preventDefault();
      this.inputEl.value = '';
      this.inputEl.focus();
    });

    // Only show geolocation button on input focus.
    this.inputEl.addEventListener('focus', () => {
      this.geolocationButtonEl.setAttribute(ENABLED_ATTR, '');
    });

    // Restore previous location if input is empty when blurred and hide
    // the geolocation button.
    this.inputEl.addEventListener('blur', () => {
      if (this.inputEl.value === '') {
        this.restore();
      }
      this.geolocationButtonEl.removeAttribute(ENABLED_ATTR);
    });

    // Get user's location when geolocation button is clicked.
    this.geolocationButtonEl.addEventListener('click', (e: Event) => {
      e.preventDefault();
      this.getGeolocation();
    });
  }

  /**
   * On first run, location may or may not be set. If not, check if there's a
   * location in the address bar and use that. Then check localStorage, and
   * if that doesn't exist, use fallback location. On all subsequent updates,
   * location is set via custom element attribute since location can also be
   * user-defined.
   */
  private initialLocation(): string {
    const urlSegments = window.location.pathname.split('/');
    urlSegments.shift();

    // 4 URL segments are year, month, day, location
    if (urlSegments.length === 4) {
      return urlSegments[3].replace(/[+]/g, ' ');
    } else {
      return localStorage.getItem(LOCAL_STORAGE_ITEM) || this.defaultLocation;
    }
  }

  /**
   * Fetches human-friendly location based on geo coordinates provided by the
   * Geolocation API.
   */
  private async getGeolocation(): Promise<any> {
    document.body.setAttribute(LOADING_ATTR, '');
    this.inputEl.value = 'Retrieving location...';

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };
  
    // Alert user and restore input with previous location.
    const error = () => {
      alert(`Uh oh. We were unable to retrieve your location. :(\n\nYou may need to enable Location Services on your device before you can use this feature.`);
      this.restore();
      document.body.removeAttribute(LOADING_ATTR);
    }

    // Get user's location as city/state/country.
    const success = (position: any) => {
      this.reverseGeocode({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    }

    // Get user's current geolocation coordinates.
    await navigator.geolocation.getCurrentPosition(success, error, options);
  }

  /**
   * Fetches human-friendly location based on geo coordinates via API.
   */
  private async reverseGeocode(coords: UserCoordinates): Promise<any> {
    const {lat, lng} = coords;
    const endpoint = (`${process.env.REVERSE_GEOCODE_API}?prox=${lat},${lng},\
      ${GEOCODER_PROXIMITY}&mode=retrieveAddresses&maxresults=1&gen=9&\
      app_id=${process.env.GEOCODER_APP_ID}\
      &app_code=${process.env.GEOCODER_APP_CODE}`);

    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      // TODO(geolocation): Update lookup for city, state, country and
      // display long-form name of country.
      const address = data.Response.View[0].Result[0].Location.Address;
      this.location = `${address.City}, ${address.State}`;
      this.previousLocation = this.location;
      this.inputEl.value = this.location;
      this.update();

      document.body.removeAttribute(LOADING_ATTR);

    } catch (error) {
      console.warn('Currently unable to fetch data. :(');
    }
  }

  /**
   * Updates the URL with new location and changes the 'location' attribute to
   * trigger App.update().
   */
  private update() {
    const urlSegments = window.location.pathname.split('/');
    urlSegments.splice(-1, 1);
    urlSegments.push(this.dateUtils.urlify(this.location));

    history.pushState(null, null, urlSegments.join('/'));
    this.setAttribute(LOCATION_ATTR, this.location);

    // Save new location to localStorage.
    localStorage.setItem(LOCAL_STORAGE_ITEM, this.location);
  }

  /**
   * Restores previous location.
   */
  private restore() {
    this.location = this.previousLocation;
    this.inputEl.value = this.previousLocation;
  }

  /**
   * Shows geolocation button if browser supports Geolocation API.
   */
  private enableGeolocation() {
    if (navigator.geolocation) {
      this.geolocationButtonEl.removeAttribute(HIDDEN_ATTR);
    }
  }

  /**
   * Renders HTML form element for user's location and sets references to
   * form elements.
   */
  private render() {
    const html = `\      
      <form class="location__form">\
        <input class="location__input" \
          type="text" \  
          name="location" \
          value="${this.location}" \
          aria-label="Type a new location" \
          required>\
        <button class="location__button location__button--submit" \
          type="submit" \
          aria-label="Update location">\
          ${this.svgIcon('submit')}\
        </button>\
        <button class="location__button location__button--reset" \
          type="reset" \
          aria-label="Clear location">\
          ${this.svgIcon('reset')}\
      </form>\
      <button class="location__button location__button--geolocation" \
        aria-label="Find my location" \
        hidden>\
        ${this.svgIcon('location', 'geolocation')}\
      </button>\
    `;
    this.innerHTML = html.replace(/\s\s/g, '');

    this.formEl = this.querySelector('form');
    this.inputEl = this.querySelector('input');
    this.geolocationButtonEl = this.querySelector('.location__button--geolocation');
  }

  /**
   * Returns a rendered inline SVG icon.
   */
  private svgIcon(name: string, modifier: string = name): string {
    const html = `\
      <svg class="icon icon--${modifier}" viewBox="0 0 24 24">\
        <path d="${ICONS.get(name)}"/>\
      </svg>\
    `;
    return html.replace(/\s\s/g, '');
  }
}

customElements.define('user-location', UserLocation);
