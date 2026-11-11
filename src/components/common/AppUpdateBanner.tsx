import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUpdateModalStore } from '../../stores/useUpdateModalStore';
import { appUpdateService } from '../../services/appUpdateService';

export const AppUpdateBanner: React.FC = () => {
  const navigate = useNavigate();
  const hasPendingAppUpdate = useUpdateModalStore((s) => s.hasPendingAppUpdate);
  const newServerVersion = useUpdateModalStore((s) => s.newServerVersion);
  const dismissPendingAppUpdate = useUpdateModalStore((s) => s.dismissPendingAppUpdate);

  const [updatePhase, setUpdatePhase] = useState<'idle' | 'updating' | 'restarting'>('idle');

  if (!hasPendingAppUpdate) return null;

  const handleUpdateClick = async () => {
    if (updatePhase !== 'idle') return;

    setUpdatePhase('updating');

    try {
      // 1. Give subtle tactile feedback and let the progress sweep start smoothly
      await new Promise((res) => setTimeout(res, 260));

      setUpdatePhase('restarting');

      // 2. Safely flush drafts and trigger service worker update
      await appUpdateService.applyAppUpdate();
    } catch {
      // Fallback reload if SW update hangs
      window.location.reload();
    }
  };

  const handleChangelogClick = () => {
    dismissPendingAppUpdate();
    navigate('/changelog');
  };

  const versionLabel = newServerVersion && newServerVersion !== 'Latest'
    ? `v${newServerVersion.replace(/^v/, '')}`
    : 'New version';

  return createPortal(
    <AnimatePresence>
      <div
        role="alert"
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[100] max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] pointer-events-none"
      >
        <motion.div
          layout
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-lg p-3.5 sm:p-4 select-none"
        >
          {/* Subtle Progress Bar during update phase */}
          {updatePhase !== 'idle' && (
            <motion.div
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: updatePhase === 'restarting' ? 1 : 0.75 }}
              transition={{
                duration: updatePhase === 'restarting' ? 0.3 : 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="absolute top-0 left-0 right-0 h-[2px] bg-neutral-900 dark:bg-neutral-100 z-10"
            />
          )}

          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 pr-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                  Update available
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-medium tracking-tight bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700/60">
                  {versionLabel}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {updatePhase === 'restarting'
                  ? 'Restarting application to apply updates...'
                  : updatePhase === 'updating'
                  ? 'Saving offline drafts and refreshing...'
                  : 'A new release is ready with performance and sync improvements.'}
              </p>
            </div>

            {/* Dismiss action */}
            {updatePhase === 'idle' && (
              <button
                type="button"
                onClick={dismissPendingAppUpdate}
                aria-label="Dismiss update notification"
                className="shrink-0 p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Row */}
          <div className="mt-3.5 flex items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
            <button
              type="button"
              onClick={handleChangelogClick}
              disabled={updatePhase !== 'idle'}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors cursor-pointer px-1 py-1 rounded disabled:opacity-40"
            >
              Changelog
            </button>

            <motion.button
              type="button"
              onClick={handleUpdateClick}
              disabled={updatePhase !== 'idle'}
              whileTap={updatePhase === 'idle' ? { scale: 0.97 } : undefined}
              className={`relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer overflow-hidden ${
                updatePhase === 'idle'
                  ? 'bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 active:translate-y-[0.5px]'
                  : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 cursor-wait'
              }`}
            >
              <AnimatePresence mode="wait">
                {updatePhase === 'idle' ? (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                  >
                    Update now
                  </motion.span>
                ) : updatePhase === 'updating' ? (
                  <motion.span
                    key="updating"
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -2 }}
                    transition={{ duration: 0.12 }}
                    className="inline-flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-pulse" />
                    Updating...
                  </motion.span>
                ) : (
                  <motion.span
                    key="restarting"
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -2 }}
                    transition={{ duration: 0.12 }}
                  >
                    Restarting...
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
