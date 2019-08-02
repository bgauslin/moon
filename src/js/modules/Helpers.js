/** @class */
class Helpers {
  /**
   * Returns multiple words with first letter of each word capitalized.
   * @param {string} words
   * @return {string} 
   * @public
   */
  titleCase(words) {
    const wordsArray = words.split(' ');
    const capitalized = wordsArray.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return capitalized.join(' ');
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
