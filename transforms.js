// mdconvert transforms

import { changeAttribute } from './transforms/changeattribute.js';
import { changeTagName } from './transforms/changetagname.js';
import { changeInnerHTML } from './transforms/changeinnerhtml.js';
import { insertAfter } from './transforms/insertafter.js';
import { omitIfNoInnerHTML } from './transforms/omitifnoinnerhtml.js';
import { changeHtmlToText } from './transforms/changehtmltotext.js';
import { changeNoscript } from './transforms/changenoscript.js';
import { convertImgSrcset } from './transforms/convertimgsrcset.js';
import { changeWapoDivToImg} from './transforms/changewapodivtoimg.js';

const transformer = {
  changeAttribute,
  changeTagName,
  changeInnerHTML,
  insertAfter,
  omitIfNoInnerHTML,
  changeHtmlToText,
  changeNoscript,
  convertImgSrcset,
  changeWapoDivToImg
};

export {
  transformer
};
