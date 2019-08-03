require ('dotenv').config();
import { App } from './modules/App';
import { ChartAxes } from './components/ChartAxes';
import { DonutChart } from './components/DonutChart';
import { EventType } from './modules/EventHandler';
import { MoonInfo } from './components/MoonInfo';
import { MoonPhoto } from './components/MoonPhoto';
import { PrevNext } from './components/PrevNext';
import { Tools } from './modules/Tools';

// Stylesheet import for Webpack.
import '../stylus/moon.styl'; 

/** @const {string} */
const LOADING_ATTR = 'loading';

/** @instance */
const app = new App('usno');

/** @instance */
const tools = new Tools();

// Define all custom elements.
customElements.define('chart-axes', ChartAxes);
customElements.define('donut-chart', DonutChart);
customElements.define('moon-info', MoonInfo);
customElements.define('moon-photo', MoonPhoto);
customElements.define('prev-next', PrevNext);

/**
 * Initializes app when DOM is ready.
 * @listens EventType.READY
 */
document.addEventListener(EventType.READY, () => {
  app.init();
  tools.init();
}, { once: true } );

/**
 * Shows/hides progress bar when 'loading' custom event occurs.
 * @listens EventType.LOADING
 */
document.addEventListener(EventType.LOADING, (e) => {
  if (e.detail.loading) {
    document.body.setAttribute(LOADING_ATTR, '');
  } else {
    document.body.removeAttribute(LOADING_ATTR);
  }
});

/**
 * Updates UI via custom event dispatched by elements.
 * @listens EventType.UPDATE
 */
document.addEventListener(EventType.UPDATE, () => {
  app.update();
});

/**
 * Updates UI when URL changes via browser controls.
 * @listens EventType.POPSTATE
 */
window.addEventListener(EventType.POPSTATE, () => {
  app.update();
}, false);

/**
 * Updates 'vh' value when window is resized.
 * @listens EventType.RESIZE
 */
window.addEventListener(EventType.RESIZE, () => {
  tools.viewportHeight();
}, { passive: true });
