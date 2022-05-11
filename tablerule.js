// turndown rule to convert HTML table to Markdown table
// ref: https://github.com/mixmark-io/turndown#extending-with-rules

/**
 * convert 'table' element to markdown table
 * @type {{filter: string[], replacement: (function(*, *, *): string)}}
 */
const tableRule = {
  
  filter: ['table'],
  
  replacement: function (content, table, options) {
    const rows = table.rows;
    let mdOutput = '\n';

    // first determine the column widths of the table
    const colWidths = [];
    for (let iRow = 0; iRow < rows.length; iRow++) {
      const row = rows.item(iRow);
      const cells = row.cells;
      for (let iCell = 0; iCell < cells.length; iCell++) {
        const cell = cells.item(iCell);
        const cellWidth = cell.textContent.length;
        // columns must be at least 3 dashes wide
        colWidths[iCell] = colWidths[iCell] || 3;
        colWidths[iCell] = Math.max(colWidths[iCell], cellWidth);
      }
    }

    for (let iRow = 0; iRow < rows.length; iRow++) {
      const row = rows.item(iRow),
        cells = row.cells,
        isHeaderRow = cells.length && cells.item(0).tagName === 'TH';

      for (let iCell = 0; iCell < cells.length; iCell++) {
        const cell = cells.item(iCell),
          isFirstCell = iCell === 0;

        mdOutput += (isFirstCell ? '| ' : ' | ') + cell.textContent;

        // add padding spaces to cell (not necessary but it looks better)
        // const padding = colWidths[iCell] - cell.textContent.length;
        // if (padding > 0) {
        //   mdOutput += ' '.repeat(padding);
        //   // for (let k = 0; k < padding; k++) { mdOutput += ' '; }
        // }
      }

      mdOutput += ' |\n';  // row closer

      // insert line of dashes after header row
      if (isHeaderRow) {
        mdOutput += '| ';
        for (let iCell = 0; iCell < cells.length; iCell++) {
          if (iCell > 0) { mdOutput += ' | ';}
          const dashes = colWidths[iCell];
          // for (let k = 0; k < dashes; k++) { mdOutput += '-'; }
          mdOutput += '---';
        }
        mdOutput += ' |\n'; // dashes line closer
      }
    }

    return mdOutput + '\n'; // table closer
  }
};

export {
  tableRule
};
