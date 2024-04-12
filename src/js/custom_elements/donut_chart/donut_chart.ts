import {Chart} from '../../modules/Constants';

interface Arc {
  radius: number,
  sweep: number,
}

interface LabelProps {
  angle: number,
  radius: number,
  xOffset: number,
  yOffset: number,
}

interface Point {
  x: number,
  y: number,
}

const AXIS_OFFSET: number = -90;

/**
 * Custom element that renders a partial donut chart whose start and end
 * points are determined by start and end times. A complete circle is 24 hours
 * and the custom element also renders the start and end time labels with
 * rotation adjustments for which vertical half of the app the time label is on.
 */
export class DonutChart extends HTMLElement {
  constructor() {
    super();
  }

  static get observedAttributes(): string[] {
    return ['start', 'end'];
  }

  attributeChangedCallback() {
    this.render();
  }

  /**
   * Renders an SVG circle with an arc for the sun/moon chart.
   */
  private render() {
    // Bail if both 'start' and 'end' attributes are missing since we can't
    // make the chart without them.
    const start = this.getAttribute('start');
    const end = this.getAttribute('end');

    if (!start || !end) {
      return;
    }

    // Set up the math for drawing arc sweeps.
    const height = Chart.SIZE + (Chart.MARGIN * 2);
    const width = Chart.SIZE + (Chart.MARGIN * 2);
    const cx = height / 2;
    const cy = width / 2;
    const radius = (Chart.SIZE - Chart.SWEEP_WIDTH) / 2;
    const circumference = 2 * Math.PI * radius;
    
    // Convert values to degrees for arc. 'sweep' start and end values are
    // adjusted since the default start for SVG circles is 3 o'clock and we
    // want arcs to start at 6 o'clock, which is midnight graphically.
    const sweepStart = this.timeToDegrees(start) + AXIS_OFFSET;
    const sweepEnd = this.timeToDegrees(end) + AXIS_OFFSET;

    const transform = `rotate(${sweepStart}, ${cx}, ${cy})`;

    // 'sweep' = arc length with any negative values converted to positive
    // for cleaner math.
    let sweep = sweepEnd - sweepStart;
    if (sweep < 0) {
      sweep = (360 - sweepStart) + sweepEnd;
    }

    // Calculate arc stroke values for SVG.
    const strokeOffset = (sweep / 360) * circumference;
    const strokeDashOffset = circumference - strokeOffset;

    // Label for 'rise' time.
    const riseTime = start;
    const riseSweep = this.labelPlacement(sweepStart);
    const riseRotation = this.labelRotation({
      radius: riseSweep.radius,
      angle: sweepStart,
      xOffset: cx,
      yOffset: cy,
    });
    const riseTransform = `rotate(${riseSweep.sweep}, ${riseRotation.x}, ${riseRotation.y})`;

    // Label for 'set' time.
    const setTime = end;
    const setSweep = this.labelPlacement(sweepEnd);
    const setRotation = this.labelRotation({
      radius: setSweep.radius,
      angle: sweepEnd,
      xOffset: cx,
      yOffset: cy,
    });
    const setTransform = `rotate(${setSweep.sweep}, ${setRotation.x}, ${setRotation.y})`;

    // Static values.
    const strokeWidth = Chart.SWEEP_WIDTH;
    
    // Render the chart.
    this.innerHTML = `
      <svg viewbox="0 0 ${height} ${width}">
        <circle
          cx="${cx}"
          cy="${cy}"
          r="${radius}"
          fill="transparent"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${strokeDashOffset}"
          transform="${transform}"/>
        <text
          x="${riseRotation.x}"
          y="${riseRotation.y}"
          transform="${riseTransform}">${riseTime}</text>
        <text
          x="${setRotation.x}"
          y="${setRotation.y}"
          transform="${setTransform}">${setTime}</text>
      </svg>
    `;
  }

  /** 
   * Adjusts rotation for times on the left half of the chart so that they're
   * not upside-down. Also adjusts the chart radius since these numbers are
   * technically right-aligned, which means double-digit times on the left
   * side need a slight radius adjustment.
   */
  private labelPlacement(degrees: number): Arc {
    // Gap from edge of chart's arc for label placement.
    let radiusForLabels = (Chart.SIZE / 2) + Chart.LABEL_GAP;
    let sweep = degrees;

    const leftSideStart = 180 + AXIS_OFFSET;
    const leftSideEnd = leftSideStart + 180;

    if (degrees > leftSideStart && degrees < leftSideEnd) {
      sweep -= 180;
      radiusForLabels += Chart.MARGIN - Chart.LABEL_GAP;
    }

    return {radius: radiusForLabels, sweep};
  }

  /**
   * Returns adjusted x and y coordinates for a rotated label.
   */
  private labelRotation(props: LabelProps): Point {
    const {angle, radius, xOffset, yOffset} = props;
    const degreesToRadians = this.degreesToRadians(angle);
    const x = radius * Math.cos(degreesToRadians) + xOffset;
    const y = radius * Math.sin(degreesToRadians) + yOffset;
    
    return {x, y};
  }

  /** 
   * Converts time to degrees of a circle.
   */
  private timeToDegrees(time: string): number {
    const hours = parseInt(time.split(' ')[0].split(':')[0]);
    const minutes = parseInt(time.split(' ')[0].split(':')[1]);
    const timeToDecimal = hours + (minutes / 60);
    const hourInDegrees = 360 / 24;
    const timeInDegrees = timeToDecimal * hourInDegrees;

    return parseInt(timeInDegrees.toFixed(1));
  }

  /** 
   * Converts degrees to radians.
   */
  private degreesToRadians(angle: number): number {
    return angle * (Math.PI / 180);
  }
}

customElements.define('donut-chart', DonutChart);
