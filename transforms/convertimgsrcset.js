// mdconvert transform 'convertImgSrcset -
//   convert img 'srcset' attribute to 'src' attribute

/**
 * copy highest resolution image url from `img.srcset` to `img.src`
 * @param {HTMLDocument} document
 * @param {HTMLImageElement} element
 * @returns {HTMLImageElement}
 */
function convertImgSrcset (
  document,
  element
) {
  // console.log('convertImgSrcset() element:', element);

  const candidates = element.srcset.split(",")
    .reduce((acc, str) => {
      const [url, size] = str.split(" ");
      acc.push({url, size});
      return acc;
    }, []);

  // console.log(`convertImgSrcset() candidates:`, candidates);

  let maxSize = 0;
  const bestCandidate = candidates.reduce((best, candidate) => {
    const sizeDecimal = parseInt(candidate.size);
    if (sizeDecimal > maxSize) {
      maxSize = sizeDecimal;
      best = candidate;
    }
    return best;
  }, {});

  // console.log(`convertImgSrcset() bestCandidate:`, bestCandidate);

  if (bestCandidate.url) {
    element.src = bestCandidate.url;
  }

  return element;
}

export { convertImgSrcset };
