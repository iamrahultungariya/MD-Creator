import React from 'react';
import { Columns } from 'lucide-react';
import { ViewMode } from '../types';
import { ReaderArticleHeader } from './ReaderArticleHeader';
import { MarkdownPreview } from '../../../components/editor/MarkdownPreview';

interface EditorPreviewPaneProps {
  previewContainerRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  viewMode: ViewMode;
  readerThemeClasses: string;
  readerWidthClass: string;
  readerFontClass: string;
  readerSizeClass: string;
  isPreviewVisibleOnMobile: boolean;
  title: string;
  wordCount?: number;
  readingTime?: number | string;
  deferredPreviewContent: string;
  onToggleTask: (taskIndex: number, currentChecked: boolean) => void;
  onUpdateContent?: (newContent: string) => void;
}

export const EditorPreviewPane: React.FC<EditorPreviewPaneProps> = ({
  previewContainerRef,
  onScroll,
  viewMode,
  readerThemeClasses,
  readerWidthClass,
  readerFontClass,
  readerSizeClass,
  isPreviewVisibleOnMobile,
  title,
  wordCount,
  readingTime,
  deferredPreviewContent,
  onToggleTask,
  onUpdateContent,
}) => {
  return (
    <div
      ref={previewContainerRef}
      onScroll={onScroll}
      className={`preview-pane-container flex-col h-full min-h-0 overflow-y-auto overflow-x-hidden transition-colors duration-200 ${
        viewMode === 'read'
          ? `w-full flex ${readerThemeClasses}`
          : `bg-white dark:bg-neutral-950 flex ${
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
            ? `px-3.5 sm:px-8 md:px-10 pb-20 sm:pb-28 ${readerWidthClass} ${readerFontClass} ${readerSizeClass}`
            : 'p-4 sm:p-8 md:p-10'
        }`}
      >
        {/* Editorial Article Header in Read Mode */}
        {viewMode === 'read' && (
          <ReaderArticleHeader
            title={title}
            readingStats={{
              words: wordCount ?? 0,
              readingTime: typeof readingTime === 'number' ? `${readingTime} min read` : String(readingTime),
            }}
          />
        )}

        <MarkdownPreview
          content={deferredPreviewContent}
          onToggleTask={onToggleTask}
          onUpdateContent={onUpdateContent}
          className={viewMode === 'read' ? `${readerFontClass} ${readerSizeClass}` : undefined}
        />
      </div>
    </div>
  );
};
