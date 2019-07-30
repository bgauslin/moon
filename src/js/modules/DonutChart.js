/** 
 * @typedef {Object} Point
 * @property {number} x - x coordinate
 * @property {number} y - y coordinate
 */

/** 
 * @typedef {Object} Arc
 * @property {number} sweep - arc length
 * @property {number} radius - arc radius 
 */

/** @const {number} */
const AXIS_OFFSET = -90;

/**
 * @enum {number}
 * NOTE: Keep values coordinated with 'ChartDimension' enum in
 * 'src/stylus/config/layout.styl'
 */
const ChartDimension = {
  SIZE: 320,
  SWEEP_WIDTH: 72,
  MARGIN: 44,
  LABEL_GAP: 8,
};

/** @class */
class DonutChart {
  /**
   * @param {!Object} config
   * @param {!string} config.classname
   * @param {!string} config.color
   * @param {!string} config.rise
   * @param {!string} config.selector
   * @param {!string} config.set
   */
  constructor(config) {
    /** @private {!string} */
    this.classname_ = config.classname;

    /** @private {!string} */
    this.color_ = config.color;

    /** @private {!string} */
    this.rise_ = config.rise;

    /** @private {!string} */
    this.set_ = config.set;

    /** @private {!Element} */
    this.chartsEl_ = document.querySelector(config.selector);

    /** @private {!number} */
    this.height_ = ChartDimension.SIZE + (ChartDimension.MARGIN * 2);

    /** @private {!number} */
    this.width_ = ChartDimension.SIZE + (ChartDimension.MARGIN * 2);

    /** @private {!number} */
    this.cx_ = this.height_ / 2;

    /** @private {!number} */
    this.cy_ = this.width_ / 2;

    /** @private {!number} */
    this.radius_ = (ChartDimension.SIZE - ChartDimension.SWEEP_WIDTH) / 2;

    /** @private {!number} */
    this.circumference_ = 2 * Math.PI * this.radius_; // 2πr

    /** @private {!number} Gap from edge of chart's arc for label placement. */
    this.radiusForLabels_ = (ChartDimension.SIZE / 2) + ChartDimension.LABEL_GAP;
  }

  /** 
   * Adjusts rotation for times on the left half of the chart so that they're
   * not upside-down. Also adjusts the chart radius since these numbers are
   * technically right-aligned, which means double-digit times on the left
   * side need a slight radius adjustment.
   * @param {!number} degrees
   * @return {Arc}
   * @private
   */
  adjustLabelPlacement_(degrees) {
    let sweep = degrees;
    let radius = this.radiusForLabels_;
    const leftSideStart = 180 + AXIS_OFFSET;
    const leftSideEnd = leftSideStart + 180;

    if (degrees > leftSideStart && degrees < leftSideEnd) {
      sweep -= 180;
      radius += ChartDimension.MARGIN - ChartDimension.LABEL_GAP;
    }

    return {
      sweep: sweep,
      radius: radius,
    }
  }

  /** 
   * Converts degrees to radians.
   * @param {!number} angle
   * @return {number}
   * @private
   */
  degreesToRadians_(angle) {
    return angle * (Math.PI / 180);
  }

  /**
   * Renders an SVG circle with an arc for the sun/moon chart.
   * @public
   */
  drawChart() {
    // Convert values to degrees for arc. 'sweep' start and end values are
    // adjusted since the default start for SVG circles is 3 o'clock and we
    // want arcs to start at 6 o'clock, which is midnight graphically.
    let sweepStart = this.timeToDegrees_(this.rise_) + AXIS_OFFSET;
    let sweepEnd = this.timeToDegrees_(this.set_) + AXIS_OFFSET;

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
    const riseTime = this.rise_;
    const riseSweep = this.adjustLabelPlacement_(sweepStart);
    const riseRotation = this.labelRotation_({
      radius: riseSweep.radius,
      angle: sweepStart,
      xOffset: this.cx_,
      yOffset: this.cy_,
    });
    const riseTransform = `rotate(${riseSweep.sweep}, ${riseRotation.x}, ${riseRotation.y})`;

    // Label for 'set' time.
    const setTime = this.set_;
    const setSweep = this.adjustLabelPlacement_(sweepEnd);
    const setRotation = this.labelRotation_({
      radius: setSweep.radius,
      angle: sweepEnd,
      xOffset: this.cx_,
      yOffset: this.cy_,
    });
    const setTransform = `rotate(${setSweep.sweep}, ${setRotation.x}, ${setRotation.y})`;

    // Rendered chart HTML.
    const chartHtml = `
      <svg class="chart chart--${this.classname_}" viewBox="0 0 ${this.height_} ${this.width_}">
        <g>
          <circle
            cx="${this.cx_}"
            cy="${this.cy_}"
            r="${this.radius_}"
            fill="transparent"
            stroke="${this.color_}"
            stroke-width="${ChartDimension.SWEEP_WIDTH}"
            stroke-dasharray="${this.circumference_}"
            stroke-dashoffset="${strokeDashOffset}"
            transform="${transform}"></circle>
          <text class="chart__label" fill="${this.color_}" x="${riseRotation.x}" y="${riseRotation.y}" transform="${riseTransform}">${riseTime}</text>
          <text class="chart__label" fill="${this.color_}" x="${setRotation.x}" y="${setRotation.y}" transform="${setTransform}">${setTime}</text>
        </g>
      </svg>
    `;

    this.chartsEl_.innerHTML += chartHtml;
  }

  /**
   * Returns adjusted x and y coordinates for a rotated label.
   * @param {!Object} settings
   * @param {!number} settings.radius
   * @param {!number} settings.angle
   * @param {!number} settings.xOffset
   * @param {!number} settings.yOffset
   * @return {Point}
   * @private
   */
  labelRotation_(settings) {
    const { radius, angle, xOffset, yOffset } = settings;
    const degreesToRadians = this.degreesToRadians_(angle);
    const x = radius * Math.cos(degreesToRadians) + xOffset;
    const y = radius * Math.sin(degreesToRadians) + yOffset;
    return { x, y };
  }

  /** 
   * Converts time to degrees of a circle.
   * @param {!string} time
   * @return {number}
   * @private`
   */
  timeToDegrees_(time) {
    const hours = Number(time.split(' ')[0].split(':')[0]);
    const minutes = Number(time.split(' ')[0].split(':')[1]);
    const timeToDecimal = hours + (minutes / 60);
    const hourInDegrees = 360 / 24;
    const timeInDegrees = timeToDecimal * hourInDegrees;
    return Number(timeInDegrees.toFixed(1));
  }
}

export { ChartDimension, DonutChart };
