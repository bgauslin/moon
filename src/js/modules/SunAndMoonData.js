import { Controls } from './Controls';
import { DonutChart } from './DonutChart';
import { EventHandler } from './EventHandler';
import { RenderUtils } from './RenderUtils';
import { UserLocation } from './UserLocation';

/**
 * @typedef {Object} MoonPhaseImage
 * @property {number} imageNumber - Moon phase photo sprite's position.
 * @property {string} alt - Text content for image 'alt' attribute.
 */

/** @enum {string} */
const ChartColor = {
  MOON: '#fff',
  SUN: '#f8c537',
};

/** @const {Array<string>} */
const CHARTS_CLASSES = [
  'chart--moon',
  'chart--sun',
];

/** @const {string} */
const CHARTS_SELECTOR = '.charts__frame';

/**
 * NOTE: Keep value coordinated with loop in 'source/stylus/moon/photo.styl'
 * @const {number} 
 */
const MOONPHASE_IMAGE_COUNT = 26;

/** @class */
class SunAndMoonData {
  /**
   * @param {!Object} config
   * @param {!string} config.fallbackLocation
   * @param {!string} config.locale
   */
  constructor(config) {
    /** @private {?Object} */
    this.date_ = null;

    /** @private {?number} */
    this.latitude_ = null;

    /** @private {!string} */
    this.locale_ = config.locale;

    /** @private {!string} */
    this.location_ = config.fallbackLocation;

    /** @private {?string|number} */
    this.moonIllumination_ = null;

    /** @private {?string} */
    this.moonPhase_ = null;

    /** @private {?string} */
    this.moonrise_ = null;

    /** @private {?string} */
    this.moonset_ = null;

    /** @private {?string} */
    this.place_ = null;

    /** @private {?string} */
    this.sunrise_ = null;

    /** @private {?string} */
    this.sunset_ = null;

    /** @instance */
    this.controls = new Controls();

    /** @instance */
    this.eventHandler = new EventHandler();

    /** @instance */
    this.renderUtils = new RenderUtils();

    /** @instance */
    this.userLocationWidget = new UserLocation({
      fallbackLocation: config.fallbackLocation,
    });
  }

  /**
   * Sets up DOM and initializes UI on first run.
   * @public
   */
  init() {
    this.renderUtils.init();
    this.controls.init();
    this.userLocationWidget.init();
    this.eventHandler.hijackLinks();
  }

  /**
   * Returns moon phase with first letter of each word capitalized.
   * @return {string} 
   * @private
   */
  currentMoonPhaseLabel_() {
    const name = this.moonPhase_;
    const nameToArray = name.split(' ');
    let nameFormatted = '';

    for (let i = 0; i < nameToArray.length; i++) {
      const word = nameToArray[i];
      const wordFormatted = word.charAt(0).toUpperCase() + word.slice(1);
      nameFormatted += wordFormatted;
      if (i < nameToArray.length - 1) {
        nameFormatted += ' ';
      }
    }

    return nameFormatted;
  }

  /**
   * Returns moon phase photo sprite's position and the image's 'alt' attribute.
   * @return {MoonPhaseImage}
   * @private
   */
  currentMoonPhaseImage_() {
    let imageNumber;

    switch (this.moonPhase_.toUpperCase()) {
      case 'WAXING CRESCENT':
      case 'WAXING GIBBOUS':
      case 'WANING CRESCENT':
      case 'WANING GIBBOUS':
        imageNumber = Math.round((this.currentMoonPhasePercentage_() / 100) * MOONPHASE_IMAGE_COUNT);
        break;
      case 'FIRST QUARTER':
        imageNumber = 6;
        break;
      case 'FULL MOON':
        imageNumber = 13;
        break;
      case 'LAST QUARTER':
        imageNumber = 18;
        break;
      case 'NEW MOON':
        imageNumber = MOONPHASE_IMAGE_COUNT;
        break;
    }

    return {
      imageNumber: (imageNumber === 0) ? MOONPHASE_IMAGE_COUNT : imageNumber,
      alt: `${this.currentMoonPhaseLabel_()} ${this.currentMoonPhasePercentage_()}%`,
    }
  }

  /**
   * Returns moon cycle percentage as an integer.
   * @return {number} 
   * @private
   */
  currentMoonPhasePercentage_() {
    const illumination = Number(this.moonIllumination_.replace('%', ''));
    let percent;

    switch (this.moonPhase_.toUpperCase()) {
      case 'NEW MOON':
        percent = 0;
        break;
      case 'WAXING CRESCENT':      
      case 'WAXING GIBBOUS':
        percent = illumination / 2;
        break;
      case 'FIRST QUARTER':
        percent = 25;
        break;
      case 'FULL MOON':
        percent = 50;
        break;
      case 'WANING GIBBOUS':
      case 'WANING CRESCENT':
        percent = 100 - (illumination / 2);
        break;
      case 'LAST QUARTER':
        percent = 75;
        break;
    }

    return Math.floor(percent);
  }

  /** 
   * Gets API response with sun and moon data for the current day,
   * plus the day before and after as fallbacks for moon/sun data rendering.
   * @param {!Object} date
   * @return {Object}
   * @async
   * @private
   */
  async fetchData_(date) {
    const { year, month, day } = date;

    // Zero-pad month and day from date.
    const month_ = this.renderUtils.zeroPad(month);
    const day_ = this.renderUtils.zeroPad(day);
    
    // Get data from the API.
    const endpoint = `${process.env.API_DATA}?date=${month_}/${day_}/${year}&loc=${this.place_}`;
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      return data;
    } catch (e) {
      alert('Currently unable to fetch data. :(');
    }
  }

  /**
   * Renders an SVG moon chart via API data and attaches it to the DOM.
   * @private
   */
  makeMoonChart_() {
    const moonChart = new DonutChart({
      selector: CHARTS_SELECTOR,
      color: ChartColor.MOON,
      classname: 'moon',
      rise: this.moonrise_,
      set: this.moonset_,
    });

    moonChart.drawChart();
  }

  /**
   * Renders an SVG sun chart via API data and attaches it to the DOM.
   * @private
   */
  makeSunChart_() {
    const sunChart = new DonutChart({
      selector: CHARTS_SELECTOR,
      color: ChartColor.SUN,
      classname: 'sun',
      rise: this.sunrise_,
      set: this.sunset_,
    });

    sunChart.drawChart();
  }

  /**
   * Removes sun and moon charts if they already exist when URL changes.
   * @private
   */
  removeCharts_() {
    CHARTS_CLASSES.forEach((classname) => {
      const chart = document.querySelector(`.${classname}`);
      if (chart) {
        chart.parentNode.removeChild(chart);
      }
    });
  }

  /**
   * Sets hemisphere based on latitude.
   * @param {!string} latitude
   * @return {string}
   * @private
   */
  setHemisphere_(latitude) {
    return (latitude >= 0) ? 'northern' : 'southern';
  }

  /**
   * Updates UI when URL changes.
   * @param {?string} location - Dispatched via custom event.
   * @async
   * @public
   */
  async update(location) {
    // Enable progress bar.
    this.eventHandler.loading(true);

    // Set constructor variables.
    if (location) {
      this.place_ = location.toLowerCase().replace(/[\s]/g, '+');
    }
    this.date_ = this.renderUtils.currentDate();

    // TODO(api): Add a try/catch block here.
    // Fetch data from the API.
    let apiData = await this.fetchData_(this.date_);
  
    // If no data is available, alert the user, restore their previous
    // location, and return. Otherwise, save the new location and continue...
    if (!apiData || apiData.error !== false) {
      alert(`No data is available for ${location}.\n\nPlease try another location, or try entering a ZIP code.`);
      this.userLocationWidget.restoreLocation();
      this.place_ = this.location_.toLowerCase().replace(/[\s]/g, '+');
      this.eventHandler.loading(false);
      return;
    }

    // Since we didn't bail out due to lack of data for the location parameter,
    // now we can set the constructor variable to the parameter.
    if (location) {
      this.location_ = location;
    }

    // Update UI with new location and save it to localStorage.
    const locationUrlified = this.location_.replace(/[\s]/g, '+');
    this.userLocationWidget.updateAddressBar(locationUrlified);
    this.controls.updateAllControls(locationUrlified);
    this.userLocationWidget.savePreviousLocation(this.location_);
    localStorage.setItem('location', this.location_);

    const locationData = `${apiData.city}, ${apiData.state}`;

    // Get sunrise and sunset.
    const sunriseData = apiData.sundata.find(item => item.phen === 'R');
    const sunsetData = apiData.sundata.find(item => item.phen === 'S');

    // Set sunrise and sunset in military time.
    this.sunrise_ = this.renderUtils.militaryTime(sunriseData.time);
    this.sunset_ = this.renderUtils.militaryTime(sunsetData.time);

    // If moonrise doesn't exist in 'moondata', get it from 'prevmoondata'.
    let moonriseData = apiData.moondata.find(item => item.phen === 'R');
    if (!moonriseData) {
      moonriseData = apiData.prevmoondata.find(item => item.phen === 'R');
    }

    // If moonset doesn't exist in 'moondata', get it from 'nextmoondata'.
    let moonsetData = apiData.moondata.find(item => item.phen === 'S');
    if (!moonsetData) {
      moonsetData = apiData.nextmoondata.find(item => item.phen === 'S');
    }

    // Set moonrise and moonset in military time.
    this.moonrise_ = this.renderUtils.militaryTime(moonriseData.time);
    this.moonset_ = this.renderUtils.militaryTime(moonsetData.time);

    // If no fracillum (fraction of the moon's illumination) exists, it's a
    // New Moon, therefore it would be 'zero percent illumination.'
    this.moonIllumination_ = apiData.fracillum ? apiData.fracillum : '0%';

    // If there's no current phase in the API data, get the closest phase.
    if (!apiData.curphase) {
      this.moonPhase_ = apiData.closestphase.phase;
    } else {
      this.moonPhase_ = apiData.curphase;
    }

    // Now that we're done fetching and setting data, populate the DOM with
    // charts.
    this.removeCharts_();
    this.makeSunChart_();
    this.makeMoonChart_();

    // Then, update the charts with text labels; update the moon phase photo;
    // update elements if the date is today; and set the hemisphere and whether
    // to flip the moon phase photo based on latitude.
    this.renderUtils.renderDate(this.date_, this.locale_);
    this.renderUtils.isToday(this.date_);
    this.renderUtils.renderMoonPhaseLabel(this.currentMoonPhaseLabel_());
    this.renderUtils.renderMoonPhasePercent(this.currentMoonPhasePercentage_());
    this.renderUtils.renderMoonPhasePhotoEl(this.currentMoonPhaseImage_(), this.setHemisphere_(Number(locationData.latitude)));

    // Finally, update the document title...
    this.renderUtils.updateDocumentTitle({
      date: this.date_,
      locale: this.locale_,
      location: this.location_,
      percent: this.currentMoonPhasePercentage_(),
      phase: this.currentMoonPhaseLabel_(),
    });

    // ...disable the progress bar...
    this.eventHandler.loading(false);

    // ...and send a pageview to Google Analytics.
    this.eventHandler.sendPageview(window.location.pathname, document.title);
  }
}

export { SunAndMoonData };
