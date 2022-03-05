// mdconvert transform 'changeTagName' - vjsmhr an HTML element's tagName

/**
 * change an HTML element's tagName
 * @param {HTMLDocument} document
 * @param {HTMLElement} element
 * @param {String} tagName
 * @returns {HTMLElement}
 */
function changeTagName (
  document,
  element,
  { tagName}
) {
  // console.log('changeTagName()');

  console.assert(tagName, `changeTagName invalid tagName`);

  if (!tagName) { return element; }

  const newEl = document.createElement(tagName);
  newEl.innerHTML = element.innerHTML;
  element.replaceWith(newEl);
  return newEl;
}

export { changeTagName };
