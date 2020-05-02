import fastclick from 'fastclick';

/**
 * Adds site-wide features for enhancing a website's UX.
 */
class Utils {
  /**
   * Initializes site-wide utilities.
   */
  public init(): void {
    this.touchEnabled_();
    this.standaloneStartup_();
    this.viewportHeight_();
    this.googleAnalytics_();
    window.addEventListener('resize', this.viewportHeight_);
  }

  /**
   * Initializes Google Analytics tracking.
   */
  private googleAnalytics_(): void {
    if (process.env.NODE_ENV === 'production') {
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*(new Date() as any);a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
      (window as any).ga('create', process.env.GA_ID, 'auto');
    }
  }

  /**
   * Gets global Google Analytics object and sends a new pageview with the
   * current page's path and title.
   */
  public sendPageview(path: string, title: string): void {
    const ga = (window as any).ga;
    if (ga) {
      ga('set', 'page', path);
      ga('set', 'title', title);
      ga('send', 'pageview');
    }
  }

  /**
   * Sets custom property for viewport height that updates 'vh' calculation due
   * to iOS Safari behavior where chrome appears and disappears when scrolling.
   */
  private viewportHeight_(): void {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight / 100}px`);
  }

  /**
   * Redirects view to '/' if app is launched as a standalone app. Otherwise,
   * a user may have saved the app with a full URL, which means they will start
   * at that URL every time they launch the app instead of on the current day.
   */
  private standaloneStartup_(): void {
    if ((window as any).navigator.standalone == true || window.matchMedia('(display-mode: standalone)').matches) {
      history.replaceState(null, null, '/');
    }
  }

  /**
   * Removes 'no-touch' attribute and adds fastclick if device is touch-enabled.
   */
  private touchEnabled_(): void {
    if ('ontouchstart' in window || (window as any).DocumentTouch) {
      document.body.removeAttribute('no-touch');
      fastclick['attach'](document.body);
    }
  }
}

export {Utils};
