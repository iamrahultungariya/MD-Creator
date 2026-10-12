import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Trash2, Download, X } from 'lucide-react';

interface BatchActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBatchDelete: () => void;
  onBatchExport: () => void;
  onExitMode: () => void;
}

export const BatchActionsBar: React.FC<BatchActionsBarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBatchDelete,
  onBatchExport,
  onExitMode,
}) => {
  const isAllSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <motion.aside
      initial={{ y: 80, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 80, opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] sm:w-auto bg-neutral-950/90 dark:bg-neutral-900/95 backdrop-blur-xl text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between sm:justify-start gap-3 sm:gap-4 font-sans text-xs select-none"
      role="region"
      aria-label="Batch Actions"
    >
      {/* Selection Counter Pill */}
      <div className="flex items-center gap-2 pr-2 border-r border-white/15">
        <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-[11px]">
          {selectedCount}
        </div>
        <span className="font-semibold text-neutral-200 hidden xs:inline">Selected</span>
      </div>

      {/* Select All Toggle */}
      <button
        type="button"
        onClick={isAllSelected ? onDeselectAll : onSelectAll}
        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/15 text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
      >
        <CheckSquare className="w-3.5 h-3.5 text-neutral-400" />
        <span>{isAllSelected ? 'Deselect All' : `Select All (${totalCount})`}</span>
      </button>

      {/* Export Selected Markdown Button */}
      <button
        type="button"
        disabled={selectedCount === 0}
        onClick={onBatchExport}
        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
        title="Download selected documents as .md files"
      >
        <Download className="w-3.5 h-3.5 text-sky-400" />
        <span className="hidden sm:inline">Export .md</span>
      </button>

      {/* Delete / Move to Trash Button */}
      <button
        type="button"
        disabled={selectedCount === 0}
        onClick={onBatchDelete}
        className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5 cursor-pointer font-semibold border border-red-500/20"
        title="Delete selected documents"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Delete</span>
      </button>

      {/* Exit Selection Mode */}
      <button
        type="button"
        onClick={onExitMode}
        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-auto sm:ml-1"
        title="Exit Selection Mode"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.aside>
  );
};
