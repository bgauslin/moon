import fastclick from 'fastclick';
import {AppDate} from './DateTimeUtils';

/**
 * Adds site-wide features for enhancing a website's UX.
 */
class Utils {
  /**
   * Initializes site-wide utilities.
   */
  public init(): void {
    this.hijackLinks_();
    this.touchEnabled_();
    this.googleAnalytics_();
    this.setViewportHeight_();
    window.addEventListener('resize', this.setViewportHeight_);
  }

  /**
   * Initializes Google Analytics tracking.
   */
  private googleAnalytics_(): void {
    if (process.env.NODE_ENV === 'production') {
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*<any>new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
      (<any>window).ga('create', process.env.GA_ID, 'auto');
    }
  }

  /**
   * Makes the app a single page application via the history API when links with
   * the app's hostname are clicked.
   */
  private hijackLinks_(): void {
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
   * Converts a Date object and a location string to a full URL.
   */
  public makeUrl(date: AppDate, location: string): URL {
    const {year, month, day} = date;
    const month_ = this.zeroPad(month);
    const day_ = this.zeroPad(day);
    const location_ = this.urlify(location);
    return new URL(`/${year}/${month_}/${day_}/${location_}`, window.location.origin);
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

  /**
   * Sets custom property for viewport height that updates 'vh' calculation due
   * to iOS Safari behavior where chrome appears and disappears when scrolling.
   */
  private setViewportHeight_(): void {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight / 100}px`);
  }

  /**
   * Removes 'no-touch' attribute and adds fastclick if device is touch-enabled.
   */
  private touchEnabled_(): void {
    if ('ontouchstart' in window || (<any>window).DocumentTouch) {
      document.body.removeAttribute('no-touch');
      fastclick['attach'](document.body);
    }
  }

  /**
   * Returns a URL-friendly string with each space replaced with a '+'.
   */
  public urlify(value: string): string {
    return value.replace(/[\s]/g, '+')
  }

  /**
   * Returns a value with zero padding if its value is less than 10.
   */
  public zeroPad(n: number): string {
    return (n < 10) ? `0${n}` : `${n}`;
  }
}

export {Utils};
