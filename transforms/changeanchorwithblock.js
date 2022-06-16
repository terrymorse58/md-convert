// mdconvert transform 'changeAnchorWithBlockChild' - convert anchor to a span
// if it contains at least one block element

import { hasNonWhitespace } from '../js/whitespace.js';

/**
 * tag names of block elements
 * @type {string[]}
 */
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
 * form array of `last descendant` children elements
 * @param {HTMLDocument} document
 * @param {Window} window
 * @param {Node} node
 * @param {Boolean} [debug]
 * @return {HTMLElement[]}
 */
function getLastDescendants (
  document,
  window,
  node,
  debug = false
) {

  // if (debug) {
  //   console.log(`\ngetLastDescendants() nodeType: ${node.nodeType}`);
  // }

  const Node = window.Node;

  // for text node, wrap text in span
  if (node.nodeType === Node.TEXT_NODE) {
    const span = document.createElement('span');
    span.textContent = node.nodeValue;
    return [span];
  }

  // ignore all node types other than element
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return [];
  }

  // return this element if it has no child elements
  const element = /** @type {HTMLElement} **/ node;
  if (element.children.length === 0) {
    return [element];
  }

  // search children of this element (depth-first search)
  let descendants = [];
  for (const child of node.childNodes) {
    const childsKids = getLastDescendants(document, window, child, debug);
    if (childsKids.length > 0) {
      descendants = [...descendants, ...childsKids];
    }
  }

  return descendants;
}

/**
 * change anchor if it contains child block elements
 * - insert anchor into block element
 * - wrap anchor around non-block element
 * @param {HTMLDocument} document
 * @param {HTMLAnchorElement} anchor
 * @param {boolean} [debug]
 * @param {Window} window
 */
function changeAnchorWithBlockChild (
  document,
  anchor,
  {debug = false},
  window
) {
  if (debug) {
    console.log(`\nchangeAnchorWithBlockChild() anchor:\n` +
      `    ${anchor.outerHTML}`);
  }

  const {tagName, href} = anchor;

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
        `  changeAnchorWithBlockChild: no block descendant, no changes.\n`);
    }
    return anchor;
  }

  // form array of 'last descendant' elements
  const blockChildren = getLastDescendants(document, window, anchor, debug);

  // combine adjacent elements of the same type
  for (let i = 0; i < blockChildren.length; i++) {
    const elI = blockChildren[i];
    const iTagName = elI.tagName;
    const jNext = i + 1;
    while (blockChildren.length > jNext) {
      const elJ = blockChildren[jNext];
      const jTagName = elJ.tagName;
      if (jTagName !== iTagName) { break; }

      elI.innerHTML += elJ.innerHTML;
      blockChildren.splice(jNext, 1);
    }
  }

  // create span wrapper to contain all the elements
  const spanWrapper = document.createElement('span');
  spanWrapper.className = 'changeAnchorWithBlockChild';

  // insert elements into spanWrapper
  for (const el of blockChildren) {

    if (isBlockElement(el)) {

      // block element: place anchor inside element
      const a = document.createElement('a');
      a.href = href;
      a.innerHTML = el.innerHTML;
      el.innerHTML = '';
      el.appendChild(a);
      spanWrapper.appendChild(el);

    } else if (el.tagName === 'SPAN' &&
      !hasNonWhitespace(el.textContent)) {

      // span containing only whitespace: no anchor wrap
      spanWrapper.appendChild(el);

    } else {

      // non-block element that isn't 'span',
      // or 'span' with non-whitespace:
      // wrap anchor around element
      const a = document.createElement('a');
      a.href = href;
      a.appendChild(el);
      spanWrapper.appendChild(a);

    }
  }

  if (debug) {
    console.log(`  changeAnchorWithBlockChild complete spanWrapper:`);
    console.log(`    ${spanWrapper.outerHTML}\n`);
  }

  anchor.replaceWith(spanWrapper);

  return spanWrapper;

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
