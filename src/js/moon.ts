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

/**
 * Define all custom elements.
 */ 
customElements.define('chart-axes', ChartAxes);
customElements.define('donut-chart', DonutChart);
customElements.define('moon-info', MoonInfo);
customElements.define('moon-photo', MoonPhoto);
customElements.define('prev-next', PrevNext);
customElements.define('user-location', UserLocation);

/**
 * Create class instances.
 */ 
const app = new App();
const tools = new Tools();

/**
 * Initialize app when DOM is ready.
 */
document.addEventListener(EventType.READY, () => {
  app.init();
  tools.init();
}, { once: true } );

/**
 * Update UI via custom event dispatched by selected elements.
 */
document.addEventListener(EventType.UPDATE, () => {
  app.update();
});

/**
 * Update UI when URL changes via browser controls.
 */
window.addEventListener(EventType.POPSTATE, () => {
  app.update();
}, false);

/**
 * Update 'vh' value when window is resized.
 */
window.addEventListener(EventType.RESIZE, () => {
  tools.viewportHeight();
}, { passive: true });
