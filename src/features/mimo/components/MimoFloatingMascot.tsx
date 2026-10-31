import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, GitBranch } from 'lucide-react';
import { useMimoStore } from '../stores/useMimoStore';
import { MimoAvatar } from './MimoAvatar';

interface MimoFloatingMascotProps {
  className?: string;
}

export const MimoFloatingMascot: React.FC<MimoFloatingMascotProps> = ({ className = '' }) => {
  const isOpen = useMimoStore((s) => s.isOpen);
  const setIsOpen = useMimoStore((s) => s.setIsOpen);
  const mascotState = useMimoStore((s) => s.mascotState);
  const activeDiffHunk = useMimoStore((s) => s.activeDiffHunk);

  // When drawer is open, ambient floating widget hides to prevent clutter
  if (isOpen) return null;

  const hasPendingDiff = activeDiffHunk && !activeDiffHunk.isApplied && !activeDiffHunk.isDiscarded;

  return (
    <aside aria-label="Mimo AI Companion Widget" className="contents">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 15 }}
          transition={{ duration: 0.2 }}
          className={`fixed bottom-11 right-5 z-30 select-none no-print ${className}`}
        >
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200/90 dark:border-neutral-800 shadow-xl hover:shadow-2xl hover:border-violet-300 dark:hover:border-violet-700/80 transition-all cursor-pointer active:scale-95"
            title="Open Mimo Markdown Companion (Ctrl+J)"
            aria-label="Open Mimo AI Companion"
          >
          {/* Reactive Avatar */}
          <div className="relative">
            <MimoAvatar size="xs" state={mascotState} />
            {mascotState === 'thinking' && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500" />
              </span>
            )}
          </div>

          {/* Text and Status */}
          <div className="flex items-center gap-1.5 text-xs font-sans">
            <span className="font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              Mimo
            </span>

            {hasPendingDiff ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold animate-pulse">
                <GitBranch className="w-2.5 h-2.5" />
                Diff
              </span>
            ) : mascotState === 'thinking' ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 text-[10px] font-medium animate-pulse">
                Thinking...
              </span>
            ) : (
              <span className="hidden sm:inline-block text-[10px] font-mono text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-200/60 dark:border-neutral-700/60">
                Ctrl+J
              </span>
            )}
          </div>

          <Sparkles className="w-3 h-3 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </motion.div>
    </AnimatePresence>
    </aside>
  );
};
