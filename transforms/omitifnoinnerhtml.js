// mdconvert transform 'omitIfNoInnerHTML' - remove element if its innerHTML
// is empty

// element types that will be excluded from evaluation
const excludeEls = [
  'AREA',
  'BASE',
  'BR',
  'COL',
  'COMMAND',
  'EMBED',
  'HR',
  'IMG',
  'INPUT',
  'KEYGEN',
  'LINK',
  'META',
  'PARAM',
  'SOURCE',
  'TRACK',
  'TD',
  'TH',
  'WBR'
];

/**
 * remove element from DOM if its innerHTML is empty
 * @param {HTMLDocument} document
 * @param {HTMLElement} element
 * @returns {HTMLElement|null}
 */
function omitIfNoInnerHTML (
  document,
  element
) {
  // console.log('omitIfNoInnerHTML()');

  if (excludeEls.includes(element.tagName)) { return element; }

  if (element.innerHTML.length === 0) {
    element.remove();
    return null;
  }
  return element;
}

export { omitIfNoInnerHTML };
