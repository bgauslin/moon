/** @class */
class Helpers {
  /**
   * Converts a Date object and a location string to a full URL.
   * @param {!Date} date
   * @param {!string} location
   * @return {string} 
   * @public
   */
  makeUrl(date, location) {
    const { year, month, day } = date;
    const month_ = this.zeroPad(month);
    const day_ = this.zeroPad(day);
    const location_ = this.urlify(location);
    const url = new URL(`/${year}/${month_}/${day_}/${location_}`, window.location.origin);
    return url;
  }

  /**
   * Returns multiple words with first letter of each word capitalized.
   * @param {!string} words
   * @return {string} 
   * @public
   */
  titleCase(words) {
    const wordsArray = words.split(' ');
    const capitalized = wordsArray.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return capitalized.join(' ');
  }

  /**
   * Returns a URL-friendly lowercase string with each space replaced with a '+'.
   * @param {!string} value
   * @return {string} 
   * @public
   */
  urlify(value) {
    return value.toLowerCase().replace(/[\s]/g, '+')
  }

  /**
   * @param {!number} n
   * @return {string|number} Value with zero-padding if less than 10.
   * @public
   */
  zeroPad(n) {
    return (n < 10) ? `0${n}` : n;
  }
}

export { Helpers };
