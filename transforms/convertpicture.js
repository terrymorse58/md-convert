// mdconvert transform 'convertPicture' -
//   convert `picture` element to simple `img`

/*
  example <picture>, from nytimes.com:

  <picture>
    <source media="(min-width: 2048px)"
            srcset="https://static01.nyt.com/images/2022/05/25/travel/25istria-biking-09/merlin_206385855_2c84c3e4-29c0-4e80-aeab-03e889dc73c0-superJumbo.jpg 2x, https://static01.nyt.com/images/2022/05/25/travel/25istria-biking-09/merlin_206385855_2c84c3e4-29c0-4e80-aeab-03e889dc73c0-superJumbo.jpg">
    <source media="(min-width: 1050px)"
            srcset="https://static01.nyt.com/images/2022/05/25/travel/25istria-biking-09/merlin_206385855_2c84c3e4-29c0-4e80-aeab-03e889dc73c0-superJumbo.jpg 2x, https://static01.nyt.com/images/2022/05/25/travel/25istria-biking-09/merlin_206385855_2c84c3e4-29c0-4e80-aeab-03e889dc73c0-master1050.jpg">
    <source media="(min-width: 1024px)"
            srcset="https://static01.nyt.com/images/2022/05/25/travel/25istria-biking-09/merlin_206385855_2c84c3e4-29c0-4e80-aeab-03e889dc73c0-superJumbo.jpg 2x, https://static01.nyt.com/images/2022/05/25/travel/25istria-biking-09/merlin_206385855_2c84c3e4-29c0-4e80-aeab-03e889dc73c0-jumbo.jpg">
    <source media="(min-width: 768px)"
            srcset="https://static01.nyt.com/images/2022/05/25/travel/25istria-biking-09/merlin_206385855_2c84c3e4-29c0-4e80-aeab-03e889dc73c0-superJumbo.jpg 2x, https://static01.nyt.com/images/2022/05/25/travel/25istria-biking-09/merlin_206385855_2c84c3e4-29c0-4e80-aeab-03e889dc73c0-master768.jpg">
    <img
      src="https://static01.nyt.com/images/2022/05/25/travel/25istria-biking-09/25istria-biking-09-mobileMasterAt3x-v2.jpg"
      alt="A view of roofs and a sea from a window in a room with large bells."
      loading="lazy">
  </picture>
 */


/**
 * replace <picture> element with its contained <img> element
 * @param {HTMLDocument} document
 * @param {HTMLPictureElement} picture
 * @param {Boolean} [debug]
 * @returns {HTMLImageElement|HTMLPictureElement}
 */
function convertPicture (
  document,
  picture,
  {debug = false}
) {

  if (debug) {
    console.log('convertPicture() picture:', picture.outerHTML);
  }

  // get contained image
  const img = picture.querySelector('img');
  if (!img) {
    console.error(
      `ERROR in convertPicture: no contained img found.\n` +
      `  picture: ${picture.outerHTML}`);
    return picture;
  }

  // if img src is missing, try getting it from img data-src
  if (!img.src && img.dataset.src) {
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
  }

  // replace picture with contained image
  picture.replaceWith(img);

  if (debug) {
    console.log(`  convertPicture complete, result:`, img.outerHTML);
  }

  return img;
}

export { convertPicture };
