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
 * obtain array of child block elements
 * @param parent
 * @return {HTMLElement[]}
 */
function blockElementChildren (parent) {
  return [...parent.children]
    .filter(child => isBlockElement(child));
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
 * change anchor if it contains a child block element
 * @param {HTMLDocument} document
 * @param {HTMLAnchorElement} anchor
 * @param {boolean} [debug]
 */
function changeAnchorWithBlockChild (
  document,
  anchor,
  {debug = false}
) {
  if (debug) {
    console.log(`\nchangeAnchorWithBlockChild() anchor:\n` +
      `    ${anchor.outerHTML}`);
  }

  const {tagName} = anchor;


  if (tagName !== 'A') {
    console.error(
      `ERROR changeAnchorWithBlockChild element not anchor: ` +
      `${anchor.outerHTML}`
    );
    return anchor;
  }

  if (!elementContainsBlockElement(anchor)) {
    if (debug) {
      console.log(
        `  changeAnchorWithBlockChild: no block children, no changes.`);
    }
    return anchor;
  }

  // revise anchor recursively
  let anchorClone = document.createElement('a');
  anchorClone.href = anchor.href;
  anchorClone.innerHTML = anchor.innerHTML;
  anchorClone = reviseAnchor(document, anchorClone, debug);

  if (debug) {
    console.log(`  changeAnchorWithBlockChild complete, anchorClone:\n` +
      `    ${anchorClone.outerHTML}`);
  }

  anchor.replaceWith(anchorClone);

  return anchorClone;
}

/**
 * revise anchor recursively
 * @param {HTMLDocument} document
 * @param {HTMLAnchorElement} anchor
 * @param {Boolean} [debug]
 * @param {Number} [level]
 */
function reviseAnchor (
  document,
  anchor,
  debug = false,
  level = 0) {

  if (debug) {
    console.log(`reviseAnchor level ${level} anchor:`, anchor?.outerHTML);
  }

  const {href} = anchor;

  if (!elementContainsBlockElement(anchor)) {
    if (debug) {
      console.log(`  reviseAnchor no block children, ignoring:\n`,
        anchor.outerHTML);
    }
    return anchor;
  }

  // insert anchor into block child, or wrap anchor around non-block child
  for (const child of [...anchor.children]) {

    if (debug) {
      console.log(`    child:\n    `, child.outerHTML);
    }

    let aChild = document.createElement('a');
    aChild.href = href;

    if (isBlockElement(child)) {
      // insert anchor inside block child
      aChild.innerHTML = child.innerHTML;
      child.innerHTML = aChild.outerHTML;
    } else {
      // wrap non-block child in anchor
      aChild.innerHTML = child.outerHTML;
      child.replaceWith(aChild);
    }

    // if (debug) {
    //   console.log(`    aChild:\n    `, aChild.outerHTML);
    // }
  }

  // replace original anchor with span
  const span = document.createElement('span');
  span.innerHTML = anchor.innerHTML;
  anchor.replaceWith(span);

  if (debug) {
    console.log(`  reviseAnchor complete span:\n${span.outerHTML}\n`);
  }

  return span;

}

export { changeAnchorWithBlockChild };
