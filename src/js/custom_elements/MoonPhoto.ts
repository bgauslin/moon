import Spinner from 'spin';

// [1] MOONPHASEIMAGE_COUNT value is same as loop value in 'photo.styl'

const ILLUMINATION_ATTR: string = 'illumination';
const IMAGE_PATH_1X: string = '/img/moon-phases-26-240.min.jpg';
const IMAGE_PATH_2X: string = '/img/moon-phases-26-480.min.jpg';
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
  private illumination: number;
  private imageLoaded: boolean;
  private percent: number;
  private phase: string;
  private spinner: Spinner;

  constructor() {
    super();
    this.imageLoaded = false;
    this.spinner = new Spinner(SpinnerOptions);
  }

  static get observedAttributes(): string[] {
    return [ILLUMINATION_ATTR, PERCENT_ATTR, PHASE_ATTR];
  }

  attributeChangedCallback(): void {
    this.render();
  }

  /** 
   * Renders a photo of the current moon phase.
   */
  private render(): void {
    this.illumination = parseInt(this.getAttribute(ILLUMINATION_ATTR));
    this.percent = parseInt(this.getAttribute(PERCENT_ATTR));
    this.phase = this.getAttribute(PHASE_ATTR);

    if (!this.illumination || !this.phase || !this.percent) {
      return;
    }

    const ready = this.imageLoaded ? READY_ATTR : '';
    const html = `\      
      <div class="${this.className}__frame">\
        <figure class="${this.className}__figure">\
          <img class="${this.className}__image" \
                src="${IMAGE_PATH_1X}" \
                srcset="${IMAGE_PATH_1X} 1x, ${IMAGE_PATH_2X} 2x" \
                alt="${this.phase}${this.illuminationCaption()}" \
                frame="${this.spriteFrame()}" \
                ${ready}>\
        </figure>\
      </div>\
    `;
    
    this.innerHTML = html.replace(/\s\s/g, '');

    if (!this.imageLoaded) {
      this.preloadImage();
    }
  }

  /**
   * Returns moon phase photo sprite's position based on percent relative to
   * number of frames in the sprite.
   */
  private spriteFrame(): number {
    const frame: number = Math.round((this.percent / 100) * MOONPHASEIMAGE_COUNT);
    return (frame === 0) ? MOONPHASEIMAGE_COUNT : frame;
  }

  /**
   * Returns illumination value as text if it's greater than 0.
   */
  private illuminationCaption(): string {
    return (this.illumination > 0) ? ` (${this.illumination}% illumination)` : '';
  }

  /**
   * Attaches/removes a loading spinner and 'ready' attribute based on whether
   * or not the image is fully loaded.
   */
  private preloadImage(): void {
    const imageEl = this.querySelector('img');

    imageEl.onload = () => {
      imageEl.setAttribute(READY_ATTR, '');
      this.spinner.stop();
      this.imageLoaded = true;
    };

    window.setTimeout(() => {
      if (!imageEl.hasAttribute(READY_ATTR)) {
        this.spinner.spin();
        this.appendChild(this.spinner.el);
      }
    }, SPINNERDELAY_MS);
  }
}
