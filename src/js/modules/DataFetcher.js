import { DateTimeUtils } from './DateTimeUtils';
import { Helpers } from './Helpers';

/** @class */
class DataFetcher {
  constructor(api, locale) {
    /** @private {!string} */
    this.api_ = api;

    /** @private {!string} */
    this.locale_ = locale;

    /** @private {!Object} */
    this.data_ = null;

    /** @instance */
    this.dateTime_ = new DateTimeUtils();

    /** @instance */
    this.helpers_ = new Helpers();
  }

  /**
   * TODO...
   * @param {!Object} date
   * @param {!string} location
   * @async
   * @public
   */
  async fetch(date, location) {
    const { year, month, day } = date;
    const month_ = this.helpers_.zeroPad(month);
    const day_ = this.helpers_.zeroPad(day);
    const location_ = location.toLowerCase().replace(/[\s]/g, '+');

    // Set up endpoint and query params based on the API.
    let endpoint;
    switch (this.api_) {
      case 'usno':
        endpoint = `${process.env.API_DATA}?date=${month_}/${day_}/${year}&loc=${location_}`;
        break;
      case 'wwo':
        endpoint = `${process.env.API_DATA}?format=json&key=${process.env.API_KEY}&date=${year}-${month_}-${day_}&q=${location_}&includelocation=yes`;
        break;
    }

    // Fetch data from the API.
    try {
      const response = await fetch(endpoint);
      this.data_ = await response.json();
    } catch (e) {
      alert('Currently unable to fetch data. :(');
    }

    console.log(this.data_);

    // If no data is available, alert the user, restore their previous
    // location, and return.
    if (!this.data_ || this.data_.error !== false) {
      alert(`No data is available for ${location}.\n\nPlease try another location, or try entering a ZIP code.`);
      // TODO: Return a string/boolean so that App can reset location.
      return;
    }

    // Normalize all API data, put it in an object, and return it to App for
    // setting attribute values on custom elements.
    const { sunrise, sunset } = this.sunriseSunset_();
    const { moonrise, moonset } = this.moonriseMoonset_();

    return {
      hemisphere: this.hemisphere_(),
      moonrise,
      moonset,
      percent: this.moonPhasePercent_(), // TODO: debug
      phase: this.moonPhase_(),
      sunrise,
      sunset,
    }
  }

  /**
   * Sets the hemisphere based on the location's latitude.
   * @return {string}
   * @private
   */
  hemisphere_() {
    let latitude;
    switch (this.api_){
      case 'usno':
        latitude = this.data_.lat;
        break;
      case 'wwo':
        latitude = this.data_.nearest_area[0].latitude;
        break;
    }
    return (parseInt(latitude) >= 0) ? 'northern' : 'southern';
  }

  /**
   * Gets current moon phase name from API data.
   * @return {string}
   * @private
   */
  moonPhase_() {
    switch (this.api_){
      case 'usno':
        // If there's no current phase in the API data, get the closest phase.
        return (this.data_.curphase
          ? this.data_.curphase
          : this.data_.closestphase.phase);
      case 'wwo':
        return this.data_.moon_phase;
    }
  }

  /**
   * Converts sunrise and sunset times to military time.
   * @returns {Object}
   * @private
   */
  sunriseSunset_() {
    let sunriseData;
    let sunsetData;
    let sunrise;
    let sunset;

    switch (this.api_) {
      case 'usno':
        sunriseData = this.data_.sundata.find(item => item.phen === 'R');
        sunsetData = this.data_.sundata.find(item => item.phen === 'S');
        sunrise = this.dateTime_.militaryTime(sunriseData.time);
        sunset = this.dateTime_.militaryTime(sunsetData.time);
        break;
      case 'wwo':
        sunriseData = this.data_.time_zone[0].sunrise;
        sunsetData = this.data_.time_zone[0].sunset;
        sunrise = this.dateTime_.militaryTime(sunriseData);
        sunset = this.dateTime_.militaryTime(sunsetData);
        break;
    }

    return { sunrise, sunset };
  }

  /**
   * Sets moonrise and moonset in military time.
   * @return {Object}
   * @private
   */
  moonriseMoonset_() {
    let moonriseData;
    let moonsetData;
    let moonrise;
    let moonset;

    switch (this.api_) {
      case 'usno':
        // If moonrise doesn't exist in 'moondata', get it from 'prevmoondata'.
        moonriseData = this.data_.moondata.find(item => item.phen === 'R');
        if (!moonriseData) {
          moonriseData = this.data_.prevmoondata.find(item => item.phen === 'R');
        }
        moonrise = this.dateTime_.militaryTime(moonriseData.time);

        // If moonset doesn't exist in 'moondata', get it from 'nextmoondata'.
        moonsetData = this.data_.moondata.find(item => item.phen === 'S');
        if (!moonsetData) {
          moonsetData = this.data_.nextmoondata.find(item => item.phen === 'S');
        }
        moonset = this.dateTime_.militaryTime(moonsetData.time);
        break;
      case 'wwo':
        moonriseData = this.data_.time_zone[0].moonrise;
        moonsetData = this.data_.time_zone[0].moonset;
        // TODO: fetch data for next day or previous day if data for current day
        // doesn't exist.
        moonrise = this.dateTime_.militaryTime(moonriseData);
        moonset = this.dateTime_.militaryTime(moonsetData);
        break; 
    }

    return { moonrise, moonset };
  }

  /**
   * Returns moon cycle percentage as an integer.
   * @return {number} 
   * @private
   */
  moonPhasePercent_() {
    let percent;
    let illumination;

    switch (this.api_) {
      case 'usno':
        // If no fracillum (fraction of the moon's illumination) exists, it's a
        // New Moon, and would be 'zero percent illumination.'
        const fracillum = (this.data_.fracillum) ? this.data_.fracillum : '0%';
        illumination = parseInt(fracillum.replace('%', ''));
        break;
      case 'wwo':
        illumination = parseInt(this.data_.moon_illumination);
        break; 
    }
    
    switch (this.moonPhase_().toUpperCase()) {
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
}

export { DataFetcher };
