// convert HTML to markdown

import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import * as fs from 'fs';
import { transformer } from './transforms.js';
import { tableRule } from './tablerule.js';

/** @type TurndownOptions **/
const defaultTdOptions = {
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*'
};

// default configuration
/** @type {MdcConfig} **/
const defaultConfig = {
  frontMatter: {
    title: {
      selector: 'title'
    }
  },
  omit: ['script', 'header', 'footer'],
  transform: [],
  select: 'body'
};

/**
 * read a JSON file
 * @param {String} path
 * @return {Object}
 */
function readJsonFile (path) {
  const json = fs.readFileSync(path, {encoding: 'utf8'});
  try {
    return JSON.parse(json);
  } catch (err) {
    throw `Error: file '${path}' is not valid JSON`;
  }
}

/**
 * validate that a file path exists
 * @param {String} path
 * @returns {boolean}
 */
function isExistingFilePath (path) {
  try {
    const fStats = fs.statSync(path);
    return fStats.isFile();
  } catch (err) {
    return false;
  }
}

/**
 * read HTML file and return HTMLDocument
 * @param {String} path
 * @return {HTMLDocument}
 */
function readHtmlFile (path) {
  if (!isExistingFilePath(path)) {
    throw new Error(`Error: HTML file '${path}' does not exist`);
  }

  const htmlStr = fs.readFileSync(path, {
    encoding: 'utf8'
  });
  const dom = new JSDOM(htmlStr);
  return dom.window.document;
}

/**
 * read JSON config file and return MdcConfig object
 * @param {String} path
 * @return {MdcConfig}
 */
function readConfigFile (path) {

  if (!path) {
    return defaultConfig;
  }

  if (!isExistingFilePath(path)) {
    throw `Error: config file '${path}' does not exist`;
  }

  try {
    const config = readJsonFile(path);

    // collapse arrays to comma-delimited strings
    if (Array.isArray(config.select)) {
      config.select = config.select.join(', ');
    }
    if (Array.isArray(config.omit)) {
      config.omit = config.omit.join(', ');
    }
    return config;
  } catch (err) {
    throw err;
  }
}

/**
 * extract front matter from document
 * @param {HTMLDocument} document
 * @param {FrontMatterConfig} fmConfig
 * @return {FrontMatterString}
 */
function createFrontMatter (document, fmConfig) {
  let frontMatter = '';
  if (!fmConfig) { return frontMatter; }

  frontMatter = `---`;
  for (const [fmKey, {selector, attrName}] of Object.entries(fmConfig)) {
    let content;
    const el = document.querySelector(selector);
    if (!el) { continue; }
    content = attrName ? el.getAttribute(attrName) : el.textContent;
    // single line, no redundant white space:
    content = content.replace(/\n/g, ' ').replace(/\s\s+/g, ' ');
    frontMatter += `\n${fmKey}: ${content}  `;
  }
  frontMatter += '\n---';

  return frontMatter;
}

/**
 * remove matching elements from document
 * @param {HTMLDocument} document
 * @param {CSSSelector} selector
 */
function removeElements (document, selector) {
  if (!selector) { return; }
  const elements = [...document.querySelectorAll(selector)];
  if (!elements) { return; }
  elements.forEach(element => {
    element.remove();
  });
}

/**
 * transform matching elements in document
 * @param {HTMLDocument} document
 * @param {Transformers} transformers
 */
function transformElements (document, transformers) {

  // console.log(`\ntransformElements() transformers:`, transformers);

  if (!transformers) { return; }

  for (const {selector, conversions} of transformers) {
    // console.log(`  selector: '${selector}', conversions: ${JSON.stringify(conversions)}`);

    const elements = [...document.querySelectorAll(selector)];

    for (let element of elements) {
      // console.log(`  element.tagName: '${element.tagName}'`);

      for (const conversion of conversions) {
        // console.log(`    conversion type: '${conversion.type}'` +
        //   `, comment: '${conversion.comment}'`);

        const transFn = transformer[conversion.type];
        if (!transFn) {
          throw `Error: unknown transform conversion type '${conversion.type}'`;
        }

        element = transFn(document, element, conversion);
      }
    }
  }
}

/**
 * convert matching elements to markdown
 * @param {HTMLDocument} document
 * @param {CSSSelector} selector
 * @param {TurndownOptions} tdOptions
 * @return {MarkdownStr}
 */
function elementsToMarkdown (
  document,
  selector,
  tdOptions
) {
  if (!selector) { return ''; }

  const turndownService = new TurndownService(tdOptions);

  // console.log(`turndownService:`, JSON.stringify(turndownService, null, 2));

  turndownService.addRule('tables', tableRule);

  // form array of elements
  const elements = [...document.querySelectorAll(selector)];

  // convert each element to markdown
  return elements.reduce((acc, element) => {
    acc += '\n\n' + turndownService.turndown(element.outerHTML);
    return acc;
  }, '');
}

/**
 * convert html file to markdown file
 * @param {String} htmlPath
 * @param {String} configPath
 * @param {TurndownOptions} tdOptions
 * @return {string} markdown file path
 */
function htmlFileToMarkdownFile (
  htmlPath,
  configPath,
  tdOptions = defaultTdOptions
) {
  try {
    // store markdown file in same directory as htmlPath
    const mdPathArray = htmlPath.split('.');
    mdPathArray.pop(); // remove extension
    const mdPath = mdPathArray.join('.') + '.md';

    // read files
    const document = readHtmlFile(htmlPath);
    const config = readConfigFile(configPath);

    // extract front matter from DOM
    const frontMatterStr = createFrontMatter(document, config.frontMatter);

    // remove matching omits from document
    removeElements(document, config.omit);

    // transform matching HTML elements
    transformElements(document, config.transform);

    // console.log(`after transformElements body.innerHTML:`,
    //   document.body.innerHTML);

    // create markdown content
    const markdown = elementsToMarkdown(
      document,
      config.select,
      tdOptions
    );

    // save markdown file
    fs.writeFileSync(
      mdPath,
      frontMatterStr + markdown,
      {encoding: 'utf8'}
    );

    return mdPath;

  } catch (err) {
    const errmsg = err.message || err;
    console.error(`htmlFileToMarkdownFile ERROR:`, err);
    throw errmsg;
  }
}

export {
  readHtmlFile,
  readConfigFile,
  createFrontMatter,
  removeElements,
  transformElements,
  elementsToMarkdown,
  htmlFileToMarkdownFile
};
