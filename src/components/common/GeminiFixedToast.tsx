import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, KeyRound } from 'lucide-react';
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
      className="fixed bottom-5 right-5 z-50 max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div className="relative p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg text-neutral-900 dark:text-neutral-100">
        {/* Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Dismiss notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="space-y-1.5 pr-6">
          <h3 className="font-semibold text-xs tracking-tight text-neutral-900 dark:text-neutral-100">
            Gemini AI Connected
          </h3>

          <p className="text-[11.5px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
            AI Companion is active and ready. You can connect your personal Gemini key in settings to bypass shared limits.
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenKeyModal}
              className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-[11px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3 h-3" />
              <span>{userApiKey ? 'Manage Key' : 'Connect Key'}</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
