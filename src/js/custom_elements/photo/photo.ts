import Spinner from 'spin';

// [1] MOONPHASEIMAGE_COUNT value is same as loop value in 'photo.styl'
const ILLUMINATION_ATTR: string = 'illumination';
const MOONPHASEIMAGE_COUNT: number = 26; // [1]
const PERCENT_ATTR: string = 'percent';
const PHASE_ATTR: string = 'phase';
const READY_ATTR: string = 'ready';
const SPINNERDELAY_MS: number = 1000;

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
export class MoonPhoto extends HTMLElement {
  private imageLoaded: boolean;
  private spinner: Spinner;
  private template: any;

  constructor() {
    super();
    this.imageLoaded = false;
    this.spinner = new Spinner(SpinnerOptions);
    this.template = require('./photo.pug');
  }

  static get observedAttributes(): string[] {
    return [ILLUMINATION_ATTR, PERCENT_ATTR, PHASE_ATTR];
  }

  attributeChangedCallback() {
    this.render();
  }

  /** 
   * Renders a photo of the current moon phase.
   */
  private render() {
    const illumination = parseInt(this.getAttribute(ILLUMINATION_ATTR));
    const percent = parseInt(this.getAttribute(PERCENT_ATTR));
    const phase = this.getAttribute(PHASE_ATTR);

    if (illumination && percent && phase) {
      const currentFrame = Math.round((percent / 100) * MOONPHASEIMAGE_COUNT);
      const frame = currentFrame === 0 ? MOONPHASEIMAGE_COUNT : currentFrame;

      this.innerHTML = this.template({
        frame,
        illumination,
        phase,
        ready: this.imageLoaded
      });
    }

    if (!this.imageLoaded) {
      this.preloadImage();
    }
  }

  /**
   * Attaches/removes a loading spinner and 'ready' attribute based on whether
   * or not the image is fully loaded.
   */
  private preloadImage() {
    const image = this.querySelector('img');

    if (image) {
      image.onload = () => {
        image.setAttribute(READY_ATTR, '');
        this.spinner.stop();
        this.imageLoaded = true;
      };

      window.setTimeout(() => {
        if (!image.hasAttribute(READY_ATTR)) {
          this.spinner.spin();
          this.appendChild(this.spinner.el);
        }
      }, SPINNERDELAY_MS);
    }
  }
}

customElements.define('moon-photo', MoonPhoto);