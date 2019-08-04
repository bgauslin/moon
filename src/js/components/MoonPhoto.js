import { Attribute } from '../modules/Constants';
import Spinner from 'spin';

/** @enum {string} */
const Image = {
  PATH_1X: '/img/moon-phases-26-240.min.jpg',
  PATH_2X: '/img/moon-phases-26-480.min.jpg',
};

/**
 * NOTE: This value must stay coordinated with loop in 'src/stylus/moon/photo.styl'
 * @const {number}
 */
const MOONPHASE_IMAGE_COUNT = 26;

/** @const {number} */
const SPINNER_DELAY_MS = 1000;

/** @const {Object} */
const SpinnerOptions = {
  color: '#fff',
  length: 8,
  lines: 12,
  radius: 8,
  width: 3,
};

/** @class */
class MoonPhoto extends HTMLElement {
  constructor() {
    super();

    /** @private {boolean} */
    this.imageLoaded_ = false;

    /** @private {string} */
    this.percent_ = '';

    /** @private {string} */
    this.phase_ = '';

    /** @private {instance} */
    this.spinner_ = new Spinner(SpinnerOptions);
  }

  static get observedAttributes() {
    return [Attribute.PERCENT, Attribute.PHASE];
  }

  /** @callback */
  attributeChangedCallback() {
    this.render_();
  }

  /** 
   * Renders a photo of the current moon phase.
   * @private
   */
  render_() {
    this.percent_ = this.getAttribute(Attribute.PERCENT);
    this.phase_ = this.getAttribute(Attribute.PHASE);

    if (!this.phase_ || !this.percent_) {
      return;
    }

    const ready = this.imageLoaded_ ? Attribute.READY : '';
    const html = `\      
      <div class="${this.className}__frame">\
        <figure class="${this.className}__figure">\
          <img class="${this.className}__image" \
                src="${Image.PATH_1X}" \
                srcset="${Image.PATH_1X} 1x, ${Image.PATH_2X} 2x" \
                alt="${this.phase_}${this.illumination_()}" \
                frame="${this.imageNumber_()}"
                ${ready}>\
        </figure>\
      </div>\
    `;
    
    this.innerHTML = html.replace(/\s\s/g, '');

    if (!this.imageLoaded_) {
      this.preloadImage_();
    }
  }

  /**
   * Returns moon phase photo sprite's position.
   * @return {number}
   * @private
   */
  imageNumber_() {
    let imageNumber;

    switch (this.phase_.toUpperCase()) {
      case 'WAXING CRESCENT':
      case 'WAXING GIBBOUS':
      case 'WANING CRESCENT':
      case 'WANING GIBBOUS':
        imageNumber = Math.round((this.percent_ / 100) * MOONPHASE_IMAGE_COUNT);
        break;
      case 'FIRST QUARTER':
        imageNumber = 6;
        break;
      case 'FULL MOON':
        imageNumber = 13;
        break;
      case 'LAST QUARTER':
        imageNumber = 18;
        break;
      case 'NEW MOON':
        imageNumber = MOONPHASE_IMAGE_COUNT;
        break;
    }
    return (imageNumber === 0) ? MOONPHASE_IMAGE_COUNT : imageNumber;
  }

  /**
   * Determines moon's illumination based on percentage.
   * @return {string}
   * @private
   */
  illumination_() {
    let illumination;
    switch (this.phase_.toUpperCase()) {
      case 'NEW MOON':
        illumination = 0;
        break;
      case 'WAXING CRESCENT':      
      case 'WAXING GIBBOUS':
        illumination = this.percent_ * 2;
        break;
      case 'FIRST QUARTER':
      case 'LAST QUARTER':
        illumination = 50;
        break;
      case 'FULL MOON':
        illumination = 100;
        break;
      case 'WANING GIBBOUS':
      case 'WANING CRESCENT':
        illumination = (100 - this.percent_) * 2;
        break;
    }

    return (illumination > 0) ? ` (${illumination}% illumination)` : '';
  }

  /**
   * Attaches/removes a loading spinner and 'ready' attribute based on whether
   * or not the image is fully loaded.
   * @private 
   */
  preloadImage_() {
    const imageEl = this.querySelector('img');

    imageEl.onload = () => {
      imageEl.setAttribute(Attribute.READY, '');
      this.spinner_.stop();
      this.imageLoaded_ = true;
    };

    window.setTimeout(() => {
      if (!imageEl.hasAttribute(Attribute.READY)) {
        this.spinner_.spin();
        this.appendChild(this.spinner_.el);
      }
    }, SPINNER_DELAY_MS);
  }
}

export { MoonPhoto };
