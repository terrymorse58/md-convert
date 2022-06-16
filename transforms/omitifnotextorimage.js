// mdconvert transform 'omitIfNoTextOrImage' - remove element if its innerHTML
// is empty

import { hasNonWhitespace } from '../js/whitespace.js';

/**
 * element types that will be excluded from consideration,
 * as they cannot contain children
 * @type {string[]}
 */
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
 * true if element can never have children
 * @param {String} tagName
 * @return {boolean}
 */
function tagNameCannotHaveChildren (tagName) {
  return excludeEls.includes(tagName);
}

/**
 * true if element contains an image
 * @param {HTMLElement} element
 * @return {boolean}
 */
function elementContainsImage (element) {
  return Boolean(element.querySelector('img'));
}

/**
 * remove element from DOM if it contains no images or non-whitespace text
 * @param {HTMLDocument} document
 * @param {HTMLElement} element
 * @param {boolean} [debug]
 * @returns {HTMLElement|null}
 */
function omitIfNoTextOrImage (
  document,
  element,
  {debug = false}
) {
  if (debug) {
    console.log('omitIfNoTextOrImage() element:\n', element.outerHTML);
  }
  let omit;

  if (tagNameCannotHaveChildren(element.tagName) ||
    hasNonWhitespace(element.textContent) ||
    elementContainsImage(element)
  ) {
    if (debug) {
      console.log(`  omitIfNoTextOrImage: NOT omitting.`);
    }
    return element;
  }

  // element has no image or non-whitespace text: remove it
  if (debug) {
    console.log(`  omitIfNoTextOrImage: YES omitting.`);
  }
  element.remove();
  return null;
}

export { omitIfNoTextOrImage };
