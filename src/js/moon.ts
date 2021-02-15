require ('dotenv').config();

import './custom_elements/app/app';
import './custom_elements/chart_axes/chart_axes';
import './custom_elements/donut_chart/donut_chart';
import './custom_elements/info/info';
import './custom_elements/photo/photo';
import './custom_elements/prev_next/prev_next';
import './custom_elements/highlighter/highlighter';
import './custom_elements/user_location/user_location';

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
