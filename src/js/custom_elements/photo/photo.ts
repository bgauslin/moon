// [1] MOONPHASEIMAGE_COUNT value is same as loop value in 'photo.scss'
const IMAGE_PATH_1X = '/img/moon-phases-26-240.min.jpg';
const IMAGE_PATH_2X = '/img/moon-phases-26-480.min.jpg';
const MOONPHASEIMAGE_COUNT: number = 26; // [1]
/**
 * Custom element that renders a photo for the current moon phase. The image
 * is a reponsive sprite containing all of the moon phases and the custom
 * element adjusts the vertical position of the sprite to show the moon phase.
 */
export class MoonPhoto extends HTMLElement {
  private imageLoaded: boolean;

  constructor() {
    super();
    this.imageLoaded = false;
  }

  static get observedAttributes(): string[] {
    return ['illumination', 'percent', 'phase'];
  }

  attributeChangedCallback() {
    this.render();
  }

  /** 
   * Renders a photo of the current moon phase.
   */
  private render() {
    const illumination = parseInt(this.getAttribute('illumination')!);
    const percent = parseInt(this.getAttribute('percent')!);
    const phase = this.getAttribute('phase');

    if (illumination && percent && phase) {
      const currentFrame = Math.round((percent / 100) * MOONPHASEIMAGE_COUNT);
      const frame = (currentFrame === 0) ? MOONPHASEIMAGE_COUNT : currentFrame;
      const alt = (illumination > 0) ? `${phase} (${illumination}% illumination)` : phase;

      this.innerHTML = `
        <img 
          alt="${alt}"
          src="${IMAGE_PATH_1X}"
          srcset="${IMAGE_PATH_1X} 1x, ${IMAGE_PATH_2X} 2x"
          frame="${frame}">
      `;

      if (!this.imageLoaded) {
        const image = this.querySelector('img')!;
        image.dataset.loading = '';
        image.onload = () => {
          delete image.dataset.loading;
          this.imageLoaded = true;
        };
      }
    }
  }
}

customElements.define('moon-photo', MoonPhoto);
