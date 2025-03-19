/**
 * Custom element that renders a photo for the current moon phase when the
 * custom element's 'percent' attribute changes.
 */
class MoonPhoto extends HTMLElement {
  private image: HTMLImageElement;
  private imageCount: number = 26;
  private imagePath: string = 'https://gauslin.com/images/moon/';
  private spinner: HTMLElement;

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
    const count = (frame < 10) ? `0${frame}` : frame;

    const image1x = `${this.imagePath}phase-${count}@1x.webp`;
    const image2x = `${this.imagePath}phase-${count}@2x.webp`;

    if (this.image) {
      this.removeChild(this.image);
    }

    this.image = document.createElement('img');
    this.image.alt = '';
    this.image.src = image1x;
    this.image.srcset = `${image1x} 1x, ${image2x} 2x`;
    this.image.height = 204;
    this.image.width = 204;

    this.appendChild(this.image);

    window.requestAnimationFrame(() => {
      if (!this.image.complete) {
        this.spinner = document.createElement('div');
        this.spinner.classList.add('spinner');
        this.appendChild(this.spinner);

        this.image.dataset.loading = '';
        this.image.onload = () => {
          delete this.image.dataset.loading;
          this.image.addEventListener('transitionend', () => {
            this.removeChild(this.spinner);
          });
        }
      }
    });
  }
}

customElements.define('moon-photo', MoonPhoto);
