/**
 * Custom element that renders a photo for the current moon phase. The image
 * is a reponsive sprite containing all of the moon phases and the custom
 * element adjusts the vertical position of the sprite to show the moon phase
 * via a numeric 'frame' attribute.
 */
class MoonPhoto extends HTMLElement {
  private imageCount: number

  constructor() {
    super();
    this.imageCount = 26; // Property should match CSS [frame] max.
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
    const imagePath = 'https://assets.gauslin.com/images/moon/';

    let html = '<figure>';
    for (let i = 1; i <= this.imageCount; i++) {
      const j = (i < 10) ? `0${i}` : i;
      const image1x = `${imagePath}phase-${j}@small.webp`;
      const image2x = `${imagePath}phase-${j}@medium.webp`;
      html += `<img alt="" src="${image1x}" srcset="${image1x} 1x, ${image2x} 2x">`;
    }
    html += '</figure>';

    this.innerHTML = html;
  }

  private update() {
    const percent = Number(this.getAttribute('percent'));    
    const currentFrame = Math.round((percent / 100) * this.imageCount);
    const frame = (currentFrame === 0) ? this.imageCount : currentFrame;

    this.setAttribute('frame', `${frame}`);
  }
}

customElements.define('moon-photo', MoonPhoto);
