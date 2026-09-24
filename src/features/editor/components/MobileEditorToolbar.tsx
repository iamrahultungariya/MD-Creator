import React, { useState } from 'react';
import { 
  Bold, 
  Link2, 
  Image as ImageIcon, 
  MoreHorizontal, 
  X, 
  Download, 
  Copy, 
  ListTree, 
  Table2, 
  LayoutTemplate, 
  History, 
  FileX, 
  Printer 
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface MobileEditorToolbarProps {
  onInsertBold: () => void;
  onInsertLink: () => void;
  onOpenImageModal: () => void;
  onTriggerSlash: () => void;
  onOpenOutline: () => void;
  onOpenTableBuilder: () => void;
  onOpenTemplates: () => void;
  onOpenPdfStudio: () => void;
  onExportMd: () => void;
  onCopyMarkdown: () => void;
  onOpenRevisions: () => void;
  onClearContent: () => void;
}

export const MobileEditorToolbar: React.FC<MobileEditorToolbarProps> = ({
  onInsertBold,
  onInsertLink,
  onOpenImageModal,
  onTriggerSlash,
  onOpenOutline,
  onOpenTableBuilder,
  onOpenTemplates,
  onOpenPdfStudio,
  onExportMd,
  onCopyMarkdown,
  onOpenRevisions,
  onClearContent,
}) => {
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);

  return (
    <>
      {/* Sticky Bottom Accessory Bar — Docked above mobile viewport / virtual keyboard */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200/80 dark:border-neutral-800 px-3 py-2 flex items-center justify-around shadow-lg safe-bottom">
        {/* 1. Bold */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onInsertBold}
          className="p-2.5 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95 transition-all flex flex-col items-center gap-0.5 cursor-pointer"
          title="Bold (**text**)"
        >
          <Bold className="w-4 h-4" />
          <span className="text-[9px] font-bold">Bold</span>
        </button>

        {/* 2. Link */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onInsertLink}
          className="p-2.5 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95 transition-all flex flex-col items-center gap-0.5 cursor-pointer"
          title="Insert Link"
        >
          <Link2 className="w-4 h-4" />
          <span className="text-[9px] font-bold">Link</span>
        </button>

        {/* 3. Image */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onOpenImageModal}
          className="p-2.5 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95 transition-all flex flex-col items-center gap-0.5 cursor-pointer"
          title="Embed Image"
        >
          <ImageIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
          <span className="text-[9px] font-bold">Image</span>
        </button>

        {/* 4. Slash Commands Trigger */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onTriggerSlash}
          className="w-9 h-9 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-mono font-bold active:scale-95 transition-all flex items-center justify-center shadow-sm cursor-pointer"
          title="Slash Commands (/)"
        >
          <span className="text-sm font-bold">/</span>
        </button>

        {/* 5. More Overflow */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setIsOverflowOpen(true)}
          className="p-2.5 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95 transition-all flex flex-col items-center gap-0.5 cursor-pointer"
          title="More Tools"
        >
          <MoreHorizontal className="w-4 h-4" />
          <span className="text-[9px] font-bold">More</span>
        </button>
      </div>

      {/* Overflow Bottom Sheet Drawer */}
      <AnimatePresence>
        {isOverflowOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOverflowOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 w-full bg-white dark:bg-neutral-900 rounded-t-3xl border-t border-neutral-200 dark:border-neutral-800 p-5 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto"
            >
              {/* Grab handle */}
              <div className="w-12 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto" />

              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-neutral-950 dark:text-white">
                  Writing Studio &amp; Export
                </span>
                <button
                  onClick={() => setIsOverflowOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsOverflowOpen(false);
                    onOpenPdfStudio();
                  }}
                  className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-left flex flex-col gap-1 text-neutral-800 dark:text-neutral-200"
                >
                  <Printer className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  <span className="font-bold text-xs">PDF Studio</span>
                  <span className="text-[10px] text-neutral-500">Themes &amp; print</span>
                </button>

                <button
                  onClick={() => {
                    setIsOverflowOpen(false);
                    onExportMd();
                  }}
                  className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-left flex flex-col gap-1 text-neutral-800 dark:text-neutral-200"
                >
                  <Download className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  <span className="font-bold text-xs">Export .md</span>
                  <span className="text-[10px] text-neutral-500">Download file</span>
                </button>

                <button
                  onClick={() => {
                    setIsOverflowOpen(false);
                    onCopyMarkdown();
                  }}
                  className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-left flex flex-col gap-1 text-neutral-800 dark:text-neutral-200"
                >
                  <Copy className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  <span className="font-bold text-xs">Copy Markdown</span>
                  <span className="text-[10px] text-neutral-500">To clipboard</span>
                </button>

                <button
                  onClick={() => {
                    setIsOverflowOpen(false);
                    onOpenOutline();
                  }}
                  className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-left flex flex-col gap-1 text-neutral-800 dark:text-neutral-200"
                >
                  <ListTree className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  <span className="font-bold text-xs">Outline (TOC)</span>
                  <span className="text-[10px] text-neutral-500">H1–H6 Jump</span>
                </button>

                <button
                  onClick={() => {
                    setIsOverflowOpen(false);
                    onOpenTableBuilder();
                  }}
                  className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-left flex flex-col gap-1 text-neutral-800 dark:text-neutral-200"
                >
                  <Table2 className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  <span className="font-bold text-xs">Table Builder</span>
                  <span className="text-[10px] text-neutral-500">Visual grid</span>
                </button>

                <button
                  onClick={() => {
                    setIsOverflowOpen(false);
                    onOpenTemplates();
                  }}
                  className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-left flex flex-col gap-1 text-neutral-800 dark:text-neutral-200"
                >
                  <LayoutTemplate className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  <span className="font-bold text-xs">Templates</span>
                  <span className="text-[10px] text-neutral-500">8 Starters</span>
                </button>

                <button
                  onClick={() => {
                    setIsOverflowOpen(false);
                    onOpenRevisions();
                  }}
                  className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-left flex flex-col gap-1 text-neutral-800 dark:text-neutral-200"
                >
                  <History className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  <span className="font-bold text-xs">Revisions</span>
                  <span className="text-[10px] text-neutral-500">Checkpoints</span>
                </button>

                <button
                  onClick={() => {
                    setIsOverflowOpen(false);
                    onClearContent();
                  }}
                  className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-left flex flex-col gap-1 text-amber-700 dark:text-amber-400"
                >
                  <FileX className="w-5 h-5" />
                  <span className="font-bold text-xs">Clear Canvas</span>
                  <span className="text-[10px] opacity-75">Start fresh</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
