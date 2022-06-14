/**
 * remove extra whitespace from a string
 * @param {String} str
 * @return {String}
 */
function removeExtraWhitespace (str) {
  return str.replace(/\s\s+/g, ' ');
}

export {
  removeExtraWhitespace
}
