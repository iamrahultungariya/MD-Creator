import { EditorView, KeyBinding } from '@codemirror/view';

/**
 * Checks if a given line text represents a Markdown table row or separator.
 */
export function isTableLine(text: string): boolean {
  return /^\s*\|.*\|\s*$/.test(text);
}

/**
 * Counts the number of columns in a markdown table row line.
 */
export function countColumns(lineText: string): number {
  let clean = lineText.trim();
  if (clean.startsWith('|')) clean = clean.slice(1);
  if (clean.endsWith('|')) clean = clean.slice(0, -1);
  return clean.split('|').length;
}

/**
 * Creates CodeMirror keybindings for smart Markdown table navigation (Tab, Shift-Tab, Enter).
 */
export function createTableKeybindings(): KeyBinding[] {
  return [
    {
      key: 'Tab',
      run: (view: EditorView) => {
        const state = view.state;
        const head = state.selection.main.head;
        const line = state.doc.lineAt(head);

        if (!isTableLine(line.text)) return false;

        const lineFrom = line.from;
        const offsetInLine = head - lineFrom;
        const text = line.text;

        // Find pipe positions on the current line
        const pipes: number[] = [];
        for (let i = 0; i < text.length; i++) {
          if (text[i] === '|') pipes.push(i);
        }

        if (pipes.length < 2) return false;

        // Find next pipe after current cursor
        const nextPipe = pipes.find((p) => p > offsetInLine);

        if (nextPipe !== undefined && nextPipe < pipes[pipes.length - 1]) {
          // Move cursor right after the next pipe (inside the cell)
          const targetPos = lineFrom + nextPipe + (text[nextPipe + 1] === ' ' ? 2 : 1);
          view.dispatch({ selection: { anchor: Math.min(targetPos, line.to) } });
          return true;
        }

        // If at the end of the line, check next line
        if (line.number < state.doc.lines) {
          const nextLine = state.doc.line(line.number + 1);
          if (isTableLine(nextLine.text)) {
            // Jump to first cell in next line
            const firstPipe = nextLine.text.indexOf('|');
            const targetPos =
              nextLine.from + firstPipe + (nextLine.text[firstPipe + 1] === ' ' ? 2 : 1);
            view.dispatch({ selection: { anchor: targetPos } });
            return true;
          }
        }

        // Last row in table: append a new row with matching column count
        const colCount = countColumns(line.text);
        const newRowText = '\n| ' + Array(colCount).fill(' ').join(' | ') + ' |';
        const insertPos = line.to;

        view.dispatch({
          changes: { from: insertPos, insert: newRowText },
          selection: { anchor: insertPos + 3 },
        });
        return true;
      },
    },
    {
      key: 'Shift-Tab',
      run: (view: EditorView) => {
        const state = view.state;
        const head = state.selection.main.head;
        const line = state.doc.lineAt(head);

        if (!isTableLine(line.text)) return false;

        const lineFrom = line.from;
        const offsetInLine = head - lineFrom;
        const text = line.text;

        // Find pipe positions on the current line
        const pipes: number[] = [];
        for (let i = 0; i < text.length; i++) {
          if (text[i] === '|') pipes.push(i);
        }

        if (pipes.length < 2) return false;

        // Find previous pipe before current cursor
        const prevPipes = pipes.filter((p) => p < offsetInLine - 1);
        if (prevPipes.length > 0) {
          const targetPipe = prevPipes[prevPipes.length - 1];
          const targetPos = lineFrom + targetPipe + (text[targetPipe + 1] === ' ' ? 2 : 1);
          view.dispatch({ selection: { anchor: targetPos } });
          return true;
        }

        // If at the beginning of the line, jump to previous line's last cell
        if (line.number > 1) {
          const prevLine = state.doc.line(line.number - 1);
          if (isTableLine(prevLine.text)) {
            const prevPipesOnLine: number[] = [];
            for (let i = 0; i < prevLine.text.length; i++) {
              if (prevLine.text[i] === '|') prevPipesOnLine.push(i);
            }
            if (prevPipesOnLine.length >= 2) {
              const secondToLast = prevPipesOnLine[prevPipesOnLine.length - 2];
              const targetPos =
                prevLine.from +
                secondToLast +
                (prevLine.text[secondToLast + 1] === ' ' ? 2 : 1);
              view.dispatch({ selection: { anchor: targetPos } });
              return true;
            }
          }
        }

        return false;
      },
    },
    {
      key: 'Enter',
      run: (view: EditorView) => {
        const state = view.state;
        const head = state.selection.main.head;
        const line = state.doc.lineAt(head);

        if (!isTableLine(line.text)) return false;

        // Check if the current line is an empty table row (|   |   |)
        let clean = line.text.trim();
        if (clean.startsWith('|')) clean = clean.slice(1);
        if (clean.endsWith('|')) clean = clean.slice(0, -1);
        const cells = clean.split('|').map((c) => c.trim());
        const isEmptyRow = cells.every((c) => c === '');

        if (isEmptyRow) {
          // Replace empty row with an empty line (exits table cleanly)
          view.dispatch({
            changes: { from: line.from, to: line.to, insert: '' },
            selection: { anchor: line.from },
          });
          return true;
        }

        // Insert a new row below current row
        const colCount = cells.length;
        const newRowText = '\n| ' + Array(colCount).fill(' ').join(' | ') + ' |';
        const insertPos = line.to;

        view.dispatch({
          changes: { from: insertPos, insert: newRowText },
          selection: { anchor: insertPos + 3 },
        });
        return true;
      },
    },
  ];
}
