import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sun, 
  Moon, 
  Download, 
  Columns, 
  PenTool, 
  Eye, 
  Maximize2, 
  Minimize2, 
  FileText, 
  Info, 
  ChevronDown, 
  Sparkles, 
  Copy, 
  FolderOpen, 
  Table2, 
  Timer, 
  Trash2, 
  FileX, 
  ListTree, 
  Sliders, 
  History, 
  LayoutTemplate,
  Image as ImageIcon
} from 'lucide-react';
import { useThemeStore } from '../../../stores/useThemeStore';
import { ViewMode } from '../types';
import { DocumentMetadata } from '../../../db';
import { PwaInstallButton } from '../../../components/common/PwaInstallButton';

interface EditorHeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  title: string;
  setTitle: (title: string) => void;
  content: string;
  isSaved: boolean;
  isSaving: boolean;
  executeSave: (content: string, title: string) => void;
  docMetadata: DocumentMetadata | null;
  onOpenSwitcher: () => void;
  onOpenDrawer: () => void;
  onOpenPdfStudio: () => void;
  onOpenTableBuilder: () => void;
  onOpenImageModal?: () => void;
  onOpenFxPopover: () => void;
  onOpenOutline: () => void;
  onOpenTemplates: () => void;
  onOpenRevisions: () => void;
  onOpenSprintPopover: () => void;
  onExportMd: () => void;
  onExportDocx?: () => void;
  onDuplicateDoc?: () => void;
  onCleanFormat?: () => void;
  onCopyMarkdown: () => void;
  onClearContent: () => void;
  onDeleteCurrentDoc: () => void;
  isToolsMenuOpen: boolean;
  setIsToolsMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isExportMenuOpen: boolean;
  setIsExportMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = React.memo(({
  viewMode,
  setViewMode,
  title,
  setTitle,
  content,
  isSaved,
  isSaving,
  executeSave,
  docMetadata,
  onOpenSwitcher,
  onOpenDrawer,
  onOpenPdfStudio,
  onOpenTableBuilder,
  onOpenImageModal,
  onOpenFxPopover,
  onOpenOutline,
  onOpenTemplates,
  onOpenRevisions,
  onOpenSprintPopover,
  onExportMd,
  onExportDocx,
  onDuplicateDoc,
  onCleanFormat,
  onCopyMarkdown,
  onClearContent,
  onDeleteCurrentDoc,
  isToolsMenuOpen,
  setIsToolsMenuOpen,
  isExportMenuOpen,
  setIsExportMenuOpen,
}) => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <header className={`h-14 sm:h-15 border-b border-neutral-200/80 dark:border-neutral-800/80 px-3 sm:px-6 flex items-center justify-between bg-white dark:bg-neutral-900 select-none z-30 transition-all no-print ${
      viewMode === 'zen' ? 'opacity-0 hover:opacity-100 duration-200' : ''
    }`}>
      {/* Zone 1 (Left): Documents Back, Document Switcher, Responsive Title & Save Indicator */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={() => navigate('/documents')}
          className="p-1.5 sm:p-2 rounded-xl text-neutral-500 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer shrink-0"
          title="Back to Documents"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Docs</span>
        </button>

        <button
          onClick={onOpenSwitcher}
          className="hidden sm:flex px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-300 items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-2xs"
          title="Open Document Switcher (Ctrl+O)"
        >
          <FolderOpen className="w-3.5 h-3.5 text-neutral-400" />
          <span className="hidden md:inline">Open (Ctrl+O)</span>
        </button>

        <div className="hidden sm:block h-4 w-px bg-neutral-200 dark:bg-neutral-800 shrink-0" />

        {/* Title & Subtle Saved Dot */}
        <div className="flex items-center gap-1.5 min-w-0">
          <FileText className="w-4 h-4 text-neutral-400 shrink-0 hidden xs:block" />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => executeSave(content, title)}
            className="bg-transparent font-bold text-xs sm:text-sm text-neutral-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 rounded-lg px-1.5 sm:px-2 py-1 max-w-[110px] xs:max-w-[140px] sm:max-w-xs md:max-w-sm truncate transition-colors"
            title="Click to rename document"
          />

          {/* Subtle Breathable Save Dot */}
          <div className="flex items-center gap-1.5 text-xs font-mono shrink-0 pl-1">
            {isSaving ? (
              <span className="text-amber-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                <span className="hidden lg:inline text-[11px]">Saving...</span>
              </span>
            ) : isSaved ? (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium" title="All changes saved in local cache">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="hidden lg:inline text-[11px]">Saved</span>
              </span>
            ) : (
              <span className="text-neutral-400 flex items-center gap-1.5" title="Unsaved changes">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="hidden lg:inline text-[11px]">Unsaved</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Zone 2 (Center): Floating View Mode Segmented Control */}
      <div className="hidden sm:flex items-center bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-400 border border-neutral-200/60 dark:border-neutral-700/60 shadow-2xs">
        <button
          onClick={() => setViewMode('split')}
          className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
            viewMode === 'split' ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs font-semibold' : 'hover:text-neutral-900 dark:hover:text-white'
          }`}
          title="Split Mode (Editor + Live Preview)"
        >
          <Columns className="w-3.5 h-3.5" />
          <span>Split</span>
        </button>
        <button
          onClick={() => setViewMode('write')}
          className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
            viewMode === 'write' ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs font-semibold' : 'hover:text-neutral-900 dark:hover:text-white'
          }`}
          title="Write Mode (Distraction-Free Editor)"
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Write</span>
        </button>
        <button
          onClick={() => setViewMode('read')}
          className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
            viewMode === 'read' ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs font-semibold' : 'hover:text-neutral-900 dark:hover:text-white'
          }`}
          title="Read Mode (Rendered Preview Only)"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Read</span>
        </button>
        <button
          onClick={() => setViewMode(viewMode === 'zen' ? 'split' : 'zen')}
          className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
            viewMode === 'zen' ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs font-semibold' : 'hover:text-neutral-900 dark:hover:text-white'
          }`}
          title="Zen Fullscreen Mode"
        >
          {viewMode === 'zen' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span>Zen</span>
        </button>
      </div>

      {/* Zone 3 (Right): Consolidated Action Cluster */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Consolidated Tools & Studio Dropdown Menu - Hidden on mobile (< md), accessible via mobile toolbar */}
        <div className="hidden md:block relative">
          <button
            onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
              isToolsMenuOpen
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-xs'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
            }`}
            title="Writing tools, outline, tables, effects & templates"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-500" />
            <span>Tools</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {isToolsMenuOpen && (
            <div 
              className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150 space-y-0.5"
              onClick={() => setIsToolsMenuOpen(false)}
            >
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
                Writing Studio Tools
              </div>

              <button
                onClick={onOpenOutline}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-700 dark:text-neutral-300 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <ListTree className="w-4 h-4 text-purple-500" />
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white">Document Outline</div>
                    <div className="text-[10px] text-neutral-500">Live H1–H6 table of contents</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">TOC</span>
              </button>

              <button
                onClick={onOpenTableBuilder}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-700 dark:text-neutral-300 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Table2 className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white">Table Builder</div>
                    <div className="text-[10px] text-neutral-500">Visual rows & columns designer</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">/table</span>
              </button>

              {onOpenImageModal && (
                <button
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    onOpenImageModal();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-700 dark:text-neutral-300 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <ImageIcon className="w-4 h-4 text-purple-500" />
                    <div>
                      <div className="font-semibold text-neutral-900 dark:text-white">Embed Image Studio</div>
                      <div className="text-[10px] text-neutral-500">Offline upload or web link</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">/image</span>
                </button>
              )}

              <button
                onClick={onOpenFxPopover}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-700 dark:text-neutral-300 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white">Writing FX & Cursors</div>
                    <div className="text-[10px] text-neutral-500">Hardware-accelerated particles & carets</div>
                  </div>
                </div>
                <span 
                  className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold"
                  title="Hardware-accelerated 2D canvas rendering for lag-free particle effects & carets"
                >
                  ⚡ 60fps
                </span>
              </button>

              <button
                onClick={onOpenTemplates}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-700 dark:text-neutral-300 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <LayoutTemplate className="w-4 h-4 text-emerald-500" />
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white">Templates Library</div>
                    <div className="text-[10px] text-neutral-500">8 curated specs, PRDs & notes</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">8 Presets</span>
              </button>

              <button
                onClick={onOpenRevisions}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-700 dark:text-neutral-300 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <History className="w-4 h-4 text-cyan-500" />
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white">Revision History</div>
                    <div className="text-[10px] text-neutral-500">IndexedDB checkpoints & rollback</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">Pro</span>
              </button>

              <button
                onClick={onOpenSprintPopover}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-700 dark:text-neutral-300 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Timer className="w-4 h-4 text-rose-500" />
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white">Focus Sprint Timer</div>
                    <div className="text-[10px] text-neutral-500">Pomodoro focus sprint mode</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">25m</span>
              </button>

              <div className="border-t border-neutral-100 dark:border-neutral-800 my-1" />

              <button
                onClick={onDuplicateDoc}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-700 dark:text-neutral-300 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Copy className="w-4 h-4 text-sky-500" />
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white">Duplicate Document</div>
                    <div className="text-[10px] text-neutral-500">Clone into a new document</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">Clone</span>
              </button>

              <button
                onClick={onCleanFormat}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-700 dark:text-neutral-300 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white">Clean & Format Markdown</div>
                    <div className="text-[10px] text-neutral-500">Repair fragmented lines & badges</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">/clean</span>
              </button>
            </div>
          )}
        </div>

        {/* Export Dropdown Menu - Hidden on mobile (< md), accessible via mobile toolbar */}
        <div className="hidden md:block relative">
          <button
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {isExportMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 space-y-0.5">
              <button
                onClick={() => {
                  setIsExportMenuOpen(false);
                  onOpenPdfStudio();
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 text-neutral-700 dark:text-neutral-300 cursor-pointer bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/30"
              >
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div>
                  <div className="font-bold text-neutral-950 dark:text-white flex items-center gap-1.5">
                    <span>PDF Export Studio</span>
                    <span className="text-[9px] bg-indigo-600 text-white dark:bg-indigo-500 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">v2.4</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400">Custom themes, cover & TOC</div>
                </div>
              </button>

              <div className="border-t border-neutral-100 dark:border-neutral-800 my-1" />

              <button
                onClick={onExportMd}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-neutral-700 dark:text-neutral-300 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-neutral-500" />
                <span>Download .md</span>
              </button>
              <button
                onClick={() => {
                  setIsExportMenuOpen(false);
                  onExportDocx?.();
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-neutral-700 dark:text-neutral-300 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <div className="flex-1 flex items-center justify-between">
                  <span>Word Document (.docx)</span>
                  <span className="text-[9px] bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 px-1.5 py-0.2 rounded font-bold uppercase">DOCX</span>
                </div>
              </button>
              <button
                onClick={onCopyMarkdown}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-neutral-700 dark:text-neutral-300 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-neutral-500" />
                <span>Copy Markdown</span>
              </button>

              <div className="border-t border-neutral-100 dark:border-neutral-800 my-1" />

              <button
                onClick={onClearContent}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2 text-amber-600 dark:text-amber-400 cursor-pointer"
              >
                <FileX className="w-3.5 h-3.5" />
                <span>Clear Content...</span>
              </button>

              <button
                onClick={onDeleteCurrentDoc}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 text-red-600 dark:text-red-400 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Document...</span>
              </button>
            </div>
          )}
        </div>

        {/* Document Insights / Drawer Trigger */}
        <button
          onClick={onOpenDrawer}
          className="p-2 rounded-xl text-neutral-500 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer relative"
          title="Document details & tags"
        >
          <Info className="w-4 h-4" />
          {docMetadata?.tags?.length ? (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-600" />
          ) : null}
        </button>

        {/* PWA Install Button - Hidden on phone screens to prevent header cramming */}
        <div className="hidden sm:block">
          <PwaInstallButton variant="compact" />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-xl text-neutral-500 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
        </button>
      </div>
    </header>
  );
});

EditorHeader.displayName = 'EditorHeader';
