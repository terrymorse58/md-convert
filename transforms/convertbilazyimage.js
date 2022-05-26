// mdconvert transform 'convertBILazyImage' -
//   convert Business Intelligence lazy image to static image

/*
  example img:

<img class="lazy-image "
  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E"
  data-content-type="image/jpeg"
  data-srcs="{&quot;https://i.insider.com/628bc38db0a8be0018601d0f&quot;:{&quot;contentType&quot;:&quot;image/jpeg&quot;,&quot;aspectRatioW&quot;:2377,&quot;aspectRatioH&quot;:1552}}"
  alt="Steve Ballmer and Bill Gates"> */


/**
 * convert Business Intelligence lazy image to static image
 * @param {HTMLDocument} document
 * @param {HTMLImageElement} img
 * @param {Boolean} [debug]
 * @param {Window} [window]
 * @returns {HTMLImageElement}
 */
function convertBILazyImage (
  document,
  img,
  {debug = false},
  window = undefined
) {

  if (debug) {
    console.log('\nconvertBILazyImage()');
    console.log(`  convertBILazyImage img:\n`, img.outerHTML);
  }

  const srcsStr = img?.dataset?.srcs;
  let srcObj;

  try {
    srcObj = JSON.parse(srcsStr);
  } catch (err) {
    console.error(`  convertBILazyImage data-srcs not valid JSON: '${srcsStr}'`);
  }
  if (!srcObj) { return img; }

  const imgUrl = Object.keys(srcObj)[0];
  if (imgUrl) {
    img.src = imgUrl;
    delete img.dataset.srcs;
    delete img.dataset.contentType;
    img.className = 'convertBILazyImage';
  }

  if (debug) {
    console.log(`  convertBILazyImage complete, img:\n`, img.outerHTML);
  }

  return img;
}

export { convertBILazyImage };
