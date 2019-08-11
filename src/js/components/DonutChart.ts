import { Attribute, Chart } from '../modules/Constants';

interface Point {
  x: number,
  y: number,
}

interface Arc {
 sweep: number,  // arc length
 radius: number, // arc radius 
}

interface LabelProps {
  angle: number,
  radius: number,
  xOffset: number,
  yOffset: number,
}

const AXIS_OFFSET: number = -90;

class DonutChart extends HTMLElement {
  private circumference_: number;
  private color_: string;
  private cx_: number;
  private cy_: number;
  private end_: string;
  private height_: number;
  private radius_: number;
  private radiusForLabels_: number;
  private start_: string;
  private width_: number;  
  
  constructor() {
    super();

    // [1] 2πr
    // [2] Gap from edge of chart's arc for label placement.
    this.color_ = this.getAttribute(Attribute.COLOR);
    this.height_ = Chart.SIZE + (Chart.MARGIN * 2);
    this.width_ = Chart.SIZE + (Chart.MARGIN * 2);
    this.cx_ = this.height_ / 2;
    this.cy_ = this.width_ / 2;
    this.radius_ = (Chart.SIZE - Chart.SWEEP_WIDTH) / 2;
    this.circumference_ = 2 * Math.PI * this.radius_; // [1]
    this.radiusForLabels_ = (Chart.SIZE / 2) + Chart.LABEL_GAP; // [2]
  }

  static get observedAttributes(): string[] {
    return [Attribute.START, Attribute.END];
  }

  attributeChangedCallback(): void {
    this.render_();
  }

  /**
   * Renders an SVG circle with an arc for the sun/moon chart.
   */
  private render_(): void {
    this.start_ = this.getAttribute(Attribute.START);
    this.end_ = this.getAttribute(Attribute.END);

    if (!this.start_ || !this.end_) {
      return;
    }

    // Convert values to degrees for arc. 'sweep' start and end values are
    // adjusted since the default start for SVG circles is 3 o'clock and we
    // want arcs to start at 6 o'clock, which is midnight graphically.
    let sweepStart = this.timeToDegrees_(this.start_) + AXIS_OFFSET;
    let sweepEnd = this.timeToDegrees_(this.end_) + AXIS_OFFSET;

    // 'sweep' = arc length with any negative values converted to positive
    // for cleaner math.
    let sweep = sweepEnd - sweepStart;
    if (sweep < 0) {
      sweep = (360 - sweepStart) + sweepEnd;
    }

    // Calculate arc stroke values for SVG.
    const strokeOffset = (sweep / 360) * this.circumference_;
    const strokeDashOffset = this.circumference_ - strokeOffset;

    // Arc stroke rotation based on sweep's 'start' value
    const transform = `rotate(${sweepStart}, ${this.cx_}, ${this.cy_})`;

    // Label for 'rise' time.
    const riseTime = this.start_;
    const riseSweep = this.labelPlacement_(sweepStart);
    const riseRotation = this.labelRotation_({
      radius: riseSweep.radius,
      angle: sweepStart,
      xOffset: this.cx_,
      yOffset: this.cy_,
    });
    const riseTransform = `rotate(${riseSweep.sweep}, ${riseRotation.x}, ${riseRotation.y})`;

    // Label for 'set' time.
    const setTime = this.end_;
    const setSweep = this.labelPlacement_(sweepEnd);
    const setRotation = this.labelRotation_({
      radius: setSweep.radius,
      angle: sweepEnd,
      xOffset: this.cx_,
      yOffset: this.cy_,
    });
    const setTransform = `rotate(${setSweep.sweep}, ${setRotation.x}, ${setRotation.y})`;

    // Rendered chart HTML.
    const html = `
      <svg viewbox="0 0 ${this.height_} ${this.width_}">\
        <g>\
          <circle \
            cx="${this.cx_}" \
            cy="${this.cy_}" \
            r="${this.radius_}" \
            fill="transparent" \
            stroke="${this.color_}" \
            stroke-width="${Chart.SWEEP_WIDTH}" \
            stroke-dasharray="${this.circumference_}" \
            stroke-dashoffset="${strokeDashOffset}" \
            transform="${transform}"></circle>\
          <text class="chart__label" fill="${this.color_}" \
            x="${riseRotation.x}" y="${riseRotation.y}" \
            transform="${riseTransform}">${riseTime}</text>\
          <text class="chart__label" fill="${this.color_}" \
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
  private labelPlacement_(degrees: number): Arc {
    let sweep = degrees;
    let radius = this.radiusForLabels_;
    const leftSideStart = 180 + AXIS_OFFSET;
    const leftSideEnd = leftSideStart + 180;

    if (degrees > leftSideStart && degrees < leftSideEnd) {
      sweep -= 180;
      radius += Chart.MARGIN - Chart.LABEL_GAP;
    }

    return {
      sweep: sweep,
      radius: radius,
    }
  }

  /**
   * Returns adjusted x and y coordinates for a rotated label.
   */
  private labelRotation_(props: LabelProps): Point {
    const { angle, radius, xOffset, yOffset } = props;
    const degreesToRadians = this.degreesToRadians_(angle);
    const x = radius * Math.cos(degreesToRadians) + xOffset;
    const y = radius * Math.sin(degreesToRadians) + yOffset;
    
    return { x, y };
  }

  /** 
   * Converts time to degrees of a circle.
   */
  private timeToDegrees_(time: string): number {
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
  private degreesToRadians_(angle: number): number {
    return angle * (Math.PI / 180);
  }
}

export { Chart, DonutChart };
