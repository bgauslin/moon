require ('dotenv').config();

import './custom_elements/app/app';
import './custom_elements/donut_chart/donut_chart';
import './custom_elements/info/info';
import './custom_elements/photo/photo';
import './custom_elements/moon_charts/moon_charts';
import './custom_elements/prev_next/prev_next';
import './custom_elements/highlighter/highlighter';
import './custom_elements/user_location/user_location';
import '../stylus/index.styl';

if (process.env.NODE_ENV === 'production') {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js');
    });
  }
}
