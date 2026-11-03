import React, { useState } from 'react';
import { X, Key, ExternalLink, ShieldCheck, Check } from 'lucide-react';
import { useMimoStore } from '../stores/useMimoStore';

interface MimoApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MimoApiKeyModal: React.FC<MimoApiKeyModalProps> = ({ isOpen, onClose }) => {
  const quota = useMimoStore((s) => s.quota);
  const setUserApiKey = useMimoStore((s) => s.setUserApiKey);

  const [inputKey, setInputKey] = useState(quota.userApiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setUserApiKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setInputKey('');
    setUserApiKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">
              Connect Gemini API Key
            </h3>
            <p className="text-xs text-neutral-500">
              Bring Your Own Key (BYOK) for unlimited Mimo requests
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-4 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 space-y-1">
          <div className="font-medium text-neutral-900 dark:text-neutral-100">
            Free via Google AI Studio
          </div>
          <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
            Google provides a free tier with high rate limits for Gemini 3.8 Flash. Your key stays stored locally in your browser storage.
          </p>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-900 dark:text-neutral-100 underline underline-offset-2 hover:opacity-80 pt-0.5"
          >
            <span>Get your free Gemini API Key</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Input */}
        <div className="space-y-1.5 mb-5">
          <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Gemini API Key
          </label>
          <input
            type="password"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none focus:border-neutral-500 transition-colors"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          {quota.userApiKey ? (
            <button
              onClick={handleClear}
              className="text-xs text-rose-500 hover:text-rose-600 font-medium cursor-pointer"
            >
              Remove Key
            </button>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
              <span>Stored locally</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Saved
                </>
              ) : (
                'Save Key'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
