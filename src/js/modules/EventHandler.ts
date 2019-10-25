enum EventType {
  BLUR = 'blur',
  CLICK = 'click',
  FOCUS = 'focus',
  POPSTATE = 'popstate',
  READY = 'DOMContentLoaded',
  RESET = 'reset',
  RESIZE = 'resize',
  SUBMIT = 'submit',
  UPDATE = 'update',
}

class EventHandler {
  /**
   * Makes app an SPA via the history API when links with the app's hostname
   * are clicked.
   */
  public hijackLinks(): void {
    document.addEventListener(EventType.CLICK, (e) => {
      const target = e.target as HTMLElement;
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
   */
  private sendUpdate_(): void {
    const event = new CustomEvent(EventType.UPDATE, {
      detail: { update: true }
    });
    document.dispatchEvent(event);
  }

  /**
   * Gets global Google Analytics object and sends a new pageview with the
   * current page's path and title.
   */
  public sendPageview(path: string, title: string): void {
    const ga = (<any>window).ga;
    if (ga) {
      ga('set', 'page', path);
      ga('set', 'title', title);
      ga('send', 'pageview');
    }
  }
}

export { EventType, EventHandler };
