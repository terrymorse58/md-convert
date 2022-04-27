// mdconvert transform 'combineDuplicates' -
//combine runs of duplicate identical elements to a single element

/**
 * replace an element's innerHTML with textContent
 * @param {HTMLDocument} document
 * @param {HTMLElement} element
 * @returns {HTMLElement}
 */
function combineDuplicates (
  document,
  element
) {
  // console.log('combineDuplicates(), element.tagName:', element.tagName);

  const {tagName} = element;
  let elContent = element.innerHTML;
  let node = element.nextSibling;

  while (node && node.nodeName === tagName) {
    elContent += node.innerHTML;
    const nextNode = node.nextSibling;
    node.remove();
    node = nextNode;
  }

  element.innerHTML = elContent;
  return element;
}

export { combineDuplicates };
