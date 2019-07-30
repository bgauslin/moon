import { ChartDimension } from './DonutChart';
import { DateTimeUtils } from './DateTimeUtils';
import { Preloader } from './Preloader';

/** @enum {string} */
const ClassName = {
  CHARTS: 'charts__frame',
  FOOTER: 'footer',
  HEADER: 'header',
  HEADER_LINK: 'header__link',
  LOCATION: 'location',
  PERCENT: 'info__percent',
  PHASE: 'info__phase',
  PHOTO: 'photo',
};

/** @const {string} */
const TITLE_DIVIDER = '·';

/** @const {number} */
const VIEWBOX = ChartDimension.SIZE + (ChartDimension.MARGIN * 2);

/** @const {number} */
const MIDPOINT = VIEWBOX / 2;

// Top and left axis lines.
/** @const {number} */
const AXIS_FIRST_HALF_START = ChartDimension.MARGIN;

/** @const {number} */
const AXIS_FIRST_HALF_END = ChartDimension.MARGIN + ChartDimension.SWEEP_WIDTH;

// Bottom and right axis lines.
/** @const {number} */
const AXIS_SECOND_HALF_START = MIDPOINT + ((ChartDimension.SIZE / 2) - ChartDimension.SWEEP_WIDTH)

/** @const {number} */
const AXIS_SECOND_HALF_END = VIEWBOX - ChartDimension.MARGIN;

/** @const {Array<Object>} */
const Axes = [
  // Moving clockwise from the top.
  {
    x1: MIDPOINT, y1: AXIS_FIRST_HALF_START,
    x2: MIDPOINT, y2: AXIS_FIRST_HALF_END,
  },
  { x1: AXIS_SECOND_HALF_START, y1: MIDPOINT,
    x2: AXIS_SECOND_HALF_END, y2: MIDPOINT,
  },
  { x1: MIDPOINT, y1: AXIS_SECOND_HALF_START,
    x2: MIDPOINT, y2: AXIS_SECOND_HALF_END,
  },
  { x1: AXIS_FIRST_HALF_START, y1: MIDPOINT,
    x2: AXIS_FIRST_HALF_END, y2: MIDPOINT,
  }
];

// Top and left tick lines.
/** @const {number} */
const TICK_FIRST_HALF_START = 0;

/** @const {number} */
const TICK_FIRST_HALF_END = ChartDimension.MARGIN;

// Bottom and right tick lines.
/** @const {number} */
const TICK_SECOND_HALF_START = VIEWBOX - ChartDimension.MARGIN;

/** @const {number} */
const TICK_SECOND_HALF_END = VIEWBOX;

/** @const {Array<Object>} */
const Ticks = [
  { 
    x1: MIDPOINT, y1: TICK_FIRST_HALF_START,
    x2: MIDPOINT, y2: TICK_FIRST_HALF_END,
  },
  { x1: TICK_SECOND_HALF_START, y1: MIDPOINT,
    x2: TICK_SECOND_HALF_END, y2: MIDPOINT,
  },
  { x1: MIDPOINT, y1: TICK_SECOND_HALF_START,
    x2: MIDPOINT, y2: TICK_SECOND_HALF_END,
  },
  { x1: TICK_FIRST_HALF_START, y1: MIDPOINT,
    x2: TICK_FIRST_HALF_END, y2: MIDPOINT,
  }
];

/** @class */
class RenderUtils extends DateTimeUtils {
  constructor() {
    super();

    /** @private {string} */
    this.baseTitle_ = document.title;

    /** @private  */
    this.preloader_ = new Preloader(ClassName.PHOTO);
  }

  /**
   * Inserts all of the apps's HTML elements into the DOM.
   * @public
   */
  init() {
    this.renderAppEls_();
    this.renderHeaderEl_();
    this.renderFooterEl_();
    this.renderChartLines_();
  }

  /**
   * Renders all of the app's primary HTML elements.
   * @private
   */
  renderAppEls_() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="loader"></div>
      <header class="header"></header>
      <div class="charts">
        <div class="charts__frame"></div>
      </div>
      <div class="info">
        <div class="info__phase"></div>
        <div class="info__percent"></div>
      </div>
      <nav class="nav nav--prev"></nav>
      <nav class="nav nav--next"></nav>
      <footer class="footer"></footer>
    `;
  }

  /**
   * Renders SVG element for chart axes and ticks.
   * @private
   */
  renderChartLines_() {
    const chartsEl = document.querySelector(`.${ClassName.CHARTS}`);
    let axisLines = '';
    let tickLines = '';

    Axes.forEach((axis) => {
      const { x1, y1, x2, y2 } = axis;
      const line = `<line class="axis" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
      axisLines += line;
    });

    Ticks.forEach((tick) => {
      const { x1, y1, x2, y2 } = tick;
      const line = `<line class="tick" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
      tickLines += line;
    });

    const html = `
      <svg class="chart chart--axes" viewbox="0 0 ${VIEWBOX} ${VIEWBOX}">
        <g>${axisLines}</g>
        <g>${tickLines}</g>
      </svg>
    `;

    chartsEl.innerHTML += html;
  }

  /**
   * Renders current formatted date within the header's 'link' element.
   * @param {!Object} date
   * @param {!number} date.year
   * @param {!number} date.month
   * @param {!number} date.day
   * @param {!string} locale
   * @public
   */
  renderDate(date, locale) {
    const headerLinkEl = document.querySelector(`.${ClassName.HEADER_LINK}`);
    headerLinkEl.textContent = this.formatDate(date, locale, 'long');
  }

  /**
   * Renders HTML within the 'footer' element.
   * @private
   */
  renderFooterEl_() {
    const footerEl = document.querySelector(`.${ClassName.FOOTER}`);
    const currentYear = new Date().getFullYear().toString().substr(-2);

    const footerHtml = `
      <p class="copyright">
        <span class="copyright__years">© 2018–${currentYear}</span>
        <a class="copyright__owner" href="https://gauslin.com" title="Ben Gauslin’s Website" target="_blank" rel="noopener">Ben Gauslin</a>
      </p>
    `;
    footerEl.innerHTML = footerHtml;
  }

  /**
   * Renders HTML within the 'header' element.
   * @private
   */
  renderHeaderEl_() {
    const url = new URL('/', window.location.origin);
    const headerEl = document.querySelector(`.${ClassName.HEADER}`);
    const headerHtml = ` 
      <h1 class="header__title">
        <a class="header__link" href="${url}" title="Go to today"></a>
      </h1>
    `;
    headerEl.innerHTML = headerHtml;
  }

  /** 
   * Renders the name of the current moon phase.
   * @param {!string} phase
   * @public
   */
  renderMoonPhaseLabel(phase) {
    document.querySelector(`.${ClassName.PHASE}`).textContent = phase;
  }

  /** 
   * Renders the percent of the current moon phase.
   * @param {!number} percent
   * @public
   */
  renderMoonPhasePercent(percent) {
    const percentEl = document.querySelector(`.${ClassName.PERCENT}`)
    percentEl.textContent = `${percent}%`;
    if (percent === 0) {
      percentEl.setAttribute('invisible', '');
    } else {
      percentEl.removeAttribute('invisible');
    }
  }

  /** 
   * Renders/updates photo of the current moon phase.
   * @param {!Object} imageData
   * @param {!number} imageData.imageNumber
   * @param {!string} imageData.alt
   * @param {!string} hemisphere
   * @public
   */
  renderMoonPhasePhotoEl(imageData, hemisphere) {
    const { imageNumber, alt } = imageData;
    const photoEl = document.querySelector(`.${ClassName.PHOTO}`);

    // If photo already exists, update its attributes.
    if (photoEl) {
      photoEl.setAttribute('hemisphere', hemisphere);
      const imageEl = photoEl.querySelector('img');
      imageEl.setAttribute('alt', alt);
      imageEl.setAttribute('frame', imageNumber);

    // Otherwise, render photo element.
    } else {
      const photoHtml = `
        <div class="photo" hemisphere="${hemisphere}">
          <div class="photo__frame">
            <figure class="photo__figure">
              <img class="photo__image"
                   src="/img/moon-phases-26-240.min.jpg"
                   srcset="/img/moon-phases-26-240.min.jpg 1x, /img/moon-phases-26-480.min.jpg 2x"
                   alt="${alt}"
                   frame="${imageNumber}">
            </figure>
          </div>
        </div>
      `;
      const chartsEl = document.querySelector(`.${ClassName.CHARTS}`);
      chartsEl.innerHTML += photoHtml;

      this.preloader_.preload();
    }
  }

  /** 
   * Updates document title with info about the current moon phase.
   * @param {!Object} settings
   * @param {!Object} settings.date
   * @param {!number} settings.date.year
   * @param {!number} settings.date.month
   * @param {!number} settings.date.day
   * @param {!string} settings.locale
   * @param {!string} settings.location
   * @param {!string} settings.percent
   * @param {!string} settings.phase
   * @public
   */
  updateDocumentTitle(settings) {
    const { date, locale, location, percent, phase } = settings;
    const pathname = window.location.pathname;
    let urlSegments = pathname.split('/');
    urlSegments.shift();

    const dateLabel = (urlSegments.length === 1) ? 'Today' : this.formatDate(date, locale, 'short');
    let pageTitle = `${dateLabel} ${TITLE_DIVIDER} ${location} ${TITLE_DIVIDER} ${phase}`;

    if (percent > 0) {
      pageTitle += ` ${TITLE_DIVIDER} ${percent}%`;
    }

    document.title = pageTitle;
  }
}

export { RenderUtils };
