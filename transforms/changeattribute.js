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
  // console.log('changeAttribute()');
  // console.log(`  changeAttribute element:`, element);

  if (!element || !attrName || !pattern || typeof newStr !== 'string') {
    return element;
  }

  let content = element.getAttribute(attrName);

  if (!content) { return element; }

  const regex = new RegExp(pattern, flags);
  content = content.replace(regex, newStr);
  element.setAttribute(attrName, content);
  return element;
}

export { changeAttribute };
