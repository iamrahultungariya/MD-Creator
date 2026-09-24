import React, { useState, useCallback, useRef } from 'react';
import { Columns, Minimize2, PenTool, Eye, ArrowUpDown } from 'lucide-react';
import { ViewMode } from '../types';
import { SlashCommandMenu } from '../../../components/editor/SlashCommandMenu';
import { MarkdownPreview } from '../../../components/editor/MarkdownPreview';
import { EditorWritingFx } from '../../../components/editor/EditorWritingFx';
import { MobileEditorToolbar } from './MobileEditorToolbar';
import { storeOptimizedImage } from '../../../services/imageStorageService';
import { FindReplaceBar } from './FindReplaceBar';
import { useReaderAppearance } from '../hooks/useReaderAppearance';
import { ReaderArticleHeader } from './ReaderArticleHeader';
import { WritingModeCanvas } from './WritingModeCanvas';
import { CodeMirrorEditor, CodeMirrorEditorHandle } from './CodeMirrorEditor';

interface EditorWorkspaceProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  content: string;
  lineCount: number;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  onContentChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onTextareaKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onCursorEvent?: (pos: { line: number; col: number; offset: number }) => void;
  isSlashMenuOpen: boolean;
  setIsSlashMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  slashSelectedIndex: number;
  slashQuery: string;
  onInsertSnippet: (snippet: string) => void;
  onToggleTask: (taskIndex: number, currentChecked: boolean) => void;
  // Studio & Action Callbacks for Mobile Toolbar
  onOpenOutline?: () => void;
  onOpenTableBuilder?: () => void;
  onOpenTemplates?: () => void;
  onOpenPdfStudio?: () => void;
  onOpenImageModal?: () => void;
  onExportMd?: () => void;
  onCopyMarkdown?: () => void;
  onOpenRevisions?: () => void;
  onClearContent?: () => void;
  // Find & Replace + Document Save props
  isFindOpen?: boolean;
  setIsFindOpen?: (open: boolean) => void;
  findMode?: 'find' | 'replace';
  title?: string;
  setTitle?: (title: string) => void;
  setContent?: (val: string) => void;
  executeSave?: (content: string, title: string) => void;
  queueAutoSave?: (content: string, title: string) => void;
  isSaved?: boolean;
  isSaving?: boolean;
  isOffline?: boolean;
  wordCount?: number;
  readingTime?: number | string;
  isTypewriterMode?: boolean;
  onToggleTypewriter?: () => void;
  isSprintActive?: boolean;
  wordsWrittenInSprint?: number;
  onOpenSprintPopover?: () => void;
  editorRef?: React.RefObject<CodeMirrorEditorHandle | null>;
  onKeyDown?: (e: KeyboardEvent) => boolean | void;
  onSlashTrigger?: (query: string, pos: number) => void;
  showLineNumbers?: boolean;
}

export const EditorWorkspace: React.FC<EditorWorkspaceProps> = React.memo(({
  viewMode,
  setViewMode,
  content,
  lineCount: _lineCount,
  textareaRef,
  onContentChange: _onContentChange,
  onTextareaKeyDown: _onTextareaKeyDown,
  onKeyDown,
  onCursorEvent,
  isSlashMenuOpen,
  setIsSlashMenuOpen,
  slashSelectedIndex,
  slashQuery,
  onInsertSnippet,
  onToggleTask,
  onOpenOutline,
  onOpenTableBuilder,
  onOpenTemplates,
  onOpenPdfStudio,
  onOpenImageModal,
  onExportMd,
  onCopyMarkdown,
  onOpenRevisions,
  onClearContent,
  isFindOpen = false,
  setIsFindOpen,
  findMode = 'find',
  title = 'Untitled Document.md',
  setTitle,
  setContent,
  executeSave,
  queueAutoSave,
  isSaved = true,
  isSaving = false,
  isOffline = false,
  wordCount = 0,
  readingTime = 1,
  isTypewriterMode = false,
  onToggleTypewriter,
  isSprintActive = false,
  wordsWrittenInSprint = 0,
  onOpenSprintPopover,
  editorRef,
  onSlashTrigger,
  showLineNumbers = false,
}) => {
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [isSyncScrollEnabled, setIsSyncScrollEnabled] = useState(true);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const isSyncingFromEditorRef = useRef(false);
  const isSyncingFromPreviewRef = useRef(false);

  // Reader Mode Eye-Comfort Appearance
  const {
    readerThemeClasses,
    readerFontClass,
    readerSizeClass,
    readerWidthClass,
    setReadingProgress,
  } = useReaderAppearance();

  // Instant non-blocking Markdown preview parsing via React 19 interruptible transition
  const deferredPreviewContent = React.useDeferredValue(content);

  // Synchronized Split-Pane Proportional Scrolling (Editor -> Preview)
  const handleEditorScroll = useCallback((_e: Event, scrollDOM: HTMLElement) => {
    if (!isSyncScrollEnabled || viewMode !== 'split') return;
    if (isSyncingFromPreviewRef.current) return;

    const preview = previewContainerRef.current;
    if (!preview) return;

    const maxEditor = scrollDOM.scrollHeight - scrollDOM.clientHeight;
    if (maxEditor <= 0) return;

    const ratio = scrollDOM.scrollTop / maxEditor;
    const maxPreview = preview.scrollHeight - preview.clientHeight;

    isSyncingFromEditorRef.current = true;
    preview.scrollTop = ratio * maxPreview;
    setTimeout(() => {
      isSyncingFromEditorRef.current = false;
    }, 60);
  }, [isSyncScrollEnabled, viewMode]);

  // Synchronized Split-Pane Proportional Scrolling (Preview -> Editor) & Read Mode Progress
  const handlePreviewScroll = useCallback(() => {
    const prev = previewContainerRef.current;
    if (!prev) return;

    // In Read Mode, calculate and track reading progress percentage
    if (viewMode === 'read') {
      const maxPrev = prev.scrollHeight - prev.clientHeight;
      const progress = maxPrev > 0 ? (prev.scrollTop / maxPrev) * 100 : 0;
      setReadingProgress(progress);
      return;
    }

    // In Split Mode: sync preview -> editor
    if (viewMode === 'split' && isSyncScrollEnabled) {
      if (isSyncingFromEditorRef.current) return;

      const maxPrev = prev.scrollHeight - prev.clientHeight;
      if (maxPrev <= 0) return;

      const ratio = prev.scrollTop / maxPrev;

      isSyncingFromPreviewRef.current = true;
      editorRef?.current?.scrollToRatio(ratio);
      setTimeout(() => {
        isSyncingFromPreviewRef.current = false;
      }, 60);
    }
  }, [viewMode, isSyncScrollEnabled, setReadingProgress, editorRef]);

  // Dedicated formatting helper that works directly with CodeMirror
  const insertFormatting = useCallback(
    (formatFn: (selected: string) => { text: string; selectOffset: number; selectLength: number }) => {
      if (editorRef?.current) {
        const selected = editorRef.current.getSelection();
        const { text, selectOffset, selectLength } = formatFn(selected);
        const start = editorRef.current.getSelectionStart();
        editorRef.current.replaceSelection(text);
        editorRef.current.setSelectionRange(start + selectOffset, start + selectOffset + selectLength);
        editorRef.current.focus();
        return;
      }

      const ta = textareaRef?.current;
      if (!ta) return;

      const savedScrollTop = ta.scrollTop;
      const start = ta.selectionStart ?? 0;
      const end = ta.selectionEnd ?? 0;
      const selected = content.substring(start, end);

      const { text, selectOffset, selectLength } = formatFn(selected);
      const nextContent = content.substring(0, start) + text + content.substring(end);

      // Programmatically update value via prototype setter so React picks up the change
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
      if (nativeSetter) {
        nativeSetter.call(ta, nextContent);
      } else {
        ta.value = nextContent;
      }
      ta.dispatchEvent(new Event('input', { bubbles: true }));

      // Immediately focus with preventScroll: true
      ta.focus({ preventScroll: true });
      const newStart = start + selectOffset;
      const newEnd = newStart + selectLength;
      ta.setSelectionRange(newStart, newEnd);
      ta.scrollTop = savedScrollTop;

      // Second frame protection for mobile virtual keyboard reflow
      requestAnimationFrame(() => {
        if (textareaRef?.current) {
          textareaRef.current.scrollTop = savedScrollTop;
        }
      });
    },
    [content, textareaRef, editorRef]
  );

  // Insert bold syntax at cursor without scroll jumping
  const handleInsertBold = useCallback(() => {
    insertFormatting((selected) => {
      if (selected) {
        return {
          text: `**${selected}**`,
          selectOffset: 2,
          selectLength: selected.length,
        };
      }
      return {
        text: `**bold text**`,
        selectOffset: 2,
        selectLength: 9,
      };
    });
  }, [insertFormatting]);

  // Insert link syntax at cursor without scroll jumping
  const handleInsertLink = useCallback(() => {
    insertFormatting((selected) => {
      if (selected) {
        return {
          text: `[${selected}](https://example.com)`,
          selectOffset: selected.length + 3,
          selectLength: 19,
        };
      }
      return {
        text: `[link text](https://example.com)`,
        selectOffset: 1,
        selectLength: 9,
      };
    });
  }, [insertFormatting]);

  // Determine visibility of editor and preview panes on mobile (< 768px) vs desktop (>= 768px)
  const isEditorVisibleOnMobile = viewMode === 'zen' || (viewMode === 'split' && mobileTab === 'edit');
  const isPreviewVisibleOnMobile = viewMode === 'read' || (viewMode === 'split' && mobileTab === 'preview');

  // Dedicated focused Writing Mode canvas (Bug 1 Fix & Writing Mode Redesign)
  if (viewMode === 'write') {
    return (
      <WritingModeCanvas
        title={title}
        setTitle={setTitle || (() => {})}
        content={content}
        setContent={setContent || (() => {})}
        executeSave={executeSave || (() => {})}
        queueAutoSave={queueAutoSave || (() => {})}
        isSaved={isSaved}
        isSaving={isSaving}
        isOffline={isOffline}
        wordCount={wordCount}
        readingTime={readingTime}
        isTypewriterMode={isTypewriterMode}
        onToggleTypewriter={onToggleTypewriter || (() => {})}
        isSprintActive={isSprintActive}
        wordsWrittenInSprint={wordsWrittenInSprint}
        onOpenSprintPopover={onOpenSprintPopover}
        onOpenOutline={onOpenOutline}
        onPasteImage={async (file) => {
          try {
            const stored = await storeOptimizedImage(file, file.name);
            onInsertSnippet(`\n${stored.markdownTag}\n`);
          } catch (err) {
            console.error('Failed to optimize pasted image:', err);
          }
        }}
        onDropImage={async (file) => {
          try {
            const stored = await storeOptimizedImage(file, file.name);
            onInsertSnippet(`\n${stored.markdownTag}\n`);
          } catch (err) {
            console.error('Failed to optimize dropped image:', err);
          }
        }}
        editorRef={editorRef}
        onKeyDown={onKeyDown}
        isSlashMenuOpen={isSlashMenuOpen}
        setIsSlashMenuOpen={setIsSlashMenuOpen}
        slashSelectedIndex={slashSelectedIndex}
        slashQuery={slashQuery}
        onInsertSnippet={onInsertSnippet}
        onSlashTrigger={onSlashTrigger}
      />
    );
  }

  return (
    <>
      {/* Floating Exit Zen Mode Button */}
      {viewMode === 'zen' && (
        <div className="fixed top-3 right-5 z-50 animate-in fade-in slide-in-from-top-1 duration-200 no-print">
          <button
            onClick={() => setViewMode('split')}
            className="px-3 py-1.5 rounded-full bg-neutral-900/85 hover:bg-neutral-900 text-white dark:bg-neutral-100/90 dark:hover:bg-white dark:text-neutral-950 text-xs font-semibold backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 select-none ring-1 ring-black/10 dark:ring-white/20"
            title="Exit Zen Mode (or press Esc)"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>
              Exit Zen <kbd className="font-mono text-[10px] bg-white/20 dark:bg-black/15 px-1 py-0.2 rounded ml-0.5">Esc</kbd>
            </span>
          </button>
        </div>
      )}

      {/* Mobile-Only Edit / Preview Segmented Tab Bar (< 768px) */}
      {viewMode === 'split' && (
        <div className="md:hidden flex items-center justify-center py-2 px-4 bg-neutral-100/90 dark:bg-neutral-900/90 border-b border-neutral-200 dark:border-neutral-800 select-none z-20">
          <div className="inline-flex rounded-xl bg-neutral-200/80 dark:bg-neutral-800 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setMobileTab('edit')}
              className={`px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                mobileTab === 'edit'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Edit Markdown</span>
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                mobileTab === 'preview'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Split / Single Pane Viewport */}
      <div className={`flex-1 flex overflow-hidden relative ${viewMode === 'read' ? 'pb-0' : 'pb-14 md:pb-0'}`}>
        {/* Left Pane: Editor */}
        <div
          className={`editor-pane-container flex-col h-full bg-neutral-50/70 dark:bg-[#18181c] text-neutral-800 dark:text-neutral-200 transition-colors ${
            viewMode === 'read' ? 'hidden' : 'flex'
          } ${
            viewMode === 'split'
              ? `w-full md:w-1/2 border-r border-neutral-200 dark:border-neutral-800 ${isEditorVisibleOnMobile ? 'flex' : 'hidden md:flex'}`
              : 'w-full'
          }`}
        >
          {/* Editor Sub-header Bar - Hidden on mobile (< md) to maximize writing area */}
          <div className="hidden md:flex px-4 py-2 bg-neutral-100/80 dark:bg-[#1e1e24] border-b border-neutral-200 dark:border-neutral-800 items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 select-none no-print transition-colors">
            <span className="flex items-center gap-1.5 font-medium text-neutral-700 dark:text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              <span>Raw Markdown</span>
            </span>

            <div className="flex items-center gap-2">
              {viewMode === 'split' && (
                <button
                  onClick={() => {
                    setIsSyncScrollEnabled((prev) => {
                      const next = !prev;
                      if (next && editorRef?.current && previewContainerRef.current) {
                        const ratio = editorRef.current.getScrollRatio();
                        const prevEl = previewContainerRef.current;
                        const maxPrev = prevEl.scrollHeight - prevEl.clientHeight;
                        if (maxPrev > 0) {
                          prevEl.scrollTop = ratio * maxPrev;
                        }
                      }
                      return next;
                    });
                  }}
                  className={`px-2 py-0.5 rounded border text-[11px] font-mono flex items-center gap-1 cursor-pointer transition-colors shadow-2xs ${
                    isSyncScrollEnabled
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-400 border-neutral-200 dark:border-neutral-700 opacity-60'
                  }`}
                  title={isSyncScrollEnabled ? 'Synchronized Scrolling: ON' : 'Synchronized Scrolling: OFF'}
                >
                  <ArrowUpDown className="w-3 h-3" />
                  <span className="hidden xl:inline">Sync Scroll</span>
                </button>
              )}
            </div>
          </div>

          {/* Virtualized Document Editor (Bug 1: 5500 LOC Fix) */}
          <div
            className={`flex-1 flex overflow-hidden relative ${
              viewMode === 'zen' ? 'max-w-4xl mx-auto w-full' : ''
            }`}
          >
            <CodeMirrorEditor
              value={content}
              onChange={(newVal) => {
                setContent?.(newVal);
                queueAutoSave?.(newVal, title);
              }}
              onCursorChange={(pos) => {
                onCursorEvent?.(pos);
              }}
              onSlashTrigger={(query, pos) => {
                onSlashTrigger?.(query, pos);
              }}
              onScroll={handleEditorScroll}
              isTypewriterMode={isTypewriterMode}
              showLineNumbers={showLineNumbers}
              placeholder="Start writing here... (Type / for shortcuts, drag & drop or paste images)"
              onPasteImage={async (file) => {
                try {
                  const stored = await storeOptimizedImage(file, file.name);
                  onInsertSnippet(`\n${stored.markdownTag}\n`);
                } catch (err) {
                  console.error('Failed to optimize pasted image:', err);
                }
              }}
              onDropImage={async (file) => {
                try {
                  const stored = await storeOptimizedImage(file, file.name);
                  onInsertSnippet(`\n${stored.markdownTag}\n`);
                } catch (err) {
                  console.error('Failed to optimize dropped image:', err);
                }
              }}
              editorRef={editorRef}
              onKeyDown={onKeyDown}
              className="flex-1 w-full"
            />

            {/* Floating Find & Replace Palette */}
            {isFindOpen && (
              <FindReplaceBar
                isOpen={isFindOpen}
                onClose={() => setIsFindOpen?.(false)}
                textareaRef={textareaRef}
                editorRef={editorRef}
                content={content}
                setContent={setContent || (() => {})}
                executeSave={executeSave || (() => {})}
                title={title}
                initialMode={findMode}
              />
            )}

            {/* Slash Command Palette */}
            <SlashCommandMenu
              isOpen={isSlashMenuOpen}
              selectedIndex={slashSelectedIndex}
              searchQuery={slashQuery}
              onSelect={onInsertSnippet}
              onClose={() => setIsSlashMenuOpen(false)}
            />
          </div>
        </div>

        {/* Right Pane: Live Rendered Preview or Dedicated Reader Canvas */}
        <div
          ref={previewContainerRef}
          onScroll={handlePreviewScroll}
          className={`preview-pane-container flex-col h-full min-h-0 overflow-y-auto overflow-x-hidden transition-colors duration-200 ${
            viewMode === 'read'
              ? `w-full flex ${readerThemeClasses}`
              : `bg-white dark:bg-neutral-950 ${viewMode === 'zen' ? 'hidden' : 'flex'} ${
                  viewMode === 'split'
                    ? `w-full md:w-1/2 ${isPreviewVisibleOnMobile ? 'flex' : 'hidden md:flex'}`
                    : 'w-full'
                }`
          }`}
        >
          {/* Preview Sub-header - Only displayed in Split mode (hidden in Read mode) */}
          {viewMode === 'split' && (
            <div className="hidden md:flex px-5 py-2 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 items-center justify-between text-xs text-neutral-500 select-none no-print">
              <span className="flex items-center gap-1.5 font-semibold text-neutral-700 dark:text-neutral-300">
                <Columns className="w-3.5 h-3.5" />
                <span>Live Rendered Preview</span>
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                GFM + KaTeX Math + Highlights
              </span>
            </div>
          )}

          {/* Rendered Document Canvas */}
          <div
            className={`flex-1 transition-all duration-150 break-words min-h-0 max-w-full ${
              viewMode === 'read'
                ? `px-6 sm:px-10 pb-28 ${readerWidthClass} ${readerFontClass} ${readerSizeClass}`
                : 'p-8 sm:p-10'
            }`}
          >
            {/* Elegant Editorial Article Header in Read Mode */}
            {viewMode === 'read' && (
              <ReaderArticleHeader
                title={title}
                readingStats={{
                  words: wordCount,
                  readingTime: typeof readingTime === 'number' ? `${readingTime} min read` : String(readingTime),
                }}
              />
            )}

            <MarkdownPreview 
              content={deferredPreviewContent} 
              onToggleTask={onToggleTask}
              className={viewMode === 'read' ? `${readerFontClass} ${readerSizeClass}` : undefined}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Accessory Toolbar - Hidden in Read mode */}
      {viewMode !== 'read' && (
        <MobileEditorToolbar
          onInsertBold={handleInsertBold}
          onInsertLink={handleInsertLink}
          onOpenImageModal={onOpenImageModal || (() => {})}
          onTriggerSlash={() => setIsSlashMenuOpen((prev) => !prev)}
          onOpenOutline={onOpenOutline || (() => {})}
          onOpenTableBuilder={onOpenTableBuilder || (() => {})}
          onOpenTemplates={onOpenTemplates || (() => {})}
          onOpenPdfStudio={onOpenPdfStudio || (() => {})}
          onExportMd={onExportMd || (() => {})}
          onCopyMarkdown={onCopyMarkdown || (() => {})}
          onOpenRevisions={onOpenRevisions || (() => {})}
          onClearContent={onClearContent || (() => {})}
        />
      )}

      {/* 60FPS Hardware-Accelerated Editor Typing FX Overlay */}
      <EditorWritingFx textareaRef={textareaRef} editorRef={editorRef} />
    </>
  );
});

EditorWorkspace.displayName = 'EditorWorkspace';
