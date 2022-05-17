// mdconvert transform 'convertNytimesImgs' -
//   convert all nytimes images using the document's
//   window.__preloadedData.initialState object

/**
 * depth-first search specified element and its children for image containers
 * @param {HTMLElement} element
 * @return {HTMLElement[]}
 */
function findImageContainers (element) {
  // console.log(`findImageContainers element:`, element);

  // return <img> and <div data-testid="lazyimage-container"> elements
  if (
    element.tagName === 'IMG' ||
    (element.tagName === 'DIV' && element.dataset.testid === 'lazyimage-container')
  ) {
    // console.log(`  findImageContainers found image node:
    // ${element.outerHTML}`);
    return [element];
  }

  // element is not an image node, so search element's
  // children for image nodes
  let imgEls = [];
  const children = [...element.children];
  for (const child of children) {
    const childImgs = findImageContainers(child);
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
 * gather all the images from the initialState data
 * @param {Window} window
 * @param {HTMLDocument} document
 * @return {String[]}
 */
function getInitialStateImages (window, document) {
  // console.log(`initialStateImages()`);
  let imgUrls = [], preloadObjectStr;

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
  if (!preloadObjectStr) {return imgUrls;}

  const preloadData = looseJsonParse(preloadObjectStr);
  const {initialState} = preloadData;

  console.assert(initialState, `getInitialStateImages initialState not found`);
  if (!initialState) { return imgUrls; }

  // review every property in initalState, looking for image data
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

      // find next prop that starts with 'ImageRendition:' - that's our image
      for (let jProp = iProp + 1; jProp < len; jProp++) {
        const [jpName, jpVal] = props[jProp];
        if (
          jpName.startsWith('ImageRendition:') &&
          typeof jpVal.url !== 'undefined'
        ) {
          // console.log(`    found image URL:`, jpVal.url);
          imgUrls.push(jpVal.url);
          break;
        }
      }
    }
  }

  return imgUrls;
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
  let domImageEls = findImageContainers(body);

  subjects = domImageEls.map(element => {
    return { element };
  });

  const initStateSrcUrls = getInitialStateImages(window, document);

  console.assert(
    initStateSrcUrls.length >= domImageEls.length,
    `convertNytimesImgs too few initialState images found`
  );
  if (initStateSrcUrls.length < domImageEls.length) {
    return body;
  }

  // add urls to subjects
  subjects.forEach((subject, index) => {
    subject.url = initStateSrcUrls[index];
  })

  // add src url to each subject element
  subjects.forEach(({element, url}) => {
    if (element.tagName === 'IMG') {
      element.src = url;
    } else if (
      element.tagName === 'DIV'
    ) {
      // add child img to div
      const img = document.createElement('img');
      img.src = url;
      element.appendChild(img);
    } else {
      console.error(`convertNytimesImgs unknown dom element:`, element);
    }
  });

  console.log(`subjects:`);
  subjects.forEach(({element, url}) => {
    console.log(`\n  element: ${element.outerHTML}\n  url: ${url}`);
  });

  return body;
}

export { convertNytimesImgs };
