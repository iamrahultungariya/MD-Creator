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
  Languages,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { useMimoStore, computeTaskCostPercent } from '../stores/useMimoStore';
import { Mimo3DViewer } from './Mimo3DViewer';
import { MimoChatMessage } from './MimoChatMessage';
import { MimoQuotaRing } from './MimoQuotaRing';
import { MimoApiKeyModal } from './MimoApiKeyModal';
import { MimoPrivacyModal } from './MimoPrivacyModal';
import { MimoQuickAction, MimoActivityType, ActivityTelemetry, MimoToolCall } from '../types/mimoTypes';
import { enhanceUserPrompt } from '../services/promptRouter';
import { prepareMimoContext } from '../services/contextEngine';
import { extractDiffHunkFromResponse, extractToolCallFromResponse, computeLineDiff } from '../services/diffService';
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
  getSelectedText?: () => string;
  onInsertSnippet?: (snippet: string) => void;
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
  getSelectedText,
  onInsertSnippet,
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
  const [activeSelection, setActiveSelection] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const isGeneratingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousContentBeforeToolRef = useRef<string | null>(null);

  // Sync active document & restore per-document persistent chat history
  useEffect(() => {
    if (docId) {
      syncActiveDocument(docId, title || 'Untitled Document');
    }
  }, [docId, title, syncActiveDocument]);

  // Sync active selection whenever Mimo is opened or focused
  useEffect(() => {
    if (isOpen && getSelectedText) {
      const sel = getSelectedText();
      if (sel && sel.trim().length > 0) {
        setActiveSelection(sel.trim());
      }
    }
  }, [isOpen, getSelectedText]);

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


  const handleInsertSnippet = useCallback(

    (snippet: string) => {

      if (onInsertSnippet) {

        onInsertSnippet(snippet);

      } else {

        const next = content.trim() ? `${content.trim()}\n\n${snippet}\n` : `${snippet}\n`;

        setContent(next);

        executeSave(next, title);

        onToast('✨ Inserted snippet into document!');

      }

    },

    [onInsertSnippet, content, setContent, executeSave, title, onToast]

  );



  const handleApplyToolCall = useCallback(
    (toolCall: MimoToolCall) => {
      const { name, arguments: args } = toolCall;
      previousContentBeforeToolRef.current = content;

      if (name === 'insert_at_bottom') {
        const textToInsert = args.content || '';
        const separator = content.endsWith('\n\n') ? '' : content.endsWith('\n') ? '\n' : '\n\n';
        const next = content + separator + textToInsert;
        setContent(next);
        executeSave(next, title);
        onToast('✨ Added content to document bottom!');
      } else if (name === 'insert_at_top') {
        const textToInsert = args.content || '';
        const separator = textToInsert.endsWith('\n\n') ? '' : textToInsert.endsWith('\n') ? '\n' : '\n\n';
        const next = textToInsert + separator + content;
        setContent(next);
        executeSave(next, title);
        onToast('✨ Added content to document top!');
      } else if (name === 'insert_at_cursor' || name === 'generate_table') {
        const textToInsert = args.content || '';
        if (onInsertSnippet) {
          onInsertSnippet(textToInsert);
        } else {
          handleInsertSnippet(textToInsert);
        }
        onToast('✨ Inserted into document!');
      } else if (name === 'insert_katex_formula') {
        const formula = args.displayMode ? `$$\n${args.latex || ''}\n$$` : `$${args.latex || ''}$`;
        if (onInsertSnippet) {
          onInsertSnippet(formula);
        } else {
          handleInsertSnippet(formula);
        }
        onToast('✨ Inserted KaTeX formula!');
      } else if (name === 'set_document_title') {
        if (args.title) {
          executeSave(content, args.title);
          onToast(`✨ Renamed document to "${args.title}"`);
        }
      }

      updateLastMessage((m) => {
        if (m.toolCall && m.toolCall.id === toolCall.id) {
          return { ...m, toolCall: { ...m.toolCall, isApplied: true, isDiscarded: false } };
        }
        return m;
      });
      setMascotState('happy');
    },
    [content, setContent, executeSave, title, onToast, onInsertSnippet, handleInsertSnippet, updateLastMessage, setMascotState]
  );

  const handleDiscardToolCall = useCallback(
    (toolCallId: string) => {
      updateLastMessage((m) => {
        if (m.toolCall && m.toolCall.id === toolCallId) {
          return { ...m, toolCall: { ...m.toolCall, isDiscarded: true } };
        }
        return m;
      });
      onToast('Action discarded.');
    },
    [updateLastMessage, onToast]
  );

  const handleUndoToolCall = useCallback(
    (toolCall: MimoToolCall) => {
      if (previousContentBeforeToolRef.current !== null) {
        setContent(previousContentBeforeToolRef.current);
        executeSave(previousContentBeforeToolRef.current, title);
        onToast('↺ Undid applied Mimo action.');
        updateLastMessage((m) => {
          if (m.toolCall && m.toolCall.id === toolCall.id) {
            return { ...m, toolCall: { ...m.toolCall, isApplied: false } };
          }
          return m;
        });
      }
    },
    [setContent, executeSave, title, onToast, updateLastMessage]
  );


  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    isGeneratingRef.current = false;
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

  const handleSendPrompt = async (customPrompt?: string) => {
    const raw = customPrompt !== undefined ? customPrompt : inputPrompt;
    if (!raw.trim() || isGenerating || isGeneratingRef.current) return;

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

    const liveSelection = getSelectedText ? getSelectedText().trim() : '';
    const currentSelectionSnapshot = activeSelection || liveSelection;
    const userMessageId = `user-${Date.now()}`;
    addMessage({
      id: userMessageId,
      role: 'user',
      text: raw.trim(),
      timestamp: Date.now(),
      hasSelectionContext: !!currentSelectionSnapshot,
    });

    isGeneratingRef.current = true;
    setInputPrompt('');
    setIsGenerating(true);
    setMascotState('thinking');
    telemetryService.trackFeatureUsed('mimo_ai');

    const startTime = Date.now();
    startTimeRef.current = startTime;

    // Context preparation with selection awareness & active heading path
    const context = prepareMimoContext({
      docId,
      title,
      content,
      userPrompt: raw,
      cursorLine,
      selectedText: currentSelectionSnapshot || undefined,
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
        modelName: 'Gemini 3.5 Flash-Lite',
        thinkingLevel: 'AUTO',
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
        thinkingLevel: 'AUTO',
        history: messages,
        signal: abortControllerRef.current.signal,
        callbacks: {
          onStreamReset: () => {
            updateLastMessage((m) => ({
              ...m,
              text: '',
              thoughtText: '',
            }));
          },
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
      const { cleanText: textAfterDiff, hunk } = extractDiffHunkFromResponse(result.fullText, content);
      // Extract interactive tool call if present
      const { cleanText, toolCall } = extractToolCallFromResponse(textAfterDiff);
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
        toolCall: toolCall || undefined,
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
      isGeneratingRef.current = false;
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
    const liveSelection = getSelectedText ? getSelectedText().trim() : '';
    const sel = activeSelection || liveSelection;
    if (sel) {
      if (action === 'improve') {
        handleSendPrompt('Improve this selected text, fixing grammar, clarity, and tone with a clean diff.');
      } else if (action === 'summarize') {
        handleSendPrompt('Summarize this selected text in crisp bullet points.');
      } else if (action === 'write') {
        handleSendPrompt('Continue and expand upon this selected text with next logical points.');
      } else if (action === 'explain') {
        handleSendPrompt('Explain this selected text in simple, clear terms.');
      } else if (action === 'translate') {
        handleSendPrompt('Translate this selected text into natural Hinglish.');
      }
      return;
    }

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

  // Determine if the chat conversation is currently empty (only default greeting or 0 user messages)
  const isChatEmpty = messages.filter((m) => m.role === 'user').length === 0;

  return (
    <>
      <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[460px] md:w-[490px] bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col font-sans animate-in slide-in-from-right duration-250 select-text">
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-950/40 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Mimo3DViewer size="sm" state={mascotState} className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-violet-300/40 dark:border-violet-700/50 shadow-2xs" />
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

          {/* If chat is empty: show rich starter suggestion cards. Once active, show full chat! */}
          {isChatEmpty ? (
            <div className="py-6 px-2 flex flex-col items-center text-center space-y-5 animate-in fade-in duration-300">
              <div className="relative flex items-center justify-center py-1">
                <Mimo3DViewer size="hero" state={mascotState} />
                <span className="absolute bottom-3 right-1/2 translate-x-12 flex h-3.5 w-3.5 pointer-events-none">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-neutral-900"></span>
                </span>
              </div>

              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                  Hello! I'm Mimo ✦
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Your intelligent markdown companion connected to <span className="font-semibold text-neutral-800 dark:text-neutral-200">"{title || 'Untitled Document'}"</span>.
                </p>
              </div>

              {/* Starter Suggestion Tasks - ONLY SHOWN WHEN CHAT IS EMPTY */}
              <div className="w-full space-y-2 text-left pt-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-1">
                  Suggested Tasks
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => handleQuickAction('improve')}
                    disabled={isGenerating || isAiExcluded}
                    className="p-3 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 hover:bg-violet-50/60 dark:hover:bg-violet-950/30 hover:border-violet-300 dark:hover:border-violet-800 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <PenTool className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                      <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-violet-700 dark:group-hover:text-violet-300">
                        Improve Document
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2">
                      Review syntax, flow, and propose non-destructive diffs.
                    </p>
                  </button>

                  <button
                    onClick={() => handleQuickAction('summarize')}
                    disabled={isGenerating || isAiExcluded}
                    className="p-3 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 hover:bg-amber-50/60 dark:hover:bg-amber-950/30 hover:border-amber-300 dark:hover:border-amber-800 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-amber-700 dark:group-hover:text-amber-300">
                        Summarize Notes
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2">
                      Extract high-impact takeaways and section outlines.
                    </p>
                  </button>

                  <button
                    onClick={() => handleQuickAction('translate')}
                    disabled={isGenerating || isAiExcluded}
                    className="p-3 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 hover:bg-sky-50/60 dark:hover:bg-sky-950/30 hover:border-sky-300 dark:hover:border-sky-800 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Languages className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-sky-700 dark:group-hover:text-sky-300">
                        Explain in Hinglish
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2">
                      Crystal-clear technical explanations in natural Hinglish.
                    </p>
                  </button>

                  <button
                    onClick={() => handleQuickAction('write')}
                    disabled={isGenerating || isAiExcluded}
                    className="p-3 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 hover:bg-cyan-50/60 dark:hover:bg-cyan-950/30 hover:border-cyan-300 dark:hover:border-cyan-800 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-cyan-700 dark:group-hover:text-cyan-300">
                        Draft Next Section
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2">
                      Expand arguments, headings, tables, or code blocks.
                    </p>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <MimoChatMessage
                key={msg.id}
                message={msg}
                onApplyDiff={handleApplyDiff}
                onDiscardDiff={handleDiscardDiff}
                onInsertSnippet={handleInsertSnippet}
                onApplyToolCall={handleApplyToolCall}
                onDiscardToolCall={handleDiscardToolCall}
                onUndoToolCall={handleUndoToolCall}
              />
            ))
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Dock */}
        <div className="p-3 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 shrink-0 space-y-2">
          {/* Active Text Selection Indicator Pill */}
          {activeSelection && (
            <div className="flex items-center justify-between px-2.5 py-1 bg-violet-50 dark:bg-violet-950/60 border border-violet-200/80 dark:border-violet-800/80 rounded-lg text-[11px] text-violet-800 dark:text-violet-200">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-semibold">✂️ Focused Selection:</span>
                <span className="truncate italic text-neutral-600 dark:text-neutral-300">
                  "{activeSelection.slice(0, 36).replace(/\n/g, ' ')}..."
                </span>
                <span className="text-[10px] text-violet-600/80 dark:text-violet-400/80 font-mono">
                  ({activeSelection.split('\n').length} lines)
                </span>
              </div>
              <button
                onClick={() => setActiveSelection('')}
                className="text-violet-400 hover:text-violet-700 dark:hover:text-violet-200 p-0.5 cursor-pointer ml-2"
                title="Ignore selection"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex items-center justify-between text-xs">
            {/* Strictly Auto Router Badge (No Manual Change Allowed) */}
            <div
              className="flex items-center gap-1.5 text-[11px] font-medium text-violet-700 dark:text-violet-300 bg-violet-50/80 dark:bg-violet-950/50 px-2.5 py-1 rounded-lg border border-violet-200/80 dark:border-violet-800/70 select-none cursor-default"
              title="Smart Auto Router: Intelligently allocates reasoning depth based on prompt complexity"
            >
              <Sparkles className="w-3 h-3 text-violet-500" />
              <span>Auto Router</span>
            </div>

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
              onFocus={() => {
                if (getSelectedText && !activeSelection) {
                  const sel = getSelectedText();
                  if (sel && sel.trim().length > 0) {
                    setActiveSelection(sel.trim());
                  }
                }
              }}
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
                  : activeSelection
                  ? 'Ask about selected text, or request an edit...'
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
