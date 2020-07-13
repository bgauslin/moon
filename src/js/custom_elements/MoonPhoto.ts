import Spinner from 'spin';

// [1] MOONPHASE_IMAGE_COUNT value is same as loop value in 'photo.styl'

const ILLUMINATION_ATTR: string = 'illumination';
const IMAGE_PATH_1X: string = '/img/moon-phases-26-240.min.jpg';
const IMAGE_PATH_2X: string = '/img/moon-phases-26-480.min.jpg';
const MOONPHASE_IMAGE_COUNT: number = 26; // [1]
const PERCENT_ATTR: string = 'percent';
const PHASE_ATTR: string = 'phase';
const READY_ATTR: string = 'ready';
const SPINNER_DELAY_MS: number = 1000;

const SpinnerOptions: {} = {
  color: '#fff',
  length: 8,
  lines: 12,
  radius: 8,
  width: 3,
};

/**
 * Custom element that renders a photo for the current moon phase. The image
 * is a reponsive sprite containing all of the moon phases and the custom
 * element adjusts the vertical position of the sprite to show the moon phase.
 */
class MoonPhoto extends HTMLElement {
  private illumination_: number;
  private imageLoaded_: boolean;
  private percent_: number;
  private phase_: string;
  private spinner_: Spinner;

  constructor() {
    super();
    this.imageLoaded_ = false;
    this.spinner_ = new Spinner(SpinnerOptions);
  }

  static get observedAttributes(): string[] {
    return [ILLUMINATION_ATTR, PERCENT_ATTR, PHASE_ATTR];
  }

  attributeChangedCallback(): void {
    this.render_();
  }

  /** 
   * Renders a photo of the current moon phase.
   */
  private render_(): void {
    this.illumination_ = parseInt(this.getAttribute(ILLUMINATION_ATTR));
    this.percent_ = parseInt(this.getAttribute(PERCENT_ATTR));
    this.phase_ = this.getAttribute(PHASE_ATTR);

    if (!this.illumination_ || !this.phase_ || !this.percent_) {
      return;
    }

    const ready = this.imageLoaded_ ? READY_ATTR : '';
    const html = `\      
      <div class="${this.className}__frame">\
        <figure class="${this.className}__figure">\
          <img class="${this.className}__image" \
                src="${IMAGE_PATH_1X}" \
                srcset="${IMAGE_PATH_1X} 1x, ${IMAGE_PATH_2X} 2x" \
                alt="${this.phase_}${this.illuminationCaption_()}" \
                frame="${this.spriteFrame_()}" \
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
   * Returns moon phase photo sprite's position based on percent relative to
   * number of frames in the sprite.
   */
  private spriteFrame_(): number {
    const frame: number = Math.round((this.percent_ / 100) * MOONPHASE_IMAGE_COUNT);
    return (frame === 0) ? MOONPHASE_IMAGE_COUNT : frame;
  }

  /**
   * Returns illumination value as text if it's greater than 0.
   */
  private illuminationCaption_(): string {
    return (this.illumination_ > 0) ? ` (${this.illumination_}% illumination)` : '';
  }

  /**
   * Attaches/removes a loading spinner and 'ready' attribute based on whether
   * or not the image is fully loaded.
   */
  private preloadImage_(): void {
    const imageEl = this.querySelector('img');

    imageEl.onload = () => {
      imageEl.setAttribute(READY_ATTR, '');
      this.spinner_.stop();
      this.imageLoaded_ = true;
    };

    window.setTimeout(() => {
      if (!imageEl.hasAttribute(READY_ATTR)) {
        this.spinner_.spin();
        this.appendChild(this.spinner_.el);
      }
    }, SPINNER_DELAY_MS);
  }
}

export {MoonPhoto};
