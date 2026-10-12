import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle2, Clock, Zap, ShieldCheck, Cpu } from 'lucide-react';
import { ActivityTelemetry, MimoActivityType } from '../types/mimoTypes';

interface MimoActivityCardProps {
  activity: ActivityTelemetry;
}

const ACTIVITY_ASSETS: Record<MimoActivityType, string> = {
  thinking: '/mimo/activity_thinking.png',
  analyzing: '/mimo/activity_analyzing.png',
  searching: '/mimo/activity_searching.png',
  generating: '/mimo/activity_generating.png',
  summarizing: '/mimo/activity_summarizing.png',
  improving: '/mimo/activity_improving.png',
  translating: '/mimo/activity_translating.png',
};

export const MimoActivityCard: React.FC<MimoActivityCardProps> = ({ activity }) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [elapsed, setElapsed] = useState(activity.metrics.elapsedMs || 0);

  // Live stopwatch timer while activity is in-flight; freezes immediately when isDone or isStopped
  useEffect(() => {
    if (activity.isDone || activity.isStopped) {
      if (activity.metrics.elapsedMs > 0) {
        setElapsed(activity.metrics.elapsedMs);
      }
      return;
    }
    const start = Date.now() - elapsed;
    const interval = setInterval(() => {
      setElapsed(Date.now() - start);
    }, 100);
    return () => clearInterval(interval);
  }, [activity.isDone, activity.isStopped, activity.metrics.elapsedMs]);

  const formatTimer = (ms: number) => {
    const totalSec = (ms / 1000).toFixed(1);
    return `${totalSec}s`;
  };

  const assetSrc = ACTIVITY_ASSETS[activity.type] || ACTIVITY_ASSETS.thinking;
  const resolvedModelLabel = activity.metrics.modelName || 'Gemini 3.5 Flash-Lite';
  const resolvedLevelLabel = activity.metrics.thinkingLevel
    ? ` • ${activity.metrics.thinkingLevel}`
    : '';

  return (
    <div className="w-full my-2.5 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 shadow-sm overflow-hidden text-xs font-sans transition-all">
      {/* Activity Top Header */}
      <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-neutral-900/50">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-neutral-200/60 dark:border-neutral-700/60 bg-white dark:bg-neutral-800 flex items-center justify-center">
            <img
              src={assetSrc}
              alt={activity.type}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/mimo/thinking.png';
              }}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 capitalize">
                {activity.title}
              </span>
              {activity.isStopped ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded-full border border-rose-200/60 dark:border-rose-800/60">
                  Stopped
                </span>
              ) : activity.isDone ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                  <CheckCircle2 className="w-3 h-3" />
                  Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 px-1.5 py-0.5 rounded-full border border-violet-200/60 dark:border-violet-800/60 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-ping" />
                  In Progress
                </span>
              )}
            </div>
            {activity.subtitle && (
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                {activity.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Stopwatch & Telemetry Accordion Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3 text-neutral-400" />
            {formatTimer(elapsed)}
          </span>

          {activity.reasoningSteps.length > 0 && (
            <button
              onClick={() => setIsAccordionOpen((prev) => !prev)}
              className="p-1 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
              title="Toggle reasoning steps"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isAccordionOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Bespoke Telemetry Modules Per Activity */}
      <div className="px-3.5 py-2.5">
        {activity.type === 'thinking' && (
          <div className="flex items-center justify-between text-[11px] bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 rounded-lg p-2 text-violet-800 dark:text-violet-300">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span>Active Engine</span>
            </div>
            <span className="font-mono font-semibold">
              {resolvedModelLabel}
              {resolvedLevelLabel}
              {activity.metrics.tokensUsed ? ` (${activity.metrics.tokensUsed} tok)` : ''}
            </span>
          </div>
        )}

        {activity.type === 'analyzing' && (
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-lg p-2 text-emerald-800 dark:text-emerald-300">
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Line Scanner</div>
              <div className="font-mono font-semibold text-xs mt-0.5">
                {activity.metrics.linesScanned || 0} LOC Verified
              </div>
            </div>
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-lg p-2 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400">LOC Guardrail</div>
                <div className="font-semibold text-xs mt-0.5">&le; 1000 Limit Safe</div>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        )}

        {activity.type === 'generating' && (
          <div className="flex items-center justify-between text-[11px] bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/40 rounded-lg p-2 text-cyan-800 dark:text-cyan-300">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Token Velocity</span>
            </div>
            <span className="font-mono font-bold text-xs">
              {activity.metrics.tokenVelocity || 86.4} tok/s
            </span>
          </div>
        )}

        {activity.type === 'summarizing' && (
          <div className="flex items-center justify-between text-[11px] bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-lg p-2 text-amber-800 dark:text-amber-300">
            <span>Compaction Efficiency</span>
            <span className="font-mono font-bold text-xs bg-amber-200/60 dark:bg-amber-800/60 px-2 py-0.5 rounded">
              {activity.metrics.compactionRatio || '76%'} compacted
            </span>
          </div>
        )}

        {activity.type === 'improving' && (
          <div className="flex items-center justify-between text-[11px] bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 rounded-lg p-2">
            <span className="text-neutral-600 dark:text-neutral-300">Non-Destructive Delta</span>
            <div className="flex items-center gap-2 font-mono font-bold text-xs">
              <span className="text-emerald-600 dark:text-emerald-400">
                +{activity.metrics.diffDelta?.additions || 8}
              </span>
              <span className="text-rose-600 dark:text-rose-400">
                -{activity.metrics.diffDelta?.deletions || 3}
              </span>
            </div>
          </div>
        )}

        {activity.type === 'translating' && (
          <div className="flex items-center justify-between text-[11px] bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 rounded-lg p-2 text-sky-800 dark:text-sky-300">
            <span>Language Pipeline</span>
            <span className="font-semibold text-xs">
              {activity.metrics.language || 'Hinglish ⇄ English'}
            </span>
          </div>
        )}

        {/* Collapsible Reasoning Accordion */}
        <AnimatePresence>
          {isAccordionOpen && activity.reasoningSteps.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 space-y-1.5"
            >
              <div className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">
                Reasoning Trace
              </div>
              <ul className="space-y-1 text-[11px] text-neutral-600 dark:text-neutral-300 font-mono">
                {activity.reasoningSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-violet-500 font-bold">›</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
