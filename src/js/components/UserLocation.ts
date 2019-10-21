import { Attribute } from '../modules/Constants';
import { EventType } from '../modules/EventHandler';
import { Helpers } from '../modules/Helpers';

interface UserCoordinates {
  lat: number,
  lng: number,
}

const GEOCODER_PROXIMITY: number = 100;

class UserLocation extends HTMLElement {
  private formEl_: HTMLFormElement;
  private geolocationButtonEl_: HTMLButtonElement;
  private hasSetup_: boolean;
  private helpers_: any;
  private inputEl_: HTMLInputElement;
  private location_: string;
  private previousLocation_: string;

  constructor() {
    super();
    this.helpers_ = new Helpers();
    this.hasSetup_ = false;
  }

  static get observedAttributes(): string[] {
    return [Attribute.LOCATION, Attribute.RESTORE];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (name === Attribute.RESTORE) {
      this.restore_();
    }

    if (name === Attribute.LOCATION && !this.hasSetup_) {
      this.location_ = this.getAttribute(Attribute.LOCATION);
      this.previousLocation_ = this.location_;
      this.render_();
      this.enableGeolocation_();
      this.addListeners_();
      this.hasSetup_ = true;
    }
  }

  /**
   * Updates location widget with user-provided location if it has changed.
   */
  private addListeners_(): void {
    // Get new location on submit, blur the input, and update the attribute
    // to trigger App.update().
    this.formEl_.addEventListener(EventType.SUBMIT, (e) => {
      e.preventDefault();
      const newLocation = this.inputEl_.value;
      if (newLocation !== this.location_) {
        this.location_ = newLocation;
        this.update_();
        this.inputEl_.blur();
      }
    });

    // Clear the input and focus it when the reset icon/button is clicked.
    this.formEl_.addEventListener(EventType.RESET, (e) => {
      e.preventDefault();
      this.inputEl_.value = '';
      this.inputEl_.focus();
    });

    // Only show geolocation button on input focus.
    this.inputEl_.addEventListener(EventType.FOCUS, () => {
      this.geolocationButtonEl_.setAttribute(Attribute.ENABLED, '');
    });

    // Restore previous location if input is empty when blurred and hide
    // the geolocation button.
    this.inputEl_.addEventListener(EventType.BLUR, () => {
      if (this.inputEl_.value === '') {
        this.restore_();
      }
      this.geolocationButtonEl_.removeAttribute(Attribute.ENABLED);
    });

    // Get user's location when geolocation button is clicked.
    this.geolocationButtonEl_.addEventListener(EventType.CLICK, (e) => {
      e.preventDefault();
      this.getGeolocation_();
    });
  }

  /**
   * Fetches human-friendly location based on geo coordinates provided by the
   * Geolocation API.
   */
  private async getGeolocation_(): Promise<any> {
    document.body.setAttribute(Attribute.LOADING, '');
    this.inputEl_.value = 'Retrieving location...';

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };
  
    // Alert user and restore input with previous location.
    const error = () => {
      alert(`Uh oh. We were unable to retrieve your location. :(\n\nYou may need to enable Location Services on your device before you can use this feature.`);
      this.restore_();
      document.body.removeAttribute(Attribute.LOADING);
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
   */
  private async reverseGeocode_(coords: UserCoordinates): Promise<any> {
    const { lat, lng } = coords;
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
      this.location_ = `${address.City}, ${address.State}`;
      this.previousLocation_ = this.location_;
      this.inputEl_.value = this.location_;
      this.update_();

      document.body.removeAttribute(Attribute.LOADING);
    } catch (e) {
      alert('Currently unable to fetch data. :(');
    }
  }

  /**
   * Updates the URL with new location and changes the 'location' attribute to
   * trigger App.update().
   */
  private update_(): void {
    const urlSegments = window.location.pathname.split('/');
    urlSegments.splice(-1, 1);
    urlSegments.push(this.helpers_.urlify(this.location_));
    history.pushState(null, null, urlSegments.join('/'));

    this.setAttribute(Attribute.LOCATION, this.location_);
  }

  /**
   * Restores previous location.
   */
  private restore_(): void {
    this.location_ = this.previousLocation_;
    this.inputEl_.value = this.previousLocation_;
  }

  /**
   * Shows geolocation button if browser supports Geolocation API.
   */
  private enableGeolocation_(): void {
    if (navigator.geolocation) {
      this.geolocationButtonEl_.removeAttribute(Attribute.HIDDEN);
    }
  }

  /**
   * Renders HTML form element for user's location and sets references to
   * form elements.
   */
  private render_(): void {
    const html = `\      
      <form class="location__form">\
        <input name="location" value="${this.location_}" type="text" \
          aria-label="Type a new location" required>\
        <button type="submit" role="button" aria-label="Update location">\
          ${this.svgIcon_('submit')}\
        </button>\
        <button type="reset" role="button" aria-label="Clear location">\
          ${this.svgIcon_('reset')}\
      </form>\
      <button class="geolocation" role="button" \
        aria-label="Find my location" hidden>\
        ${this.svgIcon_('location')}\
      </button>\
    `;
    this.innerHTML = html.replace(/\s\s/g, '');

    this.formEl_ = this.querySelector('form');
    this.inputEl_ = this.querySelector('input');
    this.geolocationButtonEl_ = this.querySelector('button.geolocation');
  }

  /**
   * Returns a rendered inline SVG icon.
   */
  private svgIcon_(name: string): string {
    let svgPath: string;

    switch (name) {
      case 'location':
        svgPath = 'M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z';
        break;
      case 'reset':
        svgPath = 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z';
        break;
      case 'submit':
        svgPath = 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z';
        break;
    }

    const html = `\
      <svg class="icon icon--${name}" viewBox="0 0 24 24">\
        <path d="${svgPath}/">\
      </svg>\
    `;

    return html.replace(/\s\s/g, '');
  }
}

export { UserLocation };
