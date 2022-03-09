// mdconvert transform 'changeInnerHTML' - change an HTML element's innerHTML

/**
 * change an HTML element's tagName
 * @param {HTMLDocument} document
 * @param {HTMLElement} element
 * @param {String} pattern
 * @param {String} flags
 * @param {String} newStr
 * @returns {HTMLElement}
 */
function changeInnerHTML (
  document,
  element,
  {
    pattern,
    flags,
    newStr
  }
) {
  // console.log('changeInnerHTML()');

  console.assert(Boolean(pattern), `changeInnerHTML invalid pattern`);
  console.assert(typeof newStr === 'string',
    'problem with newStr');

  if (!pattern || typeof newStr !== 'string') { return element; }

  let content = element.innerHTML;
  const regex = new RegExp(pattern, flags);
  element.innerHTML = content.replace(regex, newStr);
  return element;
}

export { changeInnerHTML };
