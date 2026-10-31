import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, Clock, Cpu, GitBranch } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { ActivityTelemetry } from '../types/mimoTypes';

const STATIC_THOUGHT_REMARK_PLUGINS: any[] = [remarkGfm, remarkBreaks];

interface MimoThoughtBlockProps {
  activity?: ActivityTelemetry;
  thoughtText?: string;
  isStreaming?: boolean;
}

export const MimoThoughtBlock: React.FC<MimoThoughtBlockProps> = ({
  activity,
  thoughtText,
  isStreaming = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [elapsed, setElapsed] = useState(activity?.metrics.elapsedMs || 0);

  const isDone = activity?.isDone && !isStreaming;
  const isStopped = activity?.isStopped;

  // Live stopwatch while thinking is in progress
  useEffect(() => {
    if (isDone || isStopped) {
      if (activity?.metrics.elapsedMs) {
        setElapsed(activity.metrics.elapsedMs);
      }
      return;
    }

    const start = Date.now() - elapsed;
    const interval = setInterval(() => {
      setElapsed(Date.now() - start);
    }, 100);

    return () => clearInterval(interval);
  }, [isDone, isStopped, activity?.metrics.elapsedMs]);

  // Clean thought text by stripping internal eval prefixes if any
  const cleanThoughts = (thoughtText || '')
    .replace(/^Prompt evaluated:[\s\S]*?Thinking budget:.*?\n*/gi, '')
    .trim();

  // If there's neither activity nor thoughts, render nothing
  if (!activity && !cleanThoughts) return null;

  const seconds = (elapsed / 1000).toFixed(1);
  const modelName = activity?.metrics.modelName || 'Gemini 3.5 Flash-Lite';
  const latestReasoningStep =
    activity?.reasoningSteps && activity.reasoningSteps.length > 0
      ? activity.reasoningSteps[activity.reasoningSteps.length - 1]
      : 'Analyzing prompt & document context...';

  // ── 1. ACTIVE IN-FLIGHT THINKING STATE (Minimal, sleek, low-profile) ──
  if (!isDone && !isStopped) {
    return (
      <div className="w-full my-2 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/50 shadow-2xs overflow-hidden text-xs font-sans animate-in fade-in duration-150">
        <div className="px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
            </span>

            <div className="min-w-0 flex items-center gap-1.5">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-[11px]">
                Reasoning
              </span>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 hidden sm:inline">
                •
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate font-mono">
                {latestReasoningStep}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-400 dark:text-neutral-500 bg-neutral-100/80 dark:bg-neutral-800/80 px-2 py-0.5 rounded shrink-0">
            <Clock className="w-2.5 h-2.5 text-neutral-400" />
            <span>{seconds}s</span>
          </div>
        </div>

        {/* Live Streaming Thoughts Display with Markdown Formatting */}
        {cleanThoughts && cleanThoughts.length > 5 && (
          <div className="px-3 pb-2.5 pt-1 border-t border-neutral-200/50 dark:border-neutral-800/60">
            <div className="text-[9px] uppercase font-bold tracking-wider text-violet-600 dark:text-violet-400 mb-1">
              Internal Chain of Thought
            </div>
            <div className="p-2.5 rounded-lg bg-white/80 dark:bg-neutral-950/70 border border-neutral-200/60 dark:border-neutral-800/60 text-[11px] text-neutral-700 dark:text-neutral-300 leading-relaxed max-h-36 overflow-y-auto select-text">
              <ReactMarkdown
                remarkPlugins={STATIC_THOUGHT_REMARK_PLUGINS}
                components={{
                  p: ({ children }) => (
                    <p className="my-0.5 leading-relaxed text-[11px] text-neutral-600 dark:text-neutral-300 font-sans">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-0.5 my-1 text-[11px] text-neutral-600 dark:text-neutral-300 pl-0.5">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-0.5 my-1 text-[11px] text-neutral-600 dark:text-neutral-300 pl-0.5">
                      {children}
                    </ol>
                  ),
                  h1: ({ children }) => (
                    <div className="font-bold text-[11px] text-violet-700 dark:text-violet-300 mt-1 mb-0.5">
                      {children}
                    </div>
                  ),
                  h2: ({ children }) => (
                    <div className="font-bold text-[11px] text-violet-700 dark:text-violet-300 mt-1 mb-0.5">
                      {children}
                    </div>
                  ),
                  h3: ({ children }) => (
                    <div className="font-semibold text-[11px] text-violet-700 dark:text-violet-300 mt-1 mb-0.5">
                      {children}
                    </div>
                  ),
                  code: ({ children }) => (
                    <code className="px-1 py-0.2 rounded bg-neutral-200/60 dark:bg-neutral-800 text-violet-600 dark:text-violet-400 font-mono text-[10px]">
                      {children}
                    </code>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {children}
                    </strong>
                  ),
                }}
              >
                {cleanThoughts}
              </ReactMarkdown>
              <span className="inline-block w-1.5 h-3 ml-1 bg-violet-400 animate-pulse align-middle" />
            </div>
          </div>
        )}

        {/* Minimal Hairline Shimmer Progress Indicator */}
        <div className="h-[1.5px] w-full bg-neutral-200/50 dark:bg-neutral-800/50 overflow-hidden relative">
          <motion.div
            className="h-full w-1/4 bg-gradient-to-r from-transparent via-violet-500/80 to-transparent rounded-full"
            animate={{ x: ['-100%', '450%'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>
    );
  }

  // ── 2. COMPLETED / SETTLED REASONING ACCORDION (Clean & Space-Efficient) ──
  return (
    <div className="w-full my-1.5 select-text font-sans">
      <div className="rounded-xl border border-neutral-200/70 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/40 text-neutral-700 dark:text-neutral-300 overflow-hidden transition-all">
        {/* Compact Summary Header */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full px-3 py-1.5 text-left flex items-center justify-between cursor-pointer hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40 transition-colors select-none"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-3 h-3 text-violet-500 shrink-0" />
            <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200">
              {isStopped ? 'Reasoning stopped' : `Thought for ${seconds}s`}
            </span>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono hidden sm:inline truncate">
              • {modelName}
            </span>
            {activity?.metrics.diffDelta &&
              (activity.metrics.diffDelta.additions > 0 || activity.metrics.diffDelta.deletions > 0) && (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                  <GitBranch className="w-2.5 h-2.5" />
                  +{activity.metrics.diffDelta.additions} / -{activity.metrics.diffDelta.deletions}
                </span>
              )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
            <span className="text-[10px] font-medium hidden sm:inline">
              {isOpen ? 'Collapse' : 'Inspect'}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {/* Detailed Breakdown with Markdown Formatting */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="border-t border-neutral-200/60 dark:border-neutral-800 p-3 space-y-2.5 bg-white/70 dark:bg-neutral-900/60 text-xs"
            >
              {/* Reasoning Steps Trace */}
              {activity?.reasoningSteps && activity.reasoningSteps.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500">
                    Reasoning Steps
                  </div>
                  <ul className="space-y-1 font-mono text-[11px] text-neutral-600 dark:text-neutral-400 pl-1">
                    {activity.reasoningSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-violet-500 font-bold select-none">›</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Genuine Model Thoughts Formatted via Markdown */}
              {cleanThoughts && cleanThoughts.length > 5 && (
                <div className="space-y-1 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500">
                    Thought Tokens
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/90 border border-neutral-200/80 dark:border-neutral-800 text-[11px] leading-relaxed text-neutral-700 dark:text-neutral-300 max-h-48 overflow-y-auto select-text">
                    <ReactMarkdown
                      remarkPlugins={STATIC_THOUGHT_REMARK_PLUGINS}
                      components={{
                        p: ({ children }) => (
                          <p className="my-0.5 leading-relaxed text-[11px] text-neutral-600 dark:text-neutral-300 font-sans">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside space-y-0.5 my-1 text-[11px] text-neutral-600 dark:text-neutral-300 pl-0.5">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside space-y-0.5 my-1 text-[11px] text-neutral-600 dark:text-neutral-300 pl-0.5">
                            {children}
                          </ol>
                        ),
                        h1: ({ children }) => (
                          <div className="font-bold text-[11px] text-violet-700 dark:text-violet-300 mt-1 mb-0.5">
                            {children}
                          </div>
                        ),
                        h2: ({ children }) => (
                          <div className="font-bold text-[11px] text-violet-700 dark:text-violet-300 mt-1 mb-0.5">
                            {children}
                          </div>
                        ),
                        h3: ({ children }) => (
                          <div className="font-semibold text-[11px] text-violet-700 dark:text-violet-300 mt-1 mb-0.5">
                            {children}
                          </div>
                        ),
                        code: ({ children }) => (
                          <code className="px-1 py-0.2 rounded bg-neutral-200/60 dark:bg-neutral-800 text-violet-600 dark:text-violet-400 font-mono text-[10px]">
                            {children}
                          </code>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {children}
                          </strong>
                        ),
                      }}
                    >
                      {cleanThoughts}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Execution Summary Tag */}
              <div className="pt-1 flex items-center justify-between text-[10px] text-neutral-400 font-mono border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-neutral-400" />
                  <span>{modelName}</span>
                </div>
                {activity?.metrics.tokensUsed ? (
                  <span>{activity.metrics.tokensUsed} tokens consumed</span>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
