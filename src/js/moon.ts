require ('dotenv').config();

import './custom_elements/App';
import './custom_elements/ChartAxes';
import './custom_elements/DonutChart';
import './custom_elements/MoonInfo';
import './custom_elements/MoonPhoto';
import './custom_elements/PrevNext';
import './custom_elements/TodayHighlighter';
import './custom_elements/UserLocation';

// Import styles for injecting into DOM.
import '../stylus/moon.styl';

// Register the Service Worker.
if (process.env.NODE_ENV === 'production') {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js');
    });
  }
}
