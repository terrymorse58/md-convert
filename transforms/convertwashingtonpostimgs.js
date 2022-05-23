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
 * extract all the image data from the <script id="__NEXT_DATA__>
 * @param {Window} window
 * @param {HTMLDocument} document
 * @return {{url: string, caption: string}[]}
 */
function getScriptImageData (window, document) {
  // console.log(`getScriptImageData()`);
  let imgData = [];

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

  for (const imgEl of content_elements) {

    // only interested in `type: "image"` elements
    if (imgEl.type !== 'image') {continue;}

    const {url, credits_caption_display} = imgEl;
    const el = {
      caption: credits_caption_display,
      url
    };
    imgData.push(el);
  }

  return imgData;
}

/**
 * convert washingtonpost images
 * @param {HTMLDocument} document
 * @param {undefined} [element]
 * @param {undefined} [conversion]
 * @param {Window} window
 * @return {*|string|string|HTMLElement|BodyInit|ReadableStream<Uint8Array>|null}
 */
function convertWashingtonpostImgs (document,
                                    element = undefined,
                                    conversion = undefined,
                                    window) {
  // console.log('convertWashingtonpostImgs()');
  let subjects;

  const body = document.body;
  // console.log(`  convertWashingtonpostImgs body:`, body);

  // find elements that are or contain images
  let imgContainers = findArticleImageContainers(body);

  subjects = imgContainers.map(cont => {
    const {imageContainer, containerType} = cont;
    return {
      imageContainer,
      containerType,
      imageData: undefined
    };
  });

  {
  //   console.log(`subjects:`);
  //   let iSub = 0;
  //   for (const sub of subjects) {
  //     const {imageContainer, containerType} = sub;
  //     console.log(
  //       `  [${iSub++}]: {
  //   imageContainer:
  //     ${imageContainer.outerHTML},
  //   containerType: '${containerType}'
  // }`);
  //   }
  }

  const scriptImages = getScriptImageData(window, document);

  console.assert(
    scriptImages.length >= imgContainers.length,
    `convertWashingtonpostImgs too few initialState images found`
  );
  if (scriptImages.length < imgContainers.length) {
    return body;
  }

  {
  //   console.log(`scriptImages:`);
  //   let iSImg = 0;
  //   for (const sImg of scriptImages) {
  //     const {url, caption} = sImg;
  //     console.log(
  //       `  [${iSImg++}]: {
  //   url: '${url}',
  //   caption: '${caption}'
  // }`);
  //   }
  }

  // remove an element's children (if any)
  function removeElementChildren (element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  // true if the first scriptImages url is contained in targetStr
  function stringContainsAScriptImagesUrl (targetStr) {
      return targetStr.includes(scriptImages[0].url);
  }

  function addImageToContainer(container, url, caption) {
    const img = document.createElement('img'),
      blockquote = document.createElement('blockquote');

    img.src = url;
    img.alt = caption;
    container.appendChild(img);

    blockquote.textContent = caption;
    container.appendChild(blockquote);
  }

  // insert images and captions into subject elements
  for (const subject of subjects) {
    const {imageContainer, containerType} = subject;

    if (containerType === 'lede-art') {

      // lede art may or may not have an image url in scriptData.
      // if it doesn't, skip it.
      // if it does, convert it.
      const ledeImg = imageContainer.querySelector('figure > div > img');
      if (!ledeImg) {
        console.error(`addImageToContainer no no 'lede-art' image found!`);
        continue;
      }
      // see if the image's srcset contains one of the scriptImages urls
      if (!stringContainsAScriptImagesUrl(ledeImg.srcset)) {
        // console.log(`addImageToContainer 'lede-art' image not in script images, skipping`);
        continue;
      }
      // image is in scriptImages, convert it
      // console.log(`addImageToContainer 'lede-art' image in script images, converting`);
      const {url, caption} = scriptImages.shift();
      removeElementChildren(imageContainer);
      addImageToContainer(imageContainer, url, caption);

    } else if (containerType === 'article-image') {

      // single image with optional caption
      const {url, caption} = scriptImages.shift();
      removeElementChildren(imageContainer);
      addImageToContainer(imageContainer, url, caption);

    } else if (containerType === 'article-image-group') {

      // two images with optional caption
      let img1 = scriptImages.shift(),
        img2 = scriptImages.shift();
      removeElementChildren(imageContainer);
      addImageToContainer(imageContainer, img1.url, img1.caption);
      addImageToContainer(imageContainer, img2.url, img2.caption);

    } else {
      console.error(
        `addImageToContainer unknown containerType '${containerType}'`);
    }
  }

  {
  //   console.log(`subjects after conversion:`);
  //   let iSub = 0;
  //   for (const sub of subjects) {
  //     const {imageContainer, containerType} = sub;
  //     console.log(
  //       `  [${iSub++}]: {
  //   imageContainer:
  //     ${imageContainer.outerHTML},
  //   containerType: '${containerType}'
  // }`);
  //   }
  }

  return body;
}

export { convertWashingtonpostImgs };
