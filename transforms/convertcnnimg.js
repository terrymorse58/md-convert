// mdconvert transform 'convertCNNImg' -
//   convert CNN img 'data-src-*' attribute to 'src' attribute

/*
sample CNN image:

<img className="media__image media__image--responsive"
     alt="The remains of a Russian T90M tank destroyed days earlier. The Ukrainian defense ministry released a drone video of the tank being destroyed in the apparent strike."
     data-src-mini="//cdn.cnn.com/cnnnext/dam/assets/220513114200-01-ukraine-russia-kharkiv-atrocities-small-169.jpg"
     data-src-xsmall="//cdn.cnn.com/cnnnext/dam/assets/220513114200-01-ukraine-russia-kharkiv-atrocities-medium-plus-169.jpg"
     data-src-small="//cdn.cnn.com/cnnnext/dam/assets/220513114200-01-ukraine-russia-kharkiv-atrocities-large-169.jpg"
     data-src-medium="//cdn.cnn.com/cnnnext/dam/assets/220513114200-01-ukraine-russia-kharkiv-atrocities-exlarge-169.jpg"
     data-src-large="//cdn.cnn.com/cnnnext/dam/assets/220513114200-01-ukraine-russia-kharkiv-atrocities-super-169.jpg"
     data-src-full16x9="//cdn.cnn.com/cnnnext/dam/assets/220513114200-01-ukraine-russia-kharkiv-atrocities-full-169.jpg"
     data-src-mini1x1="//cdn.cnn.com/cnnnext/dam/assets/220513114200-01-ukraine-russia-kharkiv-atrocities-small-11.jpg"
     data-demand-load="not-loaded"
     data-eq-pts="mini: 0, xsmall: 221, small: 308, medium: 461, large: 781"
     src="data:image/gif;base64,R0lGODlhEAAJAJEAAAAAAP///////wAAACH5BAEAAAIALAAAAAAQAAkAAAIKlI+py+0Po5yUFQA7">
*/

// img attributes ordered in decreasing size
const attrNames = ['data-src-full16x9', 'data-src-large', 'data-src-medium',
  'data-src-small', 'data-src-xsmall', 'data-src-mini'];

/**
 * find the largest image URL from the element's "data-src-*" attributes
 * @param {HTMLImageElement} element
 * @return {null|string}
 */
function getLargestImg (element) {
  for (const attrName of attrNames) {
    let attrVal = element.getAttribute(attrName);
    if (!attrVal || attrVal.length === 0) { continue; }
    if (attrVal.startsWith('//')) { attrVal = 'https:' + attrVal}
    return attrVal;
  }
  return null;
}

/**
 * copy img element's highest resolution image to 'src'
 * @param {HTMLDocument} document
 * @param {HTMLImageElement} element
 * @returns {HTMLImageElement}
 */
function convertCNNImg (
  document,
  element
) {
  console.log('convertCNNImg() element:', element);

  const bestImgUrl = getLargestImg(element);
  if (!bestImgUrl) { return element; }

  element.src = bestImgUrl;

  console.log(`  convertCNNImg element.outerHTML`, element.outerHTML);

  return element;
}

export { convertCNNImg };
