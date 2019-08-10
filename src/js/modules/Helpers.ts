interface AppDate {
  year: number,
  month: number,
  day: number,
}

class Helpers {
  /**
   * Converts a Date object and a location string to a full URL.
   */
  public makeUrl(date: AppDate, location: string): URL {
    const { year, month, day } = date;
    const month_ = this.zeroPad(month);
    const day_ = this.zeroPad(day);
    const location_ = this.urlify(location);
    const url = new URL(`/${year}/${month_}/${day_}/${location_}`, window.location.origin);
    return url;
  }

  /**
   * Returns multiple words with first letter of each word capitalized.
   */
  public titleCase(words: string): string {
    const wordsArray = words.split(' ');
    const capitalized = wordsArray.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return capitalized.join(' ');
  }

  /**
   * Returns a URL-friendly lowercase string with each space replaced with a '+'.
   */
  public urlify(value: string): string {
    return value.toLowerCase().replace(/[\s]/g, '+')
  }

  /**
   * Returns a value with zero-padding if value is less than 10.
   */
  public zeroPad(n: number): string|number {
    return (n < 10) ? `0${n}` : n;
  }
}

export { Helpers };
