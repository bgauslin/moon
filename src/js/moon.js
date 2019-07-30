require ('dotenv').config();
import { EventType } from './modules/EventHandler';
import { SunAndMoonData } from './modules/SunAndMoonData';
import { Tools } from './modules/Tools';
import '../stylus/moon.styl';

/** @const {string} */
const LOADING_ATTR = 'loading';

/** @instance */
const sunAndMoonData = new SunAndMoonData({
  fallbackLocation: 'New York, NY',
  locale: 'en-GB',
});

/** @instance */
const tools = new Tools();

/**
 * Initializes app when DOM is ready.
 * @listens EventType.READY
 */
document.addEventListener(EventType.READY, () => {
  sunAndMoonData.init();
  tools.init();
}, { once: true } );

/**
 * Updates UI when 'location' custom event occurs.
 * @listens EventType.LOCATION
 */
document.addEventListener(EventType.LOCATION, (e) => {
  sunAndMoonData.update(e.detail.location);
});

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
 * Updates UI when URL changes via browser controls.
 * @listens EventType.POPSTATE
 */
window.addEventListener(EventType.POPSTATE, () => {
  sunAndMoonData.update();
}, false);

/**
 * Updates 'vh' value when window is resized.
 * @listens EventType.RESIZE
 */
window.addEventListener(EventType.RESIZE, () => {
  tools.viewportHeight();
}, { passive: true });
