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

const stdout = process.stdout,
  htmlPath = process.argv[2],
  configPath = process.argv[3];

if (!htmlPath || !configPath) {
  console.error('Usage: mdconvert <source_file.html> <config_file.json>');
  process.exit(0);
}

stdout.write(
`Source file: '${htmlPath}'
Config file: '${configPath}'
`);

try {
  const mdPath = htmlToMarkdown(htmlPath, configPath, turndownOptions);
  stdout.write(`Saved to ${mdPath}\n`);
} catch (err) {
  console.error(`Error: ${err}`);
  process.exit(0);
}
