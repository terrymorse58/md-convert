# md-convert

Convert an HTML file to Markdown
---

## Install

```shell
npm install [-g] md-convert
```

## Usage

```shell
mdconvert <html-file> <config-file.json>
```

Where:

`<html-file>` - any valid HTML file  
`<config-file.json>` - a JSON file to configure how to perform the conversion

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

`description` - describe what this configuration is for

---

`frontMatter` - how to generate "front matter" for markdown file

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

Front Matter:

```text
---
title: Hello World Title  
url: https://helloworld.com/helloworld.html  
---
```

(more details to follow, until then, see config directory for examples)
