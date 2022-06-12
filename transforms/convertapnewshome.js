// mdconvert transform 'convertApnewsHome' - convert apnews home page

import { changeInnerHTML } from './changeinnerhtml.js';

/**
 * remove extra whitespace from a string
 * @param {String} str
 * @return {String}
 */
function removeExtraWhitespace (str) {
  return str.replace(/\s\s+/g, ' ');
}

function getTopStoriesHeading (document, divLanding, debug) {
  // get "Top Stories" section
  const divTopStories = divLanding.querySelector('div.TopStories');
  if (debug) {
    console.log(`  getTopStories divTopStories:`, divTopStories);
  }
  if (!divTopStories) { return ''; }
  return divTopStories.querySelector('div.SectionTitle h2');
}

/**
 * get all the stories in the 'TopStories' section
 * @param {HTMLDocument} document
 * @param {HTMLDivElement} divLanding
 * @param {Boolean} [debug]
 * @return {{href, headline, timestamp, imgSrc}[]}
 */
function getTopStories (
  document,
  divLanding,
  debug = false
) {
  const storyHrefs = new Set(),
    stories = [];

  // get "Top Stories" section
  const divTopStories = divLanding.querySelector('div.TopStories');
  if (debug) {
    console.log(`  getTopStories divTopStories:`, divTopStories);
  }
  if (!divTopStories) { return stories; }

  const divSsrDesktop = divTopStories.querySelector('div.ssr-desktop');
  if (!divSsrDesktop) { return stories; }

  // get main story
  let divMainStory = divSsrDesktop.querySelector(
      'div[class^="Component-mainStory"]'),
    aMainStory = divMainStory.querySelector('div.CardHeadline a'),
    h2MainStory = aMainStory?.querySelector('h2'),
    imgMainStory = divMainStory?.querySelector('img'),
    timestampMainStory = divMainStory?.querySelector('span.Timestamp');

  // add main story to stories
  if (aMainStory && h2MainStory) {
    stories.push({
      href: aMainStory?.href,
      headline: removeExtraWhitespace(h2MainStory?.textContent?.trim()),
      timestamp: timestampMainStory?.textContent,
      imgSrc: imgMainStory?.src
    });
    storyHrefs.add(aMainStory?.href);
  }

  // get related stories
  const relatedStoryDivs = [
    ...divTopStories.querySelectorAll('div.RelatedStory')
  ];

  for (const rsDiv of relatedStoryDivs) {
    const aRelatedStory = rsDiv.querySelector('a'),
      h2RelatedStory = aRelatedStory?.querySelector('h2'),
      imgRelatedStory = rsDiv.querySelector('img'),
      timestampRelatedStory = rsDiv.querySelector('span.Timestamp'),
      href = aRelatedStory?.href,
      headline = removeExtraWhitespace(h2RelatedStory?.textContent?.trim()),
      timestamp = timestampRelatedStory?.textContent,
      imgSrc = imgRelatedStory?.src;

    // skip if a duplicate
    if (storyHrefs.has(href)) { continue; }
    storyHrefs.add(href);

    // add this related story to stories
    if (!aRelatedStory || !h2RelatedStory) { continue; }

    stories.push({
      href,
      headline,
      timestamp,
      imgSrc
    });
  }

  if (debug) {
    console.log(`stories: [`);
    for (const story of stories) {
      console.log(
        `  {\n` +
        `    href: '${story.href}'\n` +
        `    headline: '${story.headline}'\n` +
        `    timestamp: '${story.timestamp}'\n` +
        `    imgSrc: '${story.imgSrc}'\n` +
        `  },`
      );
    }
    console.log(`]`);
  }

  return stories;

}

/**
 *
 * @param {HTMLDocument} document
 * @param {HTMLElement} hTopStories
 * @param {{href, headline, timestamp, imgSrc}[]} topStories
 * @param {HTMLBodyElement} bodyEl
 */
function addTopStoriesToBody (
  document,
  hTopStories,
  topStories,
  bodyEl
) {
  if (!hTopStories || !topStories?.length) { return; }

  bodyEl.appendChild(document.createElement('hr'));
  bodyEl.appendChild(hTopStories);

  for (const {href, headline, timestamp, imgSrc} of topStories) {
    const hStory = document.createElement('h3'),
      pStory = document.createElement('p'),
      aStory = document.createElement('a'),
      imgStory = document.createElement('img');

    bodyEl.appendChild(document.createElement('hr'));

    aStory.href = href;
    aStory.textContent = headline;
    hStory.appendChild(aStory);

    pStory.appendChild(document.createTextNode(timestamp));
    pStory.appendChild(document.createElement('br'));
    pStory.appendChild(document.createElement('br'));

    imgStory.src = imgSrc;
    imgStory.alt = headline;
    pStory.appendChild(imgStory);

    bodyEl.appendChild(hStory);
    bodyEl.appendChild(pStory);
  }

}

/**
 * get array of 'div.FeedCard' elements
 * @param {HTMLDocument} document
 * @return {HTMLDivElement[]}
 */
function getFeedCards (document) {
  const divFeed = document.querySelector('div.feed');
  if (!divFeed) { return []; }

  return [...divFeed.querySelectorAll('article.cards > div.FeedCard')];
}

/**
 * convert the apnews page, replacing body contents
 * @param {HTMLDocument} document
 * @param {undefined} [element]
 * @param {Boolean} debug
 * @param {Window} window
 */
function convertApnewsHome (
  document,
  element = undefined,
  {debug = false},
  window
) {
  if (debug) {
    console.log(`convertApnewsHome()`);
  }

  const docBody = document.body;

  // get landing div -- required
  const divLanding = docBody.querySelector('div.Landing');
  if (!divLanding) {
    console.error(`ERROR convertApnewsHome no <div class="Landing">`);
    return docBody;
  }

  // get h1 heading
  const pageH1 = divLanding.querySelector('div.Landing__heading > h1');
  if (debug) {
    console.log(`  convertApnewsHome pageH1:`, pageH1?.outerHTML);
  }

  // create a new HTML body
  const newBody = document.createElement('body');
  if (pageH1) {
    newBody.appendChild(pageH1);
  }

  // get the top stories and add to new body
  const hTopStories = getTopStoriesHeading(document, divLanding, debug);
  const topStories = getTopStories(document, divLanding, debug);
  addTopStoriesToBody(document, hTopStories, topStories, newBody);

  // get all the feed cards
  const feedCards = [];
  const feedCardDivs = getFeedCards(document);
  feedCardDivs.forEach(fcDiv => {
    // get title of FeedCard
    const aFeedCard = fcDiv.querySelector(
      'div[class^="hubPeekContainer"] > a'
    );
    const hFeedCard = aFeedCard.querySelector(
      'h3'
    );

    const feedCard = {
      title: hFeedCard?.textContent,
      href: aFeedCard?.href,
      articles: []
    };

    feedCards.push(feedCard);

    // load articles into this feed card

    // get lead article if it exists
    const aLeadArticle = fcDiv.querySelector(
      'div[data-key="feed-card-hub-peak"] > div > :first-child'
    );
    if (aLeadArticle && aLeadArticle.tagName === 'A') {
      const href = aLeadArticle?.href,
        headline = removeExtraWhitespace(aLeadArticle.textContent?.trim());
      if (href && headline) {
        feedCard.articles.push({href, headline});
      }
    }

    // get stories inside <li> elements
    [...fcDiv.querySelectorAll(
      'ul[class^="storiesWrapper"] > li > a')]
      .forEach(anchor => {
        const href = anchor?.href,
          headline = removeExtraWhitespace(anchor.textContent?.trim());
        if (href && headline) {
          feedCard.articles.push({href, headline});
        }
      });

  });

  if (debug) {
    console.log(
      `feedCards:\n${JSON.stringify(feedCards, null, 2)}`);
  }

  // add feed cards to the body
  feedCards.forEach(feedCard => {
    newBody.appendChild(document.createElement('hr'));
    const h3 = document.createElement('h3'),
      anchor = document.createElement('a');
    anchor.href = feedCard.href;
    anchor.textContent = feedCard.title;
    h3.appendChild(anchor);
    newBody.appendChild(h3);

    feedCard.articles.forEach(({href, headline}) => {
      const h4 = document.createElement('h4'),
        anchor = document.createElement('a');
      anchor.href = href;
      anchor.textContent = headline;
      h4.appendChild(anchor);
      newBody.appendChild(h4);
    })
  })

  if (debug) {
    console.log(`  convertApnewsHome complete, newBody:`);
    console.log(newBody.outerHTML);
  }

  docBody.replaceWith(newBody);

  return newBody;
}

export { convertApnewsHome };
