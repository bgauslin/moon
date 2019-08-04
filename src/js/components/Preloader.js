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

// TODO(preloader): Refactor custom element for more flexible usage.
/** @class */
class Preloader extends HTMLElement {
  constructor() {
    /** @private {string} */
    this.target_ = this.getAttribute('target');

    /** @private {Element} */
    this.targetEl = this.querySelector(this.target_);

    /** @private {instance} */
    this.spinner_ = new Spinner(SpinnerOptions);
  }

  /** @callback */
  connectedCallback() {
    this.preload_();
  }

  /**
   * Attaches/removes a loading spinner based on whether or not
   * an image's figure wrapper has a 'ready' attribute.
   * @public 
   */
  preload_() {
    const figureEl = this.targetEl_.querySelector('figure');
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
        targetEl.appendChild(this.spinner_.el);
      }
    }, SPINNER_DELAY);
  }
}

export { Preloader };
