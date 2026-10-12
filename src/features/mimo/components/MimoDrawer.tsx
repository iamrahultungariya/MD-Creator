import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Send,
  Trash2,
  Wand2,
  Sparkles,
  StopCircle,
  FileText,
  PenTool,
  BookOpen,
  HelpCircle,
  Languages,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { useMimoStore, computeTaskCostPercent } from '../stores/useMimoStore';
import { MimoAvatar } from './MimoAvatar';
import { MimoChatMessage } from './MimoChatMessage';
import { MimoQuotaRing } from './MimoQuotaRing';
import { MimoApiKeyModal } from './MimoApiKeyModal';
import { MimoPrivacyModal } from './MimoPrivacyModal';
import { MimoQuickAction, MimoActivityType, ActivityTelemetry } from '../types/mimoTypes';
import { enhanceUserPrompt } from '../services/promptRouter';
import { prepareMimoContext } from '../services/contextEngine';
import { extractDiffHunkFromResponse, computeLineDiff } from '../services/diffService';
import { streamMimoResponse } from '../services/mimoGeminiService';
import { telemetryService } from '../../../services/telemetryService';

interface MimoDrawerProps {
  docId: string;
  title: string;
  content: string;
  setContent: (val: string) => void;
  executeSave: (val: string, title: string) => Promise<void> | void;
  onToast: (msg: string) => void;
  isAiExcluded?: boolean;
  cursorLine?: number;
}

export const MimoDrawer: React.FC<MimoDrawerProps> = ({
  docId,
  title,
  content,
  setContent,
  executeSave,
  onToast,
  isAiExcluded = false,
  cursorLine = 1,
}) => {
  const isOpen = useMimoStore((s) => s.isOpen);
  const setIsOpen = useMimoStore((s) => s.setIsOpen);
  const syncActiveDocument = useMimoStore((s) => s.syncActiveDocument);
  const messages = useMimoStore((s) => s.messages);
  const addMessage = useMimoStore((s) => s.addMessage);
  const updateLastMessage = useMimoStore((s) => s.updateLastMessage);
  const clearMessages = useMimoStore((s) => s.clearMessages);
  const mascotState = useMimoStore((s) => s.mascotState);
  const setMascotState = useMimoStore((s) => s.setMascotState);
  const thinkingLevel = useMimoStore((s) => s.thinkingLevel);
  const setThinkingLevel = useMimoStore((s) => s.setThinkingLevel);
  const activeActivity = useMimoStore((s) => s.activeActivity);
  const setActiveActivity = useMimoStore((s) => s.setActiveActivity);
  const setActiveDiffHunk = useMimoStore((s) => s.setActiveDiffHunk);
  const applyActiveDiff = useMimoStore((s) => s.applyActiveDiff);
  const discardActiveDiff = useMimoStore((s) => s.discardActiveDiff);
  const isKeyModalOpen = useMimoStore((s) => s.isKeyModalOpen);
  const setIsKeyModalOpen = useMimoStore((s) => s.setIsKeyModalOpen);
  const isPrivacyModalOpen = useMimoStore((s) => s.isPrivacyModalOpen);
  const setIsPrivacyModalOpen = useMimoStore((s) => s.setIsPrivacyModalOpen);
  const acceptPrivacyNotice = useMimoStore((s) => s.acceptPrivacyNotice);
  const quota = useMimoStore((s) => s.quota);
  const consumeCredit = useMimoStore((s) => s.consumeCredit);
  const userApiKey = useMimoStore((s) => s.quota.userApiKey) || '';

  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync active document & restore per-document persistent chat history
  useEffect(() => {
    if (docId) {
      syncActiveDocument(docId, title || 'Untitled Document');
    }
  }, [docId, title, syncActiveDocument]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeActivity]);

  const handleApplyDiff = useCallback(
    (hunkId?: string) => {
      const res = applyActiveDiff(content);
      if (res.success) {
        setContent(res.nextContent);
        executeSave(res.nextContent, title);
        onToast('✨ Applied Mimo changes to document!');
        if (hunkId) {
          updateLastMessage((m) => {
            if (m.diffHunk && m.diffHunk.id === hunkId) {
              return { ...m, diffHunk: { ...m.diffHunk, isApplied: true } };
            }
            return m;
          });
        }
      } else {
        onToast('Could not auto-apply diff. Please review modified lines.');
      }
    },
    [applyActiveDiff, content, setContent, executeSave, title, onToast, updateLastMessage]
  );

  const handleDiscardDiff = useCallback(
    (hunkId?: string) => {
      discardActiveDiff();
      onToast('Discarded proposed changes.');
      if (hunkId) {
        updateLastMessage((m) => {
          if (m.diffHunk && m.diffHunk.id === hunkId) {
            return { ...m, diffHunk: { ...m.diffHunk, isDiscarded: true } };
          }
          return m;
        });
      }
    },
    [discardActiveDiff, onToast, updateLastMessage]
  );

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const stoppedElapsed = startTimeRef.current
      ? Math.max(100, Date.now() - startTimeRef.current)
      : 500;

    setActiveActivity(null);
    updateLastMessage((m) => ({
      ...m,
      text: m.text ? `${m.text}\n\n*(Generation stopped by user)*` : '*(Generation stopped by user)*',
      activity: m.activity
        ? {
            ...m.activity,
            isDone: true,
            isStopped: true,
            metrics: {
              ...m.activity.metrics,
              elapsedMs: stoppedElapsed,
            },
          }
        : undefined,
    }));
    setIsGenerating(false);
    setMascotState('happy');
  };

  const handleCycleThinkingMode = () => {
    const order: ('AUTO' | 'LOW' | 'MEDIUM' | 'HIGH')[] = ['AUTO', 'LOW', 'MEDIUM', 'HIGH'];
    const currentIdx = order.indexOf(thinkingLevel === 'MINIMAL' ? 'LOW' : thinkingLevel);
    const next = order[(currentIdx + 1) % order.length];
    setThinkingLevel(next);
  };

  const getThinkingModeLabel = () => {
    if (thinkingLevel === 'LOW' || thinkingLevel === 'MINIMAL') return 'Fast • Flash-Lite';
    if (thinkingLevel === 'MEDIUM') return 'Balanced • Flash-Lite';
    if (thinkingLevel === 'HIGH') return 'Deep • 3.8 Flash';
    return 'Auto Router (Smart)';
  };

  const handleSendPrompt = async (customPrompt?: string) => {
    const raw = customPrompt !== undefined ? customPrompt : inputPrompt;
    if (!raw.trim() || isGenerating) return;

    // AI-exclusion document guardrail
    if (isAiExcluded) {
      onToast('🛡️ This document is excluded from AI scan. Change setting in Document Sidebar.');
      return;
    }

    // First-use privacy check
    if (!quota.hasAcceptedPrivacyNotice && !userApiKey) {
      setIsPrivacyModalOpen(true);
      return;
    }

    // Determine task type
    const pLower = raw.toLowerCase();
    const isDocGen =
      pLower.includes('generate document') ||
      pLower.includes('pura document') ||
      pLower.includes('create complete');
    const isEdit =
      pLower.includes('change') ||
      pLower.includes('edit') ||
      pLower.includes('improve') ||
      pLower.includes('diff');
    const isTranslate =
      pLower.includes('translate') || pLower.includes('hinglish') || pLower.includes('hindi');
    const isSummarize = pLower.includes('summarize') || pLower.includes('summary');

    // Pre-flight quota check (0% deduction upfront; actual tokens deducted after completion)
    const preflightCheck = consumeCredit(0, isDocGen);
    if (!preflightCheck.allowed) {
      onToast(preflightCheck.reason || 'Daily AI capacity reached');
      setIsKeyModalOpen(true);
      return;
    }

    const userMessageId = `user-${Date.now()}`;
    addMessage({
      id: userMessageId,
      role: 'user',
      text: raw.trim(),
      timestamp: Date.now(),
    });

    setInputPrompt('');
    setIsGenerating(true);
    setMascotState('thinking');
    telemetryService.trackFeatureUsed('mimo_ai');

    const startTime = Date.now();
    startTimeRef.current = startTime;

    // Context preparation (full document awareness for <=1000 LOC)
    const context = prepareMimoContext({
      docId,
      title,
      content,
      userPrompt: raw,
      cursorLine,
    });

    // Activity setup
    const activityType: MimoActivityType = isDocGen
      ? 'generating'
      : isEdit
      ? 'improving'
      : isTranslate
      ? 'translating'
      : isSummarize
      ? 'summarizing'
      : context.guardrailTriggered
      ? 'analyzing'
      : 'thinking';

    const activityTitle =
      activityType === 'generating'
        ? 'Synthesizing Document'
        : activityType === 'improving'
        ? 'Computing Non-Destructive Diff'
        : activityType === 'translating'
        ? `Translating "${context.docTitle}"`
        : activityType === 'summarizing'
        ? `Summarizing "${context.docTitle}"`
        : activityType === 'analyzing'
        ? 'Scanning Document (LOC Guardrail)'
        : `Analyzing "${context.docTitle}"`;

    const initialActivity: ActivityTelemetry = {
      type: activityType,
      title: activityTitle,
      subtitle: `Doc: "${context.docTitle}" (${context.linesAnalyzed} lines • ${context.totalWords} words)`,
      metrics: {
        linesScanned: context.linesAnalyzed,
        tokenVelocity: 88,
        modelName: thinkingLevel === 'HIGH' ? 'Gemini 3.8 Flash' : 'Gemini 3.5 Flash-Lite',
        thinkingLevel: thinkingLevel,
        elapsedMs: 0,
        diffDelta: { additions: 0, deletions: 0 },
      },
      reasoningSteps: [
        `Connected to "${context.docTitle}" (${context.linesAnalyzed} LOC, ${context.totalWords} words)`,
      ],
      isDone: false,
    };
    setActiveActivity(initialActivity);

    // Placeholder assistant message
    const assistantMessageId = `asst-${Date.now()}`;
    addMessage({
      id: assistantMessageId,
      role: 'assistant',
      text: '',
      thoughtText: '',
      activity: initialActivity,
      timestamp: Date.now(),
    });

    abortControllerRef.current = new AbortController();

    try {
      setMascotState('typing');

      const result = await streamMimoResponse({
        apiKey: userApiKey,
        prompt: raw,
        context,
        thinkingLevel,
        signal: abortControllerRef.current.signal,
        callbacks: {
          onModelResolved: (modelLabel, level) => {
            setActiveActivity((prev) =>
              prev
                ? {
                    ...prev,
                    metrics: { ...prev.metrics, modelName: modelLabel, thinkingLevel: level },
                  }
                : null
            );
            updateLastMessage((m) => ({
              ...m,
              activity: m.activity
                ? {
                    ...m.activity,
                    metrics: {
                      ...m.activity.metrics,
                      modelName: modelLabel,
                      thinkingLevel: level,
                    },
                  }
                : m.activity,
            }));
          },
          onThoughtChunk: (thoughtChunk) => {
            updateLastMessage((m) => ({
              ...m,
              thoughtText: (m.thoughtText || '') + thoughtChunk,
            }));
          },
          onTextChunk: (textChunk) => {
            updateLastMessage((m) => ({
              ...m,
              text: (m.text || '') + textChunk,
            }));
          },
          onTokenVelocity: (tokPerSec) => {
            setActiveActivity((prev) =>
              prev
                ? {
                    ...prev,
                    metrics: { ...prev.metrics, tokenVelocity: tokPerSec },
                  }
                : null
            );
          },
          onReasoningStep: (step) => {
            setActiveActivity((prev) =>
              prev
                ? {
                    ...prev,
                    reasoningSteps: [...(prev.reasoningSteps || []), step],
                  }
                : null
            );
            updateLastMessage((m) => ({
              ...m,
              activity: m.activity
                ? {
                    ...m.activity,
                    reasoningSteps: [...(m.activity.reasoningSteps || []), step],
                  }
                : m.activity,
            }));
          },
        },
      });

      // If aborted via Stop button, handleStop already finalized the message
      if (result.aborted) {
        return;
      }

      // Deduct proportional token-based credit only on successful completion
      const actualCostPercent = computeTaskCostPercent(
        result.tokensUsed,
        result.resolvedLevel,
        isDocGen,
        result.modelUsed
      );
      if (actualCostPercent > 0) {
        consumeCredit(actualCostPercent, isDocGen);
      }

      // Extract unified git hunk if present
      const { cleanText, hunk } = extractDiffHunkFromResponse(result.fullText, content);
      let diffDelta = { additions: 0, deletions: 0 };
      if (hunk) {
        setActiveDiffHunk(hunk);
        const computed = computeLineDiff(hunk.originalLines, hunk.proposedLines);
        diffDelta = { additions: computed.additions, deletions: computed.deletions };
      }

      const elapsedMs = Math.max(200, Date.now() - startTime);
      const completedActivity: ActivityTelemetry = {
        ...initialActivity,
        isDone: true,
        metrics: {
          ...initialActivity.metrics,
          modelName: result.modelUsed,
          thinkingLevel: result.resolvedLevel,
          tokensUsed: result.tokensUsed,
          elapsedMs,
          diffDelta,
        },
      };

      updateLastMessage((m) => ({
        ...m,
        text: cleanText || m.text,
        thoughtText: result.thoughtText || m.thoughtText,
        activity: m.activity
          ? {
              ...m.activity,
              isDone: true,
              metrics: {
                ...m.activity.metrics,
                modelName: result.modelUsed,
                thinkingLevel: result.resolvedLevel,
                tokensUsed: result.tokensUsed,
                elapsedMs,
                diffDelta,
              },
            }
          : completedActivity,
        diffHunk: hunk || undefined,
      }));

      setActiveActivity(null);
      setMascotState(hunk ? 'excited' : 'happy');
    } catch (err: any) {
      console.error('Mimo execution failed', err);
      const errElapsed = Math.max(200, Date.now() - startTime);
      setActiveActivity(null);
      updateLastMessage((m) => ({
        ...m,
        text:
          m.text ||
          'I encountered an issue processing this request. Please try again or connect your Gemini API key.',
        activity: m.activity
          ? {
              ...m.activity,
              isDone: true,
              metrics: { ...m.activity.metrics, elapsedMs: errElapsed },
            }
          : undefined,
      }));
      setMascotState('happy');
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleEnhancePrompt = () => {
    if (!inputPrompt.trim()) {
      onToast('Enter a prompt first to enhance it!');
      return;
    }
    const { enhanced, language } = enhanceUserPrompt(inputPrompt);
    setInputPrompt(enhanced);
    onToast(`✨ Enhanced prompt (${language.toUpperCase()} mode)!`);
    setMascotState('excited');
  };

  const handleQuickAction = (action: MimoQuickAction) => {
    if (action === 'improve') {
      handleSendPrompt('Review the current document and propose improvements with a clean diff.');
    } else if (action === 'summarize') {
      handleSendPrompt('Summarize key takeaways of this document in high-impact bullet points.');
    } else if (action === 'write') {
      handleSendPrompt('Help me outline the next section with headings and structured notes.');
    } else if (action === 'explain') {
      handleSendPrompt('Explain the core concepts and arguments made in this document.');
    } else if (action === 'translate') {
      handleSendPrompt('Translate the main takeaways into Hinglish with clear technical explanations.');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[460px] md:w-[490px] bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col font-sans animate-in slide-in-from-right duration-250 select-text">
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-950/40 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <MimoAvatar size="sm" state={mascotState} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-neutral-950 dark:text-white shrink-0">
                  Mimo ✦
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/80 flex items-center gap-1 shrink-0">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  Private Vault
                </span>
              </div>
              <p
                className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium truncate max-w-[230px]"
                title={`Active Document: ${title || 'Untitled Document'}`}
              >
                📄 {title || 'Untitled Document'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Hidden Quota Tracker (appears after 50% usage) */}
            <MimoQuotaRing />

            {/* Clear Chat */}
            <button
              onClick={clearMessages}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Clear chat history for this document"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Close Mimo (Ctrl+J)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isAiExcluded && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 shadow-2xs">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-amber-950 dark:text-amber-100">Document Shielded from AI</div>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                  AI scanning is turned off for this document. Content is strictly private and will never be sent to any external model. You can re-enable it in Document Sidebar &gt; Info.
                </p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MimoChatMessage
              key={msg.id}
              message={msg}
              onApplyDiff={handleApplyDiff}
              onDiscardDiff={handleDiscardDiff}
            />
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Chips */}
        <div className="px-3 py-2 border-t border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => handleQuickAction('improve')}
            disabled={isGenerating || isAiExcluded}
            className="shrink-0 px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-violet-400 disabled:opacity-40 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <PenTool className="w-3 h-3 text-violet-500" />
            Improve Diff
          </button>
          <button
            onClick={() => handleQuickAction('summarize')}
            disabled={isGenerating || isAiExcluded}
            className="shrink-0 px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-amber-400 disabled:opacity-40 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <BookOpen className="w-3 h-3 text-amber-500" />
            Summarize
          </button>
          <button
            onClick={() => handleQuickAction('write')}
            disabled={isGenerating || isAiExcluded}
            className="shrink-0 px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-cyan-400 disabled:opacity-40 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <FileText className="w-3 h-3 text-cyan-500" />
            Next Section
          </button>
          <button
            onClick={() => handleQuickAction('translate')}
            disabled={isGenerating || isAiExcluded}
            className="shrink-0 px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-sky-400 disabled:opacity-40 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <Languages className="w-3 h-3 text-sky-500" />
            Hinglish
          </button>
          <button
            onClick={() => handleQuickAction('explain')}
            disabled={isGenerating || isAiExcluded}
            className="shrink-0 px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-emerald-400 disabled:opacity-40 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <HelpCircle className="w-3 h-3 text-emerald-500" />
            Explain
          </button>
        </div>

        {/* Input Dock */}
        <div className="p-3 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 shrink-0 space-y-2">
          {/* Controls Bar */}
          <div className="flex items-center justify-between text-xs">
            {/* Interactive Model & Reasoning Selector */}
            <button
              type="button"
              onClick={handleCycleThinkingMode}
              disabled={isGenerating}
              className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100/80 dark:bg-neutral-800/80 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-700 dark:hover:text-violet-300 px-2.5 py-1 rounded-lg border border-neutral-200/80 dark:border-neutral-700/80 cursor-pointer transition-colors"
              title="Click to switch AI Model & Reasoning tier (Auto Router / Fast Flash-Lite / Balanced / Deep 3.8 Flash)"
            >
              <Sparkles className="w-3 h-3 text-violet-500" />
              <span>{getThinkingModeLabel()}</span>
            </button>

            {/* Prompt Enhancer Wand */}
            <button
              onClick={handleEnhancePrompt}
              disabled={isGenerating || !inputPrompt.trim() || isAiExcluded}
              className="px-2.5 py-1 rounded-lg border border-violet-200 dark:border-violet-900 bg-violet-50/60 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 hover:bg-violet-100 disabled:opacity-40 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
              title="Enhance prompt into structured markdown instructions (adapts to your language)"
            >
              <Wand2 className="w-3 h-3 text-violet-600 dark:text-violet-400" />
              <span>Enhance</span>
            </button>
          </div>

          {/* Text Area and Send */}
          <div className="relative flex items-end gap-2 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2 focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500 transition-all">
            <textarea
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              disabled={isAiExcluded}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendPrompt();
                }
              }}
              placeholder={
                isAiExcluded
                  ? 'This document is shielded from AI scanning (enable in Sidebar)'
                  : 'Ask Mimo, edit doc, or type in Hinglish... (Enter to send)'
              }
              rows={2}
              className="w-full bg-transparent text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none resize-none font-sans leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {isGenerating ? (
              <button
                onClick={handleStop}
                className="shrink-0 p-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-xs transition-colors"
                title="Stop generation immediately"
              >
                <StopCircle className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleSendPrompt()}
                disabled={!inputPrompt.trim() || isAiExcluded}
                className="shrink-0 p-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white cursor-pointer shadow-xs transition-colors"
                title="Send instruction to Mimo"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BYOK Gemini API Key Modal */}
      <MimoApiKeyModal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} />

      {/* First-Use Privacy & Offline Transparency Modal */}
      <MimoPrivacyModal
        isOpen={isPrivacyModalOpen}
        onAccept={acceptPrivacyNotice}
        onOpenByok={() => {
          setIsPrivacyModalOpen(false);
          setIsKeyModalOpen(true);
        }}
        onDecline={() => {
          setIsPrivacyModalOpen(false);
          setIsOpen(false);
        }}
      />
    </>
  );
};
