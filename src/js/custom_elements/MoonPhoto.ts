import {Attribute} from '../modules/Constants';
import Spinner from 'spin';

// Value is coordinated with loop value in 'src/stylus/moon/photo.styl'
const MOONPHASE_IMAGE_COUNT: number = 26;

const SPINNER_DELAY_MS: number = 1000;

const SpinnerOptions: {} = {
  color: '#fff',
  length: 8,
  lines: 12,
  radius: 8,
  width: 3,
};

enum Image {
  PATH_1X = '/img/moon-phases-26-240.min.jpg',
  PATH_2X = '/img/moon-phases-26-480.min.jpg',
}

class MoonPhoto extends HTMLElement {
  private imageLoaded_: boolean;
  private illumination_: number;
  private percent_: number;
  private phase_: string;
  private spinner_: Spinner;

  constructor() {
    super();
    this.imageLoaded_ = false;
    this.spinner_ = new Spinner(SpinnerOptions);
  }

  static get observedAttributes(): string[] {
    return [Attribute.ILLUMINATION, Attribute.PERCENT, Attribute.PHASE];
  }

  attributeChangedCallback(): void {
    this.render_();
  }

  /** 
   * Renders a photo of the current moon phase.
   */
  private render_(): void {
    this.illumination_ = parseInt(this.getAttribute(Attribute.ILLUMINATION));
    this.percent_ = parseInt(this.getAttribute(Attribute.PERCENT));
    this.phase_ = this.getAttribute(Attribute.PHASE);

    if (!this.illumination_ || !this.phase_ || !this.percent_) {
      return;
    }

    const ready = this.imageLoaded_ ? Attribute.READY : '';
    const html = `\      
      <div class="${this.className}__frame">\
        <figure class="${this.className}__figure">\
          <img class="${this.className}__image" \
                src="${Image.PATH_1X}" \
                srcset="${Image.PATH_1X} 1x, ${Image.PATH_2X} 2x" \
                alt="${this.phase_}${this.illuminationCaption_()}" \
                frame="${this.spriteFrame_()}"
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

export {MoonPhoto};