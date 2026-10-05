import React, { useState, useMemo } from 'react';
import { 
  PenTool, 
  ListTree, 
  Type, 
  Maximize2, 
  Minimize2, 
  Printer, 
  Columns,
  BookOpen,
  Clock
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
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const readerTheme = useReaderSettingsStore((s) => s.theme);
  const readingProgress = useReaderSettingsStore((s) => s.readingProgress);
  const isFullscreen = useReaderSettingsStore((s) => s.isFullscreen);
  const toggleFullscreen = useReaderSettingsStore((s) => s.toggleFullscreen);
  const isDark = useThemeStore((s) => s.isDark);

  const themeStyles = useMemo(() => {
    switch (readerTheme) {
      case 'sepia':
        return isDark
          ? {
              header: 'bg-[#27211C]/95 border-[#3E342B] text-[#E2CBB7]',
              progressTrack: 'bg-[#3E342B]',
              progressFill: 'bg-[#D4BCA4]',
              btnDefault: 'bg-[#362E27] hover:bg-[#433930] text-[#E2CBB7] border-[#4D4135]',
              btnAction: 'border-[#3E342B] hover:bg-[#362E27] text-[#E2CBB7]',
              badge: 'bg-[#362E27] text-[#E2CBB7]',
              title: 'text-[#F5E6D8]',
              muted: 'text-[#B09985]',
              divider: 'bg-[#3E342B]',
            }
          : {
              header: 'bg-[#FBF0D9]/95 border-[#EADBC3] text-[#382E25]',
              progressTrack: 'bg-[#EFE0C3]',
              progressFill: 'bg-[#5D4632]',
              btnDefault: 'bg-[#F2E4C6] hover:bg-[#E8D6B2] text-[#382E25] border-[#DFCDA7]',
              btnAction: 'border-[#EADBC3] hover:bg-[#F2E4C6] text-[#382E25]',
              badge: 'bg-[#F2E4C6] text-[#382E25]',
              title: 'text-[#2C231B]',
              muted: 'text-[#7D6B5A]',
              divider: 'bg-[#EADBC3]',
            };
      case 'slate': // Nordic Slate / Blue
        return isDark
          ? {
              header: 'bg-[#1E2530]/95 border-[#2C3646] text-[#CBD5E1]',
              progressTrack: 'bg-[#2C3646]',
              progressFill: 'bg-[#60A5FA]',
              btnDefault: 'bg-[#283241] hover:bg-[#333F53] text-[#CBD5E1] border-[#37445A]',
              btnAction: 'border-[#2C3646] hover:bg-[#283241] text-[#CBD5E1]',
              badge: 'bg-[#283241] text-[#CBD5E1]',
              title: 'text-white',
              muted: 'text-[#94A3B8]',
              divider: 'bg-[#2C3646]',
            }
          : {
              header: 'bg-[#F1F5F9]/95 border-[#CBD5E1] text-[#1E293B]',
              progressTrack: 'bg-[#E2E8F0]',
              progressFill: 'bg-[#2563EB]',
              btnDefault: 'bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#1E293B] border-[#CBD5E1]',
              btnAction: 'border-[#CBD5E1] hover:bg-[#E2E8F0] text-[#1E293B]',
              badge: 'bg-[#E2E8F0] text-[#1E293B]',
              title: 'text-[#0F172A]',
              muted: 'text-[#64748B]',
              divider: 'bg-[#CBD5E1]',
            };
      case 'midnight':
        return {
          header: 'bg-[#0B0C0E]/95 border-[#26262B] text-neutral-300',
          progressTrack: 'bg-[#181A20]',
          progressFill: 'bg-[#9E7EFF]',
          btnDefault: 'bg-[#16181D] hover:bg-[#22252D] text-neutral-200 border-[#26262B]',
          btnAction: 'border-[#26262B] hover:bg-[#16181D] text-neutral-300',
          badge: 'bg-[#16181D] text-neutral-300',
          title: 'text-white',
          muted: 'text-neutral-400',
          divider: 'bg-[#26262B]',
        };
      case 'default':
      default:
        return isDark
          ? {
              header: 'bg-[#0E0B14]/95 border-[#2A2338] text-[#EDEAF5]',
              progressTrack: 'bg-[#1D1829]',
              progressFill: 'bg-[#9E7EFF]',
              btnDefault: 'bg-[#1D1829] hover:bg-[#2A2338] text-[#EDEAF5] border-[#2A2338]',
              btnAction: 'border-[#2A2338] hover:bg-[#1D1829] text-[#EDEAF5]',
              badge: 'bg-[#1D1829] text-[#EDEAF5]',
              title: 'text-white',
              muted: 'text-[#9A93AD]',
              divider: 'bg-[#2A2338]',
            }
          : {
              header: 'bg-[#FBFAFD]/95 border-[#E7E3F0] text-[#1B1626]',
              progressTrack: 'bg-[#F3F0F9]',
              progressFill: 'bg-[#8257F5]',
              btnDefault: 'bg-[#F3F0F9] hover:bg-[#E7E3F0] text-[#1B1626] border-[#E7E3F0]',
              btnAction: 'border-[#E7E3F0] hover:bg-[#F3F0F9] text-[#1B1626]',
              badge: 'bg-[#F3F0F9] text-[#1B1626]',
              title: 'text-[#1B1626]',
              muted: 'text-[#6B6480]',
              divider: 'bg-[#E7E3F0]',
            };
    }
  }, [readerTheme, isDark]);

  return (
    <header className={`relative h-14 sm:h-15 border-b px-3 sm:px-6 flex items-center justify-between backdrop-blur-md select-none z-30 transition-colors duration-200 no-print ${themeStyles.header}`}>
      {/* 2.5px Reading Progress Line at Top */}
      <div className={`absolute top-0 left-0 right-0 h-[2.5px] pointer-events-none overflow-hidden ${themeStyles.progressTrack}`}>
        <div 
          className={`h-full transition-all duration-150 ease-out ${themeStyles.progressFill}`}
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Left: Exit to Editor & Document Info */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={() => setViewMode('split')}
          className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-sans font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs border ${themeStyles.btnDefault}`}
          title="Exit to Editor Workspace (Esc)"
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Editor</span>
          <span className={`hidden md:inline text-[10px] font-sans font-medium opacity-70`}>Esc</span>
        </button>

        <div className={`hidden sm:block h-4 w-px shrink-0 ${themeStyles.divider}`} />

        {/* Title */}
        <div className="min-w-0 flex items-center gap-2 font-sans">
          <BookOpen className={`w-4 h-4 shrink-0 hidden xs:block ${themeStyles.muted}`} />
          <h1 className={`font-bold text-xs sm:text-sm truncate max-w-[130px] xs:max-w-[200px] sm:max-w-xs md:max-w-md ${themeStyles.title}`}>
            {title || 'Untitled Document'}
          </h1>
        </div>
      </div>

      {/* Center: Reading Telemetry & Percentage */}
      <div className={`hidden md:flex items-center gap-3 text-xs font-sans ${themeStyles.muted}`}>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 opacity-80" />
          <span className="font-medium">
            {typeof readingTime === 'number' ? `${readingTime} min read` : readingTime}
          </span>
        </div>
        <span className="opacity-40">•</span>
        <span className="font-sans text-[11px] font-medium">{wordCount.toLocaleString()} words</span>
        <span className="opacity-40">•</span>
        <div className={`flex items-center gap-1 font-sans text-[11px] font-semibold px-2 py-0.5 rounded-md ${themeStyles.badge}`}>
          <span>{readingProgress}%</span>
          <span className="text-[10px] opacity-70 font-normal">read</span>
        </div>
      </div>

      {/* Right: Reading Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative font-sans">
        {/* Table of Contents / Outline */}
        <button
          onClick={onOpenOutline}
          className={`px-2.5 py-1.5 rounded-lg border text-xs font-sans font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${themeStyles.btnAction}`}
          title="Document Outline & Table of Contents"
        >
          <ListTree className="w-3.5 h-3.5 opacity-80" />
          <span className="hidden sm:inline">Outline</span>
          {headingsCount > 0 && (
            <span className={`text-[10px] font-sans font-semibold px-1.5 py-0.2 rounded-md ${themeStyles.badge}`}>
              {headingsCount}
            </span>
          )}
        </button>

        {/* Reading Appearance Settings (Aa) */}
        <button
          onClick={() => setIsAppearanceOpen((prev) => !prev)}
          className={`px-2.5 py-1.5 rounded-lg border text-xs font-sans font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
            isAppearanceOpen
              ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
              : themeStyles.btnAction
          }`}
          title="Customize Reading Appearance (Theme, Font, Size, Width)"
        >
          <Type className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Aa</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className={`p-2 rounded-lg transition-colors cursor-pointer hidden xs:flex items-center justify-center ${themeStyles.btnAction}`}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Reader'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Print / PDF Studio */}
        {onOpenPdfStudio && (
          <button
            onClick={onOpenPdfStudio}
            className={`p-2 rounded-lg transition-colors cursor-pointer hidden sm:flex items-center justify-center ${themeStyles.btnAction}`}
            title="Export / Print Clean Document"
          >
            <Printer className="w-4 h-4" />
          </button>
        )}

        {/* Split View Quick Switch */}
        <button
          onClick={() => setViewMode('split')}
          className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center ${themeStyles.btnAction}`}
          title="Switch to Split View"
        >
          <Columns className="w-4 h-4" />
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
