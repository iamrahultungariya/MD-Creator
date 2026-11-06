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
  Cpu,
  ShieldCheck,
} from 'lucide-react';
import { useUserAiStore } from '../../../stores/useUserAiStore';
import { useMimoStore } from '../../../features/mimo/stores/useMimoStore';
import { OPENROUTER_MODELS, OPENROUTER_DEFAULT_MODEL } from '../../../types/userAi';
import { validateOpenRouterApiKey, getAppReferer, APP_TITLE } from '../../../services/openRouterService';
import { validateGeminiApiKey } from '../../../features/mimo/services/mimoGeminiService';

export const PreferencesAiTab: React.FC = () => {
  const {
    provider,
    setProvider,
    openRouterApiKey,
    setOpenRouterApiKey,
    openRouterModel,
    setOpenRouterModel,
    isOpenRouterKeyVerified,
    setIsOpenRouterKeyVerified,
    openRouterFallbackToGemini,
    setOpenRouterFallbackToGemini,
  } = useUserAiStore();

  // Gemini store bindings
  const userGeminiKey = useMimoStore((s) => s.quota.userApiKey) || '';
  const setUserGeminiKey = useMimoStore((s) => s.setUserApiKey);
  const selectedGeminiModel = useMimoStore((s) => s.selectedModel);
  const setSelectedGeminiModel = useMimoStore((s) => s.setSelectedModel);

  // Local OpenRouter key state
  const [openRouterInput, setOpenRouterInput] = useState(openRouterApiKey);
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const [isValidatingOpenRouter, setIsValidatingOpenRouter] = useState(false);
  const [openRouterMessage, setOpenRouterMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isCustomModel, setIsCustomModel] = useState(!OPENROUTER_MODELS.some((m) => m.id === openRouterModel));
  const [customModelInput, setCustomModelInput] = useState(
    !OPENROUTER_MODELS.some((m) => m.id === openRouterModel) ? openRouterModel : ''
  );

  // Local Gemini key state
  const [geminiInput, setGeminiInput] = useState(userGeminiKey);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isValidatingGemini, setIsValidatingGemini] = useState(false);
  const [geminiMessage, setGeminiMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Validate & Save OpenRouter Key
  const handleSaveOpenRouterKey = async () => {
    const clean = openRouterInput.trim();
    if (!clean) {
      setOpenRouterMessage({ text: 'Please enter an OpenRouter API key.', isError: true });
      return;
    }

    setIsValidatingOpenRouter(true);
    setOpenRouterMessage(null);

    const targetModel = isCustomModel ? customModelInput.trim() || OPENROUTER_DEFAULT_MODEL : openRouterModel;
    const res = await validateOpenRouterApiKey(clean, targetModel);
    setIsValidatingOpenRouter(false);

    if (res.valid) {
      setOpenRouterApiKey(clean);
      setIsOpenRouterKeyVerified(true);
      if (res.warning) {
        setOpenRouterMessage({ text: res.warning, isError: false });
      } else {
        setOpenRouterMessage({
          text: `Verified! Latency: ${res.latencyMs || 0}ms${res.label ? ` • Key: ${res.label}` : ''}`,
          isError: false,
        });
      }
    } else {
      setIsOpenRouterKeyVerified(false);
      setOpenRouterMessage({ text: res.error || 'Authentication failed. Please verify key.', isError: true });
    }
  };

  const handleClearOpenRouterKey = () => {
    setOpenRouterInput('');
    setOpenRouterApiKey('');
    setIsOpenRouterKeyVerified(false);
    setOpenRouterMessage(null);
  };

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

  const currentReferer = getAppReferer();

  return (
    <div className="space-y-6 text-neutral-800 dark:text-neutral-200">
      {/* Overview Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 via-brand-500/10 to-indigo-500/10 border border-violet-500/20 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-600/20 text-[#8257F5] dark:text-violet-400 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <div className="font-semibold text-xs text-neutral-900 dark:text-white flex items-center gap-2"><span>AI Provider &amp; Model Selection</span><span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-violet-500/20 text-[#8257F5] dark:text-violet-300 font-bold">Active: {provider === 'openrouter' ? `OpenRouter (${openRouterModel})` : 'Google Gemini'}</span></div>
          <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Choose which AI engine powers your pair writing, editing, and smart transformations. You can switch between Google Gemini and OpenRouter anytime.
          </p>
        </div>
      </div>

      {/* Provider Selector Cards */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-[#8257F5]" />
          <span>Select AI Provider</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Gemini Option */}
          <button
            type="button"
            onClick={() => setProvider('gemini')}
            className={`p-4 rounded-xl border text-left transition-all relative cursor-pointer ${
              provider === 'gemini'
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20 shadow-xs'
                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/40 dark:bg-neutral-900/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                  G
                </div>
                <div>
                  <span className="font-semibold text-xs text-neutral-900 dark:text-white">
                    Google Gemini
                  </span>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Native Cloud Engine
                  </div>
                </div>
              </div>
              <input
                type="radio"
                name="ai_provider"
                checked={provider === 'gemini'}
                onChange={() => setProvider('gemini')}
                className="w-4 h-4 text-emerald-600 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2">
              Gemini 3.5 Flash-Lite &amp; 3.8 Flash. Built-in free quota with Google AI Studio key.
            </p>
          </button>

          {/* OpenRouter Option */}
          <button
            type="button"
            onClick={() => setProvider('openrouter')}
            className={`p-4 rounded-xl border text-left transition-all relative cursor-pointer ${
              provider === 'openrouter'
                ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-950/20 ring-2 ring-violet-500/20 shadow-xs'
                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/40 dark:bg-neutral-900/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 text-[#8257F5] dark:text-violet-400 flex items-center justify-center font-bold text-xs">
                  OR
                </div>
                <div>
                  <span className="font-semibold text-xs text-neutral-900 dark:text-white">
                    OpenRouter
                  </span>
                  <div className="text-[10px] text-[#8257F5] dark:text-violet-400 font-medium">
                    1st Model: stealth/crouton-alpha
                  </div>
                </div>
              </div>
              <input
                type="radio"
                name="ai_provider"
                checked={provider === 'openrouter'}
                onChange={() => setProvider('openrouter')}
                className="w-4 h-4 text-[#8257F5] cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2">
              Universal AI Gateway. Access Crouton Alpha reasoning, Claude 3.5, and DeepSeek with your personal OpenRouter key.
            </p>
          </button>
        </div>
      </div>

      {/* Provider Details & Configuration */}
      {provider === 'openrouter' ? (
        /* ================= OpenRouter Section ================= */
        <div className="p-4 rounded-xl bg-neutral-50/70 dark:bg-[#181620] border border-neutral-200/90 dark:border-neutral-800 space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800 pb-3">
            <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-violet-500/10 text-[#8257F5] flex items-center justify-center"><KeyRound className="w-3.5 h-3.5" /></div><span className="text-xs font-semibold text-neutral-900 dark:text-white">OpenRouter Key &amp; Model Setup</span></div>
            <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#8257F5] dark:text-violet-400 hover:underline flex items-center gap-1 font-medium"><span>Get API Key</span><ExternalLink className="w-3 h-3" /></a>
          </div>

          {/* Model Selection Dropdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Primary Model
              </label>
              <span className="text-[10px] text-neutral-400">
                Default: <code className="font-mono text-[#8257F5]">stealth/crouton-alpha</code>
              </span>
            </div>

            <select
              value={isCustomModel ? 'custom' : openRouterModel}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setIsCustomModel(true);
                  if (!customModelInput) setCustomModelInput(openRouterModel);
                } else {
                  setIsCustomModel(false);
                  setOpenRouterModel(e.target.value);
                }
              }}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#8257F5] focus:ring-1 focus:ring-[#8257F5]"
            >
              {OPENROUTER_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.badge ? `(${m.badge})` : ''} — {m.id}
                </option>
              ))}
              <option value="custom">⚙️ Custom OpenRouter Model ID...</option>
            </select>

            {isCustomModel && (
              <div className="pt-2">
                <input
                  type="text"
                  value={customModelInput}
                  onChange={(e) => {
                    setCustomModelInput(e.target.value);
                    setOpenRouterModel(e.target.value.trim());
                  }}
                  placeholder="e.g. meta-llama/llama-3.3-70b-instruct"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:border-[#8257F5]"
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                  Enter any valid model ID listed on{' '}
                  <a
                    href="https://openrouter.ai/models"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#8257F5]"
                  >
                    openrouter.ai/models
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* OpenRouter API Key Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                OpenRouter API Key
              </label>
              {isOpenRouterKeyVerified && (
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Key Connected
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type={showOpenRouterKey ? 'text' : 'password'}
                value={openRouterInput}
                onChange={(e) => {
                  setOpenRouterInput(e.target.value);
                  if (openRouterMessage) setOpenRouterMessage(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveOpenRouterKey();
                  }
                }}
                placeholder="sk-or-v1-..."
                className="w-full pl-3 pr-20 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:border-[#8257F5] focus:ring-1 focus:ring-[#8257F5]"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button type="button" onClick={() => setShowOpenRouterKey(!showOpenRouterKey)} className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200" title={showOpenRouterKey ? "Hide key" : "Show key"}>{showOpenRouterKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
                {openRouterInput && (
                  <button type="button" onClick={handleClearOpenRouterKey} className="p-1 text-neutral-400 hover:text-rose-500" title="Clear key"><Trash2 className="w-3.5 h-3.5" /></button>
                )}
              </div>
            </div>

            {openRouterMessage && (
              <div
                className={`text-[11px] p-2.5 rounded-lg flex items-center gap-2 ${
                  openRouterMessage.isError
                    ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                }`}
              >
                {openRouterMessage.isError ? (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{openRouterMessage.text}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSaveOpenRouterKey}
              disabled={isValidatingOpenRouter || !openRouterInput.trim()}
              className="px-4 py-2 rounded-lg bg-[#8257F5] hover:bg-[#7245e5] text-white text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isValidatingOpenRouter ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Testing &amp; Saving...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify &amp; Save OpenRouter Key</span>
                </>
              )}
            </button>
          </div>

          {/* Fallback to Gemini toggle */}
          <div className="pt-3 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-neutral-900 dark:text-white">
                Fallback to Google Gemini
              </div>
              <p className="text-[10px] text-neutral-500">
                If OpenRouter credits are exhausted or endpoint is unreachable, automatically fall back to Gemini
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={openRouterFallbackToGemini}
                onChange={(e) => setOpenRouterFallbackToGemini(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-neutral-600 peer-checked:bg-[#8257F5]"></div>
            </label>
          </div>

          {/* Request Header Spec Information */}
          <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800 text-[10px] font-mono space-y-1 text-neutral-600 dark:text-neutral-400">
            <div className="font-semibold text-neutral-700 dark:text-neutral-300">
              OpenRouter Request Spec:
            </div>
            <div>POST: https://openrouter.ai/api/v1/chat/completions</div>
            <div>HTTP-Referer: {currentReferer}</div>
            <div>X-Title: {APP_TITLE}</div>
            <div>Model: {openRouterModel}</div>
          </div>
        </div>
      ) : (
        /* ================= Gemini Section ================= */
        <div className="p-4 rounded-xl bg-neutral-50/70 dark:bg-[#181620] border border-neutral-200/90 dark:border-neutral-800 space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800 pb-3">
            <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><KeyRound className="w-3.5 h-3.5" /></div><span className="text-xs font-semibold text-neutral-900 dark:text-white">Google Gemini Key &amp; Tier Selection</span></div>
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"><span>Get Free Key at Google AI Studio</span><ExternalLink className="w-3 h-3" /></a>
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
                <button type="button" onClick={() => setShowGeminiKey(!showGeminiKey)} className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200" title={showGeminiKey ? "Hide key" : "Show key"}>{showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
                {geminiInput && (
                  <button type="button" onClick={handleClearGeminiKey} className="p-1 text-neutral-400 hover:text-rose-500" title="Clear key"><Trash2 className="w-3.5 h-3.5" /></button>
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
      )}
    </div>
  );
};
