import React, { useEffect, useRef, useImperativeHandle, useCallback } from 'react';
import { 
  EditorView, 
  lineNumbers, 
  highlightActiveLineGutter, 
  highlightActiveLine, 
  keymap,
  placeholder as cmPlaceholder,
  ViewUpdate
} from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { markdown, markdownKeymap } from '@codemirror/lang-markdown';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { useThemeStore } from '../../../stores/useThemeStore';

export interface CodeMirrorEditorHandle {
  focus: () => void;
  getValue: () => string;
  setValue: (val: string) => void;
  getSelection: () => string;
  replaceSelection: (text: string) => void;
  setCursor: (offset: number) => void;
  setSelectionRange: (from: number, to: number) => void;
  scrollToLine: (lineIndex: number) => void;
  getDOMNode: () => HTMLElement | null;
  getSelectionStart: () => number;
  getSelectionEnd: () => number;
  getScrollDOM: () => HTMLElement | null;
  scrollToRatio: (ratio: number) => void;
  getScrollRatio: () => number;
}

export interface CodeMirrorEditorProps {
  value: string;
  onChange: (value: string) => void;
  onCursorChange?: (pos: { line: number; col: number; offset: number }) => void;
  onSlashTrigger?: (query: string, pos: number) => void;
  onScroll?: (event: Event, scrollDOM: HTMLElement) => void;
  isTypewriterMode?: boolean;
  showLineNumbers?: boolean;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onPasteImage?: (file: File) => void;
  onDropImage?: (file: File) => void;
  onKeyDown?: (e: KeyboardEvent) => boolean | void;
  editorRef?: React.RefObject<CodeMirrorEditorHandle | null>;
}

export const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({
  value,
  onChange,
  onCursorChange,
  onSlashTrigger,
  onScroll,
  isTypewriterMode = false,
  showLineNumbers = false,
  placeholder = 'Start writing your document...',
  className = '',
  autoFocus = true,
  onPasteImage,
  onDropImage,
  onKeyDown,
  editorRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { isDark } = useThemeStore();

  // Compartments for dynamic reconfiguration without destroying state
  const lineNumbersCompartment = useRef(new Compartment());
  const themeCompartment = useRef(new Compartment());
  const typewriterCompartment = useRef(new Compartment());

  // Avoid recreating editor or full doc re-parsing on typing
  const lastInternalDocRef = useRef<string>(value);

  // Keep latest callbacks in refs to avoid recreating editor on prop changes
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onCursorChangeRef = useRef(onCursorChange);
  onCursorChangeRef.current = onCursorChange;
  const onSlashTriggerRef = useRef(onSlashTrigger);
  onSlashTriggerRef.current = onSlashTrigger;
  const onScrollRef = useRef(onScroll);
  onScrollRef.current = onScroll;
  const onPasteImageRef = useRef(onPasteImage);
  onPasteImageRef.current = onPasteImage;
  const onDropImageRef = useRef(onDropImage);
  onDropImageRef.current = onDropImage;
  const onKeyDownRef = useRef(onKeyDown);
  onKeyDownRef.current = onKeyDown;
  const isTypewriterModeRef = useRef(isTypewriterMode);
  isTypewriterModeRef.current = isTypewriterMode;

  // Handle Typewriter smooth centering with RAF throttling
  const typewriterRafRef = useRef<number | null>(null);
  const performTypewriterScroll = useCallback((view: EditorView) => {
    if (!isTypewriterModeRef.current) return;
    if (typewriterRafRef.current) cancelAnimationFrame(typewriterRafRef.current);
    typewriterRafRef.current = requestAnimationFrame(() => {
      try {
        const head = view.state.selection.main.head;
        const lineBlock = view.lineBlockAt(head);
        const scrollDOM = view.scrollDOM;
        const target = lineBlock.top - scrollDOM.clientHeight / 2 + lineBlock.height / 2;
        scrollDOM.scrollTo({
          top: Math.max(0, target),
          behavior: 'smooth',
        });
      } catch {}
    });
  }, []);

  // Expose imperative handle for external integrations
  useImperativeHandle(
    editorRef,
    () => ({
      focus: () => {
        viewRef.current?.focus();
      },
      getValue: () => {
        return viewRef.current?.state.doc.toString() || '';
      },
      setValue: (val: string) => {
        if (!viewRef.current) return;
        const current = viewRef.current.state.doc.toString();
        if (current !== val) {
          viewRef.current.dispatch({
            changes: { from: 0, to: current.length, insert: val },
          });
        }
      },
      getSelection: () => {
        if (!viewRef.current) return '';
        const { from, to } = viewRef.current.state.selection.main;
        return viewRef.current.state.doc.sliceString(from, to);
      },
      replaceSelection: (text: string) => {
        if (!viewRef.current) return;
        const main = viewRef.current.state.selection.main;
        viewRef.current.dispatch({
          changes: { from: main.from, to: main.to, insert: text },
          selection: { anchor: main.from + text.length },
        });
        viewRef.current.focus();
      },
      setCursor: (offset: number) => {
        if (!viewRef.current) return;
        const safeOffset = Math.max(0, Math.min(offset, viewRef.current.state.doc.length));
        viewRef.current.dispatch({
          selection: { anchor: safeOffset },
          scrollIntoView: true,
        });
      },
      setSelectionRange: (from: number, to: number) => {
        if (!viewRef.current) return;
        const docLen = viewRef.current.state.doc.length;
        const safeFrom = Math.max(0, Math.min(from, docLen));
        const safeTo = Math.max(safeFrom, Math.min(to, docLen));
        viewRef.current.dispatch({
          selection: { anchor: safeFrom, head: safeTo },
          scrollIntoView: true,
        });
      },
      scrollToLine: (lineIndex: number) => {
        if (!viewRef.current) return;
        const doc = viewRef.current.state.doc;
        const line = doc.line(Math.max(1, Math.min(lineIndex + 1, doc.lines)));
        viewRef.current.dispatch({
          selection: { anchor: line.from },
          scrollIntoView: true,
        });
      },
      getDOMNode: () => containerRef.current,
      getSelectionStart: () => viewRef.current?.state.selection.main.from || 0,
      getSelectionEnd: () => viewRef.current?.state.selection.main.to || 0,
      getScrollDOM: () => viewRef.current?.scrollDOM || null,
      scrollToRatio: (ratio: number) => {
        if (!viewRef.current) return;
        const scrollDOM = viewRef.current.scrollDOM;
        const maxScroll = scrollDOM.scrollHeight - scrollDOM.clientHeight;
        if (maxScroll > 0) {
          scrollDOM.scrollTop = Math.max(0, Math.min(ratio * maxScroll, maxScroll));
        }
      },
      getScrollRatio: () => {
        if (!viewRef.current) return 0;
        const scrollDOM = viewRef.current.scrollDOM;
        const maxScroll = scrollDOM.scrollHeight - scrollDOM.clientHeight;
        return maxScroll > 0 ? scrollDOM.scrollTop / maxScroll : 0;
      },
    }),
    []
  );

  // Initialize CodeMirror instance
  useEffect(() => {
    if (!containerRef.current) return;

    // Document styling theme: modern document writing feel (prose, generous breathing space, soft caret)
    const proseTheme = EditorView.theme({
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

    const darkProseTheme = EditorView.theme(
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

    // Event listener extension
    const domEventHandlers = EditorView.domEventHandlers({
      keydown: (e) => {
        if (onKeyDownRef.current) {
          const handled = onKeyDownRef.current(e);
          if (handled) return true;
        }
        return false;
      },
      paste: (e) => {
        const items = e.clipboardData?.items;
        if (!items) return false;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith('image/')) {
            const file = items[i].getAsFile();
            if (file) {
              e.preventDefault();
              onPasteImageRef.current?.(file);
              return true;
            }
          }
        }
        return false;
      },
      drop: (e) => {
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            e.preventDefault();
            onDropImageRef.current?.(file);
            return true;
          }
        }
        return false;
      },
    });

    // Update listener extension: debounced content update & cursor telemetry
    const updateListener = EditorView.updateListener.of((update: ViewUpdate) => {
      if (update.docChanged) {
        const newDoc = update.state.doc.toString();
        lastInternalDocRef.current = newDoc;
        onChangeRef.current(newDoc);

        // Check slash trigger
        const head = update.state.selection.main.head;
        const line = update.state.doc.lineAt(head);
        const textBefore = line.text.slice(0, head - line.from);
        const slashMatch = textBefore.match(/(?:^|\s)\/([a-zA-Z0-9_-]*)$/);
        if (slashMatch) {
          onSlashTriggerRef.current?.(slashMatch[1], head);
        }
      }

      if (update.selectionSet || update.docChanged) {
        const head = update.state.selection.main.head;
        const line = update.state.doc.lineAt(head);
        const col = head - line.from + 1;
        onCursorChangeRef.current?.({ line: line.number, col, offset: head });

        if (isTypewriterModeRef.current) {
          performTypewriterScroll(update.view);
        }
      }
    });

    // Typewriter padding extension: gives 40vh top/bottom padding when typewriter is on
    const typewriterPaddingTheme = isTypewriterMode
      ? EditorView.theme({
          '.cm-content': {
            paddingTop: '35vh !important',
            paddingBottom: '45vh !important',
          },
        })
      : [];

    const state = EditorState.create({
      doc: value,
      extensions: [
        history(),
        keymap.of([...markdownKeymap, ...defaultKeymap, ...historyKeymap]),
        markdown(),
        EditorView.lineWrapping,
        domEventHandlers,
        updateListener,
        cmPlaceholder(placeholder),
        lineNumbersCompartment.current.of(showLineNumbers ? [lineNumbers(), highlightActiveLineGutter()] : []),
        themeCompartment.current.of(isDark ? [proseTheme, darkProseTheme] : [proseTheme]),
        typewriterCompartment.current.of(typewriterPaddingTheme),
        highlightActiveLine(),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    // Attach scroll listener to scrollDOM for high-performance sync scrolling
    const scrollDOM = view.scrollDOM;
    const handleScroll = (e: Event) => {
      onScrollRef.current?.(e, scrollDOM);
    };
    scrollDOM.addEventListener('scroll', handleScroll, { passive: true });

    if (autoFocus) {
      view.focus();
    }

    return () => {
      scrollDOM.removeEventListener('scroll', handleScroll);
      if (typewriterRafRef.current) cancelAnimationFrame(typewriterRafRef.current);
      view.destroy();
      viewRef.current = null;
    };
  }, []); // Mount once

  // Sync external value changes into CodeMirror without disturbing cursor position or lag
  useEffect(() => {
    if (!viewRef.current) return;
    // Fast path: if the change originated from internal typing, do NOTHING (instant 60+ FPS)
    if (value === lastInternalDocRef.current) return;

    lastInternalDocRef.current = value;
    const currentDoc = viewRef.current.state.doc.toString();
    if (value !== currentDoc) {
      const curSelection = viewRef.current.state.selection.main;
      viewRef.current.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: value },
        selection: { anchor: Math.min(curSelection.anchor, value.length) },
      });
    }
  }, [value]);

  // Sync dark/light theme dynamically
  useEffect(() => {
    if (!viewRef.current) return;
    const proseTheme = EditorView.theme({
      '&': { height: '100%', fontSize: '15px', fontFamily: 'var(--font-sans)' },
      '.cm-scroller': { fontFamily: 'inherit', lineHeight: '1.8' },
      '.cm-content': { caretColor: '#2563eb', padding: '24px 20px', minHeight: '100%' },
      '&.cm-focused': { outline: 'none !important' },
      '.cm-line': { padding: '0 2px' },
      '.cm-cursor': { borderLeftColor: '#2563eb', borderLeftWidth: '2.5px' },
      '&.cm-focused .cm-selectionBackground, ::selection': { backgroundColor: 'rgba(59, 130, 246, 0.22) !important' },
      '.cm-gutters': { backgroundColor: 'transparent', borderRight: 'none', color: '#9ca3af', fontFamily: 'var(--font-mono)', fontSize: '11px', paddingRight: '12px' },
      '.cm-activeLineGutter': { backgroundColor: 'transparent', color: '#2563eb', fontWeight: 'bold' },
    });

    const darkProseTheme = EditorView.theme(
      {
        '.cm-content': { caretColor: '#60a5fa' },
        '.cm-cursor': { borderLeftColor: '#60a5fa' },
        '&.cm-focused .cm-selectionBackground, ::selection': { backgroundColor: 'rgba(96, 165, 250, 0.25) !important' },
        '.cm-gutters': { color: '#6b7280' },
        '.cm-activeLineGutter': { color: '#60a5fa' },
      },
      { dark: true }
    );

    viewRef.current.dispatch({
      effects: themeCompartment.current.reconfigure(isDark ? [proseTheme, darkProseTheme] : [proseTheme]),
    });
  }, [isDark]);

  // Toggle line numbers dynamically
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: lineNumbersCompartment.current.reconfigure(
        showLineNumbers ? [lineNumbers(), highlightActiveLineGutter()] : []
      ),
    });
  }, [showLineNumbers]);

  // Toggle typewriter mode padding dynamically
  useEffect(() => {
    if (!viewRef.current) return;
    const typewriterPaddingTheme = isTypewriterMode
      ? EditorView.theme({
          '.cm-content': {
            paddingTop: '35vh !important',
            paddingBottom: '45vh !important',
          },
        })
      : [];

    viewRef.current.dispatch({
      effects: typewriterCompartment.current.reconfigure(typewriterPaddingTheme),
    });
  }, [isTypewriterMode]);

  return (
    <div
      ref={containerRef}
      className={`h-full w-full overflow-hidden select-text transition-colors ${className}`}
    />
  );
};
