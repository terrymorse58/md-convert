// mdconvert transform 'changeHtmlToText' -
// replace element's innerHTML with textContent

/**
 * replace an element's innerHTML with textContent
 * @param {HTMLDocument} document
 * @param {HTMLElement} element
 * @returns {HTMLElement}
 */
function changeHtmlToText (
  document,
  element
) {
  // console.log('changeHtmlToText(), element:', element);

  element.innerHTML = element.textContent;
  return element;
}

export { changeHtmlToText };
