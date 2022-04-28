// mdconvert transform 'changeAnchorWithBlockChild' - change anchor that contains
// at least one block element to a span

// all 'display: inline' elements
const inlineEls = new Set(['ABBR', 'ACRONYM', 'B', 'BR', 'EM', 'I',
  'IMG', 'NOSCRIPT', 'PICTURE', 'S', 'SMALL', 'SPAN', 'STRONG', 'SUB',
  'SUP', 'TIME', 'U', 'TT']);

/**
 * change anchor to span if it has a block child element
 * @param {HTMLDocument} document
 * @param {HTMLElement} element
 */
function changeAnchorWithBlockChild (
  document,
  element
) {
  // console.log('changeAnchorWithBlockChild()');

  /** @type HTMLAnchorElement **/
  const a = element,
    tagName = a.tagName;
  let containsBlockElement = false;

  console.assert(tagName === 'A', `changeAnchorWithBlockChild invalid element`);

  if (tagName !== 'A') { return element; }

  // search for block element in children
  for (const child of [...a.children]) {
    if (!inlineEls.has(child.tagName)) {
      containsBlockElement = true;
      break;
    }
  }

  if (!containsBlockElement) {
    return element;
  }

  // anchor contains block element, convert anchor to span
  const newSpan = document.createElement('span');
  newSpan.innerHTML = a.innerHTML;
  a.replaceWith(newSpan);
  return newSpan;
}

export { changeAnchorWithBlockChild };
