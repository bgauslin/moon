require ('dotenv').config();

import {App} from './modules/App';
import {ChartAxes} from './custom_elements/ChartAxes';
import {DonutChart} from './custom_elements/DonutChart';
import {MoonInfo} from './custom_elements/MoonInfo';
import {MoonPhoto} from './custom_elements/MoonPhoto';
import {PrevNext} from './custom_elements/PrevNext';
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
map.set(UserLocation, 'user-location');
map.forEach((key, value) => customElements.define(key, value));

// Create app instance and initialize it when DOM is ready.
document.addEventListener('DOMContentLoaded', () => new App('2018'));

// Register the Service Worker.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
