# md-convert

Convert an HTML file to Markdown
---

## Install

```shell
npm install [-g] md-convert
```

## Usage

```shell
htmlmd --src <html-file> [--config <config-file>]
```

Where:

`<html-file>` - any valid HTML file  
`<config-file>` - a JSON file to configure the conversion process (optional)

JavaScript:
```javascript
import { htmlFileToMarkdownFile } from 'md-convert';
const htmlPath = 'index.html';
const configPath = 'my-mdconfig.json';
const turndownOptions = {
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*'
};

const mdPath = htmlFileToMarkdownFile(htmlPath, configPath, turndownOptions);
```
---

## API

### readHtmlFile
```javascript
/**
 * read HTML file and return HTMLDocument
 * @param {String} path
 * @return {HTMLDocument}
 */

const document = readHtmlFile(htmlPath);
```

### readConfigFile
```javascript
/**
 * read JSON config file and return MdcConfig object
 * @param {String} path
 * @return {MdcConfig}
 */

const config = readConfigFile(configPath);
```

### createFrontMatter
```javascript
/**
 * extract front matter from document
 * @param {HTMLDocument} document
 * @param {FrontMatterConfig} fmConfig
 * @return {FrontMatterString}
 */

const frontMatterStr = createFrontMatter(document, frontMatterConfig);
```

### removeElements
```javascript
/**
 * remove matching elements from document
 * @param {HTMLDocument} document
 * @param {CSSSelector} selector
 */

removeElements(document, omitConfig);
```

### transformElements
```javascript
/**
 * transform matching elements in document
 * @param {HTMLDocument} document
 * @param {Transformers} transformers
 */

transformElements(document, transformConfig);
```

### elementsToMarkdown
```javascript
/**
 * convert matching elements to markdown
 * @param {HTMLDocument} document
 * @param {CSSSelector} selector
 * @param {TurndownOptions} tdOptions
 * @return {MarkdownStr}
 */

const markdownText = elementsToMarkdown(
    document,
    cssSelector,
    turndownOptions
  );
```

### htmlFileToMarkdownFile
```javascript
/**
 * convert html file to markdown file
 * @param {String} htmlPath
 * @param {String} configPath
 * @param {TurndownOptions} tdOptions
 * @return {string} markdown file path
 */

const mdPath = htmlFileToMarkdownFile(htmlPath, configPath, turndownOptions);
```

### JSON Config File Properties

```JSON
{
  "description": "",
  "frontMatter": {},
  "omit": [],
  "transform": [],
  "select": []
}
```

---

### Config Properties

- `description` - describe what this configuration is for
- `frontMatter` - how to generate "front matter" for markdown file
- `omit` - CSS selector - HTML elements to remove from document
- `transform` - rules to transform elements
- `select` - CSS selector - HTML elements to include in conversion

Order of actions are:

1. omit - remove elements from documemt
2. transform - modify certain elements
3. select - select elements for conversion

---

#### `frontMatter` Properties

```JSON
{
  "<item_name>": {
  "selector": "<any_css_selector>",
  "attrName": "<element_attribute_name_if_any>"
}
```
If "attrName" is omitted, front matter content is obtained from element's textContent.

#### Example

HTML:

```html
<title>Hello World Title</title>
<meta property="og:url" content="https://helloworld.com/helloworld.html">
```

Config:

```json
{
  "frontMatter": {
    "title": {
      "selector": "title"
    },
    "url": {
      "selector": "meta[property='og:url']",
      "attrName": "content"
    }
  }
}
```

Resulting Front Matter:

```text
---
title: Hello World Title  
url: https://helloworld.com/helloworld.html  
---
```

(more details to follow, until then, see config directory for examples)
