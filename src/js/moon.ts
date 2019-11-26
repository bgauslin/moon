require ('dotenv').config();

import { App } from './modules/App';
import { ChartAxes } from './components/ChartAxes';
import { DonutChart } from './components/DonutChart';
import { EventType } from './modules/EventHandler';
import { MoonInfo } from './components/MoonInfo';
import { MoonPhoto } from './components/MoonPhoto';
import { PrevNext } from './components/PrevNext';
import { UserLocation } from './components/UserLocation';

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

// Create app instance and initialize it; update app when custom event is
// dispatched or when URL changes via browser controls.
const app = new App('2018');

document.addEventListener(EventType.READY, () => app.init(), { once: true });
document.addEventListener(EventType.UPDATE, () => app.update());
window.addEventListener(EventType.POPSTATE, () => app.update(), false);
