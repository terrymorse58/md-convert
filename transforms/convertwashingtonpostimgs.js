// mdconvert transform 'convertWashingtonpostImgs' -
//   convert all washingtonpost images using the document's
//   <script id="__NEXT_DATA__" type="application/json">{...}</script>

/**
 * depth-first search specified DOM element and its children for image
 * containers
 * @param {HTMLElement} element
 * @return {{imageContainer: HTMLElement,
 *            containerType: string,
 *            ledeImgType: string,
 *            caption: string}[]}
 */
function findDomImageContainers (element) {
  // console.log(`findDomImageContainers element:`, element);

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

    const imageContainer = element,
      containerType = element.dataset.qa;
    let ledeImgType, caption;

    // determine "lede-img" type ('image' or 'video')
    if (containerType === 'lede-art') {
      const videoWrapper =
          imageContainer.querySelector(
            'div > div[data-testid="video-wrapper"]'),
        figImg = imageContainer.querySelector('figure > div > img');
      let figcaption;

      if (videoWrapper) {
        ledeImgType = 'video';
        figcaption = videoWrapper.querySelector(
          'figcaption[data-qa="video-caption"]');
      } else if (figImg) {
        ledeImgType = 'image';
        figcaption = imageContainer.querySelector(
          'figure > figcaption');
      } else {
        console.error(
          `findDomImageContainers 'lede-art' image type unknown.\n` +
          `  imageContainer:\n` +
          `  ${imageContainer.outerHTML}`);
      }

      if (figcaption) {
        caption = figcaption.textContent;
      }

    }

    const domData = {
      imageContainer,
      containerType,
      ledeImgType,
      caption
    };

    return [domData];
  }

  // element is not an image container, so search element's
  // children
  let imgContainers = [];
  const children = [...element.children];
  for (const child of children) {
    const childImgs = findDomImageContainers(child);
    if (childImgs.length) {
      imgContainers = imgContainers.concat(childImgs);
    }
  }

  return imgContainers;
}

/**
 * recursively find 'content_elements' items where
 *      element.type === "image", or
 *      element.type === "video
 * @param {Object} contentElItem
 * @param {Set} imgsSet
 * @param {Set} videosSet
 */
function findGraphicItemsInScriptData (
  contentElItem,
  imgsSet,
  videosSet) {

  if (contentElItem.type === 'image') {
    imgsSet.add(contentElItem);
  } else if (contentElItem.type === 'video') {
    videosSet.add(contentElItem);
  }

  // search for graphic items in this element's content_elements

  const {content_elements} = contentElItem;
  if (!content_elements) {return;}
  for (const childEl of content_elements) {
    findGraphicItemsInScriptData(childEl, imgsSet, videosSet);
  }
}

/**
 * extract all image data (type: 'image') and video data (type: 'video')
 * from the <script id="__NEXT_DATA__> script
 * @param {Window} window
 * @param {HTMLDocument} document
 * @return {{imgData: {caption: String, url: String}[], videoData: {caption: String, url: String}[]}}
 */
function getScriptDataGraphics (window, document) {
  // console.log(`getScriptDataGraphics()`);
  let imgData = [], videoData = [];

  // obtain the script element with id="__NEXT_DATA__"
  const scriptEl = document.querySelector('script#__NEXT_DATA__');

  // console.log(`getScriptDataGraphics scriptEl:`, scriptEl);

  if (!scriptEl) {
    console.error(`getScriptDataGraphics no script found!`);
    return {imgData, videoData};
  }

  let scriptObject;
  try {
    scriptObject = JSON.parse(scriptEl.textContent);
  } catch (err) {
    console.error(`getScriptDataGraphics invalid JSON:`, err);
    return {imgData, videoData};
  }

  const {content_elements} = scriptObject?.props?.pageProps?.globalContent;
  if (!content_elements) {
    console.error(`getScriptDataGraphics property 'content_elements' not` +
      ` found`);
    return {imgData, videoData};
  }

  // form set of all content elements where type == 'image'
  const imagesSet = new Set(),
    videosSet = new Set();
  for (const contentElItem of content_elements) {
    findGraphicItemsInScriptData(contentElItem, imagesSet, videosSet);
  }

  // form imageData from set of content images
  imgData = [...imagesSet].map(cEl => {
    const {url, credits_caption_display} = cEl;
    return {
      caption: credits_caption_display,
      url
    };
  });

  // form video data from set of content videos
  videoData = [...videosSet].map(cItem => {
    const {credits_caption_display, promo_image} = cItem,
      {url} = promo_image;
    return {
      caption: credits_caption_display,
      url
    };
  });

  return {
    imgData,
    videoData
  };
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
 * true if the first imgData url is contained in targetStr
 * @param {String} targetStr
 * @param {{url: string}[]} imgData
 * @return {Boolean}
 */
function stringContainsImageDataUrl (targetStr, imgData) {
  if (!imgData || !imgData[0]) { return false; }
  const {url} = imgData[0];
  if (!url) { return false; }
  return targetStr.includes(url);
}

/**
 * add image + blockquote to specified container
 * @param {HTMLDocument} document
 * @param {HTMLElement} container
 * @param {string} url
 * @param {string} caption
 */
function addImageWithCaptionToContainer (
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

  let imgContainers = findDomImageContainers(body);

  const domSubjects = imgContainers.map(cont => {
    const {imageContainer, containerType, ledeImgType, caption} = cont;
    return {
      imageContainer,
      containerType,
      ledeImgType,
      caption,
      url: ""
    };
  });

  if (debug) {
    console.log(`  convertWashingtonpostImgs domSubjects:`);
    let iSub = 0;
    for (const sub of domSubjects) {
      const {imageContainer, containerType, ledeImgType, caption} = sub;
      console.log(
        `  [${iSub++}]: {\n` +
        `    imageContainer:\n` +
        `      ${imageContainer.outerHTML},\n` +
        `    containerType: '${containerType}',\n` +
        `    ledeImgType: '${ledeImgType}',\n` +
        `    caption: '${caption}'\n` +
        `  }`);
    }
  }

  // find graphic items in the
  //    <script id="__NEXT_DATA__" type="application/json">

  const {imgData, videoData} = getScriptDataGraphics(window, document);

  if (debug) {
    console.log(`\n  convertWashingtonpostImgs imgData:`);
    let iSImg = 0;
    for (const sImg of imgData) {
      const {url, caption} = sImg;
      console.log(
        `  [${iSImg++}]: {\n` +
        `    url: '${url}',\n` +
        `    caption: '${caption}'\n` +
        `  }`);
    }
    console.log(`\n  videoData:`);
    let iVid = 0;
    for (const vid of videoData) {
      const {url, caption} = vid;
      console.log(
        `  [${iVid++}]: {\n` +
        `    url: '${url}',\n` +
        `    caption: '${caption}'\n` +
        `  }`);
    }
  }

  // if (imgData.length < imgContainers.length) {
  //   console.error(
  //     `convertWashingtonpostImgs image count mismatch:
  //     imgData.length:  ${imgData.length}
  //     imgContainers.length: ${imgContainers.length}
  //     SKIPPING IMAGE CONVERSION!`);
  //   return body;
  // }

  // insert images + captions into htmlSubject elements

  for (const subject of domSubjects) {
    const {imageContainer, containerType, ledeImgType, caption} = subject;

    if (containerType === 'lede-art' && ledeImgType === 'image') {

      // 'lede-art' 'image' container must have an `img` element:
      const ledeImg = imageContainer.querySelector('figure > div > img');
      if (!ledeImg) {
        continue;
      }

      let srcUrl, newCaption;
      if (!stringContainsImageDataUrl(ledeImg.srcset, imgData)) {
        
        // lede-art image is not in imgData, get url from image's srcset
        const urls = ledeImg.srcset.match(/^(.*?)(\.jpg|\.jpeg|\.png)/);
        srcUrl = urls[0];
        newCaption = caption;

      } else {

        // image is in imgData, get url and caption from imgData
        const {url, caption} = imgData.shift();
        srcUrl = url;
        newCaption = caption;
      }

      removeElementChildren(imageContainer);
      addImageWithCaptionToContainer(document, imageContainer, srcUrl,
        newCaption);

    } else if (containerType === 'lede-art' && ledeImgType === 'video') {

      // find the video data with a matching caption
      let vdUrl;
      for (let iVData = 0, len = videoData.length; iVData < len; iVData++) {
        const vData = videoData[iVData];
        if (vData.caption === caption) {
          vdUrl = vData.url;
          videoData.splice(iVData, 1);
          break;
        }
      }
      
      if (vdUrl) {
        removeElementChildren(imageContainer);
        addImageWithCaptionToContainer(
          document, imageContainer, vdUrl, caption);
      } else {
        console.error(
          `convertWashingtonpostImgs no video URL found, subject:`, subject);
      }

    } else if (containerType === 'article-image') {

      // single image with optional caption
      const id = imgData.shift();
      removeElementChildren(imageContainer);
      addImageWithCaptionToContainer(document, imageContainer, id.url,
        id.caption);

    } else if (containerType === 'article-image-group') {

      // two images with optional caption
      let img1 = imgData.shift(),
        img2 = imgData.shift();
      removeElementChildren(imageContainer);
      addImageWithCaptionToContainer(
        document, imageContainer, img1.url, img1.caption);
      addImageWithCaptionToContainer(
        document, imageContainer, img2.url, img2.caption);

    } else {
      console.error(
        `addImageWithCaptionToContainer unknown containerType:` +
        `'${containerType}'`);
    }
    
  }
  
  if (debug) {
    console.log(`\n  convertWashingtonpostImgs domSubjects after conversion:`);
    let iSub = 0;
    for (const sub of domSubjects) {
      const {imageContainer, containerType, ledeImgType, caption} = sub;
      console.log(
        `  [${iSub++}]: {\n` +
        `    imageContainer:\n` +
        `      ${imageContainer.outerHTML},\n` +
        `    containerType: '${containerType}',\n` +
        `    ledeImgType: '${ledeImgType}',\n` +
        `    caption: '${caption}'\n` +
        `  }`);
    }
  }

  return body;
}

export { convertWashingtonpostImgs };
