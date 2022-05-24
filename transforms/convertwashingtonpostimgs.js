// mdconvert transform 'convertWashingtonpostImgs' -
//   convert all washingtonpost images using the document's
//   <script id="__NEXT_DATA__" type="application/json">{...}</script>

/*
Structure of a washingtonpost "article-image" container:

<div data-qa="article-image" class="hide-for-print">
  <div></div>
</div>


 */

/**
 * depth-first search specified element and its children for image containers
 * @param {HTMLElement} element
 * @return {{imageContainer: HTMLElement, containerType: string}[]}
 */
function findArticleImageContainers (element) {
  // console.log(`findArticleImageContainers element:`, element);

  // return when one of these elements is found:
  //   <div data-qa="lede-art">
  //   <div data-qa="article-image">
  //   <div data-qa="article-image-group">
  if (
    element.tagName === 'DIV' &&
    (
      element.dataset.qa === 'lede-art' ||
      element.dataset.qa === 'article-image' ||
      element.dataset.qa === 'article-image-group'
    )
  ) {

    const domData = {
      imageContainer: element,
      containerType: element.dataset.qa
    };

    return [domData];
  }

  // element is not an image container, so search element's
  // children
  let imgEls = [];
  const children = [...element.children];
  for (const child of children) {
    const childImgs = findArticleImageContainers(child);
    if (childImgs.length) {
      imgEls = imgEls.concat(childImgs);
    }
  }

  return imgEls;
}

/**
 * recursively find 'content_elements' items where element.type === "image"
 * @param {Object} contentEl
 * @param {Set} imgsSet
 */
function findImagesInContentElements(contentEl, imgsSet) {

  if (contentEl.type === 'image') {
    imgsSet.add(contentEl);
  }

  const {content_elements} = contentEl;
  if (!content_elements) {return;}

  // search for image elements in this element's content_elements
  for (const childEl of content_elements) {
    findImagesInContentElements(childEl, imgsSet);
  }
}

/**
 * extract all image data (type: 'image') from the
 * <script id="__NEXT_DATA__>
 * @param {Window} window
 * @param {HTMLDocument} document
 * @return {{url: string, caption: string}[]}
 */
function getScriptImageData (window, document) {
  // console.log(`getScriptImageData()`);

  // obtain the script element with id="__NEXT_DATA__"
  const scriptEl = document.querySelector('script#__NEXT_DATA__');

  // console.log(`getScriptImageData scriptEl:`, scriptEl);

  if (!scriptEl) {
    console.error(`getScriptImageData no script found!`);
    return imgData;
  }

  let scriptObject;
  try {
    scriptObject = JSON.parse(scriptEl.textContent);
  } catch (err) {
    console.error(`getScriptImageData invalid JSON:`, err);
    return imgData;
  }

  const {content_elements} = scriptObject?.props?.pageProps?.globalContent;
  if (!content_elements) {
    console.error(`getScriptImageData property 'content_elements' not` +
      ` found`);
    return imgData;
  }

  // form set of all content elements where type == 'image'
  const imagesSet = new Set();
  for (const contentEl of content_elements) {
    findImagesInContentElements(contentEl, imagesSet);
  }

  // form imageData from set of content images
  const imgData = [...imagesSet].map(cEl => {
    const {url, credits_caption_display} = cEl;
    return {
      caption: credits_caption_display,
      url
    }
  });

  return imgData;
}


/**
 * remove an element's children (if any)
 * @param {HTMLElement} element
 */
function removeElementChildren (element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * true if the first scriptImages url is contained in targetStr
 * @param {String} targetStr
 * @param {{url: string}[]} scriptImages
 * @return {Boolean}
 */
function stringContainsAScriptImagesUrl (targetStr, scriptImages) {
  return targetStr.includes(scriptImages[0].url);
}

/**
 * add image + blockquote to specified container
 * @param {HTMLDocument} document
 * @param {HTMLElement} container
 * @param {string} url
 * @param {string} caption
 */
function addImageToContainer (
  document,
  container,
  url,
  caption
) {
  const img = document.createElement('img'),
    blockquote = document.createElement('blockquote');

  img.src = url;
  img.alt = caption;
  container.appendChild(img);

  blockquote.textContent = caption;
  container.appendChild(blockquote);
}

/**
 * convert washingtonpost images
 * @param {HTMLDocument} document
 * @param {undefined} [element]
 * @param {Boolean} debug
 * @param {Window} window
 * @return {*|string|string|HTMLElement|BodyInit|ReadableStream<Uint8Array>|null}
 */
function convertWashingtonpostImgs (document,
                                    element = undefined,
                                    {debug = false},
                                    window) {

  if (debug) {
    console.log('convertWashingtonpostImgs()');
  }

  const {body} = document;

  // find HTML elements that may contain images

  let imgContainers = findArticleImageContainers(body);

  const htmlSubjects = imgContainers.map(cont => {
    const {imageContainer, containerType} = cont;
    return {
      imageContainer,
      containerType
    };
  });

  if (debug) {
    console.log(`  convertWashingtonpostImgs htmlSubjects:`);
    let iSub = 0;
    for (const sub of htmlSubjects) {
      const {imageContainer, containerType} = sub;
      console.log(
        `  [${iSub++}]: {
    imageContainer:
      ${imageContainer.outerHTML},
    containerType: '${containerType}'
  }`);
    }
  }

  // find image data in script

  const scriptImages = getScriptImageData(window, document);

  if (debug) {
    console.log(`  convertWashingtonpostImgs scriptImages:`);
    let iSImg = 0;
    for (const sImg of scriptImages) {
      const {url, caption} = sImg;
      console.log(
        `  [${iSImg++}]: {
      url: '${url}',
      caption: '${caption}'
    }`);
    }
  }

  if (scriptImages.length < imgContainers.length) {
    console.error(
      `convertWashingtonpostImgs image count mismatch:
      scriptImages.length:  ${scriptImages.length}
      imgContainers.length: ${imgContainers.length}
      SKIPPING IMAGE CONVERSION!`);
    return body;
  }

  // insert images + captions into htmlSubject elements

  for (const subject of htmlSubjects) {
    const {imageContainer, containerType} = subject;

    if (containerType === 'lede-art') {

      // TERRY lede-art may contain a video instead of an image
      // which we could possibly convert to an image

      // lede art may or may not have an image url in scriptData.
      // if it doesn't, skip it.
      // if it does, convert it.
      const ledeImg = imageContainer.querySelector('figure > div > img');
      if (!ledeImg) {
        continue;
      }

      // see if the image's srcset contains one of the scriptImages urls
      if (!stringContainsAScriptImagesUrl(ledeImg.srcset, scriptImages)) {
        // console.log(`addImageToContainer 'lede-art' image not in script images, skipping`);
        continue;
      }

      // image is in scriptImages, convert it
      // console.log(`addImageToContainer 'lede-art' image in script images, converting`);
      const {url, caption} = scriptImages.shift();
      removeElementChildren(imageContainer);
      addImageToContainer(document, imageContainer, url, caption);

    } else if (containerType === 'article-image') {

      // single image with optional caption
      const {url, caption} = scriptImages.shift();
      removeElementChildren(imageContainer);
      addImageToContainer(document, imageContainer, url, caption);

    } else if (containerType === 'article-image-group') {

      // two images with optional caption
      let img1 = scriptImages.shift(),
        img2 = scriptImages.shift();
      removeElementChildren(imageContainer);
      addImageToContainer(document, imageContainer, img1.url, img1.caption);
      addImageToContainer(document, imageContainer, img2.url, img2.caption);

    } else {
      console.error(
        `addImageToContainer unknown containerType '${containerType}'`);
    }
  }

  if (debug) {
    console.log(`  convertWashingtonpostImgs htmlSubjects after conversion:`);
    let iSub = 0;
    for (const sub of htmlSubjects) {
      const {imageContainer, containerType} = sub;
      console.log(
        `  [${iSub++}]: {
      imageContainer:
        ${imageContainer.outerHTML},
      containerType: '${containerType}'
    }`);
    }
  }

  return body;
}

export { convertWashingtonpostImgs };
