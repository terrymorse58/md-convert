// mdconvert transform 'changeAnchorWithBlockChild' - convert anchor to a span
// if it contains at least one block element

// 'display: block' elements (copied from turndown package)
const blockElements = [
  'ADDRESS', 'ARTICLE', 'ASIDE', 'AUDIO', 'BLOCKQUOTE', 'BODY', 'CANVAS',
  'CENTER', 'DD', 'DIR', 'DIV', 'DL', 'DT', 'FIELDSET', 'FIGCAPTION', 'FIGURE',
  'FOOTER', 'FORM', 'FRAMESET', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER',
  'HGROUP', 'HR', 'HTML', 'ISINDEX', 'LI', 'MAIN', 'MENU', 'NAV', 'NOFRAMES',
  'NOSCRIPT', 'OL', 'OUTPUT', 'P', 'PRE', 'SECTION', 'TABLE', 'TBODY', 'TD',
  'TFOOT', 'TH', 'THEAD', 'TR', 'UL'
];

/**
 * true if tag name is a 'display: block' element
 * @param {HTMLElement} element
 * @return {Boolean}
 */
function isBlockElement (element) {
  const {tagName} = element;
  return blockElements.includes(tagName);
}

/**
 * true if element contains a 'display: block' element
 * @param {HTMLElement} element
 * @return {boolean}
 */
function elementContainsBlockElement (element) {
  for (const child of [...element.children]) {
    if (isBlockElement(child)) {
      return true;
    }
  }
  return false;
}

/**
 * change anchor to span if it contains a child block element
 * @param {HTMLDocument} document
 * @param {HTMLAnchorElement} element
 * @param {boolean} [debug]
 */
function changeAnchorWithBlockChild (
  document,
  element,
  {debug = false}
) {
  if (debug) {
    console.log('\nchangeAnchorWithBlockChild()');
    console.log(`  changeAnchorWithBlockChild element:\n` +
      `${element.outerHTML}`);
  }

  const {tagName} = element;


  if (tagName !== 'A') {
    console.error(
      `ERROR changeAnchorWithBlockChild element not anchor: ` +
      `${element.outerHTML}`
    );
    return element;
  }

  // search for block element in children
  if (elementContainsBlockElement(element)) {
    if (debug) {
      console.log(`  changeAnchorWithBlockChild element contains block`);
    }
    // anchor contains at least one block element, convert anchor to span
    const newSpan = document.createElement('span');
    newSpan.innerHTML = element.innerHTML;
    element.replaceWith(newSpan);

    if (debug) {
      console.log(`  changeAnchorWithBlockChild newSpan:\n` +
        `${newSpan.outerHTML}`);
    }

    return newSpan;
  }

  if (debug) {
    console.log(`  changeAnchorWithBlockChild: no changes.`)
  }

  return element;
}

export { changeAnchorWithBlockChild };
