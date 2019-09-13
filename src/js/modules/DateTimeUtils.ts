import { Helpers } from './Helpers';

interface AppDate {
  year: number,
  month: number,
  day: number,
}

const DAYS_IN_MONTHS: number[] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

class DateTimeUtils {
  private helpers_: any;

  constructor() {
    this.helpers_ = new Helpers();
  }

  /** 
   * Parses date from the URL and falls back to today if URL isn't valid.
   */
  public activeDate(): AppDate {
    const urlSegments = window.location.pathname.split('/');
    urlSegments.shift();

    const year = parseInt(urlSegments[0]);
    const month = parseInt(urlSegments[1]);
    const day = parseInt(urlSegments[2]);

    // If date part of URL isn't valid, replace URL with '/' and return today.
    if (!this.isValidMonth_(month) || !this.isValidDay_(year, month, day)) {
      history.replaceState(null, null, '/');
      return this.todaysDate();
    }

    return { year, month, day };
  }

  /** 
   * Today.
   */
  public todaysDate(): AppDate {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    return { year, month, day };
  }

  /**
   * Date after the active date.
   */
  public nextDate(): AppDate {
    let { year, month, day } = this.activeDate();

    // Last day of the year.
    if (day === 31 && month === 12) {
      year += 1;
      month = 1;
      day = 1;
    // Leap day.
    } else if (this.isLeapYear_(year) && month === 2 && day === 29) { 
      month = 3;
      day = 1;
    // Last day of the month.
    } else if (day === DAYS_IN_MONTHS[month - 1]) {
      month += 1;
      day = 1;
    } else {
      day += 1;
    }

    return { year, month, day };
  }

  /**
   * Date before the active date.
   */
  public prevDate(): AppDate {
    let { year, month, day } = this.activeDate();

    // First day of the year.
    if (day === 1 && month === 1) {
      year -= 1;
      month = 12;
      day = 31;
    // Day before leap day.
    } else if (this.isLeapYear_(year) && month === 3 && day === 1) {   
      month = 2;
      day = 29;
    // First day of the month.
    } else if (day === 1) {
      month -= 1;
      day = DAYS_IN_MONTHS[month - 1];
    } else {
      day -= 1;
    }

    return { year, month, day };
  }

  /**
   * Date formatted per the locale.
   */
  public prettyDate(date: AppDate, locale: string, monthFormat: string): string {
    let { year, month, day } = date;
    month -= 1; // Adjust month for UTC format
    const date_ = new Date(Date.UTC(year, month, day));

    const formattedDate = date_.toLocaleDateString(locale, {
      day: 'numeric',
      month: monthFormat,
      year: 'numeric',
      timeZone: 'UTC',
    });

    return formattedDate;
  }

  /**
   * Whether the year is a leap year.
   */
  private isLeapYear_(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * Extracts the hours and minutes from a Date object and returns them
   * in HH:MM format;
   */
  public hoursMinutes(date: Date): string {
    const date_ = new Date(date);
    return `${date_.getHours()}:${this.helpers_.zeroPad(date_.getMinutes())}`;
  }

  /**
   * Whether the day is valid.
   */
  private isValidDay_(year: number, month: number, day: number): boolean {
    if (month < 1 || month > 12) {
      return;
    } else if (this.isLeapYear_(year) && month === 2 && day === 29) {
      return true;
    } else {
      const lastDay = DAYS_IN_MONTHS[month - 1];
      return (day >= 1 && day <= lastDay);
    }
  }

  /**
   * Whether the month is valid.
   */
  private isValidMonth_(month: number): boolean {
    return (month > 0 && month < 13);
  }
}

export { AppDate, DateTimeUtils };
