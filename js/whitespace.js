/**
 * remove extra whitespace from a string
 * @param {String} str
 * @return {String}
 */
function removeExtraWhitespace (str) {
  return str.replace(/\s\s+/g, ' ');
}

/**
 * returns true if any character in str is non-whitespace
 * @param {String} str
 * @return {boolean}
 */
function hasNonWhitespace (str) {
  return str.search(/[\S]/gm) > 0;
}

export {
  removeExtraWhitespace,
  hasNonWhitespace
}
