import { ParsedTable, serializeMarkdownTable } from './markdownTable';

/**
 * Clean cell text for Markdown table safety:
 * - Trims external whitespace
 * - Replaces newlines/carriage returns with space
 * - Escapes pipe symbols (| -> \|)
 */
function cleanTableCell(text: string): string {
  return text
    .replace(/[\r\n]+/g, ' ')
    .replace(/\|/g, '\\|')
    .trim();
}

/**
 * Attempts to parse an HTML table from clipboard data (e.g. from Excel, Google Sheets, or websites).
 */
function parseHtmlTable(html: string): ParsedTable | null {
  if (!html || !html.toLowerCase().includes('<table')) {
    return null;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const table = doc.querySelector('table');
    if (!table) return null;

    const trElements = Array.from(table.querySelectorAll('tr'));
    if (trElements.length === 0) return null;

    // Check for explicit thead or th elements
    const thElements = Array.from(table.querySelectorAll('thead th, tr:first-child th'));
    let headers: string[] = [];
    let dataRowStartIndex = 0;

    if (thElements.length > 0) {
      headers = thElements.map(th => cleanTableCell(th.textContent || ''));
      // Find where tbody or data starts
      const firstTr = trElements[0];
      if (firstTr.querySelectorAll('th').length > 0) {
        dataRowStartIndex = 1;
      }
    } else {
      // Use the first row as headers if there are multiple rows
      const firstRowCells = Array.from(trElements[0].querySelectorAll('td, th'));
      headers = firstRowCells.map(td => cleanTableCell(td.textContent || ''));
      dataRowStartIndex = 1;
    }

    // Require at least 2 columns to qualify as a structured table
    if (headers.length < 2) return null;

    const colCount = headers.length;
    const rows: string[][] = [];

    for (let i = dataRowStartIndex; i < trElements.length; i++) {
      const cells = Array.from(trElements[i].querySelectorAll('td, th'));
      if (cells.length === 0) continue;

      const rowData: string[] = [];
      for (let c = 0; c < colCount; c++) {
        const text = cells[c] ? cleanTableCell(cells[c].textContent || '') : '';
        rowData.push(text);
      }
      rows.push(rowData);
    }

    return {
      headers,
      alignments: headers.map(() => 'none'),
      rows
    };
  } catch (err) {
    console.warn('Failed to parse clipboard HTML table:', err);
    return null;
  }
}

/**
 * Attempts to parse Tab-Separated Values (TSV) from plain text clipboard data.
 * Standard format generated when copying cells in Excel or Google Sheets.
 */
function parseTsvTable(plainText: string): ParsedTable | null {
  if (!plainText || !plainText.includes('\t')) {
    return null;
  }

  const lines = plainText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) return null;

  // Split lines by tab delimiter
  const matrix = lines.map(line => line.split('\t').map(cleanTableCell));
  const colCount = matrix[0].length;

  // Require at least 2 columns
  if (colCount < 2) return null;

  const headers = matrix[0];
  const rows: string[][] = [];

  for (let i = 1; i < matrix.length; i++) {
    const rawCells = matrix[i];
    const normalized: string[] = [];
    for (let c = 0; c < colCount; c++) {
      normalized.push(rawCells[c] || '');
    }
    rows.push(normalized);
  }

  return {
    headers,
    alignments: headers.map(() => 'none'),
    rows
  };
}

/**
 * Primary Smart Clipboard Parser:
 * Detects if clipboard contains tabular data from Excel, Google Sheets, or web tables,
 * and formats it into a clean, aligned GitHub-Flavored Markdown pipe table.
 * Returns null if the clipboard content is not recognized as tabular data.
 */
export function extractMarkdownTableFromClipboard(clipboardData: DataTransfer | null): string | null {
  if (!clipboardData) return null;

  // 1. Try HTML Table first (highest fidelity: captures formatting, headers, cells from Sheets/Excel/Web)
  const html = clipboardData.getData('text/html');
  if (html) {
    const parsedHtmlTable = parseHtmlTable(html);
    if (parsedHtmlTable && parsedHtmlTable.headers.length >= 2) {
      const serialized = serializeMarkdownTable(parsedHtmlTable);
      if (serialized.trim().length > 0) {
        return serialized;
      }
    }
  }

  // 2. Fallback to Plain Text TSV (Tab-Separated Values)
  const plainText = clipboardData.getData('text/plain');
  if (plainText) {
    const parsedTsvTable = parseTsvTable(plainText);
    if (parsedTsvTable && parsedTsvTable.headers.length >= 2) {
      const serialized = serializeMarkdownTable(parsedTsvTable);
      if (serialized.trim().length > 0) {
        return serialized;
      }
    }
  }

  return null;
}
