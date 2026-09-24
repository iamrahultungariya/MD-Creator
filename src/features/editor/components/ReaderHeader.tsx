import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  PenTool, 
  ListTree, 
  Type, 
  Maximize2, 
  Minimize2, 
  Printer, 
  Columns,
  BookOpen,
  Clock,
  Sun,
  Moon
} from 'lucide-react';
import { ViewMode } from '../types';
import { useReaderSettingsStore } from '../../../stores/useReaderSettingsStore';
import { useThemeStore } from '../../../stores/useThemeStore';
import { ReaderAppearancePopover } from './ReaderAppearancePopover';

interface ReaderHeaderProps {
  title: string;
  wordCount: number;
  readingTime: number | string;
  headingsCount: number;
  onOpenOutline: () => void;
  onOpenPdfStudio?: () => void;
  setViewMode: (mode: ViewMode) => void;
}

export const ReaderHeader: React.FC<ReaderHeaderProps> = ({
  title,
  wordCount,
  readingTime,
  headingsCount,
  onOpenOutline,
  onOpenPdfStudio,
  setViewMode,
}) => {
  const navigate = useNavigate();
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const { readingProgress, isFullscreen, toggleFullscreen } = useReaderSettingsStore();
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <header className="relative h-14 sm:h-15 border-b border-neutral-200/70 dark:border-neutral-800/80 px-3 sm:px-6 flex items-center justify-between bg-white/95 dark:bg-[#15161a]/95 backdrop-blur-md select-none z-30 transition-colors no-print">
      {/* 2px Reading Progress Line at Top */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-neutral-100 dark:bg-neutral-800 pointer-events-none overflow-hidden">
        <div 
          className="h-full bg-neutral-900 dark:bg-neutral-100 transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Left: Exit to Editor & Document Info */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={() => setViewMode('split')}
          className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
          title="Exit to Editor Workspace (Esc)"
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Editor</span>
          <span className="hidden md:inline text-[10px] text-neutral-400 font-mono">Esc</span>
        </button>

        <button
          onClick={() => navigate('/documents')}
          className="p-1.5 sm:p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-xs font-medium cursor-pointer shrink-0"
          title="Library / Documents"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="hidden sm:block h-4 w-px bg-neutral-200 dark:border-neutral-800 shrink-0" />

        {/* Title */}
        <div className="min-w-0 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-neutral-400 shrink-0 hidden xs:block" />
          <h1 className="font-bold text-xs sm:text-sm text-neutral-950 dark:text-white truncate max-w-[130px] xs:max-w-[200px] sm:max-w-xs md:max-w-md">
            {title || 'Untitled Document'}
          </h1>
        </div>
      </div>

      {/* Center: Reading Telemetry & Percentage */}
      <div className="hidden md:flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-neutral-400" />
          <span className="font-medium">
            {typeof readingTime === 'number' ? `${readingTime} min read` : readingTime}
          </span>
        </div>
        <span className="text-neutral-300 dark:text-neutral-700">•</span>
        <span className="font-mono text-[11px]">{wordCount.toLocaleString()} words</span>
        <span className="text-neutral-300 dark:text-neutral-700">•</span>
        <div className="flex items-center gap-1 font-mono text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
          <span>{readingProgress}%</span>
          <span className="text-[10px] text-neutral-400 font-normal">read</span>
        </div>
      </div>

      {/* Right: Reading Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative">
        {/* Table of Contents / Outline */}
        <button
          onClick={onOpenOutline}
          className="px-2.5 py-1.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          title="Document Outline & Table of Contents"
        >
          <ListTree className="w-3.5 h-3.5 text-neutral-500" />
          <span className="hidden sm:inline">Outline</span>
          {headingsCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-neutral-200/60 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
              {headingsCount}
            </span>
          )}
        </button>

        {/* Reading Appearance Settings (Aa) */}
        <button
          onClick={() => setIsAppearanceOpen((prev) => !prev)}
          className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
            isAppearanceOpen
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-neutral-900 dark:border-white shadow-xs'
              : 'border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
          }`}
          title="Customize Reading Appearance (Theme, Font, Size, Width)"
        >
          <Type className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Aa</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl text-neutral-500 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer hidden xs:flex items-center justify-center"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Reader'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Print / PDF Studio */}
        {onOpenPdfStudio && (
          <button
            onClick={onOpenPdfStudio}
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer hidden sm:flex items-center justify-center"
            title="Export / Print Clean Document"
          >
            <Printer className="w-4 h-4" />
          </button>
        )}

        {/* Split View Quick Switch */}
        <button
          onClick={() => setViewMode('split')}
          className="p-2 rounded-xl text-neutral-500 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer flex items-center justify-center"
          title="Switch to Split View"
        >
          <Columns className="w-4 h-4" />
        </button>

        {/* Theme Toggle (Sync with App Light / Dark) */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-xl text-neutral-500 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer flex items-center justify-center"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? <Sun className="w-4 h-4 text-neutral-400 hover:text-neutral-100" /> : <Moon className="w-4 h-4 text-neutral-600 hover:text-neutral-900" />}
        </button>

        {/* Appearance Popover Floating Dropdown */}
        <ReaderAppearancePopover
          isOpen={isAppearanceOpen}
          onClose={() => setIsAppearanceOpen(false)}
        />
      </div>
    </header>
  );
};
