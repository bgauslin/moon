import {DateUtils} from '../../modules/DateUtils';

interface UserCoordinates {
  lat: number,
  lng: number,
}

const DEFAULT_ATTR = 'default';
const GEOCODER_PROXIMITY: number = 100;
const HIDDEN_ATTR = 'hidden';
const LOADING_ATTR = 'loading';
const LOCAL_STORAGE_ITEM = 'location';
const LOCATION_ATTR = 'location';
const RESTORE_ATTR = 'restore';

/**
 * Custom element that gets the user's location either via text input or via
 * the Geolocation API and a reverse geocoding API to convert lat/lng
 * coordinates to a named location.
 */
export class UserLocation extends HTMLElement {
  private dateUtils: DateUtils;
  private defaultLocation: string;
  private form: HTMLFormElement;
  private geolocationButton: HTMLButtonElement;
  private hasSetup: boolean;
  private input: HTMLInputElement;
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
    this.form.addEventListener('submit', (e: Event) => {
      e.preventDefault();
      const newLocation = this.input.value;
      if (newLocation !== this.location) {
        this.location = newLocation;
        this.update();
        this.input.blur();
      }
    });

    // Clear the input and focus it when the reset icon/button is clicked.
    this.form.addEventListener('reset', (e: Event) => {
      e.preventDefault();
      this.input.value = '';
      this.input.focus();
    });

    // Restore previous location if input is empty when blurred and hide
    // the geolocation button.
    this.input.addEventListener('blur', () => {
      if (this.input.value === '') {
        this.restore();
      }
    });

    // Get user's location when geolocation button is clicked.
    this.geolocationButton.addEventListener('click', (e: Event) => {
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
    this.input.value = 'Retrieving location...';

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
      this.input.value = this.location;
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
    this.input.value = this.previousLocation;
  }

  /**
   * Shows geolocation button if browser supports Geolocation API.
   */
  private enableGeolocation() {
    if (navigator.geolocation) {
      this.geolocationButton.removeAttribute(HIDDEN_ATTR);
    }
  }

  /**
   * Renders HTML form element for user's location and sets references to
   * form elements.
   */
  private render() {
    const template = require('./user_location.pug');
    this.innerHTML = template({location: this.location});

    this.form = this.querySelector('form');
    this.input = this.querySelector('input');
    this.geolocationButton = this.querySelector('#find');
  }
}

customElements.define('user-location', UserLocation);
