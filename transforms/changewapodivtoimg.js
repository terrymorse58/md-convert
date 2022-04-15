// md-convert transform 'changeWapoDivToImg'

function changeWapoDivToImg (
  document,
  element
) {
  // console.log(`changeWapoDivToImg()`);

  if (!element ||
    element.tagName !== 'DIV' ||
    !element.classList.contains('powa-wrapper')
  ) {
    console.error('ERROR changeWapoDivToImg bad element:', element);
    return element;
  }

  const bgImgStr = element.style.backgroundImage;
  const urlStr = bgImgStr.replace(`url(`, '')
    .replace(`)`, '');
  const img = document.createElement('img');
  img.src = urlStr;
  element.replaceWith(img);
  return img;
}

export { changeWapoDivToImg };
