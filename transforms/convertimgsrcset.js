// mdconvert transform 'convertImgSrcset' -
//   convert img 'srcset' attribute to 'src' attribute

/*
  example img:

<img alt="" class="w-100 mw-100 h-auto" width="600" height="400"
     srcset="https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/JXZBNREZAMI6ZGMHTXHO4YVD6Y.jpg&amp;w=440 400w,https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/JXZBNREZAMI6ZGMHTXHO4YVD6Y.jpg&amp;w=540 540w,https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/JXZBNREZAMI6ZGMHTXHO4YVD6Y.jpg&amp;w=691 691w,https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/JXZBNREZAMI6ZGMHTXHO4YVD6Y.jpg&amp;w=767 767w,https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/JXZBNREZAMI6ZGMHTXHO4YVD6Y.jpg&amp;w=916 916w"
     sizes="(max-width: 440px) 440px,(max-width: 600px) 691px,(max-width: 768px) 691px,(min-width: 769px) and (max-width: 1023px) 960px,(min-width: 1024px) and (max-width: 1299px) 530px,(min-width: 1300px) and (max-width: 1439px) 691px,(min-width: 1440px) 916px,440px"
     decoding="async" style="background-size: cover; max-width: 1600px;">
 */


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
