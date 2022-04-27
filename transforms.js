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
import { insertBefore } from './transforms/insertbefore.js';
import { changeVideoPosterToImg } from './transforms/changevideopostertoimg.js';
import { combineDuplicates } from './transforms/combineduplicates.js';

const transformer = {
  changeAttribute,
  changeTagName,
  changeInnerHTML,
  insertBefore,
  insertAfter,
  omitIfNoInnerHTML,
  changeHtmlToText,
  changeNoscript,
  convertImgSrcset,
  changeWapoDivToImg,
  changeVideoPosterToImg,
  combineDuplicates
};

export {
  transformer
};
