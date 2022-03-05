// mdconvert transform 'omitIfNoInnerHTML' - remove element if its innerHTML
// is empty

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

  if (element.innerHTML.length === 0) {
    element.remove();
    return null;
  }
  return element;
}

export { omitIfNoInnerHTML };
