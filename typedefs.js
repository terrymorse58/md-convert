// type definitions for mdconvert

/**
 * options for the `turndown` html-markdown converter
 * @typedef {Object} TurndownOptions
 * @property {String} headingStyle
 * @property {String} hr
 * @property {String} bulletListMarker
 * @property {String} codeBlockStyle
 * @property {String} emDelimiter
 */

/**
 * @typedef {String} MarkdownStr
 * @typedef {Object} FrontMatterConfig
 * @typedef {String} FrontMatterString
 * @typedef {String} CSSSelector
 * @typedef {String|String[]} OmitConfig
 * @typedef {String|String[]} SelectConfig
 */

/**
 * @typedef {Object} DomTransformer
 * @property {String} selector
 * @property {Array<Object>} conversions
 */

/**
 * @typedef {DomTransformer[]} DomTransformers
 */

/**
 * mdconvert config data from JSON file
 * @typedef {Object} MdcConfig
 * @property {FrontMatterConfig} frontMatter
 * @property {Boolean} convertTables
 * @property {OmitConfig} omit
 * @property {DomTransformers} transform
 * @property {SelectConfig} select
 */
