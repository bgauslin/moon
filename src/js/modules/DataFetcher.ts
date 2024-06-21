import SunCalc from 'suncalc';
import tzLookup from 'tz-lookup';
import {AppDate, Utils} from './Utils';

export interface MoonData {
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

/**
 * Class that gets lat/lng coordinates from a geocoding API to then
 * determine moon and sun rise/set times based on that geolocation.
 */
export class DataFetcher {
  private date: Date;
  private dateUtils: Utils;
  private lat: number;
  private lng: number;
  private location: string;
  private timezone: string;

  constructor() {
    this.dateUtils = new Utils();
  }

  /**
   * Fetches location coordinates, then returns sun and moon data for rendering.
   */
  public async fetch(date: AppDate, location: string): Promise<MoonData> {
    const newLocation = this.dateUtils.urlify(location);

    // Get lat/lng via API based on location.
    if (newLocation !== this.location) {
      const endpoint = `${process.env.GEOCODE_API}search?q=${newLocation}&api_key=${process.env.GEOCODE_API_KEY}`;
      const response = await fetch(endpoint);
      const data = await response.json();
      const {lat, lon} = data[0];
      this.lat = lat;
      this.lng = lon;
      this.timezone = tzLookup(lat, lon);
      this.location = newLocation;
    }
    // Create a Date object from the date parameter for SunCalc.
    const {year, month, day} = date;
    const monthIndex = month - 1;
    this.date = new Date(year, monthIndex, day);

    // Normalize all API data and put it in an object for setting attribute
    // values on custom elements.
    const {sunrise, sunset} = this.sunriseSunset();
    const {moonrise, moonset} = this.moonriseMoonset();

    return {
      hemisphere: this.hemisphere(),
      illumination: this.moonPhaseIllumination(),
      moonrise,
      moonset,
      percent: this.moonPhasePercent(),
      phase: this.moonPhase(),
      sunrise,
      sunset,
    }
  }

  /**
   * Sets the hemisphere based on location's latitude.
   */
  private hemisphere(): string {
    return (this.lat >= 0) ? 'northern' : 'southern';
  }

  /**
   * Converts sunrise and sunset times to 24-hour HH:MM format.
   */
  private sunriseSunset(): SunriseSunset {
    const sunTimes = SunCalc.getTimes(this.date, this.lat, this.lng);
    const sunrise = this.dateUtils.militaryTime(sunTimes.sunrise, this.timezone);
    const sunset = this.dateUtils.militaryTime(sunTimes.sunset, this.timezone);
    return {sunrise, sunset};
  }

  /**
   * Converts moonrise and moonset times to 24-hour HH:MM format.
   */
  private moonriseMoonset(): MoonriseMoonset {
    const moonTimes = SunCalc.getMoonTimes(this.date, this.lat, this.lng);

    let moonrise_: Date = moonTimes.rise;
    let moonset_: Date = moonTimes.set;

    // If moonrise or moonset values are undefined, use the day before instead.
    // If the day before is still undefined, use the day after. Ultimately, we
    // just want to avoid console errors and broken chart rendering.
    // For our purposes, "close enough" is preferred over "totally broken."
    // For example: /2001/10/29/Reykjavik,+Iceland
    if (moonrise_ === undefined || moonset_ === undefined) {
      const {year: prevYear, month: prevMonth, day: prevDay} = this.dateUtils.prevDate();
      const prevMonthIndex = prevMonth - 1;
      const prevDate = new Date(prevYear, prevMonthIndex, prevDay);
      const prevMoonTimes = SunCalc.getMoonTimes(prevDate, this.lat, this.lng);

      const {year: nextYear, month: nextMonth, day: nextDay} = this.dateUtils.nextDate();
      const nextMonthIndex = nextMonth - 1;
      const nextDate = new Date(nextYear, nextMonthIndex, nextDay);
      const nextMoonTimes = SunCalc.getMoonTimes(nextDate, this.lat, this.lng);

      if (moonrise_ === undefined) {
        moonrise_ = (prevMoonTimes.rise !== undefined) ? prevMoonTimes.rise : nextMoonTimes.rise;
      }

      if (moonset_ === undefined) {
        moonset_ = (prevMoonTimes.set !== undefined) ? prevMoonTimes.set : nextMoonTimes.set;
      }
    }

    const moonrise = this.dateUtils.militaryTime(moonrise_, this.timezone);
    const moonset = this.dateUtils.militaryTime(moonset_, this.timezone);

    return {moonrise, moonset};
  }

  /**
   * Returns moon phase illumination as an integer of a percentage.
   * e.g. .7123 => 71
   */
  private moonPhaseIllumination(): number {
    const illumination = SunCalc.getMoonIllumination(this.date);
    return Math.ceil(illumination.fraction * 100);
  }

  // TODO(fetcher): Update moonPhase() values to ensure all phases display.
  /**
   * Returns current moon phase.
   */
  private moonPhase(): string {
    const percent = this.moonPhasePercent();

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
  private moonPhasePercent(): number {
    const illumination = SunCalc.getMoonIllumination(this.date);
    return Math.ceil(illumination.phase * 100);
  }
}
