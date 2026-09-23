import React from 'react';

const PAIRS: Record<string, string> = {
  '(': ')',
  '[': ']',
  '{': '}',
  '"': '"',
  "'": "'",
  '`': '`',
  '*': '*',
  '~': '~',
};

const CLOSING_CHARS = [')', ']', '}', '"', "'", '`'];

const AUTO_CLOSE: Record<string, string> = {
  '(': ')',
  '[': ']',
  '{': '}',
  '"': '"',
  "'": "'",
  '`': '`',
};

/**
 * Handles auto-pairing, selection wrapping, and bracket backspacing.
 * Returns true if the keyboard event was fully handled, false otherwise.
 */
export function handleEditorAutoPair(
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

  // 1. Selection wrapping with bracket or quote
  if (selectionStart !== selectionEnd && PAIRS[e.key]) {
    e.preventDefault();
    const open = e.key;
    const close = PAIRS[e.key];
    const selected = content.substring(selectionStart, selectionEnd);
    const wrapped = open + selected + close;
    const next = content.substring(0, selectionStart) + wrapped + content.substring(selectionEnd);
    setContent(next);
    executeSave(next, title);
    setTimeout(() => {
      ta.focus({ preventScroll: true });
      ta.setSelectionRange(selectionStart + 1, selectionEnd + 1);
      updateCursorPosition();
    }, 10);
    return true;
  }

  // 2. Single cursor operations
  if (selectionStart === selectionEnd) {
    // Step over closing character if already directly in front of it
    if (CLOSING_CHARS.includes(e.key) && content[selectionStart] === e.key) {
      e.preventDefault();
      ta.setSelectionRange(selectionStart + 1, selectionStart + 1);
      updateCursorPosition();
      return true;
    }

    // Insert opening pair with caret placed in-between
    if (AUTO_CLOSE[e.key]) {
      e.preventDefault();
      const open = e.key;
      const close = AUTO_CLOSE[e.key];
      const next = content.substring(0, selectionStart) + open + close + content.substring(selectionStart);
      setContent(next);
      executeSave(next, title);
      setTimeout(() => {
        ta.focus({ preventScroll: true });
        ta.setSelectionRange(selectionStart + 1, selectionStart + 1);
        updateCursorPosition();
      }, 10);
      return true;
    }

    // Backspace between empty pair deletes both
    if (e.key === 'Backspace') {
      const charBefore = content[selectionStart - 1];
      const charAfter = content[selectionStart];
      if (
        (charBefore === '(' && charAfter === ')') ||
        (charBefore === '[' && charAfter === ']') ||
        (charBefore === '{' && charAfter === '}') ||
        (charBefore === '"' && charAfter === '"') ||
        (charBefore === "'" && charAfter === "'") ||
        (charBefore === '`' && charAfter === '`')
      ) {
        e.preventDefault();
        const next = content.substring(0, selectionStart - 1) + content.substring(selectionStart + 1);
        setContent(next);
        executeSave(next, title);
        setTimeout(() => {
          ta.focus({ preventScroll: true });
          ta.setSelectionRange(selectionStart - 1, selectionStart - 1);
          updateCursorPosition();
        }, 10);
        return true;
      }
    }
  }

  return false;
}
