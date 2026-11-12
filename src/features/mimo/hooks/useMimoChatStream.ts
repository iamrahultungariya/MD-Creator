import { useState, useRef } from 'react';
import { useMimoStore, computeTaskCostPercent } from '../stores/useMimoStore';
import {
  MimoActivityType,
  ActivityTelemetry,
  MimoProtocolStepId,
  MimoProtocolStep,
  MimoProtocolTimeline,
} from '../types/mimoTypes';

const PROTOCOL_STEP_DEFS: Array<{ id: MimoProtocolStepId; label: string; detail: string }> = [
  { id: 'understand', label: 'Understand', detail: 'Intent, scope & context' },
  { id: 'decompose', label: 'Decompose', detail: 'Structure & section flow' },
  { id: 'develop', label: 'Develop', detail: 'High-density drafting' },
  { id: 'verify', label: 'Verify', detail: 'Accuracy & formatting audit' },
  { id: 'polish', label: 'Polish', detail: 'Clarity & Markdown precision' },
];

function createInitialProtocolTimeline(): MimoProtocolTimeline {
  return {
    enabled: true,
    currentStep: 'understand',
    steps: PROTOCOL_STEP_DEFS.map((def, idx) => ({
      id: def.id,
      label: def.label,
      detail: def.detail,
      status: idx === 0 ? 'active' : 'pending',
    })),
  };
}

function advanceProtocolTimeline(
  timeline: MimoProtocolTimeline,
  targetStep: MimoProtocolStepId,
  status: 'active' | 'done' = 'active'
): MimoProtocolTimeline {
  const targetIdx = PROTOCOL_STEP_DEFS.findIndex((s) => s.id === targetStep);
  if (targetIdx === -1) return timeline;

  const updatedSteps: MimoProtocolStep[] = timeline.steps.map((step, idx) => {
    if (idx < targetIdx) return { ...step, status: 'done' };
    if (idx === targetIdx) return { ...step, status };
    return { ...step, status: 'pending' };
  });

  const activeDef = PROTOCOL_STEP_DEFS[targetIdx];
  return {
    ...timeline,
    currentStep: targetStep,
    steps: updatedSteps,
    summaryLabel:
      status === 'done' && targetIdx === PROTOCOL_STEP_DEFS.length - 1
        ? 'Thought complete'
        : activeDef.label,
  };
}
import { prepareMimoContext } from '../services/contextEngine';
import {
  extractDiffHunkFromResponse,
  extractToolCallFromResponse,
  extractClarificationFromResponse,
  computeLineDiff,
} from '../services/diffService';
import { streamMimoResponse, generateNextOperationSuggestions } from '../services/mimoGeminiService';
import { telemetryService } from '../../../services/telemetryService';
import { fetchPinnedDocReferences, formatPinnedDocsPromptLayer } from '../services/docPinningService';
import { extractEpisodicBulletsLocally, shouldCompressEpisodicTurns } from '../services/episodicMemoryEngine';
import { recordTaskExecution } from '../services/mimoScoreboardService';
import {
  parseSlashCommand,
  executeCompactCommand,
  buildCleanMarkdownPrompt,
  buildActionItemsPrompt,
  buildTrimPrompt,
  buildReviewPrompt,
} from '../services/mimoSlashCommands';

export interface UseMimoChatStreamProps {
  docId: string;
  title: string;
  content: string;
  cursorLine: number;
  isAiExcluded: boolean;
  onToast: (msg: string) => void;
  getSelectedText?: () => string;
  activeSelection: string;
  inputPrompt: string;
  setInputPrompt: (val: string) => void;
}

const EMPTY_STRINGS: string[] = [];

export function useMimoChatStream({
  docId,
  title,
  content,
  cursorLine,
  isAiExcluded,
  onToast,
  getSelectedText,
  activeSelection,
  inputPrompt,
  setInputPrompt,
}: UseMimoChatStreamProps) {
  const messages = useMimoStore((s) => s.messages);
  const addMessage = useMimoStore((s) => s.addMessage);
  const updateLastMessage = useMimoStore((s) => s.updateLastMessage);
  const setMascotState = useMimoStore((s) => s.setMascotState);
  const setActiveActivity = useMimoStore((s) => s.setActiveActivity);
  const setActiveDiffHunk = useMimoStore((s) => s.setActiveDiffHunk);
  const setIsKeyModalOpen = useMimoStore((s) => s.setIsKeyModalOpen);
  const setIsPrivacyModalOpen = useMimoStore((s) => s.setIsPrivacyModalOpen);
  const quota = useMimoStore((s) => s.quota);
  const consumeCredit = useMimoStore((s) => s.consumeCredit);
  const userApiKey = useMimoStore((s) => s.quota.userApiKey) || '';
  const thinkingLevel = useMimoStore((s) => s.thinkingLevel);
  const selectedModel = useMimoStore((s) => s.selectedModel) || 'gemini-3.5-flash-lite';
  const showThinking = useMimoStore((s) => s.showThinking);
  const touchMimoActivity = useMimoStore((s) => s.touchMimoActivity);
  const pinnedDocIds = useMimoStore((s) =>
    docId && s.pinnedDocIdsByDoc ? s.pinnedDocIdsByDoc[docId] || EMPTY_STRINGS : EMPTY_STRINGS
  );
  const episodicSummaries = useMimoStore((s) =>
    docId && s.episodicSummariesByDoc ? s.episodicSummariesByDoc[docId] || EMPTY_STRINGS : EMPTY_STRINGS
  );
  const appendEpisodicSummary = useMimoStore((s) => s.appendEpisodicSummary);

  const [isGenerating, setIsGenerating] = useState(false);
  const isGeneratingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);

  // RAF-batched text stream buffer to eliminate low-spec & mobile UI jank / reflow thrashing
  const streamBufferRef = useRef<string>('');
  const thoughtBufferRef = useRef<string>('');
  const rafIdRef = useRef<number | null>(null);

  const flushTextBuffer = () => {
    if (rafIdRef.current !== null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    const pendingText = streamBufferRef.current;
    const pendingThought = thoughtBufferRef.current;

    if (!pendingText && !pendingThought) return;

    streamBufferRef.current = '';
    thoughtBufferRef.current = '';

    updateLastMessage((m) => ({
      ...m,
      ...(pendingText ? { text: (m.text || '') + pendingText } : {}),
      ...(pendingThought ? { thoughtText: (m.thoughtText || '') + pendingThought } : {}),
      mascotState: 'typing',
    }));
  };

  const scheduleFlush = () => {
    if (rafIdRef.current !== null) return;
    if (typeof requestAnimationFrame === 'function') {
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        flushTextBuffer();
      });
    } else {
      flushTextBuffer();
    }
  };

  const handleStop = () => {
    flushTextBuffer();
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

    // Handle /compact command immediately without triggering standard generation loop
    const parsedSlash = parseSlashCommand(raw);
    if (parsedSlash && parsedSlash.def.id === 'compact') {
      setInputPrompt('');
      await executeCompactCommand({
        docId,
        docTitle: title,
        onToast,
        apiKey: userApiKey,
      });
      return;
    }

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

    // Determine if user has a valid personal or workspace API key
    // Pre-flight quota check (0% deduction upfront; actual tokens deducted after completion).
    // If the user has their personal BYOK key, skip demo quota restrictions.
    const userPersonalKey = useMimoStore.getState().quota.userApiKey?.trim();
    const isUsingPersonalByok = Boolean(userPersonalKey);

    if (!isUsingPersonalByok) {
      const preflightCheck = consumeCredit(0, isDocGen);
      if (!preflightCheck.allowed) {
        onToast(preflightCheck.reason || 'Daily AI capacity reached');
        setIsKeyModalOpen(true);
        return;
      }
    }

    const liveSelection = getSelectedText ? getSelectedText().trim() : '';
    const currentSelectionSnapshot = activeSelection || liveSelection;

    // Resolve specialized prompt transformation if a generation slash command was invoked
    let promptToSend = raw;
    let slashActivityType: MimoActivityType | null = null;
    let slashActivityTitle: string | null = null;

    if (parsedSlash) {
      if (parsedSlash.def.id === 'clean-md') {
        promptToSend = buildCleanMarkdownPrompt(content, currentSelectionSnapshot, parsedSlash.args);
        slashActivityType = 'improving';
        slashActivityTitle = '🧹 Formatting Markdown Syntax & Tables';
      } else if (parsedSlash.def.id === 'action-items') {
        promptToSend = buildActionItemsPrompt(content, currentSelectionSnapshot, parsedSlash.args);
        slashActivityType = 'analyzing';
        slashActivityTitle = '📋 Extracting Action Items & Tasks';
      } else if (parsedSlash.def.id === 'trim') {
        promptToSend = buildTrimPrompt(content, currentSelectionSnapshot, parsedSlash.args);
        slashActivityType = 'improving';
        slashActivityTitle = '✂️ Trimming Fluff & Redundancy';
      } else if (parsedSlash.def.id === 'review') {
        promptToSend = buildReviewPrompt(content, parsedSlash.args);
        slashActivityType = 'analyzing';
        slashActivityTitle = '🔍 Auditing Document Quality & Gaps';
      }
    }

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
      userPrompt: promptToSend,
      cursorLine,
      selectedText: currentSelectionSnapshot || undefined,
    });

    // Activity setup
    const activityType: MimoActivityType =
      slashActivityType ||
      (isDocGen
        ? 'generating'
        : isEdit
        ? 'improving'
        : isTranslate
        ? 'translating'
        : isSummarize
        ? 'summarizing'
        : context.guardrailTriggered
        ? 'analyzing'
        : 'thinking');

    const activityTitle =
      slashActivityTitle ||
      (activityType === 'generating'
        ? 'Synthesizing Document'
        : activityType === 'improving'
        ? 'Computing Non-Destructive Diff'
        : activityType === 'translating'
        ? `Translating "${context.docTitle}"`
        : activityType === 'summarizing'
        ? `Summarizing "${context.docTitle}"`
        : activityType === 'analyzing'
        ? 'Scanning Document (LOC Guardrail)'
        : `Analyzing "${context.docTitle}"`);

    // Resolve pinned reference documents from workspace
    const pinnedDocs = await fetchPinnedDocReferences(pinnedDocIds);
    const pinnedDocsLayer = formatPinnedDocsPromptLayer(pinnedDocs);

    // Check rolling episodic memory compression
    let effectiveEpisodic = [...episodicSummaries];
    if (shouldCompressEpisodicTurns(messages)) {
      const freshBullets = extractEpisodicBulletsLocally(messages);
      if (freshBullets.length > 0) {
        appendEpisodicSummary(docId, freshBullets);
        effectiveEpisodic = freshBullets;
      }
    }

    const initialActivity: ActivityTelemetry = {
      type: activityType,
      title: activityTitle,
      subtitle: `Doc: "${context.docTitle}" (${context.linesAnalyzed} lines • ${context.totalWords} words)`,
      metrics: {
        linesScanned: context.linesAnalyzed,
        tokenVelocity: selectedModel === 'gemini-3.5-flash-lite' ? 140 : selectedModel === 'gemini-3.5-flash' ? 115 : 88,
        modelName:
          selectedModel === 'gemini-3.5-flash-lite'
            ? 'Gemini 3.5 Flash-Lite'
            : selectedModel === 'gemini-3.5-flash'
            ? 'Gemini 3.5 Flash'
            : 'Gemini 3.8 Flash',
        thinkingLevel: selectedModel === 'gemini-3.5-flash-lite' ? 'MINIMAL' : thinkingLevel,
        elapsedMs: 0,
        diffDelta: { additions: 0, deletions: 0 },
      },
      reasoningSteps: [
        `Connected to "${context.docTitle}" (${context.linesAnalyzed} LOC, ${context.totalWords} words)`,
        ...(pinnedDocs.length > 0
          ? [
              `Vault grounding: ${pinnedDocs.length} pinned note(s) (${pinnedDocs
                .map((d) => `"${d.title}"`)
                .join(', ')})`,
            ]
          : []),
      ],
      protocolTimeline:
        selectedModel === 'gemini-3.5-flash-lite'
          ? createInitialProtocolTimeline()
          : undefined,
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
      mascotState: 'thinking',
    });

    abortControllerRef.current = new AbortController();

    try {
      // Mascot remains in 'thinking' until first text token is received
      setMascotState('thinking');

      const result = await streamMimoResponse({
        apiKey: userApiKey,
        prompt: promptToSend,
        context,
        thinkingLevel: thinkingLevel,
        selectedModel: selectedModel,
        showThinking: showThinking,
        pinnedDocsLayer,
        episodicBullets: effectiveEpisodic,
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
            thoughtBufferRef.current += thoughtChunk;
            scheduleFlush();
          },
          onTextChunk: (textChunk) => {
            streamBufferRef.current += textChunk;
            scheduleFlush();
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
          onProtocolStage: (stepId, status = 'active') => {
            if (selectedModel !== 'gemini-3.5-flash-lite') return;
            setActiveActivity((prev) =>
              prev && prev.protocolTimeline
                ? {
                    ...prev,
                    protocolTimeline: advanceProtocolTimeline(prev.protocolTimeline, stepId, status),
                  }
                : prev
            );
            updateLastMessage((m) => ({
              ...m,
              activity:
                m.activity && m.activity.protocolTimeline
                  ? {
                      ...m.activity,
                      protocolTimeline: advanceProtocolTimeline(
                        m.activity.protocolTimeline,
                        stepId,
                        status
                      ),
                    }
                  : m.activity,
            }));
          },
        },
      });

      // Synchronously flush any buffered tokens before finalizing message
      flushTextBuffer();

      // If aborted via Stop button, handleStop already finalized the message
      if (result.aborted) {
        return;
      }

      // Deduct proportional token-based credit only for shared demo users without personal keys
      if (!isUsingPersonalByok) {
        const actualCostPercent = computeTaskCostPercent(
          result.tokensUsed,
          result.resolvedLevel,
          isDocGen,
          result.modelUsed
        );
        if (actualCostPercent > 0) {
          consumeCredit(actualCostPercent, isDocGen);
        }
      }

      // Record real token and latency telemetry
      const latencyMs = Date.now() - startTime;
      useMimoStore.getState().recordRealUsage({
        tokensUsed: result.tokensUsed,
        promptTokens: result.promptTokens,
        candidateTokens: result.candidatesTokens,
        modelId: selectedModel,
        latencyMs,
      });

      // Extract unified git hunk if present
      const { cleanText: textAfterDiff, hunk } = extractDiffHunkFromResponse(result.fullText, content);
      // Extract interactive clarification questions if present
      const { cleanText: textAfterClarification, clarification } = extractClarificationFromResponse(textAfterDiff);
      // Extract interactive tool call if present
      const { cleanText, toolCall } = extractToolCallFromResponse(textAfterClarification);
      let diffDelta = { additions: 0, deletions: 0 };
      if (hunk) {
        setActiveDiffHunk(hunk);
        const computed = computeLineDiff(hunk.originalLines, hunk.proposedLines);
        diffDelta = { additions: computed.additions, deletions: computed.deletions };
      }

      const elapsedMs = Math.max(200, Date.now() - startTime);
      const finalizedTimeline = initialActivity.protocolTimeline
        ? advanceProtocolTimeline(initialActivity.protocolTimeline, 'polish', 'done')
        : undefined;
      const completedActivity: ActivityTelemetry = {
        ...initialActivity,
        ...(finalizedTimeline ? { protocolTimeline: finalizedTimeline } : {}),
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
              ...(m.activity.protocolTimeline
                ? {
                    protocolTimeline: advanceProtocolTimeline(
                      m.activity.protocolTimeline,
                      'polish',
                      'done'
                    ),
                  }
                : {}),
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
        clarification: clarification || undefined,
        mascotState: clarification ? 'thinking' : hunk ? 'excited' : 'happy',
      }));

      setActiveActivity(null);
      touchMimoActivity();
      setMascotState(clarification ? 'thinking' : hunk ? 'excited' : 'happy');

      // Update task scoreboard in IndexedDB & trigger debounced cloud sync
      recordTaskExecution(raw).catch((err) => {
        console.warn('[MimoScoreboard] Failed to record task execution:', err);
      });

      // Refresh rolling episodic memory after successful turn
      const turnConversation = [
        ...messages,
        {
          id: assistantMessageId,
          role: 'assistant' as const,
          text: cleanText || '',
          timestamp: Date.now(),
        },
      ];
      if (shouldCompressEpisodicTurns(turnConversation)) {
        const freshEpisodic = extractEpisodicBulletsLocally(turnConversation);
        if (freshEpisodic.length > 0) {
          appendEpisodicSummary(docId, freshEpisodic);
        }
      }

      // Asynchronously generate 2-3 smart next-operation suggestion chips via 3.5 Flash Lite
      generateNextOperationSuggestions(promptToSend, cleanText || result.fullText, userApiKey)
        .then((suggestions) => {
          if (suggestions && suggestions.length > 0) {
            updateLastMessage((m) => ({
              ...m,
              suggestedActions: suggestions,
            }));
          }
        })
        .catch((err) => {
          console.debug('[Mimo Suggestions] Background generation error:', err);
        });
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
      touchMimoActivity();
      setMascotState('happy');
    } finally {
      isGeneratingRef.current = false;
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  return {
    isGenerating,
    handleSendPrompt,
    handleStop,
  };
}
