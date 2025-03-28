/**
 * Custom element that renders a photo for the current moon phase when the
 * custom element's 'percent' attribute changes.
 */
class MoonPhoto extends HTMLElement {
  private image: HTMLImageElement;
  private imageCount: number = 26;
  private imagePath: string = 'https://gauslin.com/images/moon/';

  static get observedAttributes(): string[] {
    return ['percent'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'percent' && newValue !== oldValue) {
      this.updateImage(Number(newValue));
    }
  }

  /**
   * Converts a percentage to its corresponding integer within a range of
   * numbers whose maximum is less than 100, then renders that image.
   */
  updateImage(percent: number) {
    const currentFrame = Math.round((percent / 100) * this.imageCount);
    const frame = (currentFrame === 0) ? this.imageCount : currentFrame;

    if (this.image) {
      this.removeChild(this.image);
    }

    this.image = this.renderImage(frame);
    this.appendChild(this.image);

    window.requestAnimationFrame(() => {
      if (!this.image.complete) {
        this.image.dataset.loading = '';
        this.image.onload = () => {
          delete this.image.dataset.loading;
        }
      }
    });
  }

  /**
   * Helper function for rendering an image.
   */
  renderImage(frame: number) {
    const count = (frame < 10) ? `0${frame}` : frame;
    const image1x = `${this.imagePath}phase-${count}@1x.webp`;
    const image2x = `${this.imagePath}phase-${count}@2x.webp`;

    const image = document.createElement('img');
    image.alt = '';
    image.src = image1x;
    image.srcset = `${image1x} 1x, ${image2x} 2x`;
    image.height = 204;
    image.width = 204;

    return image;
  }
}

customElements.define('moon-photo', MoonPhoto);
