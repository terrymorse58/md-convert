// mdconvert transform 'insertAfter' - insert HTML after an element

/**
 * insert HTML after an element
 * @param {HTMLDocument} document
 * @param {HTMLElement} element
 * @param {String} htmlStr
 * @returns {HTMLElement}
 */
function insertAfter (
  document,
  element,
  { htmlStr}
) {
  // console.log('insertAfter()');

  console.assert(typeof htmlStr === 'string',
    'insertAfter: invalid htmlStr');

  if (typeof htmlStr !== 'string') { return element; }

  const wrapper = document.createElement('div');
  wrapper.innerHTML = htmlStr;
  const nodes = [...wrapper.children];
  element.after(...nodes);
  return element;
}

export { insertAfter };
