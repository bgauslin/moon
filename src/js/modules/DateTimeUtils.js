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
   * Parses date from the URL, falls back to today if URL isn't valid, and
   * returns a date object.
   * @return {Date} The date object.
   * @public
   */
  currentDate() {
    const pathname = window.location.pathname;
    const urlSegments = pathname.split('/');
    urlSegments.shift();

    let year = Number(urlSegments[0]);
    let month = Number(urlSegments[1]);
    let day = Number(urlSegments[2]);

    // If URL isn't a valid date, get today instead and redirect to home page.
    if (!this.validYear_(year) || !this.validMonth_(month) || !this.validDay_(year, month, day)) {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth() + 1;
      day = now.getDate();

      history.replaceState(null, null, '/');
    }

    return { year, month, day };
  }

  /**
   * @param {!Object} date
   * @param {!number} date.year
   * @param {!number} date.month
   * @param {!number} date.day
   * @param {!string} locale
   * @param {!string} monthFormat
   * @return {string} Date formatted per the locale.
   * @public
   */
  formatDate(date, locale, monthFormat) {
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

  // TODO: Rename this method, relocate it, and pass selectors into it.
  /**
   * Adds/removes class if current date is today.
   * @param {!Object} date
   * @param {!number} date.year
   * @param {!number} date.month
   * @param {!number} date.day
   * @public
   */
  isToday(date) {
    const now = new Date();
    const dateNow = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };

    const isToday = (date.year === dateNow.year && date.month === dateNow.month && date.day === dateNow.day);

    const selectors = ['.header__title', '.info__phase', '.info__percent'];
    selectors.forEach((selector) => {
      const el = document.querySelector(selector);
      if (isToday) {
        el.classList.add('today');
      } else {
        el.classList.remove('today');
      }
    }); 
  }

  /**
   * @param {!string} time - Time in HH:MM AM/PM format.
   * @return {string} Time in HH:MM 24-hour format.
   * @public
   */
  militaryTime(time) {
    const amPm = time.split(' ')[1].replace(/\./g, '').toUpperCase();
    const hours = Number(time.split(' ')[0].split(':')[0]);
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
   * @return {Date} Date after the current date.
   * @public
   */
  nextDate() {
    let { year, month, day } = this.currentDate();

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
   * @return {Date} Date before the current date.
   * @public
   */
  prevDate() {
    let { year, month, day } = this.currentDate();

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
