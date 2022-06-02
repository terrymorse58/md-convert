// mdconvert transform 'changeTagName' - change an HTML element's tagName

/**
 * change an HTML element's tagName
 * @param {HTMLDocument} document
 * @param {HTMLElement} element
 * @param {String} tagName
 * @param {Boolean} debug
 * @returns {HTMLElement}
 */
function changeTagName (
  document,
  element,
  { tagName, debug}
) {

  if (debug) {
    console.log('changeTagName()');
    console.log(`  changeTagName element: ${element.outerHTML}`);
  }

  if (!tagName) {
    console.error(`changeTagName invalid tagName '${tagName}'`);
    return element;
  }

  const newEl = document.createElement(tagName);
  newEl.innerHTML = element.innerHTML;

  // copy the element attributes, also
  [...element.attributes].forEach(({name, value}) => {
    newEl.setAttribute(name, value);
  });

  element.replaceWith(newEl);

  if (debug) {
    console.log(`  changeTagName newEl: ${newEl.outerHTML}`);
  }

  return newEl;
}

export { changeTagName };
