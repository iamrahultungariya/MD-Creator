import React, { useEffect, useState } from 'react';
import { 
  Download, 
  FileDown, 
  FileText, 
  Copy, 
  X, 
  Printer,
  Sparkles
} from 'lucide-react';
import { useAuthStore, isUserPro } from '../../stores/useAuthStore';
import { ProUpgradeModal } from '../common/ProUpgradeModal';

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
  const { user } = useAuthStore();
  const isPro = isUserPro(user);
  const [isProUpgradeOpen, setIsProUpgradeOpen] = useState(false);
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
        if (!isPro) {
          setIsProUpgradeOpen(true);
        } else {
          onClose();
          onExportDocx();
        }
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

      {/* Modern Squircle Card Modal (Matching reference design feel) */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
        className="relative w-full max-w-lg bg-white dark:bg-[#141415] border border-neutral-200/80 dark:border-neutral-800/80 rounded-[28px] sm:rounded-[32px] shadow-2xl shadow-neutral-950/25 p-5 sm:p-6 z-10 animate-in zoom-in-95 fade-in duration-150 select-none flex flex-col"
      >
        {/* Header (Avatar / Icon badge + Title & Subtitle + Close Button) */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/40 shadow-inner">
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
            <span className="hidden sm:inline-flex text-[10px] font-mono text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800/80 px-2 py-0.5 rounded-full">
              Ctrl+E
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Close modal (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Minimal Thin Divider */}
        <div className="border-t border-neutral-100 dark:border-neutral-800/80 mb-4" />

        {/* Export Options Grid */}
        <div className="space-y-2.5">
          {/* Option 1: PDF Studio */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenPdfStudio();
            }}
            className="w-full text-left p-3.5 rounded-2xl border border-indigo-100/70 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/15 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all flex items-center justify-between group cursor-pointer hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-neutral-950 dark:text-white">
                    PDF Export Studio
                  </span>
                  <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                    Studio
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                  Custom cover themes, typography styling & table of contents
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 px-2 py-1 rounded-lg shrink-0">
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
            className="w-full text-left p-3.5 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 transition-all flex items-center justify-between group cursor-pointer hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center shadow-sm shrink-0">
                <FileDown className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-neutral-950 dark:text-white">
                    Markdown File (.md)
                  </span>
                  <span className="text-[9px] bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-1.5 py-0.2 rounded font-mono font-bold">
                    MD
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                  Standard markdown for Obsidian, GitHub, Notion and static sites
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 px-2 py-1 rounded-lg shrink-0">
              2
            </span>
          </button>

          {/* Option 3: Word Document (.docx) */}
          <button
            type="button"
            onClick={() => {
              if (!isPro) {
                setIsProUpgradeOpen(true);
                return;
              }
              onClose();
              onExportDocx();
            }}
            className="w-full text-left p-3.5 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 transition-all flex items-center justify-between group cursor-pointer hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-neutral-950 dark:text-white">
                    Word Document (.docx)
                  </span>
                  <span className="text-[9px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-1.5 py-0.2 rounded font-mono font-bold">
                    DOCX
                  </span>
                  {!isPro && (
                    <span className="text-[9px] bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                      PRO
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                  Formatted document compatible with Microsoft Word &amp; Google Docs
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 px-2 py-1 rounded-lg shrink-0">
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
            className="w-full text-left p-3.5 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 transition-all flex items-center justify-between group cursor-pointer hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
                <Copy className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-neutral-950 dark:text-white">
                    Copy Markdown Text
                  </span>
                  <span className="text-[9px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
                    CLIPBOARD
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                  Instantly copy raw markdown content with normalized formatting
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 px-2 py-1 rounded-lg shrink-0">
              4
            </span>
          </button>
        </div>

        {/* Footer Bar with Pill Action Button */}
        <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
          <div className="text-[11px] text-neutral-400 dark:text-neutral-500 flex items-center gap-2">
            <span>Press <strong className="text-neutral-700 dark:text-neutral-300 font-semibold">1-4</strong> or click option</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-bold tracking-tight shadow-sm transition-all active:scale-95 cursor-pointer bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
          >
            Close
          </button>
        </div>
      </div>

      {/* Pro Upgrade Interstitial Modal */}
      <ProUpgradeModal
        isOpen={isProUpgradeOpen}
        onClose={() => setIsProUpgradeOpen(false)}
        featureTitle="Microsoft Word (.docx) Export"
        featureDescription="Exporting formatted Microsoft Word (.docx) documents with clean typography, styled headings, code snippets, and table structures is a Pro feature. Claim one of our Earlybird VIP spots to unlock free Pro access!"
      />
    </div>
  );
};
