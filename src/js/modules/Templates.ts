enum ChartColor {
  SUN = '#f8c537',
  MOON = '#fff',
}

class Templates {
  private contentEl_: HTMLElement;

  constructor(selector: string) {
    this.contentEl_ = document.querySelector(selector);
  }

  public init(): void {
    this.renderCharts_();
    this.renderInfo_();
    this.renderControls_();
  }

  /**
   * Renders charts, axes, and photo elements.
   */
  private renderCharts_(): void {
    const html = `\
      <div class="charts">\
        <div class="charts__frame">\
          <chart-axes class="chart"></chart-axes>\
          <donut-chart class="chart" name="sun" color="${ChartColor.SUN}"></donut-chart>\
          <donut-chart class="chart" name="moon" color="${ChartColor.MOON}"></donut-chart>\
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
    const html = '<moon-info class="info"></moon-info>';
    this.contentEl_.innerHTML += html.replace(/\s\s/g, '');
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
}

export { Templates };
