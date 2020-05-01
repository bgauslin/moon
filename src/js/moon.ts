require ('dotenv').config();

import {App} from './modules/App';
import {ChartAxes} from './custom_elements/ChartAxes';
import {DonutChart} from './custom_elements/DonutChart';
import {MoonInfo} from './custom_elements/MoonInfo';
import {MoonPhoto} from './custom_elements/MoonPhoto';
import {PrevNext} from './custom_elements/PrevNext';
import {TodayHighlighter} from './custom_elements/TodayHighlighter';
import {UserLocation} from './custom_elements/UserLocation';

// Import styles for injecting into DOM.
import '../stylus/moon.styl';

// Define all custom elements.
const map = new Map();
map.set(ChartAxes, 'chart-axes');
map.set(DonutChart, 'donut-chart');
map.set(MoonInfo, 'moon-info');
map.set(MoonPhoto, 'moon-photo');
map.set(PrevNext, 'prev-next');
map.set(TodayHighlighter, 'app-today');
map.set(UserLocation, 'user-location');
map.forEach((key, value) => customElements.define(key, value));

// Create app instance and initialize it when DOM is ready.
document.addEventListener('DOMContentLoaded', () => {
  document.body.removeAttribute('no-js');
  document.body.querySelector('noscript').remove();
  new App('2018').init();
});

// Register the Service Worker.
if (process.env.NODE_ENV === 'production') {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js');
    });
  }
}
