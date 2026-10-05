import React, { useState, useCallback } from 'react';
import { PenTool, Eye, ArrowUpDown } from 'lucide-react';
import { ViewMode } from '../types';
import { SlashCommandMenu } from '../../../components/editor/SlashCommandMenu';
import { MobileEditorToolbar } from './MobileEditorToolbar';
import { storeOptimizedImage } from '../../../services/imageStorageService';
import { FindReplaceBar } from './FindReplaceBar';
import { useReaderAppearance } from '../hooks/useReaderAppearance';
import { WritingModeCanvas } from './WritingModeCanvas';
import { CodeMirrorEditor, CodeMirrorEditorHandle } from './CodeMirrorEditor';
import { EditorPreviewPane } from './EditorPreviewPane';
import { useEditorWorkspaceSyncScroll } from '../hooks/useEditorWorkspaceSyncScroll';

const PresentationView = React.lazy(() =>
  import('../../presentation/PresentationView').then((m) => ({ default: m.PresentationView }))
);

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
  isSprintActive?: boolean;
  wordsWrittenInSprint?: number;
  onOpenSprintPopover?: () => void;
  editorRef?: React.RefObject<CodeMirrorEditorHandle | null>;
  onKeyDown?: (e: KeyboardEvent) => boolean | void;
  onSlashTrigger?: (query: string, pos: number) => void;
  showLineNumbers?: boolean;
  mobileTab?: 'edit' | 'preview';
  onSelectMobileTab?: (tab: 'edit' | 'preview') => void;
  onToast?: (message: string) => void;
  onVimModeChange?: (mode: 'NORMAL' | 'INSERT' | 'VISUAL' | 'REPLACE') => void;
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
  isSprintActive = false,
  wordsWrittenInSprint = 0,
  onOpenSprintPopover,
  editorRef,
  onSlashTrigger,
  showLineNumbers = false,
  mobileTab: propMobileTab,
  onSelectMobileTab,
  onToast,
  onVimModeChange,
}) => {
  const [internalMobileTab, setInternalMobileTab] = useState<'edit' | 'preview'>('edit');
  const mobileTab = propMobileTab !== undefined ? propMobileTab : internalMobileTab;
  const setMobileTab = onSelectMobileTab || setInternalMobileTab;
  // Reader Mode Eye-Comfort Appearance
  const {
    readerThemeClasses,
    readerFontClass,
    readerSizeClass,
    readerWidthClass,
    setReadingProgress,
    isReaderDark,
  } = useReaderAppearance();

  // Proportional Split-Pane Scrolling & Task/Content Edit Scroll Locks
  const {
    isSyncScrollEnabled,
    setIsSyncScrollEnabled,
    previewContainerRef,
    handleEditorScroll,
    handlePreviewScroll,
    handleToggleTaskWithScrollLock,
    handlePreviewContentUpdate,
  } = useEditorWorkspaceSyncScroll({
    viewMode,
    editorRef,
    setReadingProgress,
    onToggleTask,
    setContent,
    queueAutoSave,
    title,
  });

  // Instant non-blocking Markdown preview parsing via React 19 interruptible transition
  const deferredPreviewContent = React.useDeferredValue(content);

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

  // Insert highlight syntax at cursor without scroll jumping
  const handleInsertHighlight = useCallback(() => {
    insertFormatting((selected) => {
      if (selected) {
        return {
          text: `==${selected}==`,
          selectOffset: 2,
          selectLength: selected.length,
        };
      }
      return {
        text: `==highlighted text==`,
        selectOffset: 2,
        selectLength: 16,
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
  const isEditorVisibleOnMobile = viewMode === 'split' && mobileTab === 'edit';
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
        onToast={onToast}
      />
    );
  }

  if (viewMode === 'present') {
    return (
      <React.Suspense fallback={<div className="fixed inset-0 bg-neutral-950 flex items-center justify-center text-neutral-400 font-mono text-xs">Loading presentation slides...</div>}>
        <PresentationView
          content={content}
          title={title}
          onExit={() => setViewMode('split')}
        />
      </React.Suspense>
    );
  }

  return (
    <>
      {/* Mobile-Only Edit / Preview Segmented Tab Bar (< 768px) */}
      {viewMode === 'split' && (
        <div className="md:hidden flex items-center justify-center py-2 px-4 bg-neutral-100/90 dark:bg-neutral-900/90 border-b border-neutral-200 dark:border-neutral-800 select-none z-20">
          <div className="inline-flex rounded-lg bg-neutral-200/80 dark:bg-neutral-800 p-0.5 text-xs font-sans font-medium">
            <button
              onClick={() => setMobileTab('edit')}
              className={`px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                mobileTab === 'edit'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <PenTool className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Edit Markdown</span>
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                mobileTab === 'preview'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
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
          <div className="hidden md:flex px-4 py-2 bg-neutral-100/80 dark:bg-[#1e1e24] border-b border-neutral-200 dark:border-neutral-800 items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 select-none no-print transition-colors font-sans">
            <span className="flex items-center gap-2 font-medium text-neutral-700 dark:text-neutral-300">
              <span className="w-2 h-2 rounded-xs bg-emerald-500 dark:bg-emerald-400" />
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
                  className={`px-2.5 py-1 rounded-md border text-xs font-sans font-medium flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs ${
                    isSyncScrollEnabled
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border-brand-200 dark:border-brand-800/80 font-semibold'
                      : 'bg-white dark:bg-neutral-800/80 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:text-neutral-900 dark:hover:text-white'
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
          <div className="flex-1 flex overflow-hidden relative">
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
              onToast={onToast}
              onVimModeChange={onVimModeChange}
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
              caretCoords={isSlashMenuOpen && editorRef?.current ? editorRef.current.getCaretCoords() : null}
            />
          </div>
        </div>

        {/* Right Pane: Live Rendered Preview or Dedicated Reader Canvas */}
        <EditorPreviewPane
          previewContainerRef={previewContainerRef}
          onScroll={handlePreviewScroll}
          viewMode={viewMode}
          readerThemeClasses={readerThemeClasses}
          readerWidthClass={readerWidthClass}
          readerFontClass={readerFontClass}
          readerSizeClass={readerSizeClass}
          isReaderDark={isReaderDark}
          isPreviewVisibleOnMobile={isPreviewVisibleOnMobile}
          title={title}
          wordCount={wordCount}
          readingTime={readingTime}
          deferredPreviewContent={deferredPreviewContent}
          onToggleTask={handleToggleTaskWithScrollLock}
          onUpdateContent={viewMode === 'read' ? undefined : handlePreviewContentUpdate}
        />
      </div>

      {/* Mobile Sticky Bottom Accessory Toolbar - Hidden in Read mode */}
      {viewMode !== 'read' && (
        <MobileEditorToolbar
          onInsertBold={handleInsertBold}
          onInsertHighlight={handleInsertHighlight}
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
    </>
  );
});

EditorWorkspace.displayName = 'EditorWorkspace';
