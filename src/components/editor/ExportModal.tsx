import React, { useEffect } from 'react';
import { 
  Download, 
  FileDown, 
  FileText, 
  Copy, 
  X, 
  Printer
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPdfStudio: () => void;
  onExportMd: () => void;
  onExportDocx: () => void;
  onCopyMarkdown: () => void;
  docTitle: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onOpenPdfStudio,
  onExportMd,
  onExportDocx,
  onCopyMarkdown,
  docTitle
}) => {
  // Handle Escape key and number shortcuts 1-4
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === '1') {
        e.preventDefault();
        onClose();
        onOpenPdfStudio();
      } else if (e.key === '2') {
        e.preventDefault();
        onClose();
        onExportMd();
      } else if (e.key === '3') {
        e.preventDefault();
        onClose();
        onExportDocx();
      } else if (e.key === '4') {
        e.preventDefault();
        onClose();
        onCopyMarkdown();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onOpenPdfStudio, onExportMd, onExportDocx, onCopyMarkdown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Soft Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs animate-in fade-in duration-200"
      />

      {/* Modern Squarish Card Modal */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
        className="relative w-full max-w-lg bg-white dark:bg-[#141415] border border-neutral-200/90 dark:border-neutral-800 rounded-xl shadow-2xl p-5 sm:p-6 z-10 animate-in zoom-in-95 fade-in duration-150 select-none flex flex-col font-sans"
      >
        {/* Header (Avatar / Icon badge + Title & Subtitle + Close Button) */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-500/20 shadow-2xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 id="export-modal-title" className="font-bold text-base text-neutral-950 dark:text-white leading-tight">
                Export Document
              </h2>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate max-w-[240px] sm:max-w-xs mt-0.5">
                {docTitle || 'Untitled Document'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex text-[10px] font-mono text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800/80 px-2 py-0.5 rounded-md border border-neutral-200/60 dark:border-neutral-700/60">
              Ctrl+E
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Close modal (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Minimal Thin Divider */}
        <div className="border-t border-neutral-100 dark:border-neutral-800/80 mb-4" />

        {/* Export Options Grid */}
        <div className="space-y-2">
          {/* Option 1: PDF Studio */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenPdfStudio();
            }}
            className="w-full text-left p-3 rounded-lg border border-brand-500/20 bg-brand-50/20 dark:bg-brand-950/15 hover:bg-brand-50/50 dark:hover:bg-brand-950/30 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                <Printer className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-neutral-950 dark:text-white">
                    PDF Export Studio
                  </span>
                  <span className="text-[9px] bg-brand-600 text-white px-1.5 py-0.2 rounded-md font-bold uppercase tracking-wider">
                    Studio
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                  Custom cover themes, typography styling & table of contents
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 px-2 py-0.5 rounded-md shrink-0">
              1
            </span>
          </button>

          {/* Option 2: Markdown File (.md) */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onExportMd();
            }}
            className="w-full text-left p-3 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center shadow-2xs shrink-0">
                <FileDown className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-neutral-950 dark:text-white">
                    Markdown File (.md)
                  </span>
                  <span className="text-[9px] bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-1.5 py-0.2 rounded-md font-mono font-bold">
                    MD
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                  Standard markdown for Obsidian, GitHub, Notion and static sites
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 px-2 py-0.5 rounded-md shrink-0">
              2
            </span>
          </button>

          {/* Option 3: Word Document (.docx) */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onExportDocx();
            }}
            className="w-full text-left p-3 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-neutral-950 dark:text-white">
                    Word Document (.docx)
                  </span>
                  <span className="text-[9px] bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 px-1.5 py-0.2 rounded-md font-mono font-bold">
                    DOCX
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                  Formatted document compatible with Microsoft Word &amp; Google Docs
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 px-2 py-0.5 rounded-md shrink-0">
              3
            </span>
          </button>

          {/* Option 4: Copy Markdown to Clipboard */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onCopyMarkdown();
            }}
            className="w-full text-left p-3 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-2xs shrink-0">
                <Copy className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-neutral-950 dark:text-white">
                    Copy Markdown Text
                  </span>
                  <span className="text-[9px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.2 rounded-md font-mono font-bold">
                    CLIPBOARD
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                  Instantly copy raw markdown content with normalized formatting
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 px-2 py-0.5 rounded-md shrink-0">
              4
            </span>
          </button>
        </div>

        {/* Footer Bar */}
        <div className="pt-3.5 mt-3.5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
          <div className="text-[11px] text-neutral-400 dark:text-neutral-500 flex items-center gap-2">
            <span>Press <strong className="text-neutral-700 dark:text-neutral-300 font-semibold">1-4</strong> or click option</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 shadow-2xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
