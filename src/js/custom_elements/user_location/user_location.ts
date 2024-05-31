import {LitElement, html} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';

interface UserCoordinates {
  lat: number,
  lng: number,
}

/**
 * Custom element that gets the user's location either via text input or via
 * the Geolocation API and a reverse geocoding API to convert lat/lng
 * coordinates to a named location.
 */
@customElement('user-location')
class UserLocation extends LitElement {
  @property({attribute: 'location', reflect: true}) location: string;
  @query('input') input: HTMLInputElement;
  @state() previousLocation: string;

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.previousLocation = this.location;
  }

  private updateLocation(event: Event) {
    event.preventDefault();
    this.location = this.input.value;
    this.previousLocation = this.location;
    this.dispatchLocation();
  }

  private clearLocation(event: Event) {
    event.preventDefault();
    this.input.value = '';
    this.input.focus();
  }

  private restoreLocation() {
    if (this.input.value === '') {
      this.input.value = this.previousLocation;
    }
  }

  /**
   * Fetches human-friendly location based on geo coordinates provided by the
   * Geolocation API.
   */
  private getGeolocation() {
    this.progressBar(true);

    // Get user's location.
    const success = (position: any) => {
      this.reverseGeocode({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    }

    // Alert user and restore input with previous location.
    const error = () => {
      alert(`Uh oh. We were unable to retrieve your location. :(\n\nYou may need to enable Location Services on your device before you can use this feature.`);
      this.location = this.previousLocation;
      this.progressBar(false);
    }

    // Get user's current geolocation coordinates.
    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }); 
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

      this.dispatchLocation();
      this.progressBar(false);
    } catch (error) {
      console.warn('Currently unable to fetch data. :(');
    }
  }

  private dispatchLocation() {
    this.dispatchEvent(new CustomEvent('location', {
      bubbles: true,
      composed: true,
      detail: {
        location: this.location,
      }
    }));
  }

  private progressBar(enabled: boolean) {
    this.dispatchEvent(new CustomEvent('progress', {
      bubbles: true,
      composed: true,
      detail: {
        enabled: enabled,
      }
    }));
  }

  /**
   * Renders HTML form element for user's location and sets references to
   * form elements.
   */
  protected render() {
    return html`
      <form
        @reset="${this.clearLocation}"
        @submit="${this.updateLocation}">
        <input
          type="text"
          name="location"
          value="${this.location}"
          aria-label="Enter a location"
          required
          @blur="${this.restoreLocation}">
        <button type="submit" aria-label="Update location"></button>
        ${this.renderResetButton()}
        ${this.renderGeoButton()}
      </form>
    `;
  }

  private renderResetButton() {
    return html`
      <button type="reset" aria-label="Clear location">
        <svg viewbox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="6"/>
          <path d="M10,10 L14,14 M10,14 L14,10"/>
        </svg>
      </button>
    `;
  }

  private renderGeoButton() {
    if (navigator.geolocation) {
      return html`
        <button
          type="button"
          aria-label="Get location"
          id="geo"
          @click="${this.getGeolocation}">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12,2 v3 M22,12 h-3 M12,22 v-3 M2,12 h3 M5,12 A7 7 0 1 1 19,12 M5,12 A7 7 0 0 0 19,12"/>
            <circle cx="12" cy="12" r="2.5"/>
          </svg>
        </button>
      `;
    }
  }
}
