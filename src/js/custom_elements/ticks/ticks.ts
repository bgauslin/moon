import {Chart} from '../../modules/Constants';

interface Tick {
  start: number,
  end: number,
}

/**
 * Renders an SVG containing grouped lines.
 */
class MoonTicks extends HTMLElement {
  private angle: number;
  private center: number = Chart.MARGIN + (Chart.SIZE / 2);
  private divisions: number = 24;
  private hourTick: Tick;
  private outerTick: Tick;
  private sweepTick: Tick;
  private viewbox: number = Chart.SIZE + (Chart.MARGIN * 2);

  constructor() {
    super();

    this.angle = 360 / this.divisions;
    this.hourTick = {
      start: Chart.MARGIN,
      end: Chart.MARGIN - (Chart.SWEEP_WIDTH / 4),
    };
    this.outerTick = {
      start: 0,
      end: Chart.MARGIN,
    };
    this.sweepTick = {
      start: Chart.MARGIN,
      end: Chart.MARGIN + Chart.SWEEP_WIDTH,
    };
  }

  connectedCallback() {
    const sweepTicks = this.ticks(this.sweepTick, true);
    const majorTicks = this.ticks(this.outerTick, true);
    const minorTicks = this.ticks(this.hourTick);
    
    const groups = [
      {id: 'sweep-ticks', lines: sweepTicks},
      {id: 'major-ticks', lines: majorTicks},
      {id: 'minor-ticks', lines: minorTicks},
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
      <svg viewbox="0 0 ${this.viewbox} ${this.viewbox}" aria-hidden="true">
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
}

customElements.define('moon-ticks', MoonTicks);
