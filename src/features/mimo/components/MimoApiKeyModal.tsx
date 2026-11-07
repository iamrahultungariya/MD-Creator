import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Key, ExternalLink, Check, Trash2, Loader2, AlertCircle, Zap } from 'lucide-react';
import { useMimoStore } from '../stores/useMimoStore';
import { validateGeminiApiKey } from '../services/mimoGeminiService';

interface MimoApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MimoApiKeyModal: React.FC<MimoApiKeyModalProps> = ({ isOpen, onClose }) => {
  const userGeminiApiKey = useMimoStore((s) => s.quota.userApiKey) || '';
  const setUserGeminiApiKey = useMimoStore((s) => s.setUserApiKey);
  const quota = useMimoStore((s) => s.quota);
  const requestsToday = quota.requestsToday || 0;
  const totalTokensToday = quota.totalTokensToday || 0;
  const promptTokensToday = quota.promptTokensToday || 0;
  const candidatesTokensToday = quota.candidatesTokensToday || 0;
  const liveLatencyMs = quota.liveLatencyMs || quota.lastRequestLatencyMs || 0;

  const [inputKey, setInputKey] = useState(userGeminiApiKey);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    const trimmed = inputKey.trim();
    if (!trimmed) {
      setValidationError('Please enter a valid Gemini API key');
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    const check = await validateGeminiApiKey(trimmed);
    setIsValidating(false);

    if (check.valid) {
      setUserGeminiApiKey(trimmed);
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
    setValidationError(null);
    setUserGeminiApiKey('');
  };

  const isConnected = Boolean(userGeminiApiKey && inputKey === userGeminiApiKey);

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
            Google provides free Gemini API keys (supports both <code className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">AIza...</code> and <code className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">AQ...</code> formats). Your key stays stored locally in your browser.
          </p>
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 dark:text-emerald-400 font-semibold underline underline-offset-2 hover:opacity-80 inline-flex items-center gap-1 mt-1"
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
            {isConnected && !validationError && (
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
            placeholder="AIza... or AQ..."
            className={`w-full px-3 py-2 rounded-lg border bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white font-mono focus:outline-none transition-colors ${
              validationError
                ? 'border-rose-500 ring-2 ring-rose-500/20'
                : savedSuccess || isConnected
                ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                : 'border-neutral-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
            }`}
          />

          {validationError && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-700 dark:text-rose-300 space-y-1">
              <div className="flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                <span className="leading-relaxed">{validationError}</span>
              </div>
            </div>
          )}
        </div>

        {/* Live Visual Quota & Usage Card if Gemini Key is Connected */}
        {userGeminiApiKey && (
          <div className="mb-5 p-3 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-850/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Live Quota &amp; Real Usage
              </span>
              {liveLatencyMs > 0 && (
                <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5" />
                  {liveLatencyMs}ms
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-700/80 space-y-1">
                <div className="flex justify-between text-[10px] text-neutral-500">
                  <span>Requests Today</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{requestsToday} / 1,500</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(3, (requestsToday / 1500) * 100))}%` }}
                  />
                </div>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-700/80 space-y-1">
                <div className="flex justify-between text-[10px] text-neutral-500">
                  <span>Tokens Consumed</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {totalTokensToday > 1000 ? `${(totalTokensToday / 1000).toFixed(1)}k` : totalTokensToday}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${totalTokensToday > 0 ? (promptTokensToday / totalTokensToday) * 100 : 50}%` }}
                  />
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${totalTokensToday > 0 ? (candidatesTokensToday / totalTokensToday) * 100 : 50}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          {isConnected ? (
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
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
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
