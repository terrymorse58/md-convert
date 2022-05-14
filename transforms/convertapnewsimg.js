// mdconvert transform 'convertApnewsImg' -
//   convert first img 'data-src-*' attribute to 'src' attribute

/*
sample apnews image:

<head>
  <meta data-rh="true" property="og:image"
    content="https://(...).jpeg">
</head>
<body>
<div id="root">
  <div class="App">
    <main class="Main">
      <div class="Body">
        <div class="Content WireStory fluid-wrapper with-lead">

          <a class="LeadFeature Component-leadFeature-0-2-77 LeadFeature_gallery"
            href="(url of gallery)">
            <div
              class="placeholder-0-2-85 undefined"
              data-key="media-placeholder"
            >
              <img
                class="image-0-2-86"
                src=""
                alt="(...)"
                width="2000"
                height="1300"
                >
            </div>
          </a>
*/


/**
 * find the "og:image" URL from the document's meta tag
 * @param {HTMLDocument} document
 * @return {null|string}
 */
function getOgImageURL (document) {
  const meta = document.querySelector('meta[property="og:image"]');
  // console.log(`getMetaImageURL meta.outerHTML:`, meta.outerHTML);
  if (!meta || !meta.content) { return null;}
  return meta.content;
}

/**
 * copy <meta property="og:image"> content attribute to image 'src'
 * @param {HTMLDocument} document
 * @param {HTMLImageElement} element
 * @returns {HTMLImageElement}
 */
function convertApnewsImg (
  document,
  element
) {
  // console.log('convertApnewsImg() element:', element);

  const ogImageUrl = getOgImageURL(document);
  if (!ogImageUrl) { return element; }

  element.src = ogImageUrl;

  // console.log(`  convertApnewsImg element.outerHTML`, element.outerHTML);

  return element;
}

export { convertApnewsImg };
