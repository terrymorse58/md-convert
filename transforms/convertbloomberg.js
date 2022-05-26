// mdconvert transform 'convertBloomberg' - convert a single Bloomberg page

/**
 * retrieve the document's script data
 * @param {HTMLDocument} document
 */
function getScriptData (document) {
  console.log(`getScripData()`);
  let scriptObj = null;

  const scriptEl = document.querySelector(
    'script[data-component-props="ArticleBody"]'
  );

  console.log(`  getScriptData scriptEl:`, scriptEl);

  if (!scriptEl) {
    console.error(`getScriptData: script not found!`);
    return scriptObj;
  }

  try {
    scriptObj = JSON.parse(scriptEl.textContent);
    console.log(`typeof scriptObj:`, typeof scriptObj);
  } catch (err) {
    console.error(`getScriptData script contents not valid JSON!`);
  }

  return scriptObj;
}

/**
 * cnvert the Bloomberg page, replacing body contents
 * @param {HTMLDocument} document
 * @param {undefined} [element]
 * @param {Boolean} debug
 * @param {Window} window
 */
function convertBloomberg (
  document,
  element = undefined,
  {debug = false},
  window
) {
  console.log(`convertBloomberg(), debug is ${debug ? 'TRUE' : 'FALSE'}`);
  const docBody = document.body;

  // retrieve contents of the script containing the page's data
  const pageData = getScriptData(document);
  if (!pageData) { return docBody; }
  const {story} = pageData;
  const {
    headline,
    abstract,
    ledeImageUrl,
    ledeCaption,
    ledeCredit,
    byline,
    publishedAt,
    updatedAt,
    body
  } = story;

  // clear out the current body content
  docBody.innerHTML = '';

  // insert a logo at the top
  const aBloom = document.createElement('a');
  aBloom.href = 'https://www.bloomberg.com';
  docBody.appendChild(aBloom);
  const logoImg = document.createElement('img');
  logoImg.src = 'https://data.bloomberglp.com/company/sites/51/2019/08/og-image-generic-lp.png';
  logoImg.alt = 'Bloomberg logo';
  aBloom.appendChild(logoImg);

  // start forming the body contents

  if (headline) {
    const h1 = document.createElement('h1');
    h1.textContent = headline;
    docBody.appendChild(h1);
  }

  if (abstract) {
    const ul = document.createElement('ul');
    docBody.appendChild(ul);
    for (const abtext of abstract) {
      const li = document.createElement('li');
      li.innerHTML = `<h4>${abtext}</h4>`;
      ul.appendChild(li);
    }
  }

  if (ledeImageUrl) {
    const img = document.createElement('img');
    img.src = ledeImageUrl;
    img.alt = ledeCaption || '';
    docBody.appendChild(img);
  }

  if (ledeCaption || ledeCredit) {
    const blockquote = document.createElement('blockquote');
    blockquote.textContent = (ledeCaption || '') +
      (ledeCredit ? (' — ' + ledeCredit) : '');
    docBody.appendChild(blockquote);
  }

  if (byline || publishedAt || updatedAt) {
    const p = document.createElement('p');
    let pContent = '';
    if (byline) { pContent = `By ${byline}`;}
    if (publishedAt) {
      const pubDate = new Date(publishedAt);
      if (pContent) {pContent += `<br>`;}
      pContent += `${pubDate.toString()}`;
    }
    if (updatedAt) {
      const updDate = new Date(updatedAt);
      if (pContent) {pContent += `<br>`;}
      pContent += `<i>Updated on ${updDate.toString()}</i>`;
    }
    p.innerHTML = pContent;
    docBody.appendChild(p);
  }

  if (body) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = body;
    docBody.appendChild(wrapper);
  }

  // clear out all <style> elements
  const styles = [...document.querySelectorAll('style')];
  for (const style of styles) {
    style.remove();
  }

  // convert all lazy images to static images
  const lazyImgs = [...document.querySelectorAll('img.lazy-img__image')];
  for (const img of lazyImgs) {
    const nativeSrc = img.dataset.nativeSrc;
    if (!nativeSrc) { continue; }
    img.src = nativeSrc;
  }

  // remove class="trashline" elements
  const trashEls = [...document.querySelectorAll('.trashline')];
  for (const el of trashEls) {
    el.remove();
  }

  // remove figures that are data-image-type="audio"
  const audioFigures =
    [...document.querySelectorAll('figure[data-image-type="audio"]')];
  for (const figure of audioFigures) {
    figure.remove();
  }

  // convert figcaptions to blockquotes
  const figcaptions = [...document.querySelectorAll('figcaption')];
  for (const figcaption of figcaptions) {
    const divCaption = figcaption.querySelector('.caption'),
      divCredit = figcaption.querySelector('.credit');
    let content = '';
    if (divCaption) { content += divCaption.textContent; }
    if (divCredit) { content += ` ${divCredit.textContent}`;}
    if (!divCaption && !divCredit) { content = figcaption.textContent; }
    const blockquote = document.createElement('blockquote');
    blockquote.textContent = content;
    figcaption.replaceWith(blockquote);
  }

  if (debug) {
    console.log(`convertBloombert complete, body:`);
    console.log(docBody.outerHTML);
  }

  return docBody;
}

export { convertBloomberg };
