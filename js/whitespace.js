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
 * @param {Boolean} [debug]
 * @return {boolean}
 */
function hasNonWhitespace (str, debug= false) {

  if (debug) {
    console.log(`hasNoWhiteSpace() str: '${str}'`)
  }

  const firstFound = str.match(/[\S]/);

  if (debug) {
    console.log(`  hasNoWhiteSpace firstFound: ${firstFound}`);
  }

  return (firstFound !== null);
}

export {
  removeExtraWhitespace,
  hasNonWhitespace
}
