// mdconvert transform 'convertNytimesHome' - convert NY Times home page

import { removeExtraWhitespace } from '../js/whitespace.js';

/**
 * depth first search of element's children for tagnames of interest
 * @param {HTMLElement} parent
 * @param {{tagName, content, src}[]} items
 */
function getChildElements (parent, items) {

  const targetTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'p'];
  const parentTagName = parent.tagName.toLowerCase();

  let item;

  // handle anchor that has no children
  if (parentTagName === 'a' && parent.children.length === 0) {
    item = {
      tagName: 'span',
      content: removeExtraWhitespace(parent.textContent).trim()
    };
  }

  // store image info
  else if (parentTagName === 'img' && parent.hasAttribute('src')) {
    item = {
      tagName: 'img',
      src: parent.getAttribute('src')
    };
  }

  // one of the "target" elements (h1, etc.)
  else if (targetTags.includes(parentTagName)) {
    item = {
      tagName: parent.tagName.toLowerCase(),
      content: removeExtraWhitespace(parent.textContent).trim()
    };
  }

  // store item info if it exists
  if (item) {
    items.push(item);
    return;
  }

  // evaluate all the children
  for (const child of parent.children) {
    getChildElements(child, items);
  }
}

/**
 * convert the NY Times page, replacing body contents
 * @param {HTMLDocument} document
 * @param {undefined} [element]
 * @param {Boolean} debug
 * @param {Window} window
 */
function convertNytimesHome (
  document,
  element = undefined,
  {debug = false},
  window) {

  if (debug) {
    console.log(`convertNyTimesHome()`);
  }

  // work on a clome of body
  const bodyClone = document.createElement('body');
  bodyClone.innerHTML = document.body.innerHTML;

  // remove tables from body clone
  [...bodyClone.querySelectorAll('table')]
    .forEach(table => { table.remove(); });

  // try getting anchors within a section
  const sections = [
    ...bodyClone.querySelectorAll('section')
  ];
  const anchors = sections.reduce((acc, section) => {
    const anchor = section.querySelector('a');
    if (!anchor) { return acc; }
    if (!anchor.href.startsWith('http')) { return acc; }
    acc.push(anchor);
    return acc;
  }, []);

  if (debug) {
    console.log(`  convertNyTimesHome anchors hrefs:\n`);
    for (const a of anchors) {
      console.log(`    "${a.href}"`);
    }
  }

  // form story list from anchors and their children
  const storySet = new Set();
  const storyList = anchors.reduce((acc, anchor) => {
    const {href} = anchor;

    const items = [];
    getChildElements(anchor, items);
    const story = {href, items},
      storyJson = JSON.stringify(story);

    // prevent duplicates
    if (storySet.has(storyJson)) { return acc; }

    acc.push(story);
    storySet.add(storyJson);

    return acc;
  }, []);

  if (debug) {
    console.log(`  storyList:\n`,
      JSON.stringify(storyList, null, 2));
  }

  // form new body
  const newBody = document.createElement('body');

  const h1 = document.createElement('h1');
  h1.textContent = 'New York Times Home Page';
  newBody.appendChild(h1);

  storyList.forEach(story => {
    const {href, items} = story;

    for (const item of items) {
      const {tagName, content, src} = item;

      const a = document.createElement('a');
      a.href = href;

      const el = document.createElement(tagName);

      if (tagName === 'img') {
        // image: wrap it with anchor
        el.src = src;
        a.appendChild(el);
        newBody.appendChild(a);
      } else if (tagName === 'p') {
        // paragraph: plain text with no anchor
        el.textContent = content;
        newBody.appendChild(el);
      } else {
        // heading (probably): wrap text with anchor
        a.textContent = content;
        el.appendChild(a);
        newBody.appendChild(el);
      }
    }

    newBody.appendChild(document.createElement('hr'));
  });

  document.body.innerHTML = newBody.innerHTML;

  return document.body;
}

export { convertNytimesHome };
