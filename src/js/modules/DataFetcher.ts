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
  private api_: string;
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
  public async fetch(api: string, date: AppDate, location: string): Promise<any> {
    this.api_ = api;

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

    switch (this.api_) {
      case 'usno':
        return `${process.env.USNO_API}?date=${month_}/${day_}/${year}&loc=${this.location_}`;
      case 'aeris':
        // Get the day before and after in case of null values.
        const prevDate = this.dateTime_.prevDate(date);
        const nextDate = this.dateTime_.nextDate(date);

        // Zero-pad prevDate data.
        const prevYear = prevDate.year;
        const prevMonth = this.helpers_.zeroPad(prevDate.month);
        const prevDay = this.helpers_.zeroPad(prevDate.day);

        // Zero-pad nextDate data.
        const nextYear = nextDate.year;
        const nextMonth = this.helpers_.zeroPad(nextDate.month);
        const nextDay = this.helpers_.zeroPad(nextDate.day);

        // Make to/from references for API params.
        const from = `${prevYear}-${prevMonth}-${prevDay}`;
        const to = `${nextYear}-${nextMonth}-${nextDay}`;

        // Customize which fields to return from the API.
        const fields = 'loc,sun.riseISO,sun.setISO,moon.riseISO,moon.setISO,moon.phase.phase,moon.phase.name';
      
        // Construct the endpoint query.
        return `${process.env.AERIS_API}?from=${from}&to=${to}&p=${this.location_}&fields=${fields}&client_id=${process.env.AERIS_ACCESS_ID}&client_secret=${process.env.AERIS_SECRET_KEY}`;
    }
  }

  /**
   * Sets the hemisphere based on location's latitude.
   */
  private hemisphere_(): string {
    let latitude: number;

    switch (this.api_){
      case 'usno':
        latitude = this.data_.lat;
        break;
      case 'aeris':
        latitude = this.data_[0].loc.lat;
        break;
    }
    return (latitude >= 0) ? 'northern' : 'southern';
  }

  /**
   * Gets current moon phase name from API data.
   */
  private moonPhase_(): string {
    switch (this.api_){
      case 'usno':
        // If there's no current phase in the API data, get the closest phase.
        return (this.data_.curphase
          ? this.data_.curphase
          : this.data_.closestphase.phase);
      case 'aeris':
        return this.data_[1].moon.phase.name;
    }
  }

  /**
   * Converts sunrise and sunset times to military time.
   */
  private sunriseSunset_(): SunriseSunset {
    let sunriseData: any;
    let sunsetData: any;
    let sunrise: any;
    let sunset: any;

    switch (this.api_) {
      case 'usno':
        sunriseData = this.data_.sundata.find(item => item.phen === 'R');
        sunsetData = this.data_.sundata.find(item => item.phen === 'S');
        sunrise = this.dateTime_.militaryTime(sunriseData.time);
        sunset = this.dateTime_.militaryTime(sunsetData.time);
        break;

      case 'aeris':
        sunriseData = this.data_[1].sun.riseISO;
        sunsetData = this.data_[1].sun.setISO;
    
        // Fallback to sunrise on the day before, then day after if day before
        // is null.
        if (!sunriseData) {
          const sunriseBefore = this.data_[0].sun.riseISO;
          const sunriseAfter = this.data_[2].sun.riseISO;
          sunriseData = sunriseBefore ? sunriseBefore : sunriseAfter;
        }
    
        // Fallback to sunset on the day before, then day after if day before
        // is null.
        if (!sunsetData) {
          const sunsetBefore = this.data_[0].sun.setISO;
          const sunsetAfter = this.data_[2].sun.setISO;
          sunsetData = sunsetBefore ? sunsetBefore : sunsetAfter;
        }

        sunrise = this.dateTime_.militaryTime(sunriseData);
        sunset = this.dateTime_.militaryTime(sunsetData);
        break;
    }

    return { sunrise, sunset };
  }

  /**
   * Converts moonrise and moonset times to military time.
   */
  private moonriseMoonset_(): MoonriseMoonset {
    let moonriseData: any;
    let moonsetData: any;
    let moonrise: any;
    let moonset: any;

    switch (this.api_) {
      case 'usno':
        // If moonrise doesn't exist in 'moondata', get it from 'prevmoondata'.
        moonriseData = this.data_.moondata.find((item: any) => item.phen === 'R');
        if (!moonriseData) {
          moonriseData = this.data_.prevmoondata.find((item: any) => item.phen === 'R');
        }
        moonrise = this.dateTime_.militaryTime(moonriseData.time);

        // If moonset doesn't exist in 'moondata', get it from 'nextmoondata'.
        moonsetData = this.data_.moondata.find((item: any) => item.phen === 'S');
        if (!moonsetData) {
          moonsetData = this.data_.nextmoondata.find((item: any) => item.phen === 'S');
        }
        moonset = this.dateTime_.militaryTime(moonsetData.time);
        break;

      case 'aeris':
        moonriseData = this.data_[1].moon.riseISO;
        moonsetData = this.data_[1].moon.setISO;
    
        // Fallback to moonrise on the day before, then day after if day before
        // is null.
        if (!moonriseData) {
          const moonriseBefore = this.data_[0].moon.riseISO;
          const moonriseAfter = this.data_[2].moon.riseISO;
          moonriseData = moonriseBefore ? moonriseBefore : moonriseAfter;
        }
    
        // Fallback to moonset on the day before, then day after if day before
        // is null.
        if (!moonsetData) {
          const moonsetBefore = this.data_[0].moon.setISO;
          const moonsetAfter = this.data_[2].moon.setISO;
          moonsetData = moonsetBefore ? moonsetBefore : moonsetAfter;
        }

        moonrise = this.dateTime_.militaryTime(moonriseData);
        moonset = this.dateTime_.militaryTime(moonsetData);
        break;
    }

    return { moonrise, moonset };
  }

  /**
   * Returns moon phase illumination.
   */
  private moonPhaseIllumination_(): number {
    switch (this.api_) {
      case 'usno':
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
      case 'aeris':
        return this.data_.moon.phase.illum;
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
