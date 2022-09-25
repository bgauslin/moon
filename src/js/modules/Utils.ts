import fastclick from 'fastclick';

/**
 * Adds site-wide features for enhancing a website's UX.
 */
class Utils {
  /**
   * Initializes site-wide utilities.
   */
  public init() {
    this.touchEnabled();
    this.standaloneStartup();
  }

  /**
   * Redirects view to '/' if app is launched as a standalone app. Otherwise,
   * a user may have saved the app with a full URL, which means they will start
   * at that URL every time they launch the app instead of on the current day.
   */
  private standaloneStartup() {
    if ((window as any).navigator.standalone == true || window.matchMedia('(display-mode: standalone)').matches) {
      history.replaceState(null, '', '/');
    }
  }

  /**
   * Removes 'no-touch' attribute and adds fastclick if device is touch-enabled.
   */
  private touchEnabled() {
    if ('ontouchstart' in window || (window as any).DocumentTouch) {
      document.body.removeAttribute('no-touch');
      fastclick['attach'](document.body);
    }
  }
}

export {Utils};
