import React, { useState } from 'react';
import {
  Sparkles,
  KeyRound,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { useMimoStore } from '../../../features/mimo/stores/useMimoStore';
import { validateGeminiApiKey } from '../../../features/mimo/services/mimoGeminiService';

export const PreferencesAiTab: React.FC = () => {
  // Gemini store bindings
  const userGeminiKey = useMimoStore((s) => s.quota.userApiKey) || '';
  const setUserGeminiKey = useMimoStore((s) => s.setUserApiKey);
  const selectedGeminiModel = useMimoStore((s) => s.selectedModel);
  const setSelectedGeminiModel = useMimoStore((s) => s.setSelectedModel);

  // Local Gemini key state
  const [geminiInput, setGeminiInput] = useState(userGeminiKey);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isValidatingGemini, setIsValidatingGemini] = useState(false);
  const [geminiMessage, setGeminiMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Validate & Save Gemini Key
  const handleSaveGeminiKey = async () => {
    const clean = geminiInput.trim();
    if (!clean) {
      setGeminiMessage({ text: 'Please enter a Gemini API key.', isError: true });
      return;
    }

    setIsValidatingGemini(true);
    setGeminiMessage(null);

    const check = await validateGeminiApiKey(clean);
    setIsValidatingGemini(false);

    if (check.valid) {
      setUserGeminiKey(clean);
      setGeminiMessage({ text: 'Gemini API Key connected successfully!', isError: false });
    } else {
      setGeminiMessage({ text: check.error || 'Invalid API key. Please verify in Google AI Studio.', isError: true });
    }
  };

  const handleClearGeminiKey = () => {
    setGeminiInput('');
    setUserGeminiKey('');
    setGeminiMessage(null);
  };

  return (
    <div className="space-y-6 text-neutral-800 dark:text-neutral-200">
      {/* Overview Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-brand-500/10 to-teal-500/10 border border-emerald-500/20 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <div className="font-semibold text-xs text-neutral-900 dark:text-white flex items-center gap-2">
            <span>AI Engine &amp; Model Selection</span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold">
              Active: Google Gemini ({selectedGeminiModel})
            </span>
          </div>
          <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Google Gemini powers your pair writing, proofreading, grammar corrections, and intelligent transformations. Configure your model tier or bring your personal Google AI Studio key below.
          </p>
        </div>
      </div>

      {/* Gemini Section */}
      <div className="p-4 rounded-xl bg-neutral-50/70 dark:bg-[#181620] border border-neutral-200/90 dark:border-neutral-800 space-y-5">
        <div className="flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <KeyRound className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-neutral-900 dark:text-white">
              Google Gemini Key &amp; Tier Selection
            </span>
          </div>
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
          >
            <span>Get Free Key at Google AI Studio</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Gemini Model Tier Picker */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Gemini Model Tier
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              {
                id: 'gemini-3.5-flash-lite',
                name: 'Gemini 3.5 Flash-Lite',
                badge: 'Ultra Fast',
                desc: 'Lowest latency & high RPM',
              },
              {
                id: 'gemini-3.5-flash',
                name: 'Gemini 3.5 Flash',
                badge: 'Balanced',
                desc: 'High intelligence & stability',
              },
              {
                id: 'gemini-3.8-flash',
                name: 'Gemini 3.8 Flash',
                badge: 'Deep Reasoning',
                desc: 'Maximum depth synthesis',
              },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedGeminiModel(m.id as any)}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedGeminiModel === m.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-neutral-900 dark:text-white font-medium'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold mb-0.5">
                  <span>{m.badge}</span>
                  {selectedGeminiModel === m.id && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                </div>
                <div className="text-[10px] opacity-80">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Gemini API Key Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Personal Gemini API Key (BYOK)
            </label>
            {userGeminiKey && (
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Key Connected
              </span>
            )}
          </div>

          <div className="relative">
            <input
              type={showGeminiKey ? 'text' : 'password'}
              value={geminiInput}
              onChange={(e) => {
                setGeminiInput(e.target.value);
                if (geminiMessage) setGeminiMessage(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSaveGeminiKey();
                }
              }}
              placeholder="AIza... or AQ..."
              className="w-full pl-3 pr-20 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                title={showGeminiKey ? 'Hide key' : 'Show key'}
              >
                {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              {geminiInput && (
                <button
                  type="button"
                  onClick={handleClearGeminiKey}
                  className="p-1 text-neutral-400 hover:text-rose-500"
                  title="Clear key"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {geminiMessage && (
            <div
              className={`text-[11px] p-2.5 rounded-lg flex items-center gap-2 ${
                geminiMessage.isError
                  ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              {geminiMessage.isError ? (
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{geminiMessage.text}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleSaveGeminiKey}
            disabled={isValidatingGemini || !geminiInput.trim()}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isValidatingGemini ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Validating Key...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify &amp; Save Gemini Key</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
