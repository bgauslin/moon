// require ('dotenv').config();

import './custom_elements/app/app';
import './custom_elements/donut_chart/donut_chart';
import './custom_elements/photo/photo';
import './custom_elements/prev_next/prev_next';
import './custom_elements/ticks_chart/ticks_chart';
import './custom_elements/user_location/user_location';

import '../styles/index.scss';

// Clean up the DOM since JS is enabled.
document.body.classList.remove('no-js');
document.body.querySelector('noscript')!.remove();

// Register the Service Worker.
if (process.env.NODE_ENV === 'production') {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js');
    });
  }
}

// Redirect view to '/' if app is launched as a standalone app. Otherwise,
// a user may have saved the app with a full URL, which means they will start
// at that URL every time they launch the app instead of on the current day.
if ((window as any).navigator.standalone == true || window.matchMedia('(display-mode: standalone)').matches) {
  history.replaceState(null, '', '/');
}
