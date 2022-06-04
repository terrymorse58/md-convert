// mdconvert transform 'insertBefore' - insert HTML before an element

/**
 * insert HTML before an element
 * @param {HTMLDocument} document
 * @param {HTMLElement} element
 * @param {String} htmlStr
 * @param {Boolean} debug
 * @returns {HTMLElement}
 */
function insertBefore (
  document,
  element,
  { htmlStr, debug = false}
) {

  if (debug) {
    console.log('insertBefore()');
    console.log(`  insertBefore element: ${element.outerHTML}`);
  }

  console.assert(typeof htmlStr === 'string',
    'insertBefore: invalid htmlStr');

  if (typeof htmlStr !== 'string') { return element; }

  const wrapper = document.createElement('div');
  wrapper.innerHTML = htmlStr;
  const nodes = [...wrapper.children];
  element.before(...nodes);
  return element;
}

export { insertBefore };
