const MOON_COLOR: string = '#fff';
const SUN_COLOR: string = '#f8c537';

/**
 * Class that provides all HTML templates required by the app.
 */
class Templates {
  private contentEl_: HTMLElement;
  private headerEl_: HTMLElement;

  constructor(content: string, header: string) {
    this.contentEl_ = document.querySelector(content);
    this.headerEl_ = document.querySelector(header);
  }

  public init(): void {
    // Clear out the content element first.
    this.contentEl_.innerHTML = '';
    this.contentEl_.classList.remove('content--no-js');

    this.renderHeaderLink_();;
    this.renderUserLocation_();
    this.renderCharts_();
    this.renderInfo_();
    this.renderControls_();
    this.renderProgressBar_();
  }

  /**
   * Renders the header link into the header.
   */
  private renderHeaderLink_(): void {
    const heading = this.headerEl_.querySelector('h1');
    heading.innerHTML = '<a class="header__link" href="/" title="today"></a>';
  }

  /**
   * Renders user-location element into the header.
   */
  private renderUserLocation_(): void {
    const userLocation = document.createElement('user-location');
    userLocation.classList.add('location');
    this.headerEl_.appendChild(userLocation);
  }

  /**
   * Renders charts, axes, and photo elements into the content element.
   */
  private renderCharts_(): void {
    const html = `\
      <div class="charts">\
        <div class="charts__frame">\
          <chart-axes class="chart"></chart-axes>\
          <donut-chart class="chart" name="sun" color="${SUN_COLOR}"></donut-chart>\
          <donut-chart class="chart" name="moon" color="${MOON_COLOR}"></donut-chart>\
          <moon-photo class="photo"></moon-photo>\
        </div>\
      </div>\
    `;
    this.contentEl_.innerHTML += html.replace(/\s\s/g, '');
  }

  /**
   * Renders info element.
   */
  private renderInfo_(): void {
    this.contentEl_.innerHTML += '<moon-info class="info"></moon-info>';
  }

  /**
   * Renders navigation controls.
   */
  private renderControls_(): void {
    const nav = ['prev', 'next'];
    nav.forEach((direction) => {
      this.contentEl_.innerHTML += `<prev-next class="nav" direction="${direction}"></prev-next>`;
    });
  }

  /**
   * Renders progress bar as first child of the body element.
   */
  private renderProgressBar_(): void {
    const div = document.createElement('div');
    div.classList.add('progress-bar');
    document.body.insertBefore(div, document.body.childNodes[0]);
  }
}

export {Templates};
