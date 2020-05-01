/**
 * Class for handling user-provided events and custom events.
 */
class EventHandler {
  /**
   * Makes the app a single page application via the history API when links with
   * the app's hostname are clicked.
   */
  public hijackLinks(): void {
    document.addEventListener('click', (e: Event) => {
      const target = <HTMLElement>e.target;
      const href = target.getAttribute('href');
      if (href) {
        const linkUrl = new URL(href, window.location.origin);
        if (linkUrl.hostname === window.location.hostname) {
          e.preventDefault();
          history.pushState(null, null, href);

          const event = new CustomEvent('update', {
            detail: {update: true}
          });
          document.dispatchEvent(event);
        }
      }
    });
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

export {EventHandler};
