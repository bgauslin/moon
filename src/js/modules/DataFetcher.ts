import { AppDate, DateTimeUtils } from './DateTimeUtils';
import { Helpers } from './Helpers';

interface AppData {
  hemisphere: string,
  illumination: number,
  moonrise: string,
  moonset: string,
  percent: number,
  phase: string,
  sunrise: string,
  sunset: string,
}

interface MoonriseMoonset {
  moonrise: string,
  moonset: string,
}

interface SunriseSunset {
  sunrise: string,
  sunset: string,
}

class DataFetcher {
  private data_: any;
  private dateTime_: any;
  private helpers_: any;
  private location_: string;

  constructor() {
    this.dateTime_ = new DateTimeUtils();
    this.helpers_ = new Helpers();
  }

  /**
   * Fetches data depending on the API, then processes and normalizes the
   * results before returning it in standardized format.
   */
  public async fetch(date: AppDate, location: string): Promise<any> {

    try {
      const response = await fetch(this.endpoint_(date, location));
      this.data_ = await response.json();
    } catch (e) {
      alert('Currently unable to fetch data. :(');
      return;
    }

    // TODO(fetcher): Return response status so that App can reset location.
    // If no data is available, alert the user and restore previous location.
    if (!this.data_) {
      alert(`No data is available for ${location}. Please try another location, or try entering a ZIP code.`);
      return;
    }

    // Normalize all API data and put it in an object for setting attribute
    // values on custom elements.
    const { sunrise, sunset } = this.sunriseSunset_();
    const { moonrise, moonset } = this.moonriseMoonset_();

    return {
      hemisphere: this.hemisphere_(),
      illumination: this.moonPhaseIllumination_(),
      moonrise,
      moonset,
      percent: this.moonPhasePercent_(),
      phase: this.moonPhase_(),
      sunrise,
      sunset,
    }
  }

  /**
   * Sets up endpoint and query params based on the API.
   */
  private endpoint_(date: AppDate, location?: string): string {
    const { year, month, day } = date;
    const month_ = this.helpers_.zeroPad(month);
    const day_ = this.helpers_.zeroPad(day);

    this.location_ = this.helpers_.urlify(location);

    return `${process.env.USNO_API}?date=${month_}/${day_}/${year}&loc=${this.location_}`;
  }

  /**
   * Sets the hemisphere based on location's latitude.
   */
  private hemisphere_(): string {
    return (this.data_.lat >= 0) ? 'northern' : 'southern';
  }

  /**
   * Gets current moon phase name from API data. If there's no current phase
   * in the API data, then get the closest phase.
   */
  private moonPhase_(): string {
    return this.data_.curphase ? this.data_.curphase : this.data_.closestphase.phase;
  }

  /**
   * Converts sunrise and sunset times to military time.
   */
  private sunriseSunset_(): SunriseSunset {
    const sunriseData = this.data_.sundata.find(item => item.phen === 'R');
    const sunsetData = this.data_.sundata.find(item => item.phen === 'S');
    const sunrise = this.dateTime_.militaryTime(sunriseData.time);
    const sunset = this.dateTime_.militaryTime(sunsetData.time);

    return { sunrise, sunset };
  }

  /**
   * Converts moonrise and moonset times to military time.
   */
  private moonriseMoonset_(): MoonriseMoonset {
    // If moonrise doesn't exist in 'moondata', get it from 'prevmoondata'.
    let moonriseData = this.data_.moondata.find((item: any) => item.phen === 'R');
    if (!moonriseData) {
      moonriseData = this.data_.prevmoondata.find((item: any) => item.phen === 'R');
    }
    const moonrise = this.dateTime_.militaryTime(moonriseData.time);

    // If moonset doesn't exist in 'moondata', get it from 'nextmoondata'.
    let moonsetData = this.data_.moondata.find((item: any) => item.phen === 'S');
    if (!moonsetData) {
      moonsetData = this.data_.nextmoondata.find((item: any) => item.phen === 'S');
    }
    const moonset = this.dateTime_.militaryTime(moonsetData.time);

    return { moonrise, moonset };
  }

  /**
   * Returns moon phase illumination.
   */
  private moonPhaseIllumination_(): number {
    switch (this.moonPhase_().toUpperCase()) {
      case 'NEW MOON':
        return 0;
      case 'FIRST QUARTER':
      case 'LAST QUARTER':
        return 50;
      case 'FULL MOON':
        return 100;
      default:
        return parseInt(this.data_.fracillum.replace('%', ''));
    }
  }

  /**
   * Returns moon cycle percentage as an integer. MoonPhoto needs this value
   * in order to calculate which image to show. Percent is calculated via
   * illumination (0-100) relative to phase.
   */
  private moonPhasePercent_(): number {
    const illumination = this.moonPhaseIllumination_();
    
    switch (this.moonPhase_().toUpperCase()) {
      case 'NEW MOON':
        return 0;
      case 'WAXING CRESCENT': // 1-24
      case 'FIRST QUARTER':   // 25
      case 'WAXING GIBBOUS':  // 26-49
        return Math.floor(illumination / 2);
      case 'FULL MOON':
        return 50;
      case 'WANING GIBBOUS':  // 51-74
      case 'LAST QUARTER':    // 75
      case 'WANING CRESCENT': // 76-99
        return Math.floor(100 - (illumination / 2));
    }
  }
}

export { AppData, DataFetcher };
