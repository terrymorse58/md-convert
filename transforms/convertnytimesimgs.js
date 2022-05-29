// mdconvert transform 'convertNytimesImgs' -
//   convert all nytimes images using the document's
//   window.__preloadedData.initialState object

/*
Structure of a nytimes lazy image container:

<figure>
  <div>
    <span>Image</span>
    <div data-testid="lazy-image">
      <div data-testid="lazyimage-container"></div>
    </div>
  </div>
  <figcaption>
    <span>(caption text goes here)</span>
    <span>
      <span>Credit...</span>
      <span>(credit text goes here)</span>
    </span>
  </figcaption>
</figure>


 */

/**
 * depth-first search specified element and its children for image containers
 * @param {HTMLElement} element
 * @param {Boolean} [debug]
 * @return {{lazyContainer: HTMLElement, credit: string, caption: string}[]}
 */
function findLazyImageContainers (element, debug = false) {

  if (debug) {
    // console.log(`findLazyImageContainers element:`, element);
  }

  // return when <div data-testid="lazyimage-container"> is found
  if (
    element.tagName === 'DIV' &&
    element.dataset.testid === 'lazyimage-container'
  ) {

    const domData = {
      lazyContainer: element,
      credit: undefined,
      caption: undefined
    };

    // get the container's <figure> parent and look for credit and caption
    const figure = element.closest('figure');
    console.assert(Boolean(figure),
      `findLazyImageContainers parent figure not found`);
    if (!figure) { return [domData]; }

    const figcaption = figure.querySelector('figcaption');
    if (!figcaption) { return [domData]; }

    const figSpans = [...figcaption.children]
      .filter(el => el.tagName === 'SPAN');

    // console.log(`\n  findLazyImageContainers figSpans: [`);
    // figSpans.forEach(span => {
    //   console.log(`    ${span.outerHTML}`);
    // });
    // console.log(`    ]`);

    // the child of a figcaption's span is either a caption or a credit
    figSpans.forEach(span => {
      const spanChildren = [...span.children],
        childrenCount = spanChildren.length;

      if (childrenCount === 0) {
        // no children means it's a caption
        domData.caption = span.textContent;
      } else if (childrenCount === 2) {
        // two children means credit text is in second child
        const spanCredit = spanChildren[1];
        domData.credit = spanCredit.textContent;
      }
    });

    return [domData];
  }

  // element is not lazy image container, so search element's children
  let imgEls = [];
  const children = [...element.children];
  for (const child of children) {
    const childImgs = findLazyImageContainers(child);
    if (childImgs.length) {
      imgEls = imgEls.concat(childImgs);
    }
  }

  return imgEls;
}

/**
 * parse a string to a JavaScript object
 * ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#never_use_eval!
 * @param {String} objStr
 * @return {Object}
 */
function looseJsonParse (objStr) {
  return Function('"use strict";return (' + objStr + ')')();
}

/**
 * extract all the image data from the initialState data
 * @param {Window} window
 * @param {HTMLDocument} document
 * @param {Boolean} [debug]
 * @return {{imageType, credit, legacyHtmlCaption, url}[]}
 */
function getInitialStateImageData (
  window,
  document,
  debug = false
) {
  // console.log(`initialStateImages()`);
  let imgData = [], preloadObjectStr;

  // find the <script> element that contains 'window.__preloadedData'
  const scripts = [...document.querySelectorAll('script')];
  for (const script of scripts) {
    if (script.textContent.includes('window.__preloadedData')) {
      const preloadScript = script.textContent;
      // trim the script down to the object contents
      preloadObjectStr = preloadScript.replace('window.__preloadedData = {', '{')
        .replace(/(.*);/gs, '$1');

      if (debug) {
        console.log(`  initialStateImages: found window.__preloadedData`);
      }

      break;
    }
  }

  console.assert(preloadObjectStr,
    `initialStateImages preloadObjectStr not found`);
  if (!preloadObjectStr) {return imgData;}

  const preloadData = looseJsonParse(preloadObjectStr);
  const {initialState} = preloadData;

  console.assert(initialState,
    `getInitialStateImageData window.__preloadedData.initialState not found`);
  if (!initialState) { return imgData; }

  // evaluate every property in initalState, looking for image data
  const props = Object.entries(initialState);
  for (let iProp = 0, len = props.length; iProp < len; iProp++) {
    const [propName, propVal] = props[iProp];
    // console.log(`propName:`, propName);
    if (
      propName.startsWith('Image:') &&
      !propName.includes('.crops(') &&
      propVal.__typename === 'Image'
    ) {
      // console.log(`Image ${propName}: `, propVal);
      const {imageType, credit, legacyHtmlCaption} = propVal;
      const stateObj = {
        imageType,
        credit,
        legacyHtmlCaption
      };

      // find next prop that starts with 'ImageRendition:' - that contains our
      // image src url
      for (let jProp = iProp + 1; jProp < len; jProp++) {
        const [jpName, jpVal] = props[jProp];
        if (
          jpName.startsWith('ImageRendition:') &&
          typeof jpVal.url !== 'undefined'
        ) {
          // console.log(`    found image URL:`, jpVal.url);
          stateObj.url = jpVal.url;
          imgData.push(stateObj);
          break;
        }
      }
    }
  }

  return imgData;
}

/**
 * @typedef {Object} InitialData
 * @property {String} imageType
 * @property {String} credit
 * @property {String} legacyHtmlCaption
 * @property {String} url
 */

/**
 * form hashes of inital data consisting of hashByCaption an hashByCredit
 * @param {InitialData[]} imgData
 * @return {{hashByCaption: Object, hashByCredit: Object}}
 */
function hashInitialData (imgData) {
  const hashData = {
      hashByCaption: {},
      hashByCredit: {}
    },
    {hashByCaption, hashByCredit} = hashData;
  imgData.forEach(dataObj => {
    if (dataObj.legacyHtmlCaption) {
      // hashByCaption: image with caption
      const propName = dataObj.legacyHtmlCaption;
      hashByCaption[propName] = dataObj;
    } else if (dataObj.credit) {
      // hashByCredit: images with credit but no caption
      const propName = dataObj.credit;
      if (!hashByCredit[propName]) {hashByCredit[propName] = [];}
      hashByCredit[propName].push(dataObj);
    }
  });
  return hashData;
}

/**
 * convert nytimes images
 * @param {HTMLDocument} document
 * @param {undefined} [element]
 * @param {Boolean} [debug]
 * @param {Window} window
 * @return {*|string|string|HTMLElement|BodyInit|ReadableStream<Uint8Array>|null}
 */
function convertNytimesImgs (document,
                             element = undefined,
                             {debug = false},
                             window) {
  if (debug) {
    console.log('convertNytimesImgs()');
  }
  let subjects;

  const body = document.body;

  // find elements that are or contain lazy images
  let lazyContainers = findLazyImageContainers(body, debug);

  subjects = lazyContainers.map(cont => {
    const {lazyContainer, credit, caption} = cont;
    return {
      lazyContainer,
      credit,
      caption
    };
  });

  if (debug) {
    console.log(`\nsubjects:`);
    let iSub = 0;
    for (const {lazyContainer, caption, credit} of subjects) {
      console.log(
        `  [${iSub++}]:\n` +
        `    lazyContainer: ${lazyContainer.outerHTML},\n` +
        `    caption: '${caption}',\n` +
        `    credit: '${credit}'`
      );
    }
    if (iSub === 0) {
      console.log(`   No subjects found.`);
    }
  }

  // skip processing if no subjects found
  if (!subjects || subjects.length === 0) {
    return body;
  }

  const initStateImages = getInitialStateImageData(window, document, debug);

  console.assert(
    initStateImages.length >= subjects.length,
    `convertNytimesImgs too few initialState images found`
  );
  if (initStateImages.length < subjects.length) {
    return body;
  }

  // create hashes of image data
  const {hashByCaption, hashByCredit} = hashInitialData(initStateImages);

  // console.log(`idHash:`, idHash);

  // add urls to subjects
  subjects.forEach((subject, index) => {
    const {caption, credit} = subject,
      idCaption = caption && hashByCaption[caption],
      idCredit = credit && hashByCredit[credit];

    if (idCaption) {
      subject.url = idCaption.url;
    } else if (idCredit && idCredit.length > 0) {
      subject.url = idCredit.shift().url;
    }
  });

  // append child img to each lazyload div
  for (const subject of subjects) {
    const {lazyContainer, credit, caption, url} = subject;

    if (!url) {
      console.log(`
  convertNytimesImgs didn't find url for subject: {
    lazyContainer: ${lazyContainer.outerHTML},
    credit: '${credit}',
    caption: '${caption}'
  }`);
      break;
    }

    if (lazyContainer.tagName !== 'DIV') {
      console.error(
        `convertNytimesImgs unknown dom lazyContainer (should be div): ` +
        `${lazyContainer.outerHTML}`);
      break;
    }

    // add to lazyload div a child img with src=url
    const img = document.createElement('img');
    img.src = url;
    lazyContainer.appendChild(img);
  }

  return body;
}

export { convertNytimesImgs };
