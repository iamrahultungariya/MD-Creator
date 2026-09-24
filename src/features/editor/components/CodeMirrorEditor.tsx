import React, { useEffect, useRef, useImperativeHandle, useCallback } from 'react';
import { 
  EditorView, 
  lineNumbers, 
  highlightActiveLineGutter, 
  highlightActiveLine, 
  keymap,
  placeholder as cmPlaceholder,
  drawSelection,
  ViewUpdate
} from '@codemirror/view';
import { EditorState, Compartment, Prec } from '@codemirror/state';
import { markdown, markdownKeymap } from '@codemirror/lang-markdown';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching, indentOnInput } from '@codemirror/language';
import { closeBrackets } from '@codemirror/autocomplete';
import { useThemeStore } from '../../../stores/useThemeStore';
import { getThemeExtensions, getTypewriterPaddingTheme } from '../utils/codeMirrorThemes';

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
  getCaretCoords: () => { left: number; top: number; bottom: number } | null;
  flush: () => void;
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

  // Buffer & debounce keystrokes so React state is not updated on every single keypress
  const changeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingChangeRef = useRef(false);

  const flushChange = useCallback(() => {
    if (changeTimerRef.current) {
      clearTimeout(changeTimerRef.current);
      changeTimerRef.current = null;
    }
    if (pendingChangeRef.current && viewRef.current) {
      pendingChangeRef.current = false;
      const newDoc = viewRef.current.state.doc.toString();
      lastInternalDocRef.current = newDoc;
      onChangeRef.current?.(newDoc);
    }
  }, []);

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
        flushChange();
        return viewRef.current?.state.doc.toString() || '';
      },
      flush: () => {
        flushChange();
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
      getCaretCoords: () => {
        if (!viewRef.current) return null;
        try {
          const sel = viewRef.current.state.selection.main;
          if (!sel.empty) {
            const startCoords = viewRef.current.coordsAtPos(sel.from) || viewRef.current.coordsAtPos(sel.from, 1);
            const endCoords = viewRef.current.coordsAtPos(sel.to) || viewRef.current.coordsAtPos(sel.to, -1);
            if (startCoords) {
              const left =
                endCoords && Math.abs(startCoords.top - endCoords.top) < 10
                  ? (startCoords.left + endCoords.left) / 2
                  : startCoords.left;
              return {
                left,
                top: startCoords.top,
                bottom: endCoords ? Math.max(startCoords.bottom, endCoords.bottom) : startCoords.bottom,
              };
            }
          }
          const head = sel.head;
          const coords = viewRef.current.coordsAtPos(head) || viewRef.current.coordsAtPos(head, -1);
          return coords ? { left: coords.left, top: coords.top, bottom: coords.bottom } : null;
        } catch {
          return null;
        }
      },
    }),
    []
  );

  // Initialize CodeMirror instance
  useEffect(() => {
    if (!containerRef.current) return;

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
      blur: () => {
        flushChange();
        return false;
      },
    });

    // Update listener extension: debounced content update & cursor telemetry
    const updateListener = EditorView.updateListener.of((update: ViewUpdate) => {
      if (update.docChanged) {
        pendingChangeRef.current = true;
        if (changeTimerRef.current) {
          clearTimeout(changeTimerRef.current);
        }
        changeTimerRef.current = setTimeout(() => {
          changeTimerRef.current = null;
          if (viewRef.current && pendingChangeRef.current) {
            pendingChangeRef.current = false;
            const newDoc = viewRef.current.state.doc.toString();
            lastInternalDocRef.current = newDoc;
            onChangeRef.current?.(newDoc);
          }
        }, 60);

        // Check slash trigger (zero stringification overhead: only inspects current line)
        const head = update.state.selection.main.head;
        const line = update.state.doc.lineAt(head);
        const textBefore = line.text.slice(0, head - line.from);
        const slashMatch = textBefore.match(/(?:^|\s)\/([a-zA-Z0-9_-]*)$/);
        if (slashMatch) {
          onSlashTriggerRef.current?.(slashMatch[1], head);
        } else {
          onSlashTriggerRef.current?.('', -1);
        }
      } else if (update.selectionSet) {
        // When selection moves without doc change (e.g. click away or arrow away from /), dismiss slash menu
        const head = update.state.selection.main.head;
        const line = update.state.doc.lineAt(head);
        const textBefore = line.text.slice(0, head - line.from);
        const slashMatch = textBefore.match(/(?:^|\s)\/([a-zA-Z0-9_-]*)$/);
        if (slashMatch) {
          onSlashTriggerRef.current?.(slashMatch[1], head);
        } else {
          onSlashTriggerRef.current?.('', -1);
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

    // Slash commands keyboard interception with highest priority so arrows and enter navigate the palette
    const slashKeymap = Prec.highest(
      keymap.of([
        {
          key: 'ArrowDown',
          run: () => {
            if (onKeyDownRef.current) {
              const fakeEvt = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true });
              if (onKeyDownRef.current(fakeEvt) === true) return true;
            }
            return false;
          },
        },
        {
          key: 'ArrowUp',
          run: () => {
            if (onKeyDownRef.current) {
              const fakeEvt = new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true });
              if (onKeyDownRef.current(fakeEvt) === true) return true;
            }
            return false;
          },
        },
        {
          key: 'Enter',
          run: () => {
            if (onKeyDownRef.current) {
              const fakeEvt = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
              if (onKeyDownRef.current(fakeEvt) === true) return true;
            }
            return false;
          },
        },
        {
          key: 'Tab',
          run: () => {
            if (onKeyDownRef.current) {
              const fakeEvt = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
              if (onKeyDownRef.current(fakeEvt) === true) return true;
            }
            return false;
          },
        },
        {
          key: 'Escape',
          run: () => {
            if (onKeyDownRef.current) {
              const fakeEvt = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
              if (onKeyDownRef.current(fakeEvt) === true) return true;
            }
            return false;
          },
        },
      ])
    );

    const state = EditorState.create({
      doc: value,
      extensions: [
        slashKeymap,
        history(),
        bracketMatching(),
        closeBrackets(),
        indentOnInput(),
        drawSelection(),
        EditorView.contentAttributes.of({ autocorrect: 'on', spellcheck: 'true' }),
        keymap.of([...markdownKeymap, ...defaultKeymap, ...historyKeymap]),
        markdown(),
        EditorView.lineWrapping,
        domEventHandlers,
        updateListener,
        cmPlaceholder(placeholder),
        lineNumbersCompartment.current.of(showLineNumbers ? [lineNumbers(), highlightActiveLineGutter()] : []),
        themeCompartment.current.of(getThemeExtensions(isDark)),
        typewriterCompartment.current.of(getTypewriterPaddingTheme(isTypewriterMode)),
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
      if (changeTimerRef.current) {
        clearTimeout(changeTimerRef.current);
        changeTimerRef.current = null;
      }
      scrollDOM.removeEventListener('scroll', handleScroll);
      if (typewriterRafRef.current) cancelAnimationFrame(typewriterRafRef.current);
      view.destroy();
      viewRef.current = null;
    };
  }, []); // Mount once

  // Sync external value changes into CodeMirror without disturbing cursor position or lag
  useEffect(() => {
    if (!viewRef.current) return;
    // Fast path: if user has pending unsaved typing or if value matches last known doc, do NOTHING
    if (changeTimerRef.current !== null || pendingChangeRef.current) return;
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
    viewRef.current.dispatch({
      effects: themeCompartment.current.reconfigure(getThemeExtensions(isDark)),
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
    viewRef.current.dispatch({
      effects: typewriterCompartment.current.reconfigure(getTypewriterPaddingTheme(isTypewriterMode)),
    });
  }, [isTypewriterMode]);

  return (
    <div
      ref={containerRef}
      className={`h-full w-full overflow-hidden select-text transition-colors ${className}`}
    />
  );
};
