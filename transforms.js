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
import {
  changeAnchorWithBlockChild
} from './transforms/changeanchorwithblock.js';
import { convertCNNImg } from './transforms/convertcnnimg.js'
import { convertApnewsImg } from './transforms/convertapnewsimg.js';
import { convertNytimesImgs } from './transforms/convertnytimesimgs.js';


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
  combineDuplicates,
  changeAnchorWithBlockChild,
  convertCNNImg,
  convertApnewsImg,
  convertNytimesImgs
};

export {
  transformer
};
