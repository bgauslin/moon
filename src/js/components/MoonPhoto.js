import { Attribute } from '../modules/Constants';
import Spinner from 'spin';

/** @enum {string} */
const Image = {
  PATH_1X: '/img/moon-phases-26-240.min.jpg',
  PATH_2X: '/img/moon-phases-26-480.min.jpg',
};

/**
 * NOTE: Keep value coordinated with loop in 'src/stylus/moon/photo.styl'
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
    this.imagesLoaded_ = false;

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
   * Renders photo of the current moon phase. Subsequent attribute changes call
   * this.update_().
   * @private
   */
  render_() {
    this.percent_ = this.getAttribute(Attribute.PERCENT);
    this.phase_ = this.getAttribute(Attribute.PHASE);

    if (!this.phase_ || !this.percent_) {
      return;
    }

    // TODO(moon-photo): Calculate percent visible and add it to 'alt' attribute.
    const ready = this.imagesLoaded_ ? Attribute.READY : '';
    const html = `\      
      <div class="${this.className}__frame">\
        <figure class="${this.className}__figure">\
          <img class="${this.className}__image" \
                src="${Image.PATH_1X}" \
                srcset="${Image.PATH_1X} 1x, ${Image.PATH_2X} 2x" \
                alt="${this.phase_}" \
                frame="${this.imageNumber_()}"
                ${ready}>\
        </figure>\
      </div>\
    `;
    
    this.innerHTML = html.replace(/\s\s/g, '');

    if (!this.imagesLoaded_) {
      this.preloadImages_();
    }
  }

  /**
   * Returns moon phase photo sprite's position and the image's 'alt' attribute.
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
   * Attaches/removes a loading spinner and 'ready' attribute based on whether
   * or not images are fully loaded.
   * @private 
   */
  preloadImages_() {
    const imageEl = this.querySelector('img');

    imageEl.onload = () => {
      imageEl.setAttribute(Attribute.READY, '');
      this.spinner_.stop();
      this.imagesLoaded_ = true;
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
