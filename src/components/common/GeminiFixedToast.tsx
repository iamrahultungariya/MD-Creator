import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X, CheckCircle2, KeyRound } from 'lucide-react';
import { useMimoStore } from '../../features/mimo/stores/useMimoStore';

const STORAGE_KEY = 'md_gemini_fix_notice_seen_v1';

export const GeminiFixedToast: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const setIsKeyModalOpen = useMimoStore((s) => s.setIsKeyModalOpen);
  const userApiKey = useMimoStore((s) => s.quota.userApiKey);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        // Show banner smoothly after app loads
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // In case localStorage is disabled or throws
    }
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const handleOpenKeyModal = () => {
    handleDismiss();
    setIsKeyModalOpen(true);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="relative p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-neutral-900 border border-emerald-500/30 dark:border-emerald-500/40 shadow-2xl shadow-emerald-500/10 text-neutral-900 dark:text-neutral-100 overflow-hidden">
        {/* Decorative Top Accent Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Dismiss notice"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          {/* Friendly Icon Badge */}
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-emerald-500/30">
            <Sparkles className="w-5 h-5" />
          </div>

          <div className="space-y-1.5 pr-4">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-neutral-950 dark:text-white">
                Gemini AI is Fully Fixed! ✨
              </h3>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              The AI connection issue is completely resolved. You can now connect your personal Google Gemini key and write without interruptions. OpenRouter has been retired to keep everything simple and fast!
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center flex-wrap gap-2">
              <button
                type="button"
                onClick={handleOpenKeyModal}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {userApiKey ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>Check Gemini Key</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Connect Gemini Key</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
