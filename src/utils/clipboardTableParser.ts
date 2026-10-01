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
 * Parses an individual <table> DOM element into a ParsedTable structure.
 */
export function parseTableElement(table: HTMLTableElement): ParsedTable | null {
  try {
    const trElements = Array.from(table.querySelectorAll('tr'));
    if (trElements.length === 0) return null;

    // Check for explicit thead or th elements
    const thElements = Array.from(table.querySelectorAll('thead th, tr:first-child th'));
    let headers: string[] = [];
    let dataRowStartIndex = 0;

    if (thElements.length > 0) {
      headers = thElements.map(th => cleanTableCell(th.textContent || ''));
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
    console.warn('Failed to parse table element:', err);
    return null;
  }
}

/**
 * Attempts to parse Tab-Separated Values (TSV) from plain text clipboard data.
 * Standard format generated when copying cells in Excel or Google Sheets.
 */
export function parseTsvTable(plainText: string): ParsedTable | null {
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
 * Helper to convert an HTML DOM node tree containing mixed text and tables to Markdown.
 * Preserves all surrounding article/response text, headings, lists, code, and replaces
 * every <table> with its formatted Markdown pipe table.
 */
function convertNodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || '';
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();

  // 1. Tables: Parse and serialize to GitHub-Flavored Markdown pipe table
  if (tag === 'table') {
    const parsed = parseTableElement(el as HTMLTableElement);
    if (parsed) {
      return `\n\n${serializeMarkdownTable(parsed)}\n\n`;
    }
    // If not a structured table, fallback to text
    return `\n\n${el.textContent || ''}\n\n`;
  }

  // 2. Headings
  if (/^h[1-6]$/.test(tag)) {
    const level = parseInt(tag[1], 10);
    const hashes = '#'.repeat(level);
    const inner = Array.from(el.childNodes).map(convertNodeToMarkdown).join('').trim();
    return `\n\n${hashes} ${inner}\n\n`;
  }

  // 3. Paragraphs & Divisions
  if (tag === 'p') {
    const inner = Array.from(el.childNodes).map(convertNodeToMarkdown).join('').trim();
    return inner ? `\n\n${inner}\n\n` : '';
  }

  if (tag === 'br') {
    return '\n';
  }

  if (tag === 'hr') {
    return '\n\n---\n\n';
  }

  // 4. Code Blocks and Inline Code
  if (tag === 'pre') {
    const codeEl = el.querySelector('code');
    const lang = codeEl?.className.match(/language-(\w+)/)?.[1] || '';
    const codeText = (codeEl || el).textContent || '';
    return `\n\n\`\`\`${lang}\n${codeText.trim()}\n\`\`\`\n\n`;
  }

  if (tag === 'code') {
    return `\`${el.textContent || ''}\``;
  }

  // 5. Blockquotes
  if (tag === 'blockquote') {
    const inner = Array.from(el.childNodes).map(convertNodeToMarkdown).join('').trim();
    const quoted = inner.split('\n').map(line => `> ${line}`).join('\n');
    return `\n\n${quoted}\n\n`;
  }

  // 6. Lists
  if (tag === 'ul' || tag === 'ol') {
    const items = Array.from(el.children).filter(child => child.tagName.toLowerCase() === 'li');
    const isOrdered = tag === 'ol';
    const listLines = items.map((li, idx) => {
      const prefix = isOrdered ? `${idx + 1}. ` : '- ';
      const itemText = Array.from(li.childNodes).map(convertNodeToMarkdown).join('').trim();
      return `${prefix}${itemText}`;
    });
    return `\n\n${listLines.join('\n')}\n\n`;
  }

  if (tag === 'li') {
    return Array.from(el.childNodes).map(convertNodeToMarkdown).join('');
  }

  // 7. Inlines: bold, italic, links, images
  if (tag === 'strong' || tag === 'b') {
    const inner = Array.from(el.childNodes).map(convertNodeToMarkdown).join('');
    return inner.trim() ? `**${inner.trim()}**` : '';
  }

  if (tag === 'em' || tag === 'i') {
    const inner = Array.from(el.childNodes).map(convertNodeToMarkdown).join('');
    return inner.trim() ? `*${inner.trim()}*` : '';
  }

  if (tag === 'a') {
    const href = el.getAttribute('href') || '#';
    const text = Array.from(el.childNodes).map(convertNodeToMarkdown).join('').trim() || href;
    return `[${text}](${href})`;
  }

  if (tag === 'img') {
    const src = el.getAttribute('src') || '';
    const alt = el.getAttribute('alt') || 'image';
    return `![${alt}](${src})`;
  }

  // Default: process all children recursively
  const childrenText = Array.from(el.childNodes).map(convertNodeToMarkdown).join('');
  if (tag === 'div' || tag === 'section' || tag === 'article' || tag === 'main') {
    return `\n${childrenText}\n`;
  }

  return childrenText;
}

/**
 * Result of clipboard parsing
 */
export interface ClipboardParseResult {
  type: 'table' | 'article';
  markdown: string;
}

/**
 * Primary Smart Clipboard Parser:
 * Detects whether clipboard contains:
 * 1. Isolated table (from Excel, Google Sheets, or table selection) -> returns single table snippet
 * 2. Mixed content (blog, article, or AI response with surrounding text AND table/tables)
 *    -> converts entire document preserving all text, headings, and all tables in place!
 * Returns null if clipboard does not contain any tabular data to preserve default paste.
 */
export function extractClipboardMarkdown(clipboardData: DataTransfer | null): ClipboardParseResult | null {
  if (!clipboardData) return null;

  // 1. Check HTML first
  const html = clipboardData.getData('text/html');
  if (html && html.toLowerCase().includes('<table')) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const tables = Array.from(doc.querySelectorAll('table'));

      if (tables.length > 0) {
        // Measure table content vs entire body content to determine if it is an isolated table
        const totalBodyText = doc.body.textContent || '';
        const allTablesText = tables.map(t => t.textContent || '').join('');
        const nonTableTextLength = totalBodyText.length - allTablesText.length;

        // If there is only 1 table and virtually no surrounding content (< 30 non-whitespace chars),
        // treat as pure isolated table paste
        if (tables.length === 1 && nonTableTextLength < 30) {
          const parsed = parseTableElement(tables[0]);
          if (parsed && parsed.headers.length >= 2) {
            const tableMd = serializeMarkdownTable(parsed);
            if (tableMd.trim().length > 0) {
              return { type: 'table', markdown: tableMd };
            }
          }
        }

        // Otherwise: Mixed article, blog, or AI response with text + table(s)!
        // Convert the full DOM tree so NO headings, text, or additional tables are discarded!
        const converted = convertNodeToMarkdown(doc.body)
          .replace(/\n{3,}/g, '\n\n')
          .trim();

        if (converted.length > 0) {
          return { type: 'article', markdown: converted };
        }
      }
    } catch (err) {
      console.warn('Failed to parse clipboard HTML with tables:', err);
    }
  }

  // 2. Plain Text TSV (Tab-Separated Values from Excel / Sheets)
  const plainText = clipboardData.getData('text/plain');
  if (plainText && plainText.includes('\t')) {
    const parsedTsv = parseTsvTable(plainText);
    if (parsedTsv && parsedTsv.headers.length >= 2) {
      const serialized = serializeMarkdownTable(parsedTsv);
      if (serialized.trim().length > 0) {
        return { type: 'table', markdown: serialized };
      }
    }
  }

  return null;
}

/**
 * Backward compatibility alias for single-table consumers
 */
export function extractMarkdownTableFromClipboard(clipboardData: DataTransfer | null): string | null {
  const result = extractClipboardMarkdown(clipboardData);
  return result ? result.markdown : null;
}
