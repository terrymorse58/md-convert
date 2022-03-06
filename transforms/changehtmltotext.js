// mdconvert transform 'changeHtmlToText' -
// replace element's innerHTML with innerText

/**
 * replace an element's innerHTML with innerText
 * @param {HTMLDocument} document
 * @param {HTMLElement} element
 * @returns {HTMLElement}
 */
function changeHtmlToText (
  document,
  element
) {
  // console.log('changeHtmlToText()');

  // element.innerHTML = element.innerText;
  element.innerHTML = "[CONTENT REPLACED BY changeHtmlToText]";
  return element;
}

export { changeHtmlToText };
