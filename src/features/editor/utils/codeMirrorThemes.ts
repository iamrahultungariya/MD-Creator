import { EditorView } from '@codemirror/view';
import { Extension } from '@codemirror/state';

/**
 * Modern document prose typography theme (generous padding, soft caret, clean line gutters)
 */
export const proseTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '15px',
    fontFamily: 'var(--font-sans)',
  },
  '.cm-scroller': {
    fontFamily: 'inherit',
    lineHeight: '1.8',
    padding: '0',
  },
  '.cm-content': {
    caretColor: '#6D3FE0',
    padding: '24px 20px',
    minHeight: '100%',
  },
  '&.cm-focused': {
    outline: 'none !important',
  },
  '.cm-line': {
    padding: '0 2px',
  },
  '.cm-cursor': {
    borderLeftColor: '#6D3FE0',
    borderLeftWidth: '2.5px',
  },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, ::selection': {
    backgroundColor: 'var(--selection-bg, rgba(130, 87, 245, 0.25)) !important',
  },
  '.cm-activeLine': {
    backgroundColor: 'transparent',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    borderRight: 'none',
    color: '#9ca3af',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    paddingRight: '12px',
    userSelect: 'none',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
    color: '#6D3FE0',
    fontWeight: 'bold',
  },
});

export const darkProseTheme = EditorView.theme(
  {
    '.cm-content': {
      caretColor: '#9E7EFF',
    },
    '.cm-cursor': {
      borderLeftColor: '#9E7EFF',
    },
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, ::selection': {
      backgroundColor: 'var(--selection-bg, rgba(158, 126, 255, 0.3)) !important',
    },
    '.cm-gutters': {
      color: '#6b7280',
    },
    '.cm-activeLineGutter': {
      color: '#9E7EFF',
    },
  },
  { dark: true }
);

/**
 * Returns active theme extensions based on dark/light mode
 */
export function getThemeExtensions(isDark: boolean): Extension[] {
  return isDark ? [proseTheme, darkProseTheme] : [proseTheme];
}
