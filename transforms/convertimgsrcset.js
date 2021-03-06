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

  example img with `data-srcset` that has url but no size:

<img
  data-srcset="https://s.hdnux.com/photos/01/23/65/40/21977091/3/ratio3x2_425.jpg"
  alt="Dish Bo N??, filet mignon with eggs and bread a speciality of Bo Ne Phu Yen is photographed in the food court in the Lion Plaza on Friday, Jan. 28, 2022, in East San Jose, Calif. (Special to The Chronicle/ Josie Lepe)">

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

  let srcset = element.srcset ||
    element.dataset.srcset ||
    element.dataset.original ||
    element.dataset.src;
  
  if (!srcset) {
    console.error(`WARNING convertImgSrcset srcset, data-srcset, ` +
      `data-origninal missing: ${element.outerHTML}`);
    return element;
  }

  // scrub srcset of newlines
  srcset = srcset.replace(/\r?\n|\r/g, ' ');

  if (debug) {
    console.log(`  convertImgSrcset cleaned srcset: '${srcset}'`);
  }
  
  const candidateSrcs = srcset.split(",")
    .reduce((acc, str) => {

      const strTrimmed = str.trim();
      const [url, size] = strTrimmed.split(" ");
      if (url?.length) { acc.push({url, size}); }
      return acc;

    }, []);

  if (debug) {
    console.log(`  convertImgSrcset candidateSrcs:`, candidateSrcs);
  }

  let maxSize = 0;
  const bestCandidate = candidateSrcs.reduce((best, candidate) => {

    let newBest = best || candidate;
    const sizeDecimal = parseInt(candidate.size);
    if (sizeDecimal > maxSize) {
      maxSize = sizeDecimal;
      newBest = candidate;
    }
    return newBest;

  }, null);

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
