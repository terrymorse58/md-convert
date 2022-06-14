// md-convert transformer `convertApnewsFeedCard`

/**
 * convert an AP News "FeedCard"
 * @param {HTMLDocument} document
 * @param {HTMLDivElement} div
 * @param {Boolean} [debug]
 * @return {HTMLDivElement}
 */
function convertApnewsFeedCard (
  document,
  div,
  {debug = false}
) {

  if (debug) {
    console.log(`convertApnewsFeedCard() div:\n`, div.outerHTML);
  }

  if (!div || div.tagName !== 'DIV' ||
    !div.classList.contains('FeedCard')
  ) {
    console.error(`ERROR convertApnewsFeedCard bad div:\n`,
      div?.outerHTML);
    return div;
  }

  const anchor = div.querySelector('a'),
    heading = div.querySelector('h2, h3, h4'),
    headline = heading?.textContent,
    spanByline = div.querySelector('span[class^="Component-byline"]'),
    byline = spanByline?.textContent,
    spanTime = div.querySelector(('span.Timestamp')),
    timestamp = spanTime?.textContent,
    img = div.querySelector('img'),
    imgSrc = img?.src,
    imgAlt = img?.alt || headline,
    divContent = div.querySelector('div.content'),
    content = divContent?.textContent;

  // fix href if necessary
  let href = anchor?.href;
  if (href.startsWith('//')) {
    href = 'https:' + href;
  } else if (href.startsWith('/')) {
    href = 'https://apnews.com' + href;
  }

  const newDiv = document.createElement('div');
  newDiv.className = 'convertApnewsFeedCard';
  newDiv.appendChild(document.createElement('hr'));

  if (headline) {
    const hdg = document.createElement(heading.tagName);

    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = headline;
      hdg.appendChild(a);
    } else {
      hdg.textContent = headline;
    }
    newDiv.appendChild(hdg);
  }

  if (byline || timestamp) {
    const p = document.createElement('p');
    p.textContent = '';
    if (byline) {p.textContent += byline;}
    if (timestamp) {p.textContent += ` — ${timestamp}`}
    newDiv.appendChild(p);
  }

  if (imgSrc) {
    const divImg = document.createElement('div'),
      image = document.createElement('img');
    image.src = imgSrc;
    image.alt = imgAlt;
    divImg.appendChild(image);
    newDiv.appendChild(divImg);
  }

  if (content) {
    const p = document.createElement('p');
    p.textContent = content;
    newDiv.appendChild(p);
  }

  div.replaceWith(newDiv);

  if (debug) {
    console.log(`  convertApnewsFeedCard complete, newDiv\n`,
      newDiv.outerHTML);
  }

  return newDiv;
}

export {
  convertApnewsFeedCard
};
