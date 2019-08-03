/** @enum {string} */
const EventType = {
  BLUR: 'blur',
  CLICK: 'click',
  FOCUS: 'focus',
  LOADING: 'loading', // custom event
  POPSTATE: 'popstate',
  READY: 'DOMContentLoaded',
  RESET: 'reset',
  RESIZE: 'resize',
  SUBMIT: 'submit',
  UPDATE: 'update',
};

/** @class */
class EventHandler {
  /**
   * Makes app an SPA via the history API when links with the app's hostname
   * are clicked.
   * @public
   */
  hijackLinks() {
    document.addEventListener(EventType.CLICK, (e) => {
      const target = e.target;
      const href = target.getAttribute('href');

      if (href) {
        const linkUrl = new URL(href, window.location.origin);
        if (linkUrl.hostname === window.location.hostname) {
          e.preventDefault();
          history.pushState(null, null, href);
          this.sendUpdate_();
        }
      }
    });
  }

  /**
   * Dispatches custom event for the document to intercept.
   * @private
   */
  sendUpdate_() {
    const event = new CustomEvent(EventType.UPDATE, {
      detail: { update: true }
    });
    document.dispatchEvent(event);
  }

  /**
   * Dispatches custom event for UI loading status.
   * @param {boolean} status
   * @public
   */
  loading(status) {
    const event = new CustomEvent(EventType.LOADING, {
      detail: { loading: status }
    });
    document.dispatchEvent(event);
  }

  /**
   * Gets global Google Analytics object and sends a new pageview.
   * @param {!string} path - Path to the page.
   * @param {!string} title - Page title.
   * @public
   */
  sendPageview(path, title) {
    const ga = window.ga;
    if (ga) {
      ga('set', 'page', path);
      ga('set', 'title', title);
      ga('send', 'pageview');
    }
  }
}

export { EventType, EventHandler };
