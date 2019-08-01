/**
 * @typedef {Object} MoonPhaseImage
 * @property {number} imageNumber - Moon phase photo sprite's position.
 * @property {string} alt - Text content for image 'alt' attribute.
 */

/** @enum {string} */
const Image = {
  PATH_1X: '/img/moon-phases-26-240.min.jpg',
  PATH_2X: '/img/moon-phases-26-480.min.jpg',
};

/**
 * NOTE: Keep value coordinated with loop in 'source/stylus/moon/photo.styl'
 * @const {number} 
 */
const MOONPHASE_IMAGE_COUNT = 26;

/** @class */
class MoonPhoto extends HTMLElement {
  constructor() {
    super();

    /** @private {string} */
    // this.description_ = this.getAttribute('description');

    /** @private {string} */
    // this.hemisphere_ = this.getAttribute('hemisphere');

    /** @private {string} */
    // this.phase_ = this.getAttribute('phase');

    /** @private {number} */
    this.imageFrame_ = 0;
  }

  static get observedAttributes() {
    return ['description', 'hemisphere', 'phase'];
  }

  /** @callback */
  connectedCallback() {
    // this.render_();
  }

  /** @callback */
  attributeChangedCallback() {
    // this.update_();
  }

  /** 
   * Renders/updates photo of the current moon phase.
   * @private
   */
  render_() {
    // TODO: Set 'description', 'phase', and 'hemisphere' on the element, then
    // let the custom element do the 'imageFrame' calculation based on 'phase'.

    // TODO: Make first line of html below the html for this custom element.
    const html = `\      
      <div class="${this.className}__frame">\
        <figure class="${this.className}__figure">\
          <img class="${this.className}__image" \
                src="${Image.PATH_1X}" \
                srcset="${Image.PATH_1X} 1x, ${Image.PATH_2X} 2x" \
                alt="${this.description_}" \
                frame="${imageNumber}">\
        </figure>\
      </div>\
    `;
    
    this.innerHTML += html.replace(/\s\s/g, '');

    // TODO: Attach <preloader> custom element.
    // this.preloader_.preload();
  }

  /** @private */
  update_() {
    const imageEl = this.querySelector('img');
    imageEl.setAttribute('alt', this.description_);
    imageEl.setAttribute('frame', this.imageFrame_);
  }

  /** @private */
  calculateImageFrame_() {
    return;
  }

  /**
   * Returns moon phase photo sprite's position and the image's 'alt' attribute.
   * @return {MoonPhaseImage}
   * @private
   */
  imageNumber_() {
    let imageNumber;

    switch (this.moonPhase_.toUpperCase()) {
      case 'WAXING CRESCENT':
      case 'WAXING GIBBOUS':
      case 'WANING CRESCENT':
      case 'WANING GIBBOUS':
        // TODO: Calculate percentage here, or set it as an attribute elsewhere?
        imageNumber = Math.round((this.currentMoonPhasePercentage_() / 100) * MOONPHASE_IMAGE_COUNT);
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
