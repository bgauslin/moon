import { Attribute } from '../modules/Constants';
import Spinner from 'spin';

/** @enum {string} */
const Image = {
  PATH_1X: '/img/moon-phases-26-240.min.jpg',
  PATH_2X: '/img/moon-phases-26-480.min.jpg',
};

/** @const {number} */
// NOTE: Keep value coordinated with loop in 'src/stylus/moon/photo.styl'
const MOONPHASE_IMAGE_COUNT = 26;

/** @const {number} */
const SPINNER_DELAY = 1000;

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

    /** @private {string} */
    this.percent_ = '';

    /** @private {string} */
    this.phase_ = '';

    /** @private {Element} */
    this.figureEl_ = null;

    /** @private {Element} */
    this.imageEl_ = null;

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
   * Renders/updates photo of the current moon phase.
   * @private
   */
  // TODO(moon-photo): Only call render_() once; then call new update_() method
  // thereafter that only modifies what it needs to.
  render_() {
    this.percent_ = this.getAttribute(Attribute.PERCENT);
    this.phase_ = this.getAttribute(Attribute.PHASE);

    if (!this.phase_ || !this.percent_) {
      return;
    }

    // TODO(moon-photo): Provide a description in the 'alt' attribute.
    // TODO(moon-photo): Remove 'ready' attribute from <figure> after preloader is wired up.
    const html = `\      
      <div class="${this.className}__frame">\
        <figure class="${this.className}__figure" ready>\
          <img class="${this.className}__image" \
                src="${Image.PATH_1X}" \
                srcset="${Image.PATH_1X} 1x, ${Image.PATH_2X} 2x" \
                alt="" \
                frame="${this.imageNumber_()}">\
        </figure>\
      </div>\
    `;
    
    this.innerHTML = html.replace(/\s\s/g, '');

    // TODO(moon-photo): Wire up spinner and preload_() method.
    this.figureEl_ = this.querySelector('figure');
    this.imageEl_ = this.querySelector('img');
    // this.preload_();
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
   * Attaches/removes a loading spinner based on whether or not
   * an image's figure wrapper has a 'ready' attribute.
   * @private 
   */
  preload_() {
    let img = new Image();
    img = this.imageEl_;
    img.onload = () => {
      this.figureEl_.setAttribute(Attribute.READY, '');
      this.spinner_.stop();
    };

    window.setTimeout(() => {
      if (!this.figureEl_.hasAttribute(Attribute.READY)) {
        this.spinner_.spin();
        this.appendChild(this.spinner_.el);
      }
    }, SPINNER_DELAY);
  }
}

export { MoonPhoto };
