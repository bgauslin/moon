/**
 * Custom element that renders a photo for the current moon phase. The image
 * is a reponsive sprite containing all of the moon phases and the custom
 * element adjusts the vertical position of the sprite to show the moon phase
 * via a numeric 'frame' attribute.
 */
class MoonPhoto extends HTMLElement {
  private image: HTMLImageElement;
  private imageCount: number
  private imageLoaded: boolean;

  constructor() {
    super();
    this.imageCount = 26; // Property should match CSS [frame] max.
    this.imageLoaded = false;
  }

  static get observedAttributes(): string[] {
    return ['percent'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.update();
  }

  private render() {
    const imagePath1x = '/img/moon-phases-26-240.min.jpg';
    const imagePath2x = '/img/moon-phases-26-480.min.jpg';

    this.innerHTML = `<img  alt="" src="${imagePath1x}" srcset="${imagePath1x} 1x, ${imagePath2x} 2x">`;
    this.image = <HTMLImageElement>this.querySelector('img');

    if (!this.imageLoaded) {
      this.image.dataset.loading = '';
      this.image.onload = () => {
        delete this.image.dataset.loading;
        this.imageLoaded = true;
      };
    }
  }

  private update() {
    const percent = Number(this.getAttribute('percent'));    
    const currentFrame = Math.round((percent / 100) * this.imageCount);
    const frame = (currentFrame === 0) ? this.imageCount : currentFrame;

    this.setAttribute('frame', `${frame}`);
  }
}

customElements.define('moon-photo', MoonPhoto);
