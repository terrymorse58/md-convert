// mdconvert transform 'test3' -
//   convert img 'srcset' or 'data-srcset' attribute to 'src' attribute

/*
  example img with 'srcset':

<img alt="" class="w-100 mw-100 h-auto" width="600" height="400"
  srcset="https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/JXZBNREZAMI6ZGMHTXHO4YVD6Y.jpg&amp;w=440 400w,https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/JXZBNREZAMI6ZGMHTXHO4YVD6Y.jpg&amp;w=540 540w,https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/JXZBNREZAMI6ZGMHTXHO4YVD6Y.jpg&amp;w=691 691w,https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/JXZBNREZAMI6ZGMHTXHO4YVD6Y.jpg&amp;w=767 767w,https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/JXZBNREZAMI6ZGMHTXHO4YVD6Y.jpg&amp;w=916 916w"
  sizes="(max-width: 440px) 440px,(max-width: 600px) 691px,(max-width: 768px) 691px,(min-width: 769px) and (max-width: 1023px) 960px,(min-width: 1024px) and (max-width: 1299px) 530px,(min-width: 1300px) and (max-width: 1439px) 691px,(min-width: 1440px) 916px,440px"
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
    console.log('test3() element:', element.outerHTML);
  }

  const srcset = element.srcset || element.dataset.srcset;

  const candidates = srcset.split(",")
    .reduce((acc, str) => {
      const [url, size] = str.split(" ");
      acc.push({url, size});
      return acc;
    }, []);

  if (debug) {
    console.log(`  convertImgSrcset candidates:`, candidates);
  }

  let maxSize = 0;
  const bestCandidate = candidates.reduce((best, candidate) => {
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
