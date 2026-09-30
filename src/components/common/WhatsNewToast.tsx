import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowUpRight } from 'lucide-react';
import { APP_VERSION, APP_VERSION_LABEL, getUpdateStorageKey } from '../../config/version';

interface WhatsNewToastProps {
  onOpenModal: () => void;
}

export const WhatsNewToast: React.FC<WhatsNewToastProps> = ({ onOpenModal }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const storageKey = getUpdateStorageKey(APP_VERSION);
      const hasSeenUpdate = localStorage.getItem(storageKey);
      if (!hasSeenUpdate) {
        // Subtle delay so it does not distract during page initialization
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // In case localStorage is blocked
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(getUpdateStorageKey(APP_VERSION), 'true');
    } catch {
      // Ignore
    }
    setIsVisible(false);
  };

  const handleOpen = () => {
    handleDismiss();
    onOpenModal();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          role="status"
          aria-live="polite"
          aria-label="Application update announcement"
          className="fixed bottom-5 left-5 z-50 max-w-sm w-[calc(100vw-2.5rem)] sm:w-auto bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-xl shadow-neutral-950/10 dark:shadow-black/40 p-3 sm:p-3.5 flex items-center gap-3 backdrop-blur-md"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/50 dark:border-blue-900/50 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
            <Sparkles className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs text-neutral-900 dark:text-white truncate">
                What's new in {APP_VERSION_LABEL}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
              Smooth themes, smart tables &amp; crystal diagrams
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleOpen}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <span>Open</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss update notification"
              className="w-7 h-7 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
