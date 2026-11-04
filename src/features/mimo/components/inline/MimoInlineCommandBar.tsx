import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import {
  Sparkles,
  Send,
  StopCircle,
  Check,
  X,
  RotateCcw,
  PanelRightOpen,
  Wand2,
  FileText,
  CornerDownLeft,
  Pin,
} from 'lucide-react';
import { useMimoStore } from '../../stores/useMimoStore';
import { streamMimoResponse } from '../../services/mimoGeminiService';
import { prepareMimoContext } from '../../services/contextEngine';
import { fetchPinnedDocReferences, formatPinnedDocsPromptLayer } from '../../services/docPinningService';
import { extractEpisodicBulletsLocally, shouldCompressEpisodicTurns } from '../../services/episodicMemoryEngine';
import { buildChaosToClarityPrompt } from '../../services/chaosToClarityTransformer';
import { autoBalanceDelimitersAndSanitize } from '../../../../utils/markdownSanitizer';
import { MimoAvatar } from '../MimoAvatar';

export interface MimoInlineCommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  caretCoords: { left: number; top: number; bottom: number } | null;
  initialSelection: string;
  docId: string;
  docTitle: string;
  fullContent: string;
  cursorLine: number;
  onAccept: (insertedMarkdown: string) => void;
  onOpenDrawer: (initialPrompt?: string) => void;
}

const STATIC_REMARK_PLUGINS = [remarkGfm, remarkMath, remarkBreaks];
const STATIC_REHYPE_PLUGINS = [
  rehypeRaw,
  [rehypeKatex, { output: 'htmlAndMathml', strict: false, throwOnError: false }],
];

const EMPTY_INLINE_LIST: string[] = [];

export const MimoInlineCommandBar: React.FC<MimoInlineCommandBarProps> = ({
  isOpen,
  onClose,
  caretCoords,
  initialSelection,
  docId,
  docTitle,
  fullContent,
  cursorLine,
  onAccept,
  onOpenDrawer,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [modelLabel, setModelLabel] = useState('Gemini 3.8 Flash');
  const [reasoningStatus, setReasoningStatus] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const previewEndRef = useRef<HTMLDivElement>(null);

  const userApiKey = useMimoStore((s) => s.quota.userApiKey) || '';
  const selectedModel = useMimoStore((s) => s.selectedModel) || 'gemini-3.8-flash';
  const showThinking = useMimoStore((s) => s.showThinking);
  const webSearchEnabled = useMimoStore((s) => s.webSearchEnabled);
  const pinnedDocIds = useMimoStore((s) =>
    docId && s.pinnedDocIdsByDoc ? s.pinnedDocIdsByDoc[docId] || EMPTY_INLINE_LIST : EMPTY_INLINE_LIST
  );
  const episodicSummaries = useMimoStore((s) =>
    docId && s.episodicSummariesByDoc ? s.episodicSummariesByDoc[docId] || EMPTY_INLINE_LIST : EMPTY_INLINE_LIST
  );
  const appendEpisodicSummary = useMimoStore((s) => s.appendEpisodicSummary);
  const touchMimoActivity = useMimoStore((s) => s.touchMimoActivity);

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setPrompt('');
      setStreamedText('');
      setReasoningStatus(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setIsGenerating(false);
    }
  }, [isOpen]);

  // Auto-scroll stream preview
  useEffect(() => {
    if (isGenerating && previewEndRef.current) {
      previewEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [streamedText, isGenerating]);

  // Clean and balance delimiters
  const cleanMarkdown = React.useMemo(() => {
    if (!streamedText) return '';
    return autoBalanceDelimitersAndSanitize(streamedText);
  }, [streamedText]);

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
    setReasoningStatus('Stopped by user');
  }, []);

  const handleExecute = async (overridePrompt?: string) => {
    const rawPrompt = (overridePrompt !== undefined ? overridePrompt : prompt).trim();
    if (!rawPrompt || isGenerating) return;

    touchMimoActivity();
    setIsGenerating(true);
    setStreamedText('');
    setReasoningStatus('Preparing context & vault references...');

    abortControllerRef.current = new AbortController();

    try {
      // 1. Prepare AST sliding context
      const context = prepareMimoContext({
        docId,
        title: docTitle || 'Untitled Document',
        content: fullContent,
        userPrompt: rawPrompt,
        cursorLine,
        selectedText: initialSelection || undefined,
      });

      // 2. Fetch pinned vault reference docs
      const pinnedDocs = await fetchPinnedDocReferences(pinnedDocIds);
      const pinnedDocsLayer = formatPinnedDocsPromptLayer(pinnedDocs);

      // 3. Episodic memory
      let effectiveEpisodic = [...episodicSummaries];
      const history = useMimoStore.getState().messages;
      if (shouldCompressEpisodicTurns(history)) {
        const fresh = extractEpisodicBulletsLocally(history);
        if (fresh.length > 0) {
          appendEpisodicSummary(docId, fresh);
          effectiveEpisodic = fresh;
        }
      }

      const result = await streamMimoResponse({
        apiKey: userApiKey,
        prompt: rawPrompt,
        context,
        thinkingLevel: 'LOW',
        selectedModel,
        showThinking,
        webSearchEnabled,
        pinnedDocsLayer,
        episodicBullets: effectiveEpisodic,
        signal: abortControllerRef.current.signal,
        callbacks: {
          onModelResolved: (label) => {
            setModelLabel(label);
          },
          onReasoningStep: (step) => {
            setReasoningStatus(step);
          },
          onTextChunk: (chunk) => {
            setStreamedText((prev) => prev + chunk);
          },
        },
      });

      if (result.aborted) {
        setIsGenerating(false);
        return;
      }

      setStreamedText(result.fullText);
      setIsGenerating(false);
      setReasoningStatus(null);
    } catch (err: any) {
      console.error('[MimoInlineCommandBar] Execution error:', err);
      setIsGenerating(false);
      setReasoningStatus(null);
      setStreamedText((prev) => (prev ? prev : '⚠️ An error occurred while generating. Please try again.'));
    }
  };

  const handleAcceptInsertion = () => {
    if (!cleanMarkdown.trim()) return;

    // Clean any diff formatting or replacement fences if present
    let finalInsertion = cleanMarkdown;
    const diffMatch = finalInsertion.match(/```(?:diff|replacement)?\n([\s\S]*?)```/);
    if (diffMatch) {
      finalInsertion = diffMatch[1]
        .split('\n')
        .filter((l) => !l.startsWith('- '))
        .map((l) => (l.startsWith('+ ') ? l.slice(2) : l))
        .join('\n');
    }

    onAccept(finalInsertion.trim());
    onClose();
  };

  const handleQuickAction = (actionType: 'continue' | 'chaos' | 'polish' | 'hinglish' | 'table') => {
    if (actionType === 'continue') {
      handleExecute('Continue writing from this point with next logical paragraphs and headings.');
    } else if (actionType === 'chaos') {
      const target = initialSelection || fullContent;
      handleExecute(buildChaosToClarityPrompt(target, Boolean(initialSelection)));
    } else if (actionType === 'polish') {
      handleExecute('Review and polish this text for pristine clarity, tight grammar, and publication-grade flow.');
    } else if (actionType === 'hinglish') {
      handleExecute('Explain and expand this topic in natural, clear tech-savvy Hinglish.');
    } else if (actionType === 'table') {
      handleExecute('Synthesize key parameters and comparisons into a clean Markdown table.');
    }
  };

  if (!isOpen) return null;

  // Compute anchored floating position
  const styleTop = caretCoords
    ? Math.min(window.innerHeight - 380, Math.max(70, caretCoords.bottom + 8))
    : window.innerHeight / 3;
  const styleLeft = caretCoords
    ? Math.min(window.innerWidth - 480, Math.max(16, caretCoords.left - 20))
    : window.innerWidth / 2 - 230;

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-auto"
      onClick={onClose}
    >
      <div
        style={{
          top: `${styleTop}px`,
          left: `${styleLeft}px`,
        }}
        onClick={(e) => e.stopPropagation()}
        className="absolute w-[92vw] sm:w-[460px] bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 font-sans"
      >
        {/* Top Header / Meta Bar */}
        <div className="px-3.5 py-2 bg-neutral-50/90 dark:bg-neutral-950/60 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <MimoAvatar size="xs" state={isGenerating ? 'typing' : 'happy'} />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              Mimo Inline
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              {modelLabel.includes('Lite') ? '3.5 Lite' : '3.8 Flash'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {pinnedDocIds.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium">
                <Pin className="w-2.5 h-2.5 rotate-45" />
                {pinnedDocIds.length} ref{pinnedDocIds.length > 1 ? 's' : ''}
              </span>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDrawer(prompt || undefined);
              }}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
              title="Open in Mimo Sidebar"
            >
              <PanelRightOpen className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
              title="Close (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Selected Context Indicator */}
        {initialSelection && (
          <div className="px-3.5 py-1.5 bg-neutral-100/70 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300 flex items-center justify-between">
            <div className="truncate flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-neutral-400 shrink-0" />
              <span className="truncate italic">
                "{initialSelection.slice(0, 45).replace(/\n/g, ' ')}..."
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 shrink-0 ml-2 font-mono">
              Selection
            </span>
          </div>
        )}

        {/* Input Textarea Area */}
        <div className="p-3 bg-white dark:bg-neutral-900 flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleExecute();
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                if (isGenerating) {
                  handleStop();
                } else {
                  onClose();
                }
              }
            }}
            placeholder={
              initialSelection
                ? 'Ask Mimo to edit, translate, or refine selection...'
                : 'Ask Mimo to write, structure notes, or explain... (Enter to run)'
            }
            rows={2}
            className="w-full bg-transparent text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none resize-none leading-relaxed"
          />

          {isGenerating ? (
            <button
              type="button"
              onClick={handleStop}
              className="shrink-0 p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-rose-400 cursor-pointer transition-colors shadow-2xs"
              title="Stop (Esc)"
            >
              <StopCircle className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleExecute()}
              disabled={!prompt.trim()}
              className="shrink-0 p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white disabled:opacity-30 cursor-pointer transition-colors shadow-2xs"
              title="Run Prompt (Enter)"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Starter Suggestions */}
        {!streamedText && !isGenerating && (
          <div className="px-3 pb-3 pt-0 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickAction('continue')}
              className="px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-white dark:hover:bg-neutral-800 text-[10px] font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
              <span>Continue</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickAction('chaos')}
              className="px-2 py-1 rounded-lg border border-violet-500/30 bg-violet-50/60 dark:bg-violet-950/30 hover:bg-violet-100/60 dark:hover:bg-violet-900/40 text-[10px] font-medium text-violet-700 dark:text-violet-300 cursor-pointer flex items-center gap-1 transition-colors"
            >
              <Wand2 className="w-2.5 h-2.5 text-violet-500" />
              <span>Chaos to Clarity</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickAction('polish')}
              className="px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-white dark:hover:bg-neutral-800 text-[10px] font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer transition-colors"
            >
              <span>Polish</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickAction('hinglish')}
              className="px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-white dark:hover:bg-neutral-800 text-[10px] font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer transition-colors"
            >
              <span>Hinglish</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickAction('table')}
              className="px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-white dark:hover:bg-neutral-800 text-[10px] font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer transition-colors"
            >
              <span>Make Table</span>
            </button>
          </div>
        )}

        {/* Streaming & Result Preview Box */}
        {(streamedText || isGenerating) && (
          <div className="border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40 max-h-[220px] overflow-y-auto p-3 text-xs text-neutral-800 dark:text-neutral-200 select-text leading-relaxed">
            {reasoningStatus && (
              <div className="text-[10px] text-neutral-400 dark:text-neutral-500 mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span>{reasoningStatus}</span>
              </div>
            )}

            <div className="prose prose-xs dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={STATIC_REMARK_PLUGINS}
                rehypePlugins={STATIC_REHYPE_PLUGINS as any}
              >
                {cleanMarkdown}
              </ReactMarkdown>
            </div>
            <div ref={previewEndRef} />
          </div>
        )}

        {/* Footer Actions when Result is Ready */}
        {cleanMarkdown && !isGenerating && (
          <div className="px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleExecute()}
                className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                title="Regenerate prompt"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retry</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 text-[11px] font-medium cursor-pointer transition-colors"
              >
                Discard
              </button>
            </div>

            <button
              type="button"
              onClick={handleAcceptInsertion}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept (Enter)</span>
              <CornerDownLeft className="w-3 h-3 opacity-70" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
