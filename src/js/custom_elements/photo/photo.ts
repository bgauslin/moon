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
    const index = (frame < 10) ? `0${frame}` : frame;

    const image = document.createElement('img');
    const image1x = `${IMAGE_PATH}phase-${index}@1x.webp`;
    const image2x = `${IMAGE_PATH}phase-${index}@2x.webp`;
    
    image.alt = '';
    image.src = image1x;
    image.srcset = `${image1x} 1x, ${image2x} 2x`;
    image.width = 240;
    image.height = 240;

    this.replaceChildren(image);

    // TODO(photo): Better image loading/preloading.
    image.dataset.loading = '';
    image.onload = () => delete image.dataset.loading;
  }
}

customElements.define('moon-photo', MoonPhoto);
