import { EditorView } from '@codemirror/view';
import { Extension } from '@codemirror/state';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

/**
 * Modern document prose typography theme (generous padding, soft caret, clean line gutters)
 */
export const proseTheme = EditorView.theme({
  '&': {
    height: '100%',
  },
  '.cm-scroller': {
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
 * Dark theme syntax highlighting for fenced code blocks, inline code, and markdown structure
 */
export const mdWriterDarkHighlightStyle = HighlightStyle.define([
  // Keywords & Control Flow
  { tag: [t.keyword, t.operatorKeyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword], color: '#c084fc', fontWeight: '600' },
  // Strings & Text Literals
  { tag: [t.string, t.character, t.special(t.string)], color: '#34d399' },
  // Numbers & Primitives
  { tag: [t.number, t.integer, t.float], color: '#fbbf24' },
  { tag: [t.bool, t.null, t.atom], color: '#f59e0b', fontWeight: '600' },
  // Comments
  { tag: [t.comment, t.lineComment, t.blockComment, t.docComment], color: '#71717a', fontStyle: 'italic' },
  // Functions & Methods
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: '#60a5fa', fontWeight: '500' },
  // Types, Classes, Namespaces
  { tag: [t.typeName, t.className, t.namespace], color: '#38bdf8', fontWeight: '500' },
  // Variables & Properties
  { tag: [t.propertyName, t.attributeName], color: '#93c5fd' },
  { tag: [t.variableName, t.definition(t.variableName)], color: '#e4e4e7' },
  // Tags & Markup (HTML / JSX / XML)
  { tag: t.tagName, color: '#f43f5e', fontWeight: '600' },
  { tag: t.attributeValue, color: '#34d399' },
  // Operators & Punctuation
  { tag: [t.operator, t.compareOperator, t.logicOperator, t.arithmeticOperator], color: '#f472b6' },
  { tag: [t.punctuation, t.bracket, t.paren, t.brace, t.squareBracket], color: '#a1a1aa' },
  // Regular Expressions & Special Symbols
  { tag: [t.regexp, t.escape], color: '#f87171' },
  { tag: [t.meta, t.documentMeta, t.annotation], color: '#818cf8' },
  // Markdown Prose Elements
  { tag: t.heading1, fontSize: '1.45em', fontWeight: '800', color: '#ffffff' },
  { tag: t.heading2, fontSize: '1.25em', fontWeight: '700', color: '#f4f4f5' },
  { tag: t.heading3, fontSize: '1.12em', fontWeight: '700', color: '#e4e4e7' },
  { tag: [t.heading4, t.heading5, t.heading6], fontWeight: '600', color: '#d4d4d8' },
  { tag: t.strong, fontWeight: '700', color: '#ffffff' },
  { tag: t.emphasis, fontStyle: 'italic', color: '#e4e4e7' },
  { tag: t.strikethrough, textDecoration: 'line-through', opacity: '0.7' },
  { tag: t.monospace, color: '#a78bfa', backgroundColor: 'rgba(167, 139, 250, 0.12)', borderRadius: '3px' },
  { tag: [t.link, t.url], color: '#9E7EFF', textDecoration: 'underline' },
]);

/**
 * Light theme syntax highlighting for fenced code blocks, inline code, and markdown structure
 */
export const mdWriterLightHighlightStyle = HighlightStyle.define([
  // Keywords & Control Flow
  { tag: [t.keyword, t.operatorKeyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword], color: '#7c3aed', fontWeight: '600' },
  // Strings & Text Literals
  { tag: [t.string, t.character, t.special(t.string)], color: '#059669' },
  // Numbers & Primitives
  { tag: [t.number, t.integer, t.float], color: '#d97706' },
  { tag: [t.bool, t.null, t.atom], color: '#b45309', fontWeight: '600' },
  // Comments
  { tag: [t.comment, t.lineComment, t.blockComment, t.docComment], color: '#6b7280', fontStyle: 'italic' },
  // Functions & Methods
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: '#2563eb', fontWeight: '500' },
  // Types, Classes, Namespaces
  { tag: [t.typeName, t.className, t.namespace], color: '#0284c7', fontWeight: '500' },
  // Variables & Properties
  { tag: [t.propertyName, t.attributeName], color: '#0369a1' },
  { tag: [t.variableName, t.definition(t.variableName)], color: '#18181b' },
  // Tags & Markup (HTML / JSX / XML)
  { tag: t.tagName, color: '#e11d48', fontWeight: '600' },
  { tag: t.attributeValue, color: '#059669' },
  // Operators & Punctuation
  { tag: [t.operator, t.compareOperator, t.logicOperator, t.arithmeticOperator], color: '#db2777' },
  { tag: [t.punctuation, t.bracket, t.paren, t.brace, t.squareBracket], color: '#52525b' },
  // Regular Expressions & Special Symbols
  { tag: [t.regexp, t.escape], color: '#dc2626' },
  { tag: [t.meta, t.documentMeta, t.annotation], color: '#6366f1' },
  // Markdown Prose Elements
  { tag: t.heading1, fontSize: '1.45em', fontWeight: '800', color: '#09090b' },
  { tag: t.heading2, fontSize: '1.25em', fontWeight: '700', color: '#18181b' },
  { tag: t.heading3, fontSize: '1.12em', fontWeight: '700', color: '#27272a' },
  { tag: [t.heading4, t.heading5, t.heading6], fontWeight: '600', color: '#3f3f46' },
  { tag: t.strong, fontWeight: '700', color: '#09090b' },
  { tag: t.emphasis, fontStyle: 'italic', color: '#27272a' },
  { tag: t.strikethrough, textDecoration: 'line-through', opacity: '0.7' },
  { tag: t.monospace, color: '#6D3FE0', backgroundColor: 'rgba(109, 63, 224, 0.08)', borderRadius: '3px' },
  { tag: [t.link, t.url], color: '#6D3FE0', textDecoration: 'underline' },
]);

/**
 * Returns active theme extensions and syntax highlighters based on dark/light mode
 */
export function getThemeExtensions(isDark: boolean): Extension[] {
  const activeHighlight = isDark
    ? syntaxHighlighting(mdWriterDarkHighlightStyle, { fallback: true })
    : syntaxHighlighting(mdWriterLightHighlightStyle, { fallback: true });

  return isDark
    ? [proseTheme, darkProseTheme, activeHighlight]
    : [proseTheme, activeHighlight];
}
