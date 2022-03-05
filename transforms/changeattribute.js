// mdconvert transform 'changeAttribute' - modify an HTML element's attribute

/**
 * change an HTML element's attribute
 * @param {HTMLDocument} document
 * @param {HTMLElement} element
 * @param {String} attrName
 * @param {String} pattern
 * @param {String} [flags]
 * @param {String} newStr
 * @returns {HTMLElement}
 */
function changeAttribute (
  document,
  element,
  { attrName,
    pattern,
    flags = "",
    newStr}
) {
  // console.log('changeAttr()');

  console.assert(attrName, `changeAttr invalid attrName`);
  console.assert(pattern, `changeAttr invalid pattern`);
  console.assert(newStr, `changeAttr invalid newStr`);

  if (!attrName || !pattern || !newStr) {
    return element;
  }

  const regex = new RegExp(pattern, flags);
  let content = element.getAttribute(attrName);
  if (!content) { return element; }

  content = content.replace(regex, newStr);
  element.setAttribute(attrName, content);
  return element;
}

export { changeAttribute };
