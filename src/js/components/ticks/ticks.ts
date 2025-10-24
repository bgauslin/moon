import {chart} from '../chart/chart';


interface Tick {
  start: number,
  end: number,
}

/**
 * Custom eleent that renders an SVG containing grouped lines. That's it.
 */
customElements.define('moon-ticks', class extends HTMLElement {
  private angle: number;
  private center: number;
  private divisions: number = 24;
  private major: Tick;
  private minor: Tick;
  private size: number = chart.size + (chart.margin * 2);
  private sweep: Tick;

  constructor() {
    super();
    this.setProperties();
  }

  connectedCallback() {
    this.render();
  }

  private setProperties() {
    const {margin, sweep} = chart;

    this.angle = 360 / this.divisions;
    this.center = this.size / 2;
    this.major = {
      start: 0,
      end: margin,
    };
    this.minor = {
      start: margin,
      end: margin - (sweep / 4),
    };
    this.sweep = {
      start: margin,
      end: margin + sweep,
    };
  }

  private render() {
    const groups = [
      {id: 'sweep-ticks', lines: this.ticks(this.sweep, true)},
      {id: 'major-ticks', lines: this.ticks(this.major, true)},
      {id: 'minor-ticks', lines: this.ticks(this.minor)},
    ];
    let html = '';

    for (const group of groups) {
      const {id, lines} = group;
      html += `<g id="${id}">`;

      for (const line of lines) {
        const {x1, y1, x2, y2, transform} = line;
        const attr = transform ? `transform="${transform}"` : '';
        html += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${attr}/>`;    
      }
      html += '</g>';
    }

    this.innerHTML = `
      <svg aria-hidden="true" viewbox="0 0 ${this.size} ${this.size}">
        ${html}
      </svg>
    `;
  }

  /**
   * Generates an array of coordinates for rendering SVG <line> elements.
   * By default, a line for each hour is rendered unless the lines are 'major',
   * which only renders a line every 90 degrees.
   */
  private ticks(tick: Tick, major: boolean = false) {
    const {start, end} = tick;
    const ticks = [];

    for (let i = 1; i <= this.divisions; i++) {
      const degrees = i * this.angle;
      if (major && degrees % 90 === 0 ||
          !major && degrees % 90 !== 0) {
        const newLine = {
          x1: this.center,
          y1: start,
          x2: this.center,
          y2: end,
          transform: `rotate(${degrees}, ${this.center}, ${this.center})`,
        };
        ticks.push(newLine);
      }
    }
    return ticks;
  }
});
