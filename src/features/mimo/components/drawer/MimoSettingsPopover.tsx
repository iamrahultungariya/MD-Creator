import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Brain, 
  KeyRound, 
  Palette, 
  SlidersHorizontal, 
  Check, 
  Eye, 
  EyeOff, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  Zap,
  X,
  Loader2,
  AlertCircle,
  ChevronDown,
  BarChart3,
  RefreshCw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useMimoStore } from '../../stores/useMimoStore';
import { useStyleDnaStore } from '../../stores/useStyleDnaStore';
import { StyleTone, StyleFormatting } from '../../types/styleDnaTypes';
import { MimoAvatar } from '../MimoAvatar';
import { validateGeminiApiKey, fetchLiveGeminiHealthAndQuota } from '../../services/mimoGeminiService';

interface MimoSettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'controls' | 'byok' | 'style' | 'usage';

export const MimoSettingsPopover: React.FC<MimoSettingsPopoverProps> = ({ isOpen, onClose }) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>('controls');

  // Mimo Store state
  const webSearchEnabled = useMimoStore((s) => s.webSearchEnabled);
  const setWebSearchEnabled = useMimoStore((s) => s.setWebSearchEnabled);
  const showThinking = useMimoStore((s) => s.showThinking);
  const setShowThinking = useMimoStore((s) => s.setShowThinking);
  const thinkingLevel = useMimoStore((s) => s.thinkingLevel);
  const setThinkingLevel = useMimoStore((s) => s.setThinkingLevel);
  const selectedModel = useMimoStore((s) => s.selectedModel);
  const setSelectedModel = useMimoStore((s) => s.setSelectedModel);
  const touchMimoActivity = useMimoStore((s) => s.touchMimoActivity);
  const storeApiKey = useMimoStore((s) => s.quota.userApiKey) || '';
  const envApiKey = (
    (import.meta.env.VITE_GEMINI_API_KEY as string) ||
    (import.meta.env.GEMINI_API_KEY as string) ||
    ''
  ).trim();
  const userApiKey = storeApiKey || (envApiKey && !envApiKey.includes('your_gemini') ? envApiKey : '');
  const setUserApiKey = useMimoStore((s) => s.setUserApiKey);
  const dailyUsagePercent = useMimoStore((s) => s.quota.dailyUsagePercent) || 0;
  const monthlyDocGenCount = useMimoStore((s) => s.quota.monthlyDocGenCount) || 0;
  const quota = useMimoStore((s) => s.quota);
  const totalTokensToday = quota.totalTokensToday || 0;
  const promptTokensToday = quota.promptTokensToday || 0;
  const candidatesTokensToday = quota.candidatesTokensToday || 0;
  const requestsToday = quota.requestsToday || 0;
  const lastRequestLatencyMs = quota.lastRequestLatencyMs || 0;
  const liveApiStatus = quota.liveApiStatus || (userApiKey ? 'HEALTHY' : 'UNCONFIGURED');
  const liveLatencyMs = quota.liveLatencyMs || lastRequestLatencyMs || 0;
  const modelUsageToday = quota.modelUsageToday || {};
  const lastCheckedTimestamp = quota.lastCheckedTimestamp;

  const [isFetchingLiveUsage, setIsFetchingLiveUsage] = useState(false);
  const [liveFetchError, setLiveFetchError] = useState<string | null>(null);
  const [fetchSuccessMessage, setFetchSuccessMessage] = useState<string | null>(null);

  const handleFetchLiveUsage = async () => {
    setIsFetchingLiveUsage(true);
    setLiveFetchError(null);
    setFetchSuccessMessage(null);
    try {
      const res = await fetchLiveGeminiHealthAndQuota(userApiKey);
      if (res.valid) {
        setFetchSuccessMessage(`Live Ping: ${res.latencyMs}ms • Google AI Verified`);
        setTimeout(() => setFetchSuccessMessage(null), 3500);
      } else if (res.error) {
        setLiveFetchError(res.error);
      }
    } catch (e: any) {
      setLiveFetchError(e?.message || 'Failed to ping Google AI');
    } finally {
      setIsFetchingLiveUsage(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'usage' && userApiKey && (!lastCheckedTimestamp || Date.now() - lastCheckedTimestamp > 120000)) {
      handleFetchLiveUsage();
    }
  }, [activeTab, userApiKey]);

  // BYOK local state
  const [keyInput, setKeyInput] = useState('');
  const [showKeyText, setShowKeyText] = useState(false);
  const [keySavedToast, setKeySavedToast] = useState(false);
  const [isEditingKey, setIsEditingKey] = useState(!userApiKey);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyValidationError, setKeyValidationError] = useState<string | null>(null);
  const [isKeyValid, setIsKeyValid] = useState<boolean>(Boolean(userApiKey));

  // StyleDNA Store state
  const tone = useStyleDnaStore((s) => s.tone);
  const setTone = useStyleDnaStore((s) => s.setTone);
  const formatting = useStyleDnaStore((s) => s.formatting);
  const setFormatting = useStyleDnaStore((s) => s.setFormatting);
  const voiceBias = useStyleDnaStore((s) => s.voiceBias);
  const setVoiceBias = useStyleDnaStore((s) => s.setVoiceBias);
  const bannedWords = useStyleDnaStore((s) => s.bannedWords);
  const customPromptInstruction = useStyleDnaStore((s) => s.customPromptInstruction) || '';
  const setCustomPromptInstruction = useStyleDnaStore((s) => s.setCustomPromptInstruction);

  const [isToneDropdownOpen, setIsToneDropdownOpen] = useState(false);
  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false);

  // Sync key state on open
  useEffect(() => {
    if (isOpen) {
      setIsEditingKey(!userApiKey);
      setKeyInput(userApiKey);
      setKeyValidationError(null);
      setIsKeyValid(Boolean(userApiKey));
    }
  }, [isOpen, userApiKey]);

  // Close on click outside or escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSaveApiKey = async () => {
    const trimmed = keyInput.trim();
    if (!trimmed) {
      setKeyValidationError('Please enter a Gemini API key');
      return;
    }

    setIsValidatingKey(true);
    setKeyValidationError(null);

    const check = await validateGeminiApiKey(trimmed);
    setIsValidatingKey(false);

    if (check.valid) {
      setUserApiKey(trimmed);
      setIsKeyValid(true);
      setKeyValidationError(null);
      setIsEditingKey(false);
      setKeySavedToast(true);
      touchMimoActivity();
      setTimeout(() => setKeySavedToast(false), 2000);
    } else {
      setIsKeyValid(false);
      setKeyValidationError(check.error || 'Invalid API key. Please check your key from Google AI Studio.');
    }
  };

  const handleClearApiKey = () => {
    setUserApiKey('');
    setKeyInput('');
    setIsEditingKey(true);
    setIsKeyValid(false);
    setKeyValidationError(null);
    touchMimoActivity();
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 10) return '••••••••';
    return `${key.slice(0, 6)}••••••••${key.slice(-4)}`;
  };

  return (
    <motion.div
      ref={popoverRef}
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className="absolute bottom-full right-0 mb-2 w-80 sm:w-[350px] bg-white dark:bg-neutral-950 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-50 select-none font-sans text-xs"
    >
      {/* Premium Minimal Header (Matching Mimo Drawer Header) */}
      <div className="px-4 py-3 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between bg-white dark:bg-neutral-950">
        <div className="flex items-center gap-2.5">
          <MimoAvatar size="xs" state="happy" />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 tracking-tight">
              Mimo Settings
            </span>
            <span
              className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-md border border-emerald-200/90 dark:border-emerald-800/80 flex items-center gap-1 shadow-2xs"
              title="Client-side local-first configuration"
            >
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
              <span>Local</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono font-medium text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800/80 px-2 py-0.5 rounded-md">
            v2.1.0
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
            title="Close Settings (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Segmented Minimal Navigation Tabs */}
      <div className="px-3 py-2 bg-neutral-50/80 dark:bg-neutral-900/40 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center gap-1">
        <button
          type="button"
          onClick={() => {
            touchMimoActivity();
            setActiveTab('controls');
          }}
          className={`flex-1 py-1.5 px-2 rounded-lg font-medium text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'controls'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs border border-neutral-200/80 dark:border-neutral-700'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          <SlidersHorizontal className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
          <span>Controls</span>
        </button>

        <button
          type="button"
          onClick={() => {
            touchMimoActivity();
            setActiveTab('byok');
          }}
          className={`flex-1 py-1.5 px-2 rounded-lg font-medium text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
            activeTab === 'byok'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs border border-neutral-200/80 dark:border-neutral-700'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          <KeyRound className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
          <span>BYOK Key</span>
          {userApiKey && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            touchMimoActivity();
            setActiveTab('style');
          }}
          className={`flex-1 py-1.5 px-1.5 rounded-lg font-medium text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === 'style'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs border border-neutral-200/80 dark:border-neutral-700'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          <Palette className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
          <span>StyleDNA</span>
        </button>

        <button
          type="button"
          onClick={() => {
            touchMimoActivity();
            setActiveTab('usage');
          }}
          className={`flex-1 py-1.5 px-1.5 rounded-lg font-medium text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === 'usage'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs border border-neutral-200/80 dark:border-neutral-700'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          <BarChart3 className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
          <span>Usage</span>
        </button>
      </div>

      {/* Tab 1: Generation Controls */}
      {activeTab === 'controls' && (
        <div className="p-3.5 space-y-2.5">
          {/* Model Switcher Card */}
          <div className="p-2.5 rounded-xl bg-neutral-50/70 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                AI Model Tier
              </span>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                Gemini API
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => {
                  touchMimoActivity();
                  setSelectedModel('gemini-3.8-flash');
                }}
                className={`py-1.5 px-1.5 rounded-lg text-left transition-all cursor-pointer border ${
                  selectedModel === 'gemini-3.8-flash'
                    ? 'border-neutral-400 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold shadow-2xs'
                    : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-1 text-[10.5px]">
                  <Brain className="w-3 h-3 text-neutral-700 dark:text-neutral-300 shrink-0" />
                  <span className="truncate">3.8 Flash</span>
                </div>
                <div className="text-[9px] text-neutral-500 dark:text-neutral-400 font-normal truncate">
                  Deep Reason
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  touchMimoActivity();
                  setSelectedModel('gemini-3.5-flash');
                }}
                className={`py-1.5 px-1.5 rounded-lg text-left transition-all cursor-pointer border ${
                  selectedModel === 'gemini-3.5-flash'
                    ? 'border-neutral-400 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold shadow-2xs'
                    : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-1 text-[10.5px]">
                  <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">3.5 Flash</span>
                </div>
                <div className="text-[9px] text-neutral-500 dark:text-neutral-400 font-normal truncate">
                  Balanced
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  touchMimoActivity();
                  setSelectedModel('gemini-3.5-flash-lite');
                }}
                className={`py-1.5 px-1.5 rounded-lg text-left transition-all cursor-pointer border ${
                  selectedModel === 'gemini-3.5-flash-lite'
                    ? 'border-neutral-400 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold shadow-2xs'
                    : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-1 text-[10.5px]">
                  <Zap className="w-3 h-3 text-neutral-700 dark:text-neutral-300 shrink-0" />
                  <span className="truncate">3.5 Lite</span>
                </div>
                <div className="text-[9px] text-neutral-500 dark:text-neutral-400 font-normal truncate">
                  High Speed
                </div>
              </button>
            </div>
          </div>

          {/* Toggle: Web Search Grounding */}
          <div className="p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 flex items-start justify-between gap-2.5">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="p-1 rounded-md bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0 mt-0.5">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                  Web Search Grounding
                </div>
                <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400 leading-relaxed mt-0.5">
                  Ground responses with live Google Search results for fresh real-time facts.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={webSearchEnabled}
              onClick={() => {
                touchMimoActivity();
                setWebSearchEnabled(!webSearchEnabled);
              }}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-0.5 ${
                webSearchEnabled ? 'bg-neutral-900 dark:bg-neutral-100' : 'bg-neutral-200 dark:bg-neutral-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-neutral-950 shadow-xs ring-0 transition duration-200 ease-in-out ${
                  webSearchEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle: Show Thinking */}
          <div className="p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 flex items-start justify-between gap-2.5">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="p-1 rounded-md bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0 mt-0.5">
                <Brain className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs flex items-center gap-1.5">
                  <span>Show Thinking Process</span>
                  {!showThinking && (
                    <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-1.5 py-0.2 rounded-md border border-emerald-200/90 dark:border-emerald-800/80">
                      Token Saver
                    </span>
                  )}
                </div>
                <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400 leading-relaxed mt-0.5">
                  {showThinking
                    ? 'Internal model reasoning steps are streamed and rendered.'
                    : 'Zero extra reasoning tokens. Instant direct response.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={showThinking}
              onClick={() => {
                touchMimoActivity();
                setShowThinking(!showThinking);
              }}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-0.5 ${
                showThinking ? 'bg-neutral-900 dark:bg-neutral-100' : 'bg-neutral-200 dark:bg-neutral-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-neutral-950 shadow-xs ring-0 transition duration-200 ease-in-out ${
                  showThinking ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Thinking Depth Pills (when thinking enabled) */}
          {showThinking && selectedModel === 'gemini-3.8-flash' && (
            <div className="p-2.5 rounded-xl bg-neutral-50/70 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-500 dark:text-neutral-400 font-medium">
                  Reasoning Budget
                </span>
                <span className="font-mono text-neutral-700 dark:text-neutral-300 font-semibold text-[10px]">
                  {thinkingLevel}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1 p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 text-[10px]">
                {(['AUTO', 'LOW', 'MEDIUM', 'HIGH'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      touchMimoActivity();
                      setThinkingLevel(lvl);
                    }}
                    className={`py-1 rounded-md text-center font-medium transition-all cursor-pointer ${
                      thinkingLevel === lvl
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white font-semibold shadow-2xs'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                    }`}
                  >
                    {lvl === 'MEDIUM' ? 'Med' : lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: BYOK Gemini API Key */}
      {activeTab === 'byok' && (
        <div className="p-3.5 space-y-2.5">
          {userApiKey && !isEditingKey ? (
            <div className="p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-neutral-900 dark:text-neutral-100 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>API Key Connected</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-200/90 dark:border-emerald-800/80 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>Connected</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 font-mono text-xs">
                <span className="text-neutral-800 dark:text-neutral-200 truncate">
                  {showKeyText ? userApiKey : maskKey(userApiKey)}
                </span>
                <button
                  type="button"
                  onClick={() => setShowKeyText(!showKeyText)}
                  className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 ml-1 cursor-pointer"
                  title={showKeyText ? 'Hide key' : 'Show key'}
                >
                  {showKeyText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Your personal Gemini API key is stored locally and securely in your browser.
              </p>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-200/60 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={handleClearApiKey}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingKey(true)}
                  className="px-3 py-1 rounded-lg text-[11px] font-medium text-neutral-900 dark:text-white bg-neutral-200/80 hover:bg-neutral-300/80 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  Change Key
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                    Connect Gemini API Key
                  </div>
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    Connect your personal Google Gemini API key
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="relative">
                  <input
                    type={showKeyText ? 'text' : 'password'}
                    value={keyInput}
                    onChange={(e) => {
                      setKeyInput(e.target.value);
                      if (keyValidationError) setKeyValidationError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveApiKey();
                      }
                    }}
                    placeholder="AIza... or AQ..."
                    className={`w-full px-3 py-2 pr-8 rounded-xl border bg-white dark:bg-neutral-950 text-xs text-neutral-900 dark:text-neutral-100 font-mono placeholder:text-neutral-400 focus:outline-none transition-colors ${
                      keyValidationError
                        ? 'border-rose-500 ring-2 ring-rose-500/20'
                        : isKeyValid && keyInput.trim()
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'border-neutral-200 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-neutral-100'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyText(!showKeyText)}
                    className="absolute right-2 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer"
                  >
                    {showKeyText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {keyValidationError && (
                  <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[10.5px] text-rose-700 dark:text-rose-300 space-y-1">
                    <div className="flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                      <span className="leading-relaxed">{keyValidationError}</span>
                    </div>
                    {keyValidationError.includes('aistudio.google.com') && (
                      <div className="pl-4 pt-0.5">
                        <a
                          href="https://aistudio.google.com/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold underline text-rose-800 dark:text-rose-200 hover:opacity-80"
                        >
                          <span>Get a new key at Google AI Studio</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10.5px] font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:underline"
                >
                  <span>Get free key at Google AI Studio</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>

                <div className="flex items-center gap-1.5">
                  {userApiKey && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingKey(false);
                        setKeyValidationError(null);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveApiKey}
                    disabled={!keyInput.trim() || isValidatingKey}
                    className="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white font-semibold text-xs shadow-2xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {isValidatingKey ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Checking...</span>
                      </>
                    ) : keySavedToast ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
                        <span>Connected</span>
                      </>
                    ) : (
                      <span>Connect Key</span>
                    )}
                  </button>
                </div>
              </div>

              {keySavedToast && (
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/90 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold text-center animate-in fade-in">
                  ✓ Personal API Key Connected
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: StyleDNA Profile */}
      {activeTab === 'style' && (
        <div className="p-3.5 space-y-2.5">
          {/* Tone Down-Arrow Dropdown Selector */}
          <div className="p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                Author Voice Tone
              </span>
              <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 font-semibold uppercase">
                {tone}
              </span>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  touchMimoActivity();
                  setIsToneDropdownOpen(!isToneDropdownOpen);
                  setIsFormatDropdownOpen(false);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-xs text-neutral-900 dark:text-neutral-100 flex items-center justify-between font-medium cursor-pointer shadow-2xs hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
              >
                <span>
                  {tone === 'crisp-technical'
                    ? 'Crisp Technical'
                    : tone === 'conversational'
                    ? 'Conversational'
                    : tone === 'academic'
                    ? 'Academic'
                    : tone === 'executive'
                    ? 'Executive Brief'
                    : 'Ultra Concise'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${isToneDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isToneDropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl p-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 space-y-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {[
                    { id: 'crisp-technical', label: 'Crisp Technical', desc: 'Direct, informative, zero fluff' },
                    { id: 'conversational', label: 'Conversational', desc: 'Natural, friendly & engaging' },
                    { id: 'academic', label: 'Academic', desc: 'Rigorous citations & structure' },
                    { id: 'executive', label: 'Executive', desc: 'Decision-oriented & crisp TL;DR' },
                    { id: 'concise', label: 'Ultra Concise', desc: 'Dense bullets, minimal tokens' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        touchMimoActivity();
                        setTone(item.id as StyleTone);
                        setIsToneDropdownOpen(false);
                      }}
                      className={`w-full px-2 py-1.5 rounded-lg flex items-center justify-between text-left text-xs transition-colors cursor-pointer ${
                        tone === item.id
                          ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-white'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{item.label}</span>
                        <span className="text-[10px] text-neutral-400 font-normal">{item.desc}</span>
                      </div>
                      {tone === item.id && (
                        <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Formatting Down-Arrow Dropdown Selector */}
          <div className="p-2.5 rounded-xl bg-neutral-50/70 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800 space-y-2 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-neutral-700 dark:text-neutral-300 font-semibold text-xs">
                Formatting Structure
              </span>
              <span className="text-neutral-500 dark:text-neutral-400 text-[10px] font-mono">{formatting}</span>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  touchMimoActivity();
                  setIsFormatDropdownOpen(!isFormatDropdownOpen);
                  setIsToneDropdownOpen(false);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-xs text-neutral-900 dark:text-neutral-100 flex items-center justify-between font-medium cursor-pointer shadow-2xs hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
              >
                <span>
                  {formatting === 'balanced'
                    ? 'Balanced (Headings & Prose)'
                    : formatting === 'bullet-heavy'
                    ? 'Bullet-Heavy (Scanability)'
                    : 'Prose-Focused (Narrative)'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${isFormatDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFormatDropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl p-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 space-y-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {[
                    { id: 'balanced', label: 'Balanced', desc: 'Headings, short paragraphs, & bullet points' },
                    { id: 'bullet-heavy', label: 'Bullets', desc: 'Bullet points with bold lead-ins for high scanability' },
                    { id: 'prose-focused', label: 'Prose', desc: 'Cohesive narrative prose with smooth transitions' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        touchMimoActivity();
                        setFormatting(item.id as StyleFormatting);
                        setIsFormatDropdownOpen(false);
                      }}
                      className={`w-full px-2 py-1.5 rounded-lg flex items-center justify-between text-left text-xs transition-colors cursor-pointer ${
                        formatting === item.id
                          ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-white'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{item.label}</span>
                        <span className="text-[10px] text-neutral-400 font-normal">{item.desc}</span>
                      </div>
                      {formatting === item.id && (
                        <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-neutral-700 dark:text-neutral-300 font-medium text-[11px]">
                Strict Active Voice
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={voiceBias === 'active-strict'}
                onClick={() => {
                  touchMimoActivity();
                  setVoiceBias(voiceBias === 'active-strict' ? 'neutral' : 'active-strict');
                }}
                className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  voiceBias === 'active-strict' ? 'bg-neutral-900 dark:bg-neutral-100' : 'bg-neutral-200 dark:bg-neutral-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white dark:bg-neutral-950 shadow-xs ring-0 transition duration-200 ease-in-out ${
                    voiceBias === 'active-strict' ? 'translate-x-3' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Custom Persona / Instructions (Max 150 words) */}
          <div className="p-2.5 rounded-xl bg-neutral-50/70 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                Custom Instructions
              </span>
              <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                {customPromptInstruction ? customPromptInstruction.trim().split(/\s+/).filter(Boolean).length : 0} / 150 words
              </span>
            </div>
            <textarea
              value={customPromptInstruction}
              onChange={(e) => {
                const val = e.target.value;
                const words = val.trim().split(/\s+/).filter(Boolean);
                if (words.length <= 150) {
                  setCustomPromptInstruction(val);
                } else {
                  setCustomPromptInstruction(words.slice(0, 150).join(' '));
                }
              }}
              rows={2}
              placeholder="e.g. Answer with direct action points, code snippets first, no fluff, speak in Hinglish when helpful..."
              className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 resize-none font-sans leading-relaxed"
            />
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
              Mimo will follow these exact response rules in every prompt.
            </p>
          </div>

          {/* Banned Words Protection Summary */}
          <div className="p-2 rounded-xl bg-neutral-50/70 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800 text-[10.5px] text-neutral-600 dark:text-neutral-400 flex items-center justify-between">
            <span>AI Cliché Filter Active:</span>
            <span className="font-mono font-medium text-neutral-900 dark:text-neutral-200">
              {bannedWords.length} words blocked
            </span>
          </div>
        </div>
      )}

      {/* Tab 4: Live Visual Usage & Quota Metrics */}
      {activeTab === 'usage' && (
        <div className="p-3 space-y-2.5 max-h-[440px] overflow-y-auto">
          {/* 1. Live Google AI Health & Status Banner */}
          <div className="p-2.5 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {userApiKey ? (
                  liveApiStatus === 'THROTTLED' ? (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                    </span>
                  ) : liveApiStatus === 'OFFLINE' ? (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                    </span>
                  ) : (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                  )
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                )}
                <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                  {userApiKey
                    ? liveApiStatus === 'THROTTLED'
                      ? 'Rate Limit (Cooling Down)'
                      : liveApiStatus === 'OFFLINE'
                      ? 'Connection Error'
                      : 'Google Gemini Online'
                    : 'Free Shared Demo Tier'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {liveLatencyMs > 0 && (
                  <span className="font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-200/90 dark:border-emerald-800/80 flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5" />
                    {liveLatencyMs}ms
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleFetchLiveUsage}
                  disabled={isFetchingLiveUsage || !userApiKey}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200/80 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-[10px] font-medium transition-colors disabled:opacity-40 cursor-pointer"
                  title="Fetch live health & ping from Google AI"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${isFetchingLiveUsage ? 'animate-spin' : ''}`} />
                  <span>{isFetchingLiveUsage ? 'Fetching...' : 'Fetch Live'}</span>
                </button>
              </div>
            </div>

            {fetchSuccessMessage && (
              <div className="px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800 text-[10.5px] text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{fetchSuccessMessage}</span>
              </div>
            )}

            {liveFetchError && (
              <div className="px-2 py-1 rounded-md bg-rose-50 dark:bg-rose-950/60 border border-rose-200/70 dark:border-rose-800 text-[10.5px] text-rose-800 dark:text-rose-300 flex items-center gap-1.5 animate-in fade-in">
                <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
                <span className="truncate">{liveFetchError}</span>
              </div>
            )}

            <div className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
              <span>{userApiKey ? 'BYOK Personal Key Active' : 'Shared project demo quota'}</span>
              <span>
                {lastCheckedTimestamp
                  ? `Checked ${Math.max(0, Math.round((Date.now() - lastCheckedTimestamp) / 60000))}m ago`
                  : 'Ready to fetch'}
              </span>
            </div>
          </div>

          {/* 2. Visual Metric Gauges (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-2">
            {/* KPI 1: Requests Today */}
            <div className="p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-[10px] font-medium">
                <span>Requests Today</span>
                <BarChart3 className="w-3 h-3 text-neutral-400" />
              </div>
              <div className="text-base font-bold text-neutral-900 dark:text-white">
                {requestsToday}{' '}
                <span className="text-[10px] font-normal text-neutral-500">
                  / {userApiKey ? '1,500' : '45'}
                </span>
              </div>
              {/* Visual Progress Bar */}
              <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                  style={{
                    width: `${userApiKey ? Math.min(100, Math.max(3, (requestsToday / 1500) * 100)) : Math.min(100, Math.max(3, dailyUsagePercent))}%`,
                  }}
                />
              </div>
              <span className="text-[9.5px] text-neutral-400 block truncate">
                {userApiKey
                  ? '1,500 daily requests (RPD)'
                  : `${Math.max(0, Math.round(100 - dailyUsagePercent))}% demo quota remaining`}
              </span>
            </div>

            {/* KPI 2: Tokens Consumed */}
            <div className="p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-[10px] font-medium">
                <span>Tokens Consumed</span>
                <Sparkles className="w-3 h-3 text-amber-500" />
              </div>
              <div className="text-base font-bold text-neutral-900 dark:text-white">
                {totalTokensToday > 1000 ? `${(totalTokensToday / 1000).toFixed(1)}k` : totalTokensToday}{' '}
                <span className="text-[10px] font-normal text-neutral-500">tok</span>
              </div>
              {/* Segmented Token Bar */}
              <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-blue-500"
                  style={{
                    width: `${totalTokensToday > 0 ? (promptTokensToday / totalTokensToday) * 100 : 50}%`,
                  }}
                  title="Prompt tokens"
                />
                <div
                  className="h-full bg-emerald-500"
                  style={{
                    width: `${totalTokensToday > 0 ? (candidatesTokensToday / totalTokensToday) * 100 : 50}%`,
                  }}
                  title="Generation tokens"
                />
              </div>
              <span className="text-[9.5px] text-neutral-400 block truncate">
                In: {promptTokensToday > 1000 ? `${(promptTokensToday / 1000).toFixed(1)}k` : promptTokensToday} • Out: {candidatesTokensToday > 1000 ? `${(candidatesTokensToday / 1000).toFixed(1)}k` : candidatesTokensToday}
              </span>
            </div>
          </div>

          {/* 3. Visual Model Fleet Cards (Gemini 3.x Family) */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10.5px] font-semibold text-neutral-700 dark:text-neutral-300 px-0.5">
              Gemini 3.x Model Fleet & Usage
            </span>

            {/* Card: 3.5 Flash-Lite */}
            <div className={`p-2.5 rounded-xl border transition-all ${
              selectedModel === 'gemini-3.5-flash-lite'
                ? 'border-neutral-900 dark:border-neutral-200 bg-white dark:bg-neutral-900 shadow-2xs'
                : 'border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                    Gemini 3.5 Flash-Lite
                  </span>
                  {selectedModel === 'gemini-3.5-flash-lite' && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Active
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedModel('gemini-3.5-flash-lite');
                    touchMimoActivity();
                  }}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    selectedModel === 'gemini-3.5-flash-lite'
                      ? 'text-neutral-400 cursor-default'
                      : 'bg-neutral-200/70 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  {selectedModel === 'gemini-3.5-flash-lite' ? 'Selected' : 'Use'}
                </button>
              </div>
              <div className="mt-1.5 space-y-1">
                <div className="flex justify-between text-[10px] text-neutral-500">
                  <span>Usage: {modelUsageToday['gemini-3.5-flash-lite']?.requests || 0} reqs</span>
                  <span>{modelUsageToday['gemini-3.5-flash-lite']?.tokens || 0} tokens</span>
                </div>
                <div className="w-full h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(2, ((modelUsageToday['gemini-3.5-flash-lite']?.requests || 0) / 100) * 100))}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-neutral-400">
                  <span>Fast pair writing</span>
                  <span>1,500 RPD • 15 RPM</span>
                </div>
              </div>
            </div>

            {/* Card: 3.5 Flash */}
            <div className={`p-2.5 rounded-xl border transition-all ${
              selectedModel === 'gemini-3.5-flash'
                ? 'border-neutral-900 dark:border-neutral-200 bg-white dark:bg-neutral-900 shadow-2xs'
                : 'border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                    Gemini 3.5 Flash
                  </span>
                  {selectedModel === 'gemini-3.5-flash' && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Active
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedModel('gemini-3.5-flash');
                    touchMimoActivity();
                  }}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    selectedModel === 'gemini-3.5-flash'
                      ? 'text-neutral-400 cursor-default'
                      : 'bg-neutral-200/70 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  {selectedModel === 'gemini-3.5-flash' ? 'Selected' : 'Use'}
                </button>
              </div>
              <div className="mt-1.5 space-y-1">
                <div className="flex justify-between text-[10px] text-neutral-500">
                  <span>Usage: {modelUsageToday['gemini-3.5-flash']?.requests || 0} reqs</span>
                  <span>{modelUsageToday['gemini-3.5-flash']?.tokens || 0} tokens</span>
                </div>
                <div className="w-full h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(2, ((modelUsageToday['gemini-3.5-flash']?.requests || 0) / 100) * 100))}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-neutral-400">
                  <span>Balanced workhorse</span>
                  <span>1,500 RPD • 15 RPM</span>
                </div>
              </div>
            </div>

            {/* Card: 3.8 Flash */}
            <div className={`p-2.5 rounded-xl border transition-all ${
              selectedModel === 'gemini-3.8-flash'
                ? 'border-neutral-900 dark:border-neutral-200 bg-white dark:bg-neutral-900 shadow-2xs'
                : 'border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                    Gemini 3.8 Flash
                  </span>
                  {selectedModel === 'gemini-3.8-flash' && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Active
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedModel('gemini-3.8-flash');
                    touchMimoActivity();
                  }}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    selectedModel === 'gemini-3.8-flash'
                      ? 'text-neutral-400 cursor-default'
                      : 'bg-neutral-200/70 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  {selectedModel === 'gemini-3.8-flash' ? 'Selected' : 'Use'}
                </button>
              </div>
              <div className="mt-1.5 space-y-1">
                <div className="flex justify-between text-[10px] text-neutral-500">
                  <span>Usage: {modelUsageToday['gemini-3.8-flash']?.requests || 0} reqs</span>
                  <span>{modelUsageToday['gemini-3.8-flash']?.tokens || 0} tokens</span>
                </div>
                <div className="w-full h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(2, ((modelUsageToday['gemini-3.8-flash']?.requests || 0) / 100) * 100))}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-neutral-400">
                  <span>Deep reasoning</span>
                  <span>10 RPM • 250k TPM</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Monthly Document Generator Card */}
          <div className="p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                Monthly AI Doc Generator
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300">
                {userApiKey ? 'Unlimited with Key' : `${monthlyDocGenCount}/3 Used`}
              </span>
            </div>
            {!userApiKey && (
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                {[0, 1, 2].map((slotIdx) => (
                  <div
                    key={slotIdx}
                    className={`h-1.5 rounded-full ${
                      slotIdx < monthlyDocGenCount ? 'bg-neutral-400' : 'bg-emerald-500'
                    }`}
                  />
                ))}
              </div>
            )}
            <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400">
              {userApiKey
                ? 'Full multi-chapter generation is unconstrained via your connected personal API key.'
                : `${Math.max(0, 3 - monthlyDocGenCount)} generation(s) remaining this month on free demo.`}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};
