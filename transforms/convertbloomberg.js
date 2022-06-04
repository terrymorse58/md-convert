// mdconvert transform 'convertBloomberg' - convert a single Bloomberg page

import { changeInnerHTML } from './changeinnerhtml.js';

/**
 * extract the text content from a HTML string
 * @param {HTMLDocument} document
 * @param {String} htmlStr
 * @return {String}
 */
function getTextContent (document, htmlStr) {
  const divWrapper = document.createElement('div');
  divWrapper.innerHTML = htmlStr;
  return divWrapper.textContent;
}

/**
 * retrieve the document's script data
 * @param {HTMLDocument} document
 */
function getScriptData (document) {
  // console.log(`getScriptData()`);
  let scriptObj = null;

  const scriptEl = document.querySelector(
    'script[data-component-props="ArticleBody"]'
  );

  if (!scriptEl) {
    console.error(`getScriptData: script not found!`);
    return scriptObj;
  }

  try {
    scriptObj = JSON.parse(scriptEl.textContent);
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
  // console.log(`convertBloomberg()`);

  const docBody = document.body;

  if (debug) {
    console.log(`convertBloomberg:, debug is ON`);
  }

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
    ledeDescription,
    byline,
    publishedAt,
    updatedAt,
    body
  } = story;

  // clear out the current body content
  docBody.innerHTML = '';

  // insert a Bloomberg logo at the top
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
    img.alt = getTextContent(document, ledeCaption) ||
      getTextContent(document, ledeDescription) ||
      getTextContent(document, ledeCredit) ||
      "Bloomberg article lede image";
    docBody.appendChild(img);
  }

  if (ledeCaption || ledeCredit) {
    const blockquote = document.createElement('blockquote');
    blockquote.textContent = getTextContent(
      document,
      (ledeCaption || '') + (ledeCredit ? (' — ' + ledeCredit) : '')
    );
    docBody.appendChild(blockquote);
  }

  if (byline || publishedAt || updatedAt) {
    const p = document.createElement('p');
    let pContent = '';
    if (byline) { pContent = `By ${getTextContent(document, byline)}`;}
    if (publishedAt) {
      const pubDate = new Date(publishedAt);
      if (pContent) {pContent += `<br>\n`;}
      pContent += `${pubDate.toString()}`;
    }
    if (updatedAt) {
      const updDate = new Date(updatedAt);
      if (pContent) {pContent += `<br>\n`;}
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

  // remove all <style> elements
  document.querySelectorAll('style')
    .forEach(el => {el.remove();});

  // remove all <aside> elements
  document.querySelectorAll('aside')
    .forEach(el => {el.remove();});

  // convert all lazy images to static images
  document.querySelectorAll('img.lazy-img__image')
    .forEach(img => {
      img.src = img.dataset.nativeSrc || img.src;
    });

  // remove class="trashline" elements
  document.querySelectorAll('.trashline')
    .forEach(el => {el.remove();});

  // remove all obvious advertising elements
  document.querySelectorAll('div.page-ad, div.outstream-ad')
    .forEach(el => { el.remove(); });

  // remove figures that are data-image-type="audio"
  document.querySelectorAll('figure[data-image-type="audio"]')
    .forEach(el => {el.remove();});

  // convert all '&nbsp;' to spaces
  changeInnerHTML(document, docBody, {
    pattern: '&nbsp;',
    flags: 'gs',
    newStr: ' '
  });

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

  // convert <div class="chart">
/*
  sample:
      <div class="chart" data-responsive="true">
        <div class="chart-js">
          <h3 class="chart__title">...</h3>
          <p class="chart__subtitle">...</p>
          <div class="chart__container" ...></div>
          <p class="chart__source">...</p>
          <p class="chart__footnote"></p>
        </div>
        <noscript>
          <img
            src="https://assets.bwbx.io/images/users/iqjWHBFdfxIU/ixVSpOB_RdMQ/v0/-1x-1.png">
        </noscript>
      </div>
*/
  [...document.querySelectorAll('div.chart')].forEach(divChart => {
    const noscript = divChart.querySelector('noscript');
    if (!noscript) { return; }
    const img = noscript.querySelector('img');
    if (!img) { return; }

    // get alt text from .chart__title, etc.
    let altText = "";
    const hTitle = divChart.querySelector('.chart__title');
    if (hTitle) {
      altText += hTitle.textContent;
      hTitle.remove();
    }
    const pSubtitle = divChart.querySelector('.chart__subtitle');
    if (pSubtitle) {
      altText += ' - ' + pSubtitle.textContent;
      pSubtitle.remove();
    }
    const pSource = divChart.querySelector('.chart__source');
    if (pSource) {
      altText += ' - ' + pSource.textContent;
      pSource.remove();
    }
    img.alt = altText;

    // replace noscript with its child img
    noscript.replaceWith(img);
  })

  if (debug) {
    console.log(`  convertBloomberg complete, body:`);
    console.log(docBody.outerHTML);
  }


  return docBody;
}

export { convertBloomberg };
