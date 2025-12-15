import {Events} from './shared';


/**
 * Vanilla custom element that adds/removes a 'touch' class on touch targets
 * in the DOM for applying CSS.
 */	
customElements.define('luna-touch', class extends HTMLElement {
  private touchEndHandler: EventListenerObject;
  private touchStartHandler: EventListenerObject;
  private touchTarget: HTMLElement;

  constructor() {
    super();
    this.touchStartHandler = this.handleTouchStart.bind(this);
    this.touchEndHandler = this.handleTouchEnd.bind(this);    
  }

  connectedCallback() {
    document.addEventListener(Events.TouchStart, this.touchStartHandler, {passive: true});
    document.addEventListener(Events.TouchEnd, this.touchEndHandler, {passive: true});
  }

  disconnectedCallback() {
    document.removeEventListener(Events.TouchStart, this.touchStartHandler);
    document.removeEventListener(Events.TouchEnd, this.touchEndHandler);
  }

  handleTouchStart(event: TouchEvent) {
    this.touchTarget = <HTMLElement>event.composedPath()[0];
    const tagName = this.touchTarget.tagName.toLowerCase();

    if (['a', 'button'].includes(tagName)) {
      this.touchTarget.classList.add('touch');
    }
  }

  handleTouchEnd() {
    this.touchTarget.classList.remove('touch');

    [...document.querySelectorAll('.touch')].forEach(link => {
      link.classList.remove('touch');
    });
  }
});
