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

  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue !== oldValue) {
      this.updateImage(newValue);
    }
  }

  /**
   * Converts a percentage to its corresponding integer within a range of
   * numbers whose maximum is less than 100, then renders that image.
   */
  updateImage(percent) {
    const currentFrame = Math.round((Number(percent) / 100) * IMAGE_COUNT);
    const frame = (currentFrame === 0) ? IMAGE_COUNT : currentFrame;
    const index = (frame < 10) ? `0${frame}` : frame;

    const image1x = `${IMAGE_PATH}phase-${index}@1x.webp`;
    const image2x = `${IMAGE_PATH}phase-${index}@2x.webp`;

    if (this.image) {
      this.removeChild(this.image);
    }

    this.image = document.createElement('img');
    this.image.alt = '';
    this.image.src = image1x;
    this.image.srcset = `${image1x} 1x, ${image2x} 2x`;
    this.image.width = 240;
    this.image.height = 240;

    this.appendChild(this.image);

    window.requestAnimationFrame(() => {
      if (!this.image.complete) {
        const spinner = document.createElement('div');
        spinner.classList.add('spinner');
        this.appendChild(spinner);

        this.image.dataset.loading = '';
        this.image.onload = () => {
          delete this.image.dataset.loading;
          this.image.addEventListener('transitionend', () => this.removeChild(spinner));
        }
      }
    });
  }
}

customElements.define('moon-photo', MoonPhoto);
