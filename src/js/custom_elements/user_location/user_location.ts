import {DateUtils} from '../../modules/DateUtils';

interface UserCoordinates {
  lat: number,
  lng: number,
}

const STORAGE_ITEM = 'location';

/**
 * Custom element that gets the user's location either via text input or via
 * the Geolocation API and a reverse geocoding API to convert lat/lng
 * coordinates to a named location.
 */
class UserLocation extends HTMLElement {
  private dateUtils: DateUtils;
  private defaultLocation: string;
  private form: HTMLFormElement;
  private geoButton: HTMLButtonElement;
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
    return ['location', 'restore'];
  }

  connectedCallback() {
    this.defaultLocation = this.getAttribute('default') || '';
    this.removeAttribute('default');
    this.setAttribute('location', this.initialLocation());
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'restore') {
      this.restore();
    }

    if (name === 'location' && !this.hasSetup) {
      this.location = this.getAttribute('location') || this.defaultLocation;
      this.previousLocation = this.location;
      this.render();
      this.addListeners();
      this.hasSetup = true;
    }
  }

  /**
   * Updates location widget with user-provided location if it has changed.
   */
  private addListeners() {
    // Get new location on submit, blur the input, and update the attribute
    // to trigger App.update().
    this.form.addEventListener('submit', (event: Event) => {
      event.preventDefault();
      const newLocation = this.input.value;
      if (newLocation !== this.location) {
        this.location = newLocation;
        this.update();
        this.input.blur();
      }
    });

    // Clear the input and focus it when the reset icon/button is clicked.
    this.form.addEventListener('reset', (event: Event) => {
      event.preventDefault();
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
    this.geoButton.addEventListener('click', () => this.getGeolocation());
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
      return localStorage.getItem(STORAGE_ITEM) || this.defaultLocation;
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

    history.replaceState(null, '', urlSegments.join('/'));
    this.setAttribute('location', this.location);

    // Save new location to localStorage.
    localStorage.setItem(STORAGE_ITEM, this.location);
  }

  /**
   * Restores previous location.
   */
  private restore() {
    this.location = this.previousLocation;
    this.input.value = this.previousLocation;
  }

  /**
   * Fetches human-friendly location based on geo coordinates provided by the
   * Geolocation API.
   */
  private async getGeolocation(): Promise<any> {
    this.input.value = 'Getting location...';

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };
  
    // Alert user and restore input with previous location.
    const error = () => {
      alert(`Uh oh. We were unable to retrieve your location. :(\n\nYou may need to enable Location Services on your device before you can use this feature.`);
      this.restore();
    }

    // Get user's location as city/state/country.
    const success = (position: any) => {
      this.reverseGeocode({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    }

    // Get user's current geolocation coordinates.
    navigator.geolocation.getCurrentPosition(success, error, options);
  }

  /**
   * Fetches human-friendly location based on geo coordinates via API.
   */
  private async reverseGeocode(coords: UserCoordinates): Promise<any> {
    const {lat, lng} = coords;
    const endpoint = `${process.env.GEOCODE_API}reverse?lat=${lat}&lon=${lng}&api_key=${process.env.GEOCODE_API_KEY}`;

    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      const {address} = data;
      const {city} = address;

      this.location = city;

      this.previousLocation = this.location;
      this.input.value = this.location;
      this.update();
    } catch (error) {
      console.warn('Currently unable to fetch data. :(');
    }
  }

  /**
   * Renders HTML form element for user's location and sets references to
   * form elements.
   */
  private render() {
    this.innerHTML = `
      <form>
        <input
          type="text"
          name="location"
          value="${this.location}"
          aria-label="Enter a new location"
          required>
        <button type="submit" aria-label="Update location"></button>
        <button type="reset" aria-label="Clear location">
          <svg viewbox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="6"/>
            <path d="M10,10 L14,14 M10,14 L14,10"/>
          </svg>
        </button>
        ${this.renderGeoButton()}
      </form>
    `;

    this.form = <HTMLFormElement>this.querySelector('form');
    this.input = <HTMLInputElement>this.querySelector('input');
    this.geoButton = <HTMLButtonElement>this.querySelector('[id="geo"]');
  }

  private renderGeoButton() {
    if (navigator.geolocation) {
      return `
        <button type="button" aria-label="Get location" id="geo">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12,2 v3 M22,12 h-3 M12,22 v-3 M2,12 h3 M5,12 A7 7 0 1 1 19,12 M5,12 A7 7 0 0 0 19,12"/>
            <circle cx="12" cy="12" r="2.5"/>
          </svg>
        </button>
      `;
    }
  }
}

customElements.define('user-location', UserLocation);
