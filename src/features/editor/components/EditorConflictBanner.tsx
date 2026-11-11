import React from 'react';
import { motion } from 'framer-motion';

export interface RemoteConflictData {
  remoteContent: string;
  remoteTitle?: string;
  remoteUpdatedAt?: number;
}

interface EditorConflictBannerProps {
  conflict: RemoteConflictData | null;
  onKeepMine: () => void;
  onUseRemote: () => void;
  onDismiss: () => void;
}

export const EditorConflictBanner: React.FC<EditorConflictBannerProps> = ({
  conflict,
  onKeepMine,
  onUseRemote,
  onDismiss,
}) => {
  if (!conflict) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className="w-full bg-neutral-900 border-b border-neutral-800 text-neutral-100 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-sans z-20 shrink-0"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
        <div className="flex items-center gap-2 truncate">
          <span className="font-medium text-neutral-100">
            Remote edits detected from another device
          </span>
          <span className="hidden sm:inline text-neutral-400">
            — your local draft is preserved in revision history
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onKeepMine}
          className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors font-medium cursor-pointer"
        >
          Keep Mine
        </button>
        <button
          type="button"
          onClick={onUseRemote}
          className="px-2.5 py-1 rounded bg-neutral-100 hover:bg-white text-neutral-900 transition-colors font-medium cursor-pointer"
        >
          Use Remote
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors cursor-pointer text-xs"
          aria-label="Dismiss banner"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
};
