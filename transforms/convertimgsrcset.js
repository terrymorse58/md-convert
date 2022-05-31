/**
 * mdconvert transform 'convertImgSrcset' -
 *   convert img 'srcset' or 'data-srcset' attribute to 'src' attribute
 */

/*
  HTMLImageElement.srcset:
  https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/srcset

  example img with 'srcset':

<img alt="" class="w-100 mw-100 h-auto" width="600" height="400"
  srcset="https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/JXZBNREZAMI6ZGMHTXHO4YVD6Y.jpg&amp;w=440 400w,https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/JXZBNREZAMI6ZGMHTXHO4YVD6Y.jpg&amp;w=540 540w,https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/JXZBNREZAMI6ZGMHTXHO4YVD6Y.jpg&amp;w=691 691w,https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/JXZBNREZAMI6ZGMHTXHO4YVD6Y.jpg&amp;w=767 767w,https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/JXZBNREZAMI6ZGMHTXHO4YVD6Y.jpg&amp;w=916 916w"
  sizes="..."
  decoding="async" style="background-size: cover; max-width: 1600px;">

  example img with 'data-srcset':

<img  alt="Men pray outside Robb Elementary School..."
  title="Men pray outside Robb Elementary School in Uvalde...)"
  loading="" class="lazyload  size-article_feature"
  data-sizes="auto"
  data-src="https://www.mercurynews.com/wp-content/uploads/2022/05/SJM-Z-TEXFOLO-0526.jpg?w=498"
  data-srcset="https://www.mercurynews.com/wp-content/uploads/2022/05/SJM-Z-TEXFOLO-0526.jpg?w=498 620w,https://www.mercurynews.com/wp-content/uploads/2022/05/SJM-Z-TEXFOLO-0526.jpg?w=627 780w,https://www.mercurynews.com/wp-content/uploads/2022/05/SJM-Z-TEXFOLO-0526.jpg?w=819 1020w,https://www.mercurynews.com/wp-content/uploads/2022/05/SJM-Z-TEXFOLO-0526.jpg?w=1025 1280w,https://www.mercurynews.com/wp-content/uploads/2022/05/SJM-Z-TEXFOLO-0526.jpg?w=1489 1860w">
 */


/**
 * copy highest resolution image url from `img.srcset` or `img.dataset.srcset
 * to `img.src`
 * @param {HTMLDocument} document
 * @param {HTMLImageElement} element
 * @param {Boolean} [debug]
 * @returns {HTMLImageElement}
 */
function convertImgSrcset (
  document,
  element,
  {debug = false}
) {

  if (debug) {
    console.log(`convertImgSrcset() element:\n` +
      `${element.outerHTML}`);
  }

  const srcset = element.srcset || element.dataset.srcset;
  
  if (!srcset) {
    console.error(`ERROR convertImgSrcset srcset and data-srcset missing: ` +
    `${element.outerHTML}`);
    return element;
  }
  
  const candidateSrcs = srcset.split(",")
    .reduce((acc, str) => {
      const [url, size] = str.split(" ");
      acc.push({url, size});
      return acc;
    }, []);

  if (debug) {
    console.log(`  convertImgSrcset candidateSrcs:`, candidateSrcs);
  }

  let maxSize = 0;
  const bestCandidate = candidateSrcs.reduce((best, candidate) => {
    const sizeDecimal = parseInt(candidate.size);
    if (sizeDecimal > maxSize) {
      maxSize = sizeDecimal;
      best = candidate;
    }
    return best;
  }, {});

  if (debug) {
    console.log(`  convertImgSrcset bestCandidate:`, bestCandidate);
  }

  if (bestCandidate.url) {
    element.src = bestCandidate.url;
    element.removeAttribute('srcset');
    element.removeAttribute('data-srcset');
  }

  if (debug) {
    console.log(`  convertIngSrcset complete, element:`, element.outerHTML);
  }

  return element;
}

export { convertImgSrcset };
