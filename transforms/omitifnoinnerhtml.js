// mdconvert transform 'omitIfNoInnerHTML' - remove element if its innerHTML
// is empty

// element types that cannot have children
const noChildEls = [
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

  if (noChildEls.includes(element.tagName)) { return element; }

    if (element.innerHTML.length === 0) {
      element.remove();
      return null;
    }
  return element;
}

export { omitIfNoInnerHTML };
