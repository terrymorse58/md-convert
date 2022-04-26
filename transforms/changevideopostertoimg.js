// md-convert transform 'changeVideoPosterToImg'

function changeVideoPosterToImg (
  document,
  element
) {
  // console.log(`changeVideoPosterToImg()`);

  if (!element ||
    element.tagName !== 'VIDEO' ||
    !element.hasAttribute('poster')
  ) {
    console.error('ERROR changeVideoPosterToImg bad element:', element);
    return element;
  }

  const srcStr = element.poster;
  const img = document.createElement('img');
  img.src = srcStr;
  img.alt = 'converted video poster';
  element.replaceWith(img);
  return img;
}

export { changeVideoPosterToImg };
