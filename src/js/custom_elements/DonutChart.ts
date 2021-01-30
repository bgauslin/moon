import {Chart} from '../modules/Constants';

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
const COLOR_ATTR: string = 'color';
const END_ATTR: string = 'end';
const START_ATTR: string = 'start';

/**
 * Custom element that renders a partial donut chart whose start and end
 * points are determined by start and end times. A complete circle is 24 hours
 * and the custom element also renders the start and end time labels with
 * rotation adjustments for which vertical half of the app the time lable is on.
 */
export class DonutChart extends HTMLElement {
  constructor() {
    super();
  }

  static get observedAttributes(): string[] {
    return [START_ATTR, END_ATTR];
  }

  attributeChangedCallback(): void {
    this.render();
  }

  /**
   * Renders an SVG circle with an arc for the sun/moon chart.
   */
  private render(): void {
    // Bail if both 'start' and 'end' attributes are missing since we can't
    // make the chart without them.
    const start = this.getAttribute(START_ATTR);
    const end = this.getAttribute(END_ATTR);

    if (!start || !end) {
      return;
    }

    // Set up the math for drawing arc sweeps.
    const height: number = Chart.SIZE + (Chart.MARGIN * 2);
    const width: number = Chart.SIZE + (Chart.MARGIN * 2);
    const cx: number = height / 2;
    const cy: number = width / 2;
    const radius: number = (Chart.SIZE - Chart.SWEEP_WIDTH) / 2;
    const circumference: number = 2 * Math.PI * radius;
    
    // Convert values to degrees for arc. 'sweep' start and end values are
    // adjusted since the default start for SVG circles is 3 o'clock and we
    // want arcs to start at 6 o'clock, which is midnight graphically.
    const sweepStart = this.timeToDegrees(start) + AXIS_OFFSET;
    const sweepEnd = this.timeToDegrees(end) + AXIS_OFFSET;

    // 'sweep' = arc length with any negative values converted to positive
    // for cleaner math.
    let sweep = sweepEnd - sweepStart;
    if (sweep < 0) {
      sweep = (360 - sweepStart) + sweepEnd;
    }

    // Calculate arc stroke values for SVG.
    const strokeOffset = (sweep / 360) * circumference;
    const strokeDashOffset = circumference - strokeOffset;

    // Arc stroke rotation based on sweep's 'start' value
    const transform = `rotate(${sweepStart}, ${cx}, ${cy})`;

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

    // Get color for the rendered arc.
    const color = this.getAttribute(COLOR_ATTR);

    // Rendered chart HTML.
    const html = `
      <svg viewbox="0 0 ${height} ${width}">\
        <g>\
          <circle \
            cx="${cx}" \
            cy="${cy}" \
            r="${radius}" \
            fill="transparent" \
            stroke="${color}" \
            stroke-width="${Chart.SWEEP_WIDTH}" \
            stroke-dasharray="${circumference}" \
            stroke-dashoffset="${strokeDashOffset}" \
            transform="${transform}"></circle>\
          <text class="chart__label" fill="${color}" \
            x="${riseRotation.x}" y="${riseRotation.y}" \
            transform="${riseTransform}">${riseTime}</text>\
          <text class="chart__label" fill="${color}" \
            x="${setRotation.x}" y="${setRotation.y}" \
            transform="${setTransform}">${setTime}</text>\
        </g>\
      </svg>\
    `;
    this.innerHTML = html.replace(/\s\s/g, '');
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
