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
import { vim, getCM } from '@replit/codemirror-vim';
import { useThemeStore } from '../../../stores/useThemeStore';
import { usePreferencesStore } from '../../../stores/usePreferencesStore';
import { getThemeExtensions } from '../utils/codeMirrorThemes';
import { createTableKeybindings } from '../../../utils/editorTableKeymap';
import { 
  createFocusDimmingExtension, 
  getEditorTypographyTheme, 
  highlightViewPlugin 
} from '../utils/editorExtensions';
import { createEditorDomEventHandlers } from '../utils/editorDomHandlers';
import { CodeMirrorEditorHandle, CodeMirrorEditorProps } from '../types/editorComponentTypes';

export type { CodeMirrorEditorHandle, CodeMirrorEditorProps };

export const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({
  value,
  onChange,
  onCursorChange,
  onSlashTrigger,
  onScroll,
  showLineNumbers = false,
  placeholder = 'Start writing your document...',
  className = '',
  autoFocus = true,
  onPasteImage,
  onDropImage,
  onKeyDown,
  onToast,
  onVimModeChange,
  editorRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const isDark = useThemeStore((s) => s.isDark);
  const fontFamily = usePreferencesStore((s) => s.fontFamily);
  const fontSize = usePreferencesStore((s) => s.fontSize);
  const lineHeight = usePreferencesStore((s) => s.lineHeight);
  const wordWrap = usePreferencesStore((s) => s.wordWrap);
  const tabSize = usePreferencesStore((s) => s.tabSize);
  const prefLineNumbers = usePreferencesStore((s) => s.lineNumbers);
  const autoCloseBrackets = usePreferencesStore((s) => s.autoCloseBrackets);
  const typewriterMode = usePreferencesStore((s) => s.typewriterMode);
  const focusMode = usePreferencesStore((s) => s.focusMode);
  const keymapMode = usePreferencesStore((s) => s.keymapMode);

  const onVimModeChangeRef = useRef(onVimModeChange);
  onVimModeChangeRef.current = onVimModeChange;
  const typewriterModeRef = useRef(typewriterMode);
  typewriterModeRef.current = typewriterMode;
  const focusModeRef = useRef(focusMode);
  focusModeRef.current = focusMode;

  // Compartments for dynamic reconfiguration without destroying state
  const lineNumbersCompartment = useRef(new Compartment());
  const themeCompartment = useRef(new Compartment());
  const typographyCompartment = useRef(new Compartment());
  const wrapCompartment = useRef(new Compartment());
  const tabSizeCompartment = useRef(new Compartment());
  const closeBracketsCompartment = useRef(new Compartment());
  const vimCompartment = useRef(new Compartment());
  const focusDimmingCompartment = useRef(new Compartment());

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
  const onToastRef = useRef(onToast);
  onToastRef.current = onToast;

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
    const domEventHandlers = createEditorDomEventHandlers({
      onKeyDownRef,
      onPasteImageRef,
      onDropImageRef,
      onToastRef,
      viewRef,
      flushChange,
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

        // Typewriter Mode: smoothly center the active line in viewport
        if (typewriterModeRef.current) {
          requestAnimationFrame(() => {
            if (viewRef.current) {
              viewRef.current.dispatch({
                effects: EditorView.scrollIntoView(head, { y: 'center' }),
              });
            }
          });
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
        Prec.high(keymap.of(createTableKeybindings())),
        vimCompartment.current.of(keymapMode === 'vim' ? [vim()] : []),
        focusDimmingCompartment.current.of(createFocusDimmingExtension(focusMode || typewriterMode)),
        history(),
        bracketMatching(),
        closeBracketsCompartment.current.of(autoCloseBrackets ? [closeBrackets()] : []),
        tabSizeCompartment.current.of(EditorState.tabSize.of(tabSize)),
        indentOnInput(),
        drawSelection(),
        EditorView.contentAttributes.of({ autocorrect: 'on', spellcheck: 'true' }),
        keymap.of([...markdownKeymap, ...defaultKeymap, ...historyKeymap]),
        markdown(),
        highlightViewPlugin,
        wrapCompartment.current.of(wordWrap ? [EditorView.lineWrapping] : []),
        domEventHandlers,
        updateListener,
        cmPlaceholder(placeholder),
        lineNumbersCompartment.current.of((showLineNumbers || prefLineNumbers) ? [lineNumbers(), highlightActiveLineGutter()] : []),
        typographyCompartment.current.of(getEditorTypographyTheme(fontFamily, fontSize, lineHeight)),
        themeCompartment.current.of(getThemeExtensions(isDark)),
        highlightActiveLine(),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    if (typewriterMode && view.dom) {
      view.dom.classList.add('cm-typewriter-mode');
    }

    if (keymapMode === 'vim') {
      const cm = getCM(view);
      if (cm) {
        const handleVimMode = (data: { mode: string }) => {
          const m = data.mode?.toUpperCase();
          if (m === 'NORMAL' || m === 'INSERT' || m === 'VISUAL' || m === 'REPLACE') {
            onVimModeChangeRef.current?.(m as any);
          }
        };
        cm.on('vim-mode-change', handleVimMode);
        onVimModeChangeRef.current?.('NORMAL');
      }
    }

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
      const scrollDOM = viewRef.current.scrollDOM;
      const prevScrollTop = scrollDOM.scrollTop;
      const prevScrollLeft = scrollDOM.scrollLeft;
      const curSelection = viewRef.current.state.selection.main;

      viewRef.current.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: value },
        selection: { anchor: Math.min(curSelection.anchor, value.length) },
      });

      // Instantly restore scroll position so external content updates (like ticking checkboxes) don't jump to top
      scrollDOM.scrollTop = prevScrollTop;
      scrollDOM.scrollLeft = prevScrollLeft;

      requestAnimationFrame(() => {
        if (viewRef.current) {
          viewRef.current.scrollDOM.scrollTop = prevScrollTop;
          viewRef.current.scrollDOM.scrollLeft = prevScrollLeft;
        }
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

  // Dynamically reconfigure typography (font family, size, line height)
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: typographyCompartment.current.reconfigure(
        getEditorTypographyTheme(fontFamily, fontSize, lineHeight)
      ),
    });
  }, [fontFamily, fontSize, lineHeight]);

  // Dynamically toggle word wrap
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: wrapCompartment.current.reconfigure(
        wordWrap ? [EditorView.lineWrapping] : []
      ),
    });
  }, [wordWrap]);

  // Dynamically adjust tab size
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: tabSizeCompartment.current.reconfigure(
        EditorState.tabSize.of(tabSize)
      ),
    });
  }, [tabSize]);

  // Dynamically toggle auto close brackets
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: closeBracketsCompartment.current.reconfigure(
        autoCloseBrackets ? [closeBrackets()] : []
      ),
    });
  }, [autoCloseBrackets]);

  // Toggle line numbers dynamically
  useEffect(() => {
    if (!viewRef.current) return;
    const isEnabled = showLineNumbers || prefLineNumbers;
    viewRef.current.dispatch({
      effects: lineNumbersCompartment.current.reconfigure(
        isEnabled ? [lineNumbers(), highlightActiveLineGutter()] : []
      ),
    });
  }, [showLineNumbers, prefLineNumbers]);

  // Dynamically toggle Vim mode
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: vimCompartment.current.reconfigure(keymapMode === 'vim' ? [vim()] : []),
    });
    if (keymapMode === 'vim') {
      const cm = getCM(viewRef.current);
      if (cm) {
        const handleVimMode = (data: { mode: string }) => {
          const m = data.mode?.toUpperCase();
          if (m === 'NORMAL' || m === 'INSERT' || m === 'VISUAL' || m === 'REPLACE') {
            onVimModeChangeRef.current?.(m as any);
          }
        };
        cm.on('vim-mode-change', handleVimMode);
        onVimModeChangeRef.current?.('NORMAL');
      }
    } else {
      onVimModeChangeRef.current?.(undefined as any);
    }
  }, [keymapMode]);

  // Dynamically toggle typewriter mode and focus paragraph dimming
  useEffect(() => {
    if (!viewRef.current) return;
    const isFocusActive = focusMode || typewriterMode;
    viewRef.current.dispatch({
      effects: focusDimmingCompartment.current.reconfigure(
        createFocusDimmingExtension(isFocusActive)
      ),
    });
    viewRef.current.dom.classList.toggle('cm-typewriter-mode', typewriterMode);

    if (typewriterMode) {
      const head = viewRef.current.state.selection.main.head;
      viewRef.current.dispatch({
        effects: EditorView.scrollIntoView(head, { y: 'center' }),
      });
    }
  }, [focusMode, typewriterMode]);

  return (
    <div
      ref={containerRef}
      className={`h-full w-full overflow-hidden select-text transition-colors ${className}`}
    />
  );
};
