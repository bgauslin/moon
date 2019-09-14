import SunCalc from 'suncalc';
import tzLookup from 'tz-lookup';
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
  private timezone_: string;

  constructor() {
    this.dateTimeUtils_ = new DateTimeUtils();
    this.helpers_ = new Helpers();
  }

  /**
   * Fetches location coordinates, then returns sun and moon data for rendering.
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
      this.timezone_ = tzLookup(this.lat_, this.lng_);
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
   * Converts sunrise and sunset times to 24-hour HH:MM format.
   */
  private sunriseSunset_(): SunriseSunset {
    const sunTimes = SunCalc.getTimes(this.date_, this.lat_, this.lng_);
    const sunrise = this.dateTimeUtils_.militaryTime(sunTimes.sunrise, this.timezone_);
    const sunset = this.dateTimeUtils_.militaryTime(sunTimes.sunset, this.timezone_);
    return { sunrise, sunset };
  }

  /**
   * Converts moonrise and moonset times to 24-hour HH:MM format.
   */
  private moonriseMoonset_(): MoonriseMoonset {
    const moonTimes = SunCalc.getMoonTimes(this.date_, this.lat_, this.lng_);

    let moonrise = moonTimes.rise;
    let moonset = moonTimes.set;

    // If moonrise or moonset values are undefined, use the day before instead.
    // If the day before is still undefined, use the day after. Ultimately, we
    // just want to avoid console errors and broken chart rendering.
    // For our purposes, "close enough" is preferred over "totally broken."
    // For example: /2001/10/29/Reykjavik,+Iceland
    if (moonrise === undefined || moonset === undefined) {
      const { year: prevYear, month: prevMonth, day: prevDay } = this.dateTimeUtils_.prevDate();
      const prevMonthIndex = prevMonth - 1;
      const prevDate = new Date(prevYear, prevMonthIndex, prevDay);
      const prevMoonTimes = SunCalc.getMoonTimes(prevDate, this.lat_, this.lng_);

      const { year: nextYear, month: nextMonth, day: nextDay } = this.dateTimeUtils_.nextDate();
      const nextMonthIndex = nextMonth - 1;
      const nextDate = new Date(nextYear, nextMonthIndex, nextDay);
      const nextMoonTimes = SunCalc.getMoonTimes(nextDate, this.lat_, this.lng_);

      if (moonrise === undefined) {
        moonrise = prevMoonTimes.rise !== undefined ? prevMoonTimes.rise : nextMoonTimes.rise;
      }

      if (moonset === undefined) {
        moonset = prevMoonTimes.set !== undefined ? prevMoonTimes.set : nextMoonTimes.set;
      }
    }

    moonrise = this.dateTimeUtils_.militaryTime(moonrise, this.timezone_);
    moonset = this.dateTimeUtils_.militaryTime(moonset, this.timezone_);

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

  // TODO(fetcher): Update moonPhase_() values to ensure all phases display.
  /**
   * Returns current moon phase.
   */
  private moonPhase_(): string {
    const percent = this.moonPhasePercent_();

    if (percent === 0) {
      return 'New Moon';
    } else if (percent < 25) {
      return 'Waxing Crescent';
    } else if (percent <= 27) { // instead of === 25
      return 'First Quarter';
    } else if (percent < 50) {
      return 'Waxing Gibbous';
    } else if (percent <= 52) { // instead of === 50
      return 'Full Moon';
    } else if (percent < 75) {
      return 'Waning Gibbous';
    } else if (percent <= 77) { // instead of === 75
      return 'Last Quarter';
    } else if (percent < 100) {
      return 'Waning Crescent'
    }
  }

  /**
   * Returns moon cycle percentage as an integer. MoonPhoto needs this value
   * in order to calculate which image to show.
   */
  private moonPhasePercent_(): number {
    const illumination = SunCalc.getMoonIllumination(this.date_);
    return Math.floor(illumination.phase * 100);
  }
}

export { AppData, DataFetcher };
