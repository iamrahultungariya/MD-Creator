import React, { useState, useEffect } from 'react';
import { Cloud, X, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../../stores/useAuthStore';

interface CloudSyncNudgeToastProps {
  wordCount: number;
  onOpenAuth: () => void;
}

const DISMISS_KEY = 'md_writer_cloud_nudge_dismissed_until';

export const CloudSyncNudgeToast: React.FC<CloudSyncNudgeToastProps> = ({
  wordCount,
  onOpenAuth,
}) => {
  const { user } = useAuthStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If user is already logged in, never show
    if (user?.id) {
      setIsVisible(false);
      return;
    }

    // Check if dismissed recently (within 24 hours)
    try {
      const dismissedUntil = localStorage.getItem(DISMISS_KEY);
      if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
        return;
      }
    } catch {}

    // Trigger when user writes 120+ words
    if (wordCount >= 120 && !isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [wordCount, user?.id, isVisible]);

  if (!isVisible || user?.id) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      // Dismiss for 24 hours
      localStorage.setItem(DISMISS_KEY, String(Date.now() + 1000 * 60 * 60 * 24));
    } catch {}
  };

  const handleConnect = () => {
    setIsVisible(false);
    onOpenAuth();
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-sm w-full p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-2xl animate-in slide-in-from-bottom-3 duration-200 font-sans text-xs select-none">
      <div className="flex items-start justify-between gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
          <Cloud className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-neutral-950 dark:text-white">
              Safeguard Your Writing
            </h4>
            <button
              onClick={handleDismiss}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5 rounded cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
            You&apos;ve written {wordCount} words! Notes are currently saved only in this browser. Connect cloud backup to prevent accidental loss if browser data clears.
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleConnect}
              className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <span>Back Up to Cloud</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={handleDismiss}
              className="px-2.5 py-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
