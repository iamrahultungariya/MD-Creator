import React, { useState } from 'react';
import {
  Cpu,
  KeyRound,
  ShieldCheck,
  Brain,
  Zap,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Play,
  RefreshCw,
  ExternalLink,
  Lock,
  FileText,
  Terminal,
  Check,
} from 'lucide-react';
import { useAdminAiStore, OPENROUTER_CROUTON_MODEL } from '../../stores/useAdminAiStore';
import {
  validateOpenRouterApiKey,
  runThinkingCapabilityProbe,
} from '../../services/openRouterService';
import { evaluateContextPrivacyPolicy } from '../../services/adminAiContextFilter';
import { PreparedContext } from '../../features/mimo/services/contextEngine';

interface AdminAiSettingsTabProps {
  showToast: (msg: string) => void;
}

export const AdminAiSettingsTab: React.FC<AdminAiSettingsTabProps> = ({ showToast }) => {
  const {
    defaultProvider,
    setDefaultProvider,
    openRouterApiKey,
    setOpenRouterApiKey,
    isKeyVerified,
    setIsKeyVerified,
    lastVerificationDate,
    enableThinking,
    reasoningEffort,
    temperature,
    maxTokens,
    setThinkingConfig,
    fallbackToGeminiOnFailure,
    setFallbackToGemini,
    privacy,
    setPrivacyConfig,
    probeResult,
    setProbeResult,
  } = useAdminAiStore();

  // Local UI State
  const [keyInput, setKeyInput] = useState(openRouterApiKey);
  const [showKeyText, setShowKeyText] = useState(false);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyValidationMessage, setKeyValidationMessage] = useState<string | null>(null);

  // Thinking Probe State
  const [isRunningProbe, setIsRunningProbe] = useState(false);

  // Privacy Preview Simulator State
  const [testSimPrompt, setTestSimPrompt] = useState('What is the difference between let and const?');
  const [simHasSelection, setSimHasSelection] = useState(false);

  // Handle API Key Save & Validate
  const handleValidateAndSaveKey = async () => {
    const trimmed = keyInput.trim();
    if (!trimmed) {
      setKeyValidationMessage('Please enter a valid OpenRouter API key.');
      return;
    }

    setIsValidatingKey(true);
    setKeyValidationMessage(null);

    const res = await validateOpenRouterApiKey(trimmed, OPENROUTER_CROUTON_MODEL);
    setIsValidatingKey(false);

    if (res.valid) {
      setOpenRouterApiKey(trimmed);
      setIsKeyVerified(true);
      if (res.warning) {
        showToast('Key authenticated! Check workspace BYOK setting.');
        setKeyValidationMessage(res.warning);
      } else {
        showToast(`Key verified successfully (${res.latencyMs || 0}ms latency)`);
        setKeyValidationMessage(
          `Verified (${res.latencyMs || 0}ms latency). ${res.freeLimitRemaining !== undefined ? `${res.freeLimitRemaining} free requests left today.` : ''}`
        );
      }
    } else {
      setIsKeyVerified(false);
      setKeyValidationMessage(res.error || 'Failed to authenticate key with OpenRouter.');
    }
  };

  const handleClearKey = () => {
    setKeyInput('');
    setOpenRouterApiKey('');
    setIsKeyVerified(false);
    setKeyValidationMessage(null);
    showToast('OpenRouter API Key removed.');
  };

  // Run Thinking Diagnostic Probe
  const handleRunThinkingProbe = async () => {
    if (!openRouterApiKey && !keyInput.trim()) {
      showToast('Please add and verify your OpenRouter API Key first.');
      return;
    }

    const activeKey = openRouterApiKey || keyInput.trim();
    setIsRunningProbe(true);

    try {
      const result = await runThinkingCapabilityProbe({
        apiKey: activeKey,
        model: OPENROUTER_CROUTON_MODEL,
        effort: reasoningEffort,
      });

      setProbeResult(result);
      if (result.status === 'supported') {
        showToast('Diagnostic Complete: Native reasoning tokens supported!');
      } else if (result.status === 'tag_based') {
        showToast('Diagnostic Complete: Model uses <think> tags.');
      } else if (result.status === 'unsupported') {
        showToast('Diagnostic Complete: Model outputs direct text without thinking tokens.');
      } else {
        showToast(`Diagnostic Warning: ${result.errorMessage || 'Check error details'}`);
      }
    } finally {
      setIsRunningProbe(false);
    }
  };

  // Simulated Context Evaluation for Privacy Shield
  const mockPreparedContext: PreparedContext = {
    docId: 'mock-doc-1',
    docTitle: 'Confidential Product Specs 2026.md',
    rawContent: `# Executive Summary\nInternal roadmap with proprietary algorithms and revenue metrics.\nLine 3 to 150 redacted...`,
    contextMode: 'full_safe',
    contextText: `# Executive Summary\nInternal roadmap with proprietary algorithms and revenue metrics.\n(148 lines of document content)`,
    linesAnalyzed: 150,
    totalDocLines: 150,
    totalWords: 840,
    headings: ['# Executive Summary', '## Architecture', '## Secrets'],
    guardrailTriggered: false,
    selectedText: simHasSelection ? 'const AUTH_TOKEN = "sk-live-secret";' : undefined,
    activeHeadingPath: '## Architecture',
  };

  const simPrivacyResult = evaluateContextPrivacyPolicy(
    testSimPrompt,
    mockPreparedContext,
    privacy
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-black text-white tracking-tight">
              AI Engine &amp; OpenRouter Administration
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Admin Exclusive
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Configure default AI models, manage OpenRouter credentials, test thinking &amp; reasoning capabilities, and enforce Zero Pre-Feed privacy policies.
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
          <span className="text-neutral-400">Active Engine:</span>
          <span
            className={`font-bold font-mono px-2 py-0.5 rounded-md ${
              defaultProvider === 'openrouter'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {defaultProvider === 'openrouter' ? 'OpenRouter Crouton Alpha' : 'Google Gemini (Native)'}
          </span>
        </div>
      </div>

      {/* Grid: Provider Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Google Gemini */}
        <div
          onClick={() => {
            setDefaultProvider('gemini');
            showToast('Default AI engine switched to Google Gemini');
          }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
            defaultProvider === 'gemini'
              ? 'bg-emerald-950/20 border-emerald-500/60 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/40'
              : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 font-bold">
                  G
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Google Gemini
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono">
                      Standard Default
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-400">Gemini 3.8 Flash, 3.5 Flash &amp; 3.5 Lite</p>
                </div>
              </div>

              {defaultProvider === 'gemini' && (
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Standard multimodal model with deep pair-writing directives, AST section rewriting, and built-in privacy sanitization.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
            <span>Quota: User BYOK / App Key</span>
            <span className="text-emerald-400 font-semibold">Active for all users</span>
          </div>
        </div>

        {/* Card 2: OpenRouter Crouton Alpha */}
        <div
          onClick={() => {
            if (!openRouterApiKey && !keyInput.trim()) {
              showToast('Please configure your OpenRouter API Key below first.');
            }
            setDefaultProvider('openrouter');
            showToast('Default AI engine switched to OpenRouter Crouton Alpha');
          }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
            defaultProvider === 'openrouter'
              ? 'bg-purple-950/20 border-purple-500/60 shadow-lg shadow-purple-950/30 ring-1 ring-purple-500/40'
              : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30 font-bold">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    OpenRouter Crouton Alpha
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono font-bold">
                      Stealth: Free
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-mono">{OPENROUTER_CROUTON_MODEL}</p>
                </div>
              </div>

              {defaultProvider === 'openrouter' && (
                <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              OpenRouter stealth reasoning alpha. Billed at <strong>$0.00</strong> (Free tier). Features Zero Pre-Feed context protection and reasoning telemetry.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
            <span>Price: $0.00 / token</span>
            <span className="text-purple-400 font-semibold">Admin Restricted</span>
          </div>
        </div>
      </div>

      {/* Fallback Option */}
      <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-white">Automatic Upstream Failover</h4>
            <p className="text-[11px] text-neutral-400">
              If OpenRouter is rate-limited (429) or has upstream gateway errors (502), automatically fall back to Gemini.
            </p>
          </div>
        </div>
        <input
          type="checkbox"
          checked={fallbackToGeminiOnFailure}
          onChange={(e) => setFallbackToGemini(e.target.checked)}
          className="w-4 h-4 accent-amber-500 cursor-pointer rounded"
        />
      </div>

      {/* Section: OpenRouter API Key Manager */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">OpenRouter API Key Management</h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <a
              href="https://openrouter.ai/settings/keys"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>Get API Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-neutral-600">•</span>
            <a
              href="https://openrouter.ai/stealth/crouton-alpha"
              target="_blank"
              rel="noreferrer"
              className="text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Model Specs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-medium text-neutral-300">
            OpenRouter Secret Key (<span className="font-mono text-neutral-400">sk-or-v1-...</span>)
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type={showKeyText ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value);
                  setIsKeyVerified(false);
                }}
                placeholder="sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKeyText(!showKeyText)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
                title={showKeyText ? 'Hide Key' : 'Show Key'}
              >
                {showKeyText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleValidateAndSaveKey}
                disabled={isValidatingKey || !keyInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                {isValidatingKey ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save &amp; Verify Key</span>
                  </>
                )}
              </button>

              {openRouterApiKey && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="px-3 py-2.5 rounded-xl bg-neutral-800 hover:bg-rose-950/50 hover:text-rose-400 text-neutral-400 text-xs font-semibold cursor-pointer transition-colors border border-neutral-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Validation Feedback */}
          {keyValidationMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                isKeyVerified
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
              }`}
            >
              {isKeyVerified ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{keyValidationMessage}</span>
            </div>
          )}

          {isKeyVerified && lastVerificationDate && (
            <p className="text-[10px] text-neutral-500 font-mono">
              Last verified: {new Date(lastVerificationDate).toLocaleString()} • Model: {OPENROUTER_CROUTON_MODEL}
            </p>
          )}
        </div>
      </div>

      {/* Section: Live Thinking & Reasoning Capability Inspector */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Brain className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Thinking &amp; Reasoning Capability Inspector
                {probeResult?.status === 'supported' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Native Thinking Supported
                  </span>
                )}
                {probeResult?.status === 'tag_based' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Tag-Based &lt;think&gt;
                  </span>
                )}
                {probeResult?.status === 'unsupported' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-neutral-400 border border-neutral-700">
                    Direct Output (No Thinking)
                  </span>
                )}
              </h3>
              <p className="text-xs text-neutral-400">
                Run live diagnostic probes against {OPENROUTER_CROUTON_MODEL} to inspect whether the model emits reasoning tokens.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunThinkingProbe}
            disabled={isRunningProbe || (!openRouterApiKey && !keyInput.trim())}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-purple-950/40 shrink-0"
          >
            {isRunningProbe ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Testing Model...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Thinking Diagnostic Probe</span>
              </>
            )}
          </button>
        </div>

        {/* Live Probe Results Box */}
        {probeResult && (
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800/80">
                <span className="text-[10px] font-mono text-neutral-400 block">THINKING STATUS</span>
                <span
                  className={`text-xs font-bold capitalize mt-0.5 block ${
                    probeResult.status === 'supported'
                      ? 'text-emerald-400'
                      : probeResult.status === 'tag_based'
                      ? 'text-amber-400'
                      : probeResult.status === 'error'
                      ? 'text-rose-400'
                      : 'text-neutral-300'
                  }`}
                >
                  {probeResult.status.replace('_', ' ')}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800/80">
                <span className="text-[10px] font-mono text-neutral-400 block">LATENCY</span>
                <span className="text-xs font-mono font-bold text-white mt-0.5 block">
                  {probeResult.latencyMs} ms
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800/80">
                <span className="text-[10px] font-mono text-neutral-400 block">TOTAL TOKENS</span>
                <span className="text-xs font-mono font-bold text-white mt-0.5 block">
                  {probeResult.tokensUsed.totalTokens} tok
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800/80">
                <span className="text-[10px] font-mono text-neutral-400 block">BILLED COST</span>
                <span className="text-xs font-mono font-bold text-emerald-400 mt-0.5 block">
                  ${probeResult.cost.toFixed(4)} (Free)
                </span>
              </div>
            </div>

            {probeResult.rawSampleReasoning && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block">
                  Captured Reasoning Chunk / Internal Thought
                </span>
                <pre className="p-3 rounded-xl bg-neutral-900 text-[11px] text-neutral-300 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto border border-neutral-800">
                  {probeResult.rawSampleReasoning}
                </pre>
              </div>
            )}

            {probeResult.errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/30 text-rose-300 text-xs border border-rose-500/30">
                {probeResult.errorMessage}
              </div>
            )}
          </div>
        )}

        {/* Model Thinking & Sampling Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Thinking Toggle */}
          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Send Reasoning Parameter</span>
              <input
                type="checkbox"
                checked={enableThinking}
                onChange={(e) => setThinkingConfig({ enableThinking: e.target.checked })}
                className="w-4 h-4 accent-purple-500 cursor-pointer"
              />
            </div>
            <p className="text-[10px] text-neutral-400 leading-relaxed">
              Passes <code className="text-purple-300 font-mono">reasoning: &#123; effort &#125;</code> to OpenRouter.
            </p>
          </div>

          {/* Reasoning Effort Selector */}
          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-2">
            <span className="text-xs font-bold text-white block">Reasoning Effort</span>
            <div className="flex gap-1.5">
              {(['low', 'medium', 'high'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setThinkingConfig({ reasoningEffort: lvl })}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold capitalize transition-colors cursor-pointer ${
                    reasoningEffort === lvl
                      ? 'bg-purple-600 text-white'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Temperature Slider */}
          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>Temperature</span>
              <span className="font-mono text-purple-400">{temperature}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.1"
              value={temperature}
              onChange={(e) => setThinkingConfig({ temperature: parseFloat(e.target.value) })}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Max Tokens Slider */}
          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>Max Tokens</span>
              <span className="font-mono text-purple-400">{maxTokens}</span>
            </div>
            <input
              type="range"
              min="512"
              max="8192"
              step="256"
              value={maxTokens}
              onChange={(e) => setThinkingConfig({ maxTokens: parseInt(e.target.value, 10) })}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Section: Zero Pre-Feed Privacy Shield */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-6">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Strict Zero Pre-Feed &amp; On-Demand Context Shield
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Data Privacy Enforced
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              Guarantees that your full document or vault files are NEVER dumped automatically into this model.
            </p>
          </div>
        </div>

        {/* Policy Badges & Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Zero Pre-Feed Default
              </span>
              <input
                type="checkbox"
                checked={privacy.strictZeroPreFeed}
                onChange={(e) => setPrivacyConfig({ strictZeroPreFeed: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              When enabled, general inquiries and chat messages transmit <strong>0 bytes</strong> of document text to OpenRouter.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                Allow On-Demand Document Query
              </span>
              <input
                type="checkbox"
                checked={privacy.allowOnDemandTriggers}
                onChange={(e) => setPrivacyConfig({ allowOnDemandTriggers: e.target.checked })}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Context is attached ONLY when you explicitly ask about the document, type <code className="text-amber-400">@doc</code>, or highlight text.
            </p>
          </div>
        </div>

        {/* Live Policy Simulator & JSON Payload Inspector */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-neutral-400" />
              Live Context Simulator: Test what gets sent to OpenRouter
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              {simPrivacyResult.isContextAttached ? '⚠️ Context Attached' : '🛡️ Document Withheld (Zero Leak)'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={testSimPrompt}
              onChange={(e) => setTestSimPrompt(e.target.value)}
              placeholder="Type a test prompt (e.g. 'What is React?' or '@doc summarize this')..."
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-sans placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => setSimHasSelection(!simHasSelection)}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer border ${
                simHasSelection
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
              }`}
            >
              Selection: {simHasSelection ? 'ON (Simulated)' : 'OFF'}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-neutral-400">Verdict: {simPrivacyResult.reason}</span>
              <span className="text-emerald-400">
                Saved: ~{simPrivacyResult.tokensSavedEstimate} tokens
              </span>
            </div>

            <pre className="text-[11px] text-neutral-300 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
              {simPrivacyResult.finalPrompt}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
