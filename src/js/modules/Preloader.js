import Spinner from 'spin';

/** @const {Object} */
const SpinnerOptions = {
  color: '#fff',
  length: 8,
  lines: 12,
  radius: 8,
  width: 3,
};

/** @const {number} */
const SPINNER_DELAY = 1000;

/** @const {string} */
const READY_ATTR = 'ready';

/** @class */
class Preloader {
  constructor(photoClass) {
    /** @private {string} */
    this.photoClass_ = photoClass;

    /** @private {instance} */
    this.spinner_ = new Spinner(SpinnerOptions);
  }

  /**
   * Attaches/removes a loading spinner based on whether or not
   * an image's figure wrapper has a 'ready' attribute.
   * @public 
   */
  preload() {
    const photoEl = document.querySelector(`.${this.photoClass_}`);
    const figureEl = photoEl.querySelector('figure');
    const imageEl = figureEl.querySelector('img');

    let img = new Image();
    img = imageEl;
    img.onload = () => {
      figureEl.setAttribute(READY_ATTR, '');
      this.spinner_.stop();
    };

    window.setTimeout(() => {
      if (!figureEl.hasAttribute(READY_ATTR)) {
        this.spinner_.spin();
        photoEl.appendChild(this.spinner_.el);
      }
    }, SPINNER_DELAY);
  }
}

export { Preloader };
