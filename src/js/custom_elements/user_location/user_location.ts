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
      </form>
    `;

    this.form = <HTMLFormElement>this.querySelector('form');
    this.input = <HTMLInputElement>this.querySelector('input');
  }
}

customElements.define('user-location', UserLocation);
