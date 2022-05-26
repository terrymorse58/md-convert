// mdconvert transform 'convertTimestamp' -
//   convert timestamp content to human friendly text

/*
  example HTML from Business Intelligence:

  <div
      className="byline-timestamp headline-regular js-date-format"
      data-timestamp="2022-05-25T10:42:00Z"
      data-e2e-name="byline-timestamp"
  >2022-05-25T10:42:00Z</div>

 */

/**
 * convert timestamp element textContent to readable date string
 * @param {HTMLDocument} document
 * @param {HTMLElement} element
 * @param {string} timestampAttrName
 * @param {Boolean} [debug]
 * @param {Window} [window]
 * @returns {HTMLImageElement}
 */
function convertTimestamp (
  document,
  element,
  {
    timestampAttrName,
    debug = false
  },
  window = undefined
) {

  if (debug) {
    console.log('\nconvertTimestamp()');
    console.log(`  convertTimestamp element:\n`, element.outerHTML);
  }

  const timestamp = element.getAttribute(timestampAttrName);
  if (!timestamp) { return element; }

  const date = new Date(timestamp);
  element.textContent = ` ${date.toString()} `;

  if (debug) {
    console.log(`  convertTimestamp complete, element:\n`, element.outerHTML);
  }

  return element;
}

export { convertTimestamp };
