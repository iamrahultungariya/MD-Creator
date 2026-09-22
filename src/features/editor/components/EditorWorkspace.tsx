import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Columns, Minimize2, UploadCloud, PenTool, Eye, ArrowUpDown } from 'lucide-react';
import { ViewMode } from '../types';
import { SlashCommandMenu } from '../../../components/editor/SlashCommandMenu';
import { MarkdownPreview } from '../../../components/editor/MarkdownPreview';
import { EditorWritingFx } from '../../../components/editor/EditorWritingFx';
import { MobileEditorToolbar } from './MobileEditorToolbar';
import { storeOptimizedImage } from '../../../services/imageStorageService';
import { FindReplaceBar } from './FindReplaceBar';

const LINE_HEIGHT = 24; // Standardized pixel line-height for exact 1:1 gutter-to-text alignment

interface EditorWorkspaceProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  content: string;
  lineCount: number;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onTextareaKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onCursorEvent: () => void;
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
  setContent?: (val: string) => void;
  executeSave?: (content: string, title: string) => void;
  isTypewriterMode?: boolean;
}

export const EditorWorkspace: React.FC<EditorWorkspaceProps> = React.memo(({
  viewMode,
  setViewMode,
  content,
  lineCount,
  textareaRef,
  onContentChange,
  onTextareaKeyDown,
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
  setContent,
  executeSave,
  isTypewriterMode = false,
}) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [isSyncScrollEnabled, setIsSyncScrollEnabled] = useState(true);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const isSyncingScrollRef = useRef(false);
  const [scrollTop, setScrollTop] = useState(0);

  // Debounce content passed to MarkdownPreview to decouple heavy AST parsing from 60FPS typing
  const [debouncedContent, setDebouncedContent] = useState(content);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setDebouncedContent(content);
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedContent(content);
    }, 200);

    return () => clearTimeout(timer);
  }, [content]);

  // Synchronized Scrolling: Textarea -> Gutter & Preview
  const handleTextareaScroll = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;

    // 1. Sync line number gutter scroll & virtual window
    if (gutterRef.current) {
      gutterRef.current.scrollTop = ta.scrollTop;
    }
    setScrollTop(ta.scrollTop);

    // 2. Synchronized Split-Pane Proportional Scrolling (Editor -> Preview)
    if (isSyncScrollEnabled && viewMode === 'split' && !isSyncingScrollRef.current) {
      const prev = previewContainerRef.current;
      if (prev) {
        isSyncingScrollRef.current = true;
        const maxTa = ta.scrollHeight - ta.clientHeight;
        if (maxTa > 0) {
          const ratio = ta.scrollTop / maxTa;
          const maxPrev = prev.scrollHeight - prev.clientHeight;
          prev.scrollTop = ratio * maxPrev;
        }
        requestAnimationFrame(() => {
          isSyncingScrollRef.current = false;
        });
      }
    }
  }, [isSyncScrollEnabled, viewMode, textareaRef]);

  // Virtualized line numbers calculation (renders ~50 DOM elements max, regardless of line count)
  const visibleLineSlice = useMemo(() => {
    const clientHeight = textareaRef.current?.clientHeight || 800;
    const startIndex = Math.max(0, Math.floor(scrollTop / LINE_HEIGHT) - 10);
    const endIndex = Math.min(lineCount, Math.ceil((scrollTop + clientHeight) / LINE_HEIGHT) + 10);
    const lines: number[] = [];
    for (let i = startIndex; i < endIndex; i++) {
      lines.push(i + 1);
    }
    return {
      startIndex,
      endIndex,
      lines,
      topOffset: startIndex * LINE_HEIGHT,
      totalHeight: Math.max(lineCount * LINE_HEIGHT, clientHeight),
    };
  }, [scrollTop, lineCount, textareaRef]);

  // Synchronized Split-Pane Proportional Scrolling (Preview -> Editor)
  const handlePreviewScroll = useCallback(() => {
    if (!isSyncScrollEnabled || viewMode !== 'split' || isSyncingScrollRef.current) return;
    const ta = textareaRef.current;
    const prev = previewContainerRef.current;
    if (!ta || !prev) return;

    isSyncingScrollRef.current = true;
    const maxPrev = prev.scrollHeight - prev.clientHeight;
    if (maxPrev > 0) {
      const ratio = prev.scrollTop / maxPrev;
      const maxTa = ta.scrollHeight - ta.clientHeight;
      ta.scrollTop = ratio * maxTa;
    }
    requestAnimationFrame(() => {
      isSyncingScrollRef.current = false;
    });
  }, [isSyncScrollEnabled, viewMode, textareaRef]);

  // Dedicated formatting helper that preserves scroll position and prevents mobile focus jumping
  const insertFormatting = useCallback(
    (formatFn: (selected: string) => { text: string; selectOffset: number; selectLength: number }) => {
      const ta = textareaRef.current;
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
        if (textareaRef.current) {
          textareaRef.current.scrollTop = savedScrollTop;
        }
      });
    },
    [content, textareaRef]
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

  // Handle direct clipboard paste (Ctrl+V) of screenshots or image files
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          try {
            const stored = await storeOptimizedImage(file, 'pasted-image.png');
            onInsertSnippet(`\n${stored.markdownTag}\n`);
          } catch (err) {
            console.error('Failed to optimize pasted image:', err);
          }
          return;
        }
      }
    }
  };

  // Handle direct file drag & drop onto the editor
  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        setIsDraggingOver(false);
        try {
          const stored = await storeOptimizedImage(file, file.name);
          onInsertSnippet(`\n${stored.markdownTag}\n`);
        } catch (err) {
          console.error('Failed to optimize dropped image:', err);
        }
        return;
      }
    }
    setIsDraggingOver(false);
  };

  // Determine visibility of editor and preview panes on mobile (< 768px) vs desktop (>= 768px)
  const isEditorVisibleOnMobile = viewMode === 'write' || viewMode === 'zen' || (viewMode === 'split' && mobileTab === 'edit');
  const isPreviewVisibleOnMobile = viewMode === 'read' || (viewMode === 'split' && mobileTab === 'preview');

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
      <div className="flex-1 flex overflow-hidden relative pb-14 md:pb-0">
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
                  onClick={() => setIsSyncScrollEnabled((prev) => !prev)}
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

          {/* Textarea Area with Virtualized Gutter Line Numbers */}
          <div
            className={`flex-1 flex overflow-hidden relative ${
              viewMode === 'write' || viewMode === 'zen' ? 'max-w-4xl mx-auto w-full' : ''
            }`}
          >
            {/* Virtualized Line Numbers Gutter: Renders only visible ~50 DOM nodes, zero lag past line 28 */}
            <div
              ref={gutterRef}
              className={`hidden sm:block select-none overflow-hidden text-right font-mono-code text-xs text-neutral-400 dark:text-neutral-600 transition-all ${
                lineCount >= 10000 ? 'w-16 pr-3 pl-2' : lineCount >= 1000 ? 'w-14 pr-3 pl-2' : 'w-12 pr-3 pl-2'
              } ${isTypewriterMode ? 'pt-[25vh] pb-[50vh]' : 'py-6'}`}
              style={{ scrollbarWidth: 'none' }}
              aria-hidden="true"
            >
              <div style={{ height: `${visibleLineSlice.totalHeight}px`, position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: `${visibleLineSlice.topOffset}px`,
                    left: 0,
                    right: 0,
                  }}
                >
                  {visibleLineSlice.lines.map((num) => (
                    <div
                      key={num}
                      style={{ height: `${LINE_HEIGHT}px`, lineHeight: `${LINE_HEIGHT}px` }}
                      className="tabular-nums"
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Markdown Input Area */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={onContentChange}
              onKeyDown={onTextareaKeyDown}
              onKeyUp={onCursorEvent}
              onClick={onCursorEvent}
              onScroll={handleTextareaScroll}
              onPaste={handlePaste}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              placeholder="Start writing here... (Type / for shortcuts, drag & drop or paste images)"
              style={{ lineHeight: `${LINE_HEIGHT}px`, tabSize: 2 }}
              className={`flex-1 w-full p-6 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 font-mono-code text-sm resize-none focus:outline-none overflow-y-auto transition-all ${
                isTypewriterMode ? 'pt-[25vh] pb-[50vh]' : ''
              }`}
              autoFocus
            />

            {/* Floating Find & Replace Palette */}
            {isFindOpen && (
              <FindReplaceBar
                isOpen={isFindOpen}
                onClose={() => setIsFindOpen?.(false)}
                textareaRef={textareaRef}
                content={content}
                setContent={setContent || (() => {})}
                executeSave={executeSave || (() => {})}
                title={title}
                initialMode={findMode}
              />
            )}

            {/* Drag & Drop Visual Overlay */}
            {isDraggingOver && (
              <div className="absolute inset-0 z-40 bg-blue-600/10 dark:bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-xl backdrop-blur-xs flex flex-col items-center justify-center pointer-events-none p-6 text-center animate-in fade-in duration-150">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 shadow-md">
                  <UploadCloud className="w-7 h-7 animate-bounce" />
                </div>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">
                  Drop image to optimize & embed
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs">
                  Automatically compressed to WebP with bicubic smoothing for 100% offline persistence.
                </p>
              </div>
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

        {/* Right Pane: Live Rendered Preview with Proportional Synchronized Scroll */}
        <div
          ref={previewContainerRef}
          onScroll={handlePreviewScroll}
          className={`preview-pane-container flex-col h-full bg-white dark:bg-neutral-950 overflow-y-auto transition-all ${
            viewMode === 'write' || viewMode === 'zen' ? 'hidden' : 'flex'
          } ${
            viewMode === 'split'
              ? `w-full md:w-1/2 ${isPreviewVisibleOnMobile ? 'flex' : 'hidden md:flex'}`
              : 'w-full'
          }`}
        >
          {/* Preview Sub-header - Hidden on mobile (< md) to maximize preview height */}
          <div className="hidden md:flex px-5 py-2 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 items-center justify-between text-xs text-neutral-500 select-none no-print">
            <span className="flex items-center gap-1.5 font-semibold text-neutral-700 dark:text-neutral-300">
              <Columns className="w-3.5 h-3.5" />
              <span>Live Rendered Preview</span>
              {content !== debouncedContent && (
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-mono font-medium ml-2 animate-in fade-in duration-150">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  updating...
                </span>
              )}
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">
              GFM + KaTeX Math + Highlights
            </span>
          </div>

          {/* Rendered Preview Document */}
          <div
            className={`flex-1 p-8 sm:p-10 ${
              viewMode === 'read' ? 'max-w-3xl mx-auto w-full' : ''
            }`}
          >
            <MarkdownPreview 
              content={debouncedContent} 
              onToggleTask={onToggleTask} 
            />
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Accessory Toolbar */}
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

      {/* 60FPS Hardware-Accelerated Editor Typing FX Overlay */}
      <EditorWritingFx textareaRef={textareaRef} />
    </>
  );
});

EditorWorkspace.displayName = 'EditorWorkspace';
