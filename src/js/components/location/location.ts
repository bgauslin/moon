import {LitElement, html} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';

/**
 * Custom element that sets a location via text input or geolocation.
 */
@customElement('moon-location')
class MoonLocation extends LitElement {
  @property({attribute: 'location', reflect: true}) location: string;
  @query('#geo') geoButton: HTMLButtonElement;
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
    this.input.blur();
    this.sendLocation();
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

  private getGeolocation() {
    this.sendProgress(true);
    this.input.value = 'Locating...';

    const success = async (position: any) => {
      const {latitude, longitude} = position.coords;
      const endpoint = `${process.env.GEOCODE_API}reverse?lat=${latitude}&lon=${longitude}&api_key=${process.env.GEOCODE_API_KEY}`;

      try {
        const response = await fetch(endpoint);
        const data = await response.json();
        const {address} = data;
        const {city} = address;
  
        this.location = city;
        this.previousLocation = this.location;
        this.input.value = this.location;
        this.geoButton.blur();
  
        // Wait a second so that the API doesn't complain.
        window.setTimeout(() => {
          this.sendLocation();
          this.sendProgress(false);
        }, 1000);       
      } catch (error) {
        console.warn('Currently unable to fetch data. :(');
        this.input.value = this.location;
        this.sendProgress(false);
      }
    }

    const error = () => {
      alert(`Uh oh. We were unable to retrieve your location. :(\n\nYou may need to enable Location Services on your device before you can use this feature.`);
      this.input.value = this.location;
      this.sendProgress(false);
    }

    const options = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    };

    navigator.geolocation.getCurrentPosition(success, error, options); 
  }

  private sendLocation() {
    this.dispatchEvent(new CustomEvent('location', {
      bubbles: true,
      composed: true,
      detail: {
        location: this.location,
      }
    }));
  }

  private sendProgress(enabled: boolean) {
    this.dispatchEvent(new CustomEvent('progress', {
      bubbles: true,
      composed: true,
      detail: {
        enabled: enabled,
      }
    }));
  }

  protected render() {
    const label = 'Enter a location';
    return html`
      <form
        @reset="${this.clearLocation}"
        @submit="${this.updateLocation}">
        <input
          aria-label="${label}"
          inputmode="search"
          title="${label}"
          type="text"
          value="${this.location}"
          required
          @blur="${this.restoreLocation}">
        <button
          aria-label="Update location"
          type="submit"></button>
        ${this.renderResetButton()}
        ${this.renderGeoButton()}
      </form>
    `;
  }

  private renderResetButton() {
    const label = 'Clear location';
    return html`
      <button
        aria-label="${label}"
        title="${label}"
        type="reset">
        <svg aria-hidden="true" viewbox="0 0 24 24">
          <circle cx="12" cy="12" r="6"/>
          <path d="M10,10 L14,14 M10,14 L14,10"/>
        </svg>
      </button>
    `;
  }

  private renderGeoButton() {
    if (navigator.geolocation) {
      const label = 'Get current location';
      return html`
        <button
          aria-label="${label}"  
          id="geo"
          title="${label}"
          type="button"
          @click="${this.getGeolocation}">
          <svg aria-hidden="true" viewbox="0 0 24 24">
            <path d="M12,2 v3 M22,12 h-3 M12,22 v-3 M2,12 h3 M5,12 A7 7 0 1 1 19,12 M5,12 A7 7 0 0 0 19,12"/>
            <circle cx="12" cy="12" r="2.5"/>
          </svg>
        </button>
      `;
    }
  }
}
