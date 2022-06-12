// md-convert transform 'changeVideoPosterToImg'

/**
 *
 * @param {HTMLDocument} document
 * @param video
 * @param debug
 * @return {*}
 */
function changeVideoPosterToImg (
  document,
  video,
  {debug = false}
) {

  if (debug) {
    console.log(`changeVideoPosterToImg()`);
    console.log(`  changeVideoPosterToImg video:`, video.outerHTML);
  }

  if (!video ||
    video.tagName !== 'VIDEO' ||
    !video.hasAttribute('poster')
  ) {
    console.error('ERROR changeVideoPosterToImg bad video:', video.outerHTML);
    return video;
  }

  // container to surround image and possible anchor
  const container = document.createElement('div');

  // create image
  let srcStr = video.poster;
  if (srcStr.startsWith('//')) {
    srcStr = 'https:' + srcStr;
  }
  const img = document.createElement('img');
  img.src = srcStr;
  img.alt = 'converted video poster';
  container.appendChild(img);

  // append link to video if source exists
  const source = video.querySelector('source'),
    href = source?.src;
  if (href) {
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.textContent = 'Play video';
    container.appendChild(document.createElement('br'));
    container.appendChild(anchor);
  }

  video.replaceWith(container);

  if (debug) {
    console.log(`  changeVideoPosterToImg complete, container:`,
      container.outerHTML);
  }

  return container;
}

export { changeVideoPosterToImg };
