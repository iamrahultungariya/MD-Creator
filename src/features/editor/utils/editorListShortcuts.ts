import React from 'react';

/**
 * Handles Tab (indent/outdent) and Enter (smart continuation / progressive outdent) for lists.
 * Returns true if the keyboard event was fully handled, false otherwise.
 */
export function handleEditorListShortcuts(
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  content: string,
  setContent: (val: string) => void,
  executeSave: (content: string, title: string) => void,
  title: string,
  ta: HTMLTextAreaElement,
  updateCursorPosition: () => void
): boolean {
  const selectionStart = ta.selectionStart;
  const selectionEnd = ta.selectionEnd;

  // 1. Tab & Shift+Tab Indentation / Outdentation
  if (e.key === 'Tab') {
    e.preventDefault();

    const isMultiLineSelection = content.substring(selectionStart, selectionEnd).includes('\n');
    const lineStart = content.lastIndexOf('\n', selectionStart - 1) + 1;
    const nextLineIndex = content.indexOf('\n', selectionEnd);
    const lineEnd = nextLineIndex === -1 ? content.length : nextLineIndex;
    const currentLine = content.substring(lineStart, lineEnd);
    const isListItem = /^(\s*)([-*+]|\d+\.|[-*+]\s+\[[ xX]\])\s+/.test(currentLine);

    if (e.shiftKey) {
      // Outdent (remove up to 2 leading spaces)
      const block = content.substring(lineStart, lineEnd);
      const lines = block.split('\n');
      let firstLineRemoved = 0;
      const outdented = lines
        .map((line, idx) => {
          let count = 0;
          while (count < 2 && line.startsWith(' ')) {
            line = line.substring(1);
            count++;
          }
          if (idx === 0) firstLineRemoved = count;
          return line;
        })
        .join('\n');

      const next = content.substring(0, lineStart) + outdented + content.substring(lineEnd);
      setContent(next);
      executeSave(next, title);
      setTimeout(() => {
        ta.focus({ preventScroll: true });
        const newStart = Math.max(lineStart, selectionStart - firstLineRemoved);
        const newEnd = Math.max(newStart, selectionEnd - (lines.length > 1 ? 2 : firstLineRemoved));
        ta.setSelectionRange(newStart, newEnd);
        updateCursorPosition();
      }, 10);
      return true;
    } else {
      // Indent: if multi-line OR on any list item, indent the line at lineStart
      if (isMultiLineSelection || isListItem) {
        const block = content.substring(lineStart, lineEnd);
        const lines = block.split('\n');
        const indented = lines.map((line) => '  ' + line).join('\n');
        const next = content.substring(0, lineStart) + indented + content.substring(lineEnd);
        setContent(next);
        executeSave(next, title);
        setTimeout(() => {
          ta.focus({ preventScroll: true });
          ta.setSelectionRange(selectionStart + 2, selectionEnd + 2 * lines.length);
          updateCursorPosition();
        }, 10);
        return true;
      } else {
        // Plain text single cursor: insert 2 spaces
        const next = content.substring(0, selectionStart) + '  ' + content.substring(selectionEnd);
        setContent(next);
        executeSave(next, title);
        setTimeout(() => {
          ta.focus({ preventScroll: true });
          ta.setSelectionRange(selectionStart + 2, selectionStart + 2);
          updateCursorPosition();
        }, 10);
        return true;
      }
    }
  }

  // 2. Smart List & Task Continuation on Enter with Progressive Outdent
  if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
    const textBefore = content.substring(0, selectionStart);
    const lineStart = textBefore.lastIndexOf('\n') + 1;
    const currentLine = textBefore.substring(lineStart);

    const taskMatch = currentLine.match(/^(\s*)([-*+]\s+\[[ xX]\]\s*)(.*)$/);
    const bulletMatch = currentLine.match(/^(\s*)([-*+]\s+)(.*)$/);
    const orderedMatch = currentLine.match(/^(\s*)(\d+)\.\s+(.*)$/);

    if (taskMatch) {
      e.preventDefault();
      const indent = taskMatch[1];
      const marker = taskMatch[2];
      const text = taskMatch[3];
      if (!text.trim()) {
        if (indent.length >= 2) {
          // Outdent nested task item by 2 spaces
          const outdentedPrefix = indent.substring(2) + marker;
          const next = content.substring(0, lineStart) + outdentedPrefix + content.substring(selectionStart);
          setContent(next);
          executeSave(next, title);
          setTimeout(() => {
            ta.focus({ preventScroll: true });
            const newPos = lineStart + outdentedPrefix.length;
            ta.setSelectionRange(newPos, newPos);
            updateCursorPosition();
          }, 10);
        } else {
          // Empty root task item: break list
          const next = content.substring(0, lineStart) + content.substring(selectionStart);
          setContent(next);
          executeSave(next, title);
          setTimeout(() => {
            ta.focus({ preventScroll: true });
            ta.setSelectionRange(lineStart, lineStart);
            updateCursorPosition();
          }, 10);
        }
      } else {
        // Continue task with current indent
        const prefix = `\n${indent}- [ ] `;
        const next = content.substring(0, selectionStart) + prefix + content.substring(selectionEnd);
        setContent(next);
        executeSave(next, title);
        setTimeout(() => {
          ta.focus({ preventScroll: true });
          const newPos = selectionStart + prefix.length;
          ta.setSelectionRange(newPos, newPos);
          updateCursorPosition();
        }, 10);
      }
      return true;
    } else if (bulletMatch) {
      e.preventDefault();
      const indent = bulletMatch[1];
      const bullet = bulletMatch[2].trim();
      const text = bulletMatch[3];
      if (!text.trim()) {
        if (indent.length >= 2) {
          // Outdent nested bullet item by 2 spaces
          const outdentedPrefix = indent.substring(2) + `${bullet} `;
          const next = content.substring(0, lineStart) + outdentedPrefix + content.substring(selectionStart);
          setContent(next);
          executeSave(next, title);
          setTimeout(() => {
            ta.focus({ preventScroll: true });
            const newPos = lineStart + outdentedPrefix.length;
            ta.setSelectionRange(newPos, newPos);
            updateCursorPosition();
          }, 10);
        } else {
          // Empty root bullet: break list
          const next = content.substring(0, lineStart) + content.substring(selectionStart);
          setContent(next);
          executeSave(next, title);
          setTimeout(() => {
            ta.focus({ preventScroll: true });
            ta.setSelectionRange(lineStart, lineStart);
            updateCursorPosition();
          }, 10);
        }
      } else {
        // Continue bullet with current indent
        const prefix = `\n${indent}${bullet} `;
        const next = content.substring(0, selectionStart) + prefix + content.substring(selectionEnd);
        setContent(next);
        executeSave(next, title);
        setTimeout(() => {
          ta.focus({ preventScroll: true });
          const newPos = selectionStart + prefix.length;
          ta.setSelectionRange(newPos, newPos);
          updateCursorPosition();
        }, 10);
      }
      return true;
    } else if (orderedMatch) {
      e.preventDefault();
      const indent = orderedMatch[1];
      const num = parseInt(orderedMatch[2], 10);
      const text = orderedMatch[3];
      if (!text.trim()) {
        if (indent.length >= 2) {
          // Outdent nested numbered item by 2 spaces
          const outdentedPrefix = indent.substring(2) + '1. ';
          const next = content.substring(0, lineStart) + outdentedPrefix + content.substring(selectionStart);
          setContent(next);
          executeSave(next, title);
          setTimeout(() => {
            ta.focus({ preventScroll: true });
            const newPos = lineStart + outdentedPrefix.length;
            ta.setSelectionRange(newPos, newPos);
            updateCursorPosition();
          }, 10);
        } else {
          // Empty root numbered item: break list
          const next = content.substring(0, lineStart) + content.substring(selectionStart);
          setContent(next);
          executeSave(next, title);
          setTimeout(() => {
            ta.focus({ preventScroll: true });
            ta.setSelectionRange(lineStart, lineStart);
            updateCursorPosition();
          }, 10);
        }
      } else {
        // Continue numbered list with incremented number
        const prefix = `\n${indent}${num + 1}. `;
        const next = content.substring(0, selectionStart) + prefix + content.substring(selectionEnd);
        setContent(next);
        executeSave(next, title);
        setTimeout(() => {
          ta.focus({ preventScroll: true });
          const newPos = selectionStart + prefix.length;
          ta.setSelectionRange(newPos, newPos);
          updateCursorPosition();
        }, 10);
      }
      return true;
    }
  }

  return false;
}
