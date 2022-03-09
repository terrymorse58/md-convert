// mdconvert transform 'changeNoscript' - change a noscript element

/**
 * change a 'noscript' element to a div element
 * @param {HTMLDocument} document
 * @param {HTMLElement} element
 * @returns {HTMLElement}
 */
function changeNoscript (
  document,
  element
) {
  // console.log('changeNoscript() element:', element);

  let content = element.innerHTML;
  const div = document.createElement('div');
  div.innerHTML = content;
  element.replaceWith(div);
  return element;
}

export { changeNoscript };
