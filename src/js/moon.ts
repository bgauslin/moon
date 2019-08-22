require ('dotenv').config();
import { App } from './modules/App';
import { ChartAxes } from './components/ChartAxes';
import { DonutChart } from './components/DonutChart';
import { EventType } from './modules/EventHandler';
import { MoonInfo } from './components/MoonInfo';
import { MoonPhoto } from './components/MoonPhoto';
import { PrevNext } from './components/PrevNext';
import { Tools } from './modules/Tools';
import { UserLocation } from './components/UserLocation';
import '../stylus/moon.styl'; // Stylesheet import for Webpack.

const app = new App();
const tools = new Tools();

// Define all custom elements.
customElements.define('chart-axes', ChartAxes);
customElements.define('donut-chart', DonutChart);
customElements.define('moon-info', MoonInfo);
customElements.define('moon-photo', MoonPhoto);
customElements.define('prev-next', PrevNext);
customElements.define('user-location', UserLocation);

/**
 * Initializes app when DOM is ready.
 * @listens EventType.READY
 */
document.addEventListener(EventType.READY, () => {
  app.init();
  tools.init();
}, { once: true } );

/**
 * Updates UI via custom event dispatched by selected elements.
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
