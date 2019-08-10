/**
 * @typedef {Object} Date
 * @property {number} year 
 * @property {number} month
 * @property {number} day
 */

/** @const {Array<number>} */
const DAYS_IN_MONTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** @enum {number} */
const ApiYears = {
  MAX: 2100,
  MIN: 1700,
};

/** @class */
class DateTimeUtils {
  /** 
   * Parses date from the URL and falls back to today if URL isn't valid.
   * @return {Date}
   * @public
   */
  activeDate() {
    const urlSegments = window.location.pathname.split('/');
    urlSegments.shift();

    const year = parseInt(urlSegments[0]);
    const month = parseInt(urlSegments[1]);
    const day = parseInt(urlSegments[2]);

    // If date part of URL isn't valid, replace URL with '/' and return today.
    if (!this.validYear_(year) || !this.validMonth_(month) || !this.validDay_(year, month, day)) {
      history.replaceState(null, null, '/');
      return this.todaysDate();
    }

    return { year, month, day };
  }

  /** 
   * @return {Date} Today.
   * @public
   */
  todaysDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    return { year, month, day };
  }

  /**
   * @return {Date} Date after the active date.
   * @public
   */
  nextDate() {
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
   * @return {Date} Date before the active date.
   * @public
   */
  prevDate() {
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
   * @param {!Date} date
   * @param {!string} locale
   * @param {!string} monthFormat
   * @return {string} Date formatted per the locale.
   * @public
   */
  prettyDate(date, locale, monthFormat) {
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
   * @param {!number} year
   * @return {boolean}
   * @private
   */
  isLeapYear_(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * @param {!string} time - Time in HH:MM AM/PM format.
   * @return {string} Time in HH:MM 24-hour format.
   * @public
   */
  militaryTime(time) {
    const amPm = time.split(' ')[1].replace(/\./g, '').toUpperCase();
    const hours = parseInt(time.split(' ')[0].split(':')[0]);
    const minutes = time.split(' ')[0].split(':')[1];

    let hours_ = hours;
    if (amPm === 'AM' && hours === 12) {
      hours_ = 0;
    }
    if (amPm === 'PM' && hours < 12) {
      hours_ += 12;
    }

    return `${hours_}:${minutes}`;
  }

  /**
   * @param {!number} year
   * @param {!number} month
   * @param {!number} day
   * @return {boolean}
   * @private
   */
  validDay_(year, month, day) {
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
   * @param {!number} month
   * @return {boolean}
   * @private
   */
  validMonth_(month) {
    return (month > 0 && month < 13);
  }

  /**
   * @param {!number} year
   * @return {boolean}
   * @private
   */
  validYear_(year) {
    return (year >= ApiYears.MIN && year <= ApiYears.MAX);
  }
}

export { DateTimeUtils };
