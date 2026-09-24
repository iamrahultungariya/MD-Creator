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
    caretColor: '#2563eb',
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
    borderLeftColor: '#2563eb',
    borderLeftWidth: '2.5px',
  },
  '&.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(59, 130, 246, 0.22) !important',
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
    color: '#2563eb',
    fontWeight: 'bold',
  },
});

export const darkProseTheme = EditorView.theme(
  {
    '.cm-content': {
      caretColor: '#60a5fa',
    },
    '.cm-cursor': {
      borderLeftColor: '#60a5fa',
    },
    '&.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: 'rgba(96, 165, 250, 0.25) !important',
    },
    '.cm-gutters': {
      color: '#6b7280',
    },
    '.cm-activeLineGutter': {
      color: '#60a5fa',
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

/**
 * Returns typewriter mode vertical breathing padding
 */
export function getTypewriterPaddingTheme(isTypewriterMode: boolean): Extension {
  return isTypewriterMode
    ? EditorView.theme({
        '.cm-content': {
          paddingTop: '35vh !important',
          paddingBottom: '45vh !important',
        },
      })
    : [];
}
