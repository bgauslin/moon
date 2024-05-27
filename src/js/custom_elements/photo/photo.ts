/**
 * Custom element that renders a photo for the current moon phase when the
 * custom element's 'percent' attribute changes.
 */
const IMAGE_COUNT = 26;
const IMAGE_PATH = 'https://assets.gauslin.com/images/moon/';


class MoonPhoto extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['percent'];
  }

  /**
   * Converts a percentage to its corresponding integer within a range of
   * numbers whose maximum is less than 100, then renders that image.
   */
  attributeChangedCallback() {
    const percent = Number(this.getAttribute('percent')); 
   
    const currentFrame = Math.round((percent / 100) * IMAGE_COUNT);
    const frame = (currentFrame === 0) ? IMAGE_COUNT : currentFrame;
    const imageIndex = (frame < 10) ? `0${frame}` : frame;

    const image1x = `${IMAGE_PATH}phase-${imageIndex}@small.webp`;
    const image2x = `${IMAGE_PATH}phase-${imageIndex}@medium.webp`;

    this.innerHTML = `<img src="${image1x}" srcset="${image1x} 1x, ${image2x} 2x" alt="">`;
  }
}

customElements.define('moon-photo', MoonPhoto);
