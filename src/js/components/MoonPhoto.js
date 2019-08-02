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

/** @const {string} */
const PERCENT_ATTR = 'percent';

/** @const {string} */
const PHASE_ATTR = 'phase';

/** @class */
class MoonPhoto extends HTMLElement {
  constructor() {
    super();

    /** @private {string} */
    this.percent_ = '';

    /** @private {string} */
    this.phase_ = '';
  }

  static get observedAttributes() {
    return [PERCENT_ATTR, PHASE_ATTR];
  }

  /** @callback */
  attributeChangedCallback() {
    this.render_();
  }

  /** 
   * Renders/updates photo of the current moon phase.
   * @private
   */
  render_() {
    this.percent_ = this.getAttribute(PERCENT_ATTR);
    this.phase_ = this.getAttribute(PHASE_ATTR);

    if (!this.phase_ || !this.percent_) {
      return;
    }

    // TODO: (?) Provide a description in the 'alt' attribute.
    // TODO: Remove 'ready' attribute on figure after preloader is wired up.
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
    
    this.innerHTML += html.replace(/\s\s/g, '');

    // TODO: Attach <preloader> custom element.
    // this.preloader_.preload();
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
}

export { MoonPhoto };
