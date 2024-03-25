/**
 * Custom element that renders text for the moon phase and its percentage
 * relative to a full moon phase cycle.
 */
export class MoonInfo extends HTMLElement {

  constructor() {
    super();
  }

  static get observedAttributes(): string[] {
    return ['percent', 'phase'];
  }

  attributeChangedCallback() {
    const percent = this.getAttribute('percent');
    const phase = this.getAttribute('phase');
    if (percent && phase) {
      const visibility = (percent === '0') ? 'visibility="invisible"' : '';
      this.innerHTML = `
        <div id="phase">${phase}</div>
        <div id="percent" ${visibility}>
          ${percent}%
        </div>
      `;
    }
  }
}

customElements.define('moon-info', MoonInfo);
