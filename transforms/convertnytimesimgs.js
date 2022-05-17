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
 * @return {{lazyContainer: HTMLElement, credit: string, caption: string}[]}
 */
function findLazyImageContainers (element) {
  // console.log(`findLazyImageContainers element:`, element);

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
 * @return {{imageType, credit, legacyHtmlCaption, url}[]}
 */
function getInitialStateImageData (window, document) {
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
      // console.log(`  initialStateImages: found preloadScript`);
      break;
    }
  }

  console.assert(preloadObjectStr,
    `initialStateImages preloadObjectStr not found`);
  if (!preloadObjectStr) {return imgData;}

  const preloadData = looseJsonParse(preloadObjectStr);
  const {initialState} = preloadData;

  console.assert(initialState, `getInitialStateImageData initialState not found`);
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

      // find next prop that starts with 'ImageRendition:' - that's our image
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

// form a hash object of image data with prop names equal to caption text
/**
 *
 * @param {{imageType, credit, legacyHtmlCaption, url}[]} imgData
 * @return {{}}
 */
function hashImgDataByCaption (imgData) {
  const hashData = {};
  imgData.forEach(dataObj => {
    if (!dataObj.legacyHtmlCaption) { return; }
    const propName = dataObj.legacyHtmlCaption;
    hashData[propName] = dataObj;
  });
  return hashData;
}

/**
 * convert nytimes images
 * @param {HTMLDocument} document
 * @param {undefined} [element]
 * @param {undefined} [conversion]
 * @param {Window} window
 * @return {*|string|string|HTMLElement|BodyInit|ReadableStream<Uint8Array>|null}
 */
function convertNytimesImgs (document,
                             element = undefined,
                             conversion = undefined,
                             window) {
  console.log('convertNytimesImgs()');
  let subjects;

  const body = document.body;
  // console.log(`  convertNytimesImgs body:`, body);

  // find elements that are or contain images
  let lazyContainers = findLazyImageContainers(body);

  subjects = lazyContainers.map(cont => {
    const {lazyContainer, credit, caption} = cont;
    return {
      lazyContainer,
      credit,
      caption
    };
  });

  const initStateImages = getInitialStateImageData(window, document);

  console.assert(
    initStateImages.length >= lazyContainers.length,
    `convertNytimesImgs too few initialState images found`
  );
  if (initStateImages.length < lazyContainers.length) {
    return body;
  }

  const imgDataHash = hashImgDataByCaption(initStateImages);

  // console.log(`imgDataHash:`, imgDataHash);

  // add urls to subjects
  subjects.forEach((subject, index) => {
    const {caption} = subject,
      imgData = caption && imgDataHash[caption];
    if (imgData) {
      subject.url = imgData.url;
    }
  });

  // add child img to each lazyload div
  subjects.forEach(subject => {
    const {lazyContainer, credit, caption, url} = subject;
    if (!url) {
      console.log(
`convertNytimesImgs didn't find url for subject: {
  lazyContainer: ${lazyContainer.outerHTML},
  credit: '${credit}',
  caption: '${caption}'
 }`);
      return;
    }

    if (lazyContainer.tagName !== 'DIV') {
      console.error(
        `convertNytimesImgs unknown dom lazyContainer (should be div): ` +
        `${lazyContainer.outerHTML}`);
      return;
    }

    // add to lazyload div a child img with src=url
    const img = document.createElement('img');
    img.src = url;
    lazyContainer.appendChild(img);
  });

  return body;
}

export { convertNytimesImgs };
