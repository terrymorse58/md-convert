// mdconvert transform 'changeAttribute' - modify an HTML element's attribute

/**
 * change an HTML element's attribute
 * @param {HTMLDocument} document
 * @param {HTMLElement} element
 * @param {String} attrName - name of element attribute
 * @param {String} pattern - regex pattern to find & repalce
 * @param {String} [flags] - regex flags
 * @param {String} newStr - replacement string
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
  // console.log(`  changeAttribute element.outerHTML:`, element.outerHTML);
  console.assert(
    attrName && attrName.length > 0,
    `changeAttribute invalid attrName: '${attrName}'`
  );

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
