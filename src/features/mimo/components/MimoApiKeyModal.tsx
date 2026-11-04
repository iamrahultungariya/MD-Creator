import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Key, ExternalLink, Check, Trash2, Loader2, AlertCircle, AlertTriangle } from 'lucide-react';
import { useMimoStore } from '../stores/useMimoStore';
import { validateGeminiApiKey } from '../services/mimoGeminiService';

interface MimoApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MimoApiKeyModal: React.FC<MimoApiKeyModalProps> = ({ isOpen, onClose }) => {
  const userApiKey = useMimoStore((s) => s.quota.userApiKey);
  const setUserApiKey = useMimoStore((s) => s.setUserApiKey);

  const [inputKey, setInputKey] = useState(userApiKey || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    const trimmed = inputKey.trim();
    if (!trimmed) {
      setValidationError('Please enter a Gemini API key');
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    const check = await validateGeminiApiKey(trimmed);
    setIsValidating(false);

    if (check.valid) {
      setUserApiKey(trimmed);
      setSavedSuccess(true);
      setValidationError(null);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 900);
    } else {
      setValidationError(check.error || 'Invalid API key. Please verify from Google AI Studio.');
    }
  };

  const handleRemove = () => {
    setInputKey('');
    setUserApiKey('');
    setValidationError(null);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">
              Connect Gemini API Key
            </h3>
            <p className="text-xs text-neutral-500">
              Bring Your Own Key (BYOK) for Mimo pair writing
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-4 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 space-y-1">
          <div className="font-semibold text-neutral-900 dark:text-white">
            Free via Google AI Studio
          </div>
          <p className="text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-300">
            Google provides free Authorization keys (starting with <code className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">AQ...</code>) with high rate limits for Gemini 3.8 Flash. Your key stays stored locally in your browser storage.
          </p>
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 dark:text-brand-400 font-semibold underline underline-offset-2 hover:opacity-80 inline-flex items-center gap-1 mt-1"
          >
            <span>Get your free Gemini key at aistudio.google.com/apikey</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Input Field with live feedback */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Gemini API Key
            </label>
            {userApiKey && !validationError && (
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" />
                API Key Connected
              </span>
            )}
          </div>
          <input
            type="password"
            value={inputKey}
            onChange={(e) => {
              setInputKey(e.target.value);
              if (validationError) setValidationError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
              }
            }}
            placeholder="AQ... or AIza..."
            className={`w-full px-3 py-2 rounded-lg border bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white font-mono focus:outline-none transition-colors ${
              validationError
                ? 'border-rose-500 ring-2 ring-rose-500/20'
                : savedSuccess || (userApiKey && inputKey === userApiKey)
                ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                : 'border-neutral-200 dark:border-neutral-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
            }`}
          />

          {/* Deprecated Key Format Warning Banner */}
          {inputKey.trim().startsWith('AIza') && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800 text-xs space-y-1.5 animate-in fade-in duration-150">
              <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Deprecated Key Format (AIza...)</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                Google has deprecated unrestricted legacy standard keys as of May 2026. Please generate a fresh Authorization key (starts with <span className="font-mono font-bold">AQ...</span>) from Google AI Studio and paste it here.
              </p>
              <div className="pt-0.5">
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 dark:text-amber-200 underline underline-offset-2 hover:opacity-80"
                >
                  <span>Generate new AQ key at aistudio.google.com/apikey</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {validationError && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-700 dark:text-rose-300 space-y-1">
              <div className="flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                <span className="leading-relaxed">{validationError}</span>
              </div>
              {validationError.includes('aistudio.google.com') && (
                <div className="pl-5 pt-0.5">
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-rose-800 dark:text-rose-200 underline hover:opacity-80"
                  >
                    <span>Open Google AI Studio to get a new key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          {userApiKey ? (
            <button
              onClick={handleRemove}
              className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 cursor-pointer font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Key</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isValidating}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isValidating}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Connected</span>
                </>
              ) : (
                <span>Connect Key</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
