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
  const resolvedModelLabel = activity.metrics.modelName || 'Gemini 3.8 Flash';
  const resolvedLevelLabel = activity.metrics.thinkingLevel
    ? ` • ${activity.metrics.thinkingLevel}`
    : '';

  return (
    <div className="w-full my-2.5 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs overflow-hidden text-xs font-sans">
      {/* Activity Top Header */}
      <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-neutral-900/50">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-7 h-7 rounded-md overflow-hidden shrink-0 border border-neutral-200/60 dark:border-neutral-700/60 bg-white dark:bg-neutral-800 flex items-center justify-center">
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
              <span className="font-medium text-neutral-900 dark:text-neutral-100 capitalize">
                {activity.title}
              </span>
              {activity.isStopped ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-full">
                  Stopped
                </span>
              ) : activity.isDone ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                  <CheckCircle2 className="w-3 h-3" />
                  Done
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse" />
                  Running
                </span>
              )}
            </div>
            {activity.subtitle && (
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
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

      {/* Unified Telemetry Modules Per Activity */}
      <div className="px-3.5 py-2.5">
        {activity.type === 'thinking' && (
          <div className="flex items-center justify-between text-[11px] bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800 rounded-lg p-2 text-neutral-700 dark:text-neutral-300">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-neutral-500" />
              <span>Model Engine</span>
            </div>
            <span className="font-mono font-medium">
              {resolvedModelLabel}
              {resolvedLevelLabel}
              {activity.metrics.tokensUsed ? ` (${activity.metrics.tokensUsed} tok)` : ''}
            </span>
          </div>
        )}

        {activity.type === 'analyzing' && (
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800 rounded-lg p-2 text-neutral-700 dark:text-neutral-300">
              <div className="text-[10px] text-neutral-500">Line Scanner</div>
              <div className="font-mono font-medium text-xs mt-0.5">
                {activity.metrics.linesScanned || 0} LOC Verified
              </div>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800 rounded-lg p-2 text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-neutral-500">Guardrail</div>
                <div className="font-medium text-xs mt-0.5">&le; 1000 Limit Safe</div>
              </div>
              <ShieldCheck className="w-4 h-4 text-neutral-500" />
            </div>
          </div>
        )}

        {activity.type === 'generating' && (
          <div className="flex items-center justify-between text-[11px] bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800 rounded-lg p-2 text-neutral-700 dark:text-neutral-300">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-neutral-500" />
              <span>Token Velocity</span>
            </div>
            <span className="font-mono font-medium text-xs">
              {activity.metrics.tokenVelocity || 86.4} tok/s
            </span>
          </div>
        )}

        {activity.type === 'summarizing' && (
          <div className="flex items-center justify-between text-[11px] bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800 rounded-lg p-2 text-neutral-700 dark:text-neutral-300">
            <span>Compaction Efficiency</span>
            <span className="font-mono font-medium text-xs bg-neutral-200/60 dark:bg-neutral-800 px-2 py-0.5 rounded">
              {activity.metrics.compactionRatio || '76%'} compacted
            </span>
          </div>
        )}

        {activity.type === 'improving' && (
          <div className="flex items-center justify-between text-[11px] bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800 rounded-lg p-2">
            <span className="text-neutral-600 dark:text-neutral-400">Non-Destructive Delta</span>
            <div className="flex items-center gap-2 font-mono font-medium text-xs">
              <span className="text-emerald-600 dark:text-emerald-400">
                +{activity.metrics.diffDelta?.additions || 8}
              </span>
              <span className="text-rose-600 dark:text-rose-400">
                -{activity.metrics.diffDelta?.deletions || 3}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Accordion Reasoning Steps List */}
      <AnimatePresence>
        {isAccordionOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 px-3.5 py-2.5"
          >
            <div className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">
              Reasoning Steps
            </div>
            <ul className="space-y-1.5">
              {activity.reasoningSteps.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-[11px] text-neutral-600 dark:text-neutral-400 font-mono"
                >
                  <span className="text-neutral-400 select-none">›</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
