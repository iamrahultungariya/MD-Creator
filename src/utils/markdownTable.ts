export type ColumnAlignment = 'left' | 'center' | 'right' | 'none';

export interface ParsedTable {
  headers: string[];
  alignments: ColumnAlignment[];
  rows: string[][];
}

export interface LocatedTable {
  tableIndex: number;
  startIndex: number;
  endIndex: number;
  raw: string;
  table: ParsedTable;
}

/**
 * Parses a single Markdown table block into structured headers, alignments, and rows.
 */
export function parseMarkdownTable(raw: string): ParsedTable | null {
  const lines = raw
    .trim()
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return null;

  // Split row into cells respecting pipe delimiters
  const splitRow = (line: string): string[] => {
    let clean = line;
    if (clean.startsWith('|')) clean = clean.slice(1);
    if (clean.endsWith('|')) clean = clean.slice(0, -1);
    return clean.split('|').map((c) => c.trim());
  };

  const headers = splitRow(lines[0]);
  const colCount = headers.length;
  if (colCount === 0) return null;

  // Second line must be the markdown table separator (e.g. |:---|:---:|---:|)
  const sepCells = splitRow(lines[1]);
  const isSeparator = sepCells.every((cell) => /^:?-+:?$/.test(cell.trim()));
  if (!isSeparator) return null;

  const alignments: ColumnAlignment[] = sepCells.map((cell) => {
    const trimmed = cell.trim();
    const startColon = trimmed.startsWith(':');
    const endColon = trimmed.endsWith(':');
    if (startColon && endColon) return 'center';
    if (endColon) return 'right';
    if (startColon) return 'left';
    return 'none';
  });

  // Alignments length must match colCount
  while (alignments.length < colCount) alignments.push('none');

  const rows: string[][] = [];
  for (let i = 2; i < lines.length; i++) {
    const rawCells = splitRow(lines[i]);
    const normalizedCells: string[] = [];
    for (let c = 0; c < colCount; c++) {
      normalizedCells.push(rawCells[c] ?? '');
    }
    rows.push(normalizedCells);
  }

  return { headers, alignments, rows };
}

/**
 * Serializes a structured table into beautifully aligned GitHub-Flavored Markdown table text.
 */
export function serializeMarkdownTable(table: ParsedTable): string {
  const colCount = table.headers.length;
  if (colCount === 0) return '';

  // Determine minimum column widths for clean visual alignment
  const colWidths = table.headers.map((h, i) => {
    let max = Math.max(h.length, 3);
    for (const row of table.rows) {
      const cellLen = (row[i] || '').length;
      if (cellLen > max) max = cellLen;
    }
    return max;
  });

  const pad = (text: string, width: number, align: ColumnAlignment): string => {
    const diff = width - text.length;
    if (diff <= 0) return text;
    if (align === 'center') {
      const left = Math.floor(diff / 2);
      const right = diff - left;
      return ' '.repeat(left) + text + ' '.repeat(right);
    }
    if (align === 'right') {
      return ' '.repeat(diff) + text;
    }
    return text + ' '.repeat(diff);
  };

  // Header row
  const headerLine =
    '| ' +
    table.headers.map((h, i) => pad(h, colWidths[i], table.alignments[i] || 'none')).join(' | ') +
    ' |';

  // Separator line
  const separatorLine =
    '| ' +
    colWidths
      .map((w, i) => {
        const align = table.alignments[i] || 'none';
        if (align === 'center') return ':' + '-'.repeat(Math.max(w - 2, 1)) + ':';
        if (align === 'right') return '-'.repeat(Math.max(w - 1, 2)) + ':';
        if (align === 'left') return ':' + '-'.repeat(Math.max(w - 1, 2));
        return '-'.repeat(w);
      })
      .join(' | ') +
    ' |';

  // Data rows
  const rowLines = table.rows.map(
    (row) =>
      '| ' +
      row.map((c, i) => pad(c, colWidths[i], table.alignments[i] || 'none')).join(' | ') +
      ' |'
  );

  return [headerLine, separatorLine, ...rowLines].join('\n');
}

/**
 * Finds all Markdown table blocks in a full document.
 */
export function findAllTablesInDocument(markdown: string): LocatedTable[] {
  const tables: LocatedTable[] = [];
  const lines = markdown.split('\n');

  let inTable = false;
  let currentStart = 0;
  let currentLines: string[] = [];
  let tableCounter = 0;
  let runningIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isTableLine = /^\s*\|.*\|\s*$/.test(line);

    if (isTableLine) {
      if (!inTable) {
        inTable = true;
        currentStart = runningIndex;
        currentLines = [line];
      } else {
        currentLines.push(line);
      }
    } else {
      if (inTable) {
        const raw = currentLines.join('\n');
        const parsed = parseMarkdownTable(raw);
        if (parsed) {
          tables.push({
            tableIndex: tableCounter++,
            startIndex: currentStart,
            endIndex: currentStart + raw.length,
            raw,
            table: parsed,
          });
        }
        inTable = false;
        currentLines = [];
      }
    }
    runningIndex += line.length + 1; // +1 for \n
  }

  // Handle document ending with table
  if (inTable && currentLines.length > 0) {
    const raw = currentLines.join('\n');
    const parsed = parseMarkdownTable(raw);
    if (parsed) {
      tables.push({
        tableIndex: tableCounter++,
        startIndex: currentStart,
        endIndex: currentStart + raw.length,
        raw,
        table: parsed,
      });
    }
  }

  return tables;
}

/**
 * Replaces the N-th table in the document with the updated table data.
 */
export function replaceTableInDocument(
  markdown: string,
  tableIndex: number,
  updatedTable: ParsedTable
): string {
  const tables = findAllTablesInDocument(markdown);
  const target = tables.find((t) => t.tableIndex === tableIndex);
  if (!target) return markdown;

  const newTableText = serializeMarkdownTable(updatedTable);
  return (
    markdown.slice(0, target.startIndex) +
    newTableText +
    markdown.slice(target.endIndex)
  );
}

/**
 * Adds a new row to a parsed table.
 */
export function addRowToTable(table: ParsedTable, insertIndex?: number): ParsedTable {
  const newRow = Array(table.headers.length).fill('');
  const rows = [...table.rows];
  if (typeof insertIndex === 'number' && insertIndex >= 0 && insertIndex <= rows.length) {
    rows.splice(insertIndex, 0, newRow);
  } else {
    rows.push(newRow);
  }
  return { ...table, rows };
}

/**
 * Removes a row from a parsed table.
 */
export function removeRowFromTable(table: ParsedTable, rowIndex: number): ParsedTable {
  if (table.rows.length <= 1) return table;
  const rows = table.rows.filter((_, idx) => idx !== rowIndex);
  return { ...table, rows };
}

/**
 * Adds a new column to a parsed table.
 */
export function addColumnToTable(
  table: ParsedTable,
  insertIndex?: number,
  headerName?: string
): ParsedTable {
  const colIdx =
    typeof insertIndex === 'number' && insertIndex >= 0 && insertIndex <= table.headers.length
      ? insertIndex
      : table.headers.length;

  const name = headerName || `Col ${table.headers.length + 1}`;
  const headers = [...table.headers];
  headers.splice(colIdx, 0, name);

  const alignments = [...table.alignments];
  alignments.splice(colIdx, 0, 'none');

  const rows = table.rows.map((row) => {
    const newRow = [...row];
    newRow.splice(colIdx, 0, '');
    return newRow;
  });

  return { headers, alignments, rows };
}

/**
 * Removes a column from a parsed table.
 */
export function removeColumnFromTable(table: ParsedTable, colIndex: number): ParsedTable {
  if (table.headers.length <= 1) return table;
  const headers = table.headers.filter((_, idx) => idx !== colIndex);
  const alignments = table.alignments.filter((_, idx) => idx !== colIndex);
  const rows = table.rows.map((row) => row.filter((_, idx) => idx !== colIndex));
  return { headers, alignments, rows };
}

/**
 * Updates a single cell (rowIndex === -1 means header).
 */
export function updateTableCell(
  table: ParsedTable,
  rowIndex: number,
  colIndex: number,
  value: string
): ParsedTable {
  if (rowIndex === -1) {
    const headers = [...table.headers];
    headers[colIndex] = value;
    return { ...table, headers };
  }

  const rows = table.rows.map((r, rIdx) => {
    if (rIdx !== rowIndex) return r;
    const newR = [...r];
    newR[colIndex] = value;
    return newR;
  });

  return { ...table, rows };
}

/**
 * Cycles alignment for a column: none -> left -> center -> right -> none.
 */
export function cycleColumnAlignment(table: ParsedTable, colIndex: number): ParsedTable {
  const current = table.alignments[colIndex] || 'none';
  const nextAlign: Record<ColumnAlignment, ColumnAlignment> = {
    none: 'left',
    left: 'center',
    center: 'right',
    right: 'none',
  };
  const alignments = [...table.alignments];
  alignments[colIndex] = nextAlign[current];
  return { ...table, alignments };
}
