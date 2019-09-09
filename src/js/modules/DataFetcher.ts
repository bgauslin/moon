import SunCalc from 'suncalc';
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
  moonrise: Date,
  moonset: Date,
}

interface SunriseSunset {
  sunrise: Date,
  sunset: Date,
}

class DataFetcher {
  private date_: Date;
  private dateTimeUtils_: any;
  private helpers_: any;
  private lat_: number;
  private lng_: number;
  private location_: string;

  constructor() {
    this.dateTimeUtils_ = new DateTimeUtils();
    this.helpers_ = new Helpers();
  }

  /**
   * Fetches data depending on the API, then processes and normalizes the
   * results before returning it in standardized format.
   */
  public async fetch(date: AppDate, location: string): Promise<any> {
    const location_ = this.helpers_.urlify(location)

    // Get lat/lng via API based on location.
    if (location_ !== this.location_) {
      const endpoint = (`${process.env.GEOCODE_API}?searchtext=${location_}&app_id=${process.env.GEOCODER_APP_ID}&app_code=${process.env.GEOCODER_APP_CODE}`);
      const response = await fetch(endpoint);
      const data = await response.json();
      const coords = data.Response.View[0].Result[0].Location.DisplayPosition;
      this.lat_ = coords.Latitude;
      this.lng_ = coords.Longitude;
      this.location_ = location_;
    }

    // Create a Date object from the date parameter for SunCalc.
    const { year, month, day } = date;
    const monthIndex = month - 1;
    this.date_ = new Date(year, monthIndex, day);

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
   * Sets the hemisphere based on location's latitude.
   */
  private hemisphere_(): string {
    return (this.lat_ >= 0) ? 'northern' : 'southern';
  }

  /**
   * Gets current moon phase.
   */
  private moonPhase_(): string {
    const illumination = SunCalc.getMoonIllumination(this.date_);
    const phase = illumination.phase;

    if (phase === 0) {
      return 'New Moon';
    } else if (phase < .25) {
      return 'Waxing Crescent';
    } else if (phase === .25) {
      return 'First Quarter';
    } else if (phase < .5) {
      return 'Waxing Gibbous';
    } else if (phase === .5) {
      return 'Full Moon';
    } else if (phase < .75) {
      return 'Waning Gibbous';
    } else if (phase === .75) {
      return 'Last Quarter';
    } else if (phase < 1) {
      return 'Waning Crescent'
    }
  }

  /**
   * Converts sunrise and sunset times to military time.
   */
  private sunriseSunset_(): SunriseSunset {
    const sunTimes = SunCalc.getTimes(this.date_, this.lat_, this.lng_);
    const sunrise = this.dateTimeUtils_.hoursMinutes(sunTimes.sunrise);
    const sunset = this.dateTimeUtils_.hoursMinutes(sunTimes.sunset);
    return { sunrise, sunset };
  }

  /**
   * Converts moonrise and moonset times to military time.
   */
  private moonriseMoonset_(): MoonriseMoonset {
    const moonTimes = SunCalc.getMoonTimes(this.date_, this.lat_, this.lng_);
    let moonrise = this.dateTimeUtils_.hoursMinutes(moonTimes.rise);
    let moonset = this.dateTimeUtils_.hoursMinutes(moonTimes.set);

    // If moonrise or moonset values have bad values, use day before instead.
    if (moonrise.includes('NaN') || moonset.includes('NaN')) {
      const { year, month, day } = this.dateTimeUtils_.prevDate();
      const monthIndex = month - 1;
      const prevDate = new Date(year, monthIndex, day);
      const prevMoonTimes = SunCalc.getMoonTimes(prevDate, this.lat_, this.lng_);

      if (moonrise.includes('NaN')) {
        moonrise = this.dateTimeUtils_.hoursMinutes(prevMoonTimes.rise);
      }

      if (moonset.includes('NaN')) {
        moonset = this.dateTimeUtils_.hoursMinutes(prevMoonTimes.set);
      }
    }

    return { moonrise, moonset };
  }

  /**
   * Returns moon phase illumination as an integer of a percentage.
   * e.g. .7123 => 71
   */
  private moonPhaseIllumination_(): number {
    const illumination = SunCalc.getMoonIllumination(this.date_);
    return Math.floor(illumination.fraction * 100);
  }

  /**
   * Returns moon cycle percentage as an integer. MoonPhoto needs this value
   * in order to calculate which image to show. Percent is calculated via
   * illumination (0-100) relative to phase.
   */
  private moonPhasePercent_(): number {
    const illumination = this.moonPhaseIllumination_();
    
    switch (this.moonPhase_()) {
      case 'New Moon':
        return 0;
      case 'Waxing Crescent': // 1-24
      case 'First Quarter':   // 25
      case 'Waxing Gibbous':  // 26-49
        return Math.floor(illumination / 2);
      case 'Full Moon':
        return 50;
      case 'Waning Gibbous':  // 51-74
      case 'Last Quarter':    // 75
      case 'Waning Crescent': // 76-99
        return Math.floor(100 - (illumination / 2));
    }
  }
}

export { AppData, DataFetcher };
