#!/usr/bin/env node

// convert an HTML file to Markdown
// Usage: mdconvert <source_file.html> <config_file.json>

import { htmlToMarkdown } from './mdconvert.js';

/** @type TurndownOptions **/
const turndownOptions = {
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*'
};

const stdout = process.stdout;

const args = process.argv.slice(2);

const iFlagSrc = args.indexOf('--src');
const htmlPath = (iFlagSrc !== -1) ? args[iFlagSrc + 1] : null;

const iFlagConfig = args.indexOf('--config');
const configPath = (iFlagConfig !== -1) ? args[iFlagConfig + 1] : null;

if (!htmlPath) {
  console.error(
    `USAGE: mdconvert --src <source_file> [--config <config_file>]`
  );
  process.exit(0);
}


stdout.write(
`Source file: '${htmlPath}'
Config file: '${configPath ? configPath : '(none)'}'
`);

// process.exit(0);

try {
  const mdPath = htmlToMarkdown(htmlPath, configPath, turndownOptions);
  stdout.write(`Saved to ${mdPath}\n`);
} catch (err) {
  console.error(`Error: ${err}`);
  process.exit(0);
}
