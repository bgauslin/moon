import {Chart} from '../../modules/Constants';

interface Tick {
  start: number,
  end: number,
}

interface TickLine {
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  transform: string,
}

const HOUR_TICK: Tick = {  
  start: Chart.MARGIN,
  end: Chart.MARGIN - (Chart.SWEEP_WIDTH / 4),
};

const OUTER_TICK: Tick = {
  start: 0,
  end: Chart.MARGIN,
};

const SWEEP_TICK: Tick = {  
  start: Chart.MARGIN,
  end: Chart.MARGIN + Chart.SWEEP_WIDTH,
};

const CENTER: number = Chart.MARGIN + (Chart.SIZE / 2);
const VIEWBOX: number = Chart.SIZE + (Chart.MARGIN * 2);

const DIVISIONS: number = 24;
const ANGLE: number = 360 / DIVISIONS;

/**
 * Renders an SVG containing grouped lines.
 */
class TicksChart extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const sweepTicks = this.ticks(SWEEP_TICK, true);
    const majorTicks = this.ticks(OUTER_TICK, true);
    const minorTicks = this.ticks(HOUR_TICK);
    
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
      <svg viewbox="0 0 ${VIEWBOX} ${VIEWBOX}" aria-hidden="true">
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

    for (let i = 1; i <= DIVISIONS; i++) {
      const degrees = i * ANGLE;
      if (major && degrees % 90 === 0 ||
          !major && degrees % 90 !== 0) {
        const newLine = {
          x1: CENTER,
          y1: start,
          x2: CENTER,
          y2: end,
          transform: `rotate(${degrees}, ${CENTER}, ${CENTER})`,
        };
        ticks.push(newLine);
      }
    }
    return ticks;
  }
}

customElements.define('ticks-chart', TicksChart);
