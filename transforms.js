// mdconvert transforms

import { changeAttribute } from './transforms/changeattribute.js';
import { changeTagName } from './transforms/changetagname.js';
import { changeInnerHTML } from './transforms/changeinnerhtml.js';
import { insertAfter } from './transforms/insertafter.js';
import { omitIfNoInnerHTML } from './transforms/omitifnoinnerhtml.js';

const transformer = {
  changeAttribute,
  changeTagName,
  changeInnerHTML,
  insertAfter,
  omitIfNoInnerHTML
};

export {
  transformer
};
