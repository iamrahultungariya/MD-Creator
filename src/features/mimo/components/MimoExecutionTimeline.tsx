import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ActivityTelemetry } from '../types/mimoTypes';

interface MimoExecutionTimelineProps {
  activity?: ActivityTelemetry;
  isStreaming: boolean;
}

const STEP_LABELS: Record<string, { label: string; detail: string }> = {
  understand: { label: 'Understand', detail: 'Analyzing prompt and context' },
  decompose: { label: 'Structure', detail: 'Planning structure and depth' },
  develop: { label: 'Develop', detail: 'Drafting response' },
  verify: { label: 'Verify', detail: 'Syntax and layout review' },
  polish: { label: 'Polish', detail: 'Tone and formatting calibration' },
};

export const MimoExecutionTimeline: React.FC<MimoExecutionTimelineProps> = ({
  activity,
  isStreaming,
}) => {
  const timeline = activity?.protocolTimeline;
  const [isExpanded, setIsExpanded] = useState(false);

  if (!timeline?.enabled) return null;

  const isDone = Boolean(activity?.isDone) && !isStreaming;
  const elapsedSeconds = activity?.metrics?.elapsedMs
    ? (activity.metrics.elapsedMs / 1000).toFixed(1)
    : null;

  const activeStep = timeline.steps.find((s) => s.status === 'active') ?? timeline.steps[0];
  const activeLabel = STEP_LABELS[activeStep?.id]?.label || activeStep?.label || 'Thinking';

  return (
    <div className="mb-2.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-neutral-900/40 text-xs overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className="w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isDone
                ? 'bg-neutral-400 dark:bg-neutral-500'
                : 'bg-neutral-900 dark:bg-neutral-100 animate-pulse'
            }`}
          />
          <span className="font-medium text-neutral-700 dark:text-neutral-300 truncate">
            {isDone
              ? elapsedSeconds
                ? `Thought for ${elapsedSeconds}s`
                : 'Thought complete'
              : `${activeLabel}...`}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors">
          {elapsedSeconds && !isDone && (
            <span className="text-[11px] font-mono tabular-nums text-neutral-500">
              {elapsedSeconds}s
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Expanded Vertical Timeline Rail */}
      {isExpanded && (
        <div className="px-3 pb-2.5 pt-1 border-t border-neutral-200/60 dark:border-neutral-800/60">
          <ol className="relative pl-3.5 border-l border-neutral-200 dark:border-neutral-800 my-1 space-y-2">
            {timeline.steps.map((step) => {
              const isStepDone = step.status === 'done';
              const isStepActive = step.status === 'active';
              const config = STEP_LABELS[step.id] || { label: step.label, detail: step.detail };

              return (
                <li key={step.id} className="relative">
                  {/* Timeline Node Bullet */}
                  <span
                    className={`absolute -left-[19px] top-1.5 w-2 h-2 rounded-full transition-colors ${
                      isStepDone
                        ? 'bg-neutral-800 dark:bg-neutral-200 ring-1 ring-neutral-400/20'
                        : isStepActive
                        ? 'bg-neutral-900 dark:bg-white ring-2 ring-neutral-400/40 animate-pulse'
                        : 'bg-neutral-300 dark:bg-neutral-700'
                    }`}
                  />
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span
                      className={`text-[11px] ${
                        isStepActive
                          ? 'font-semibold text-neutral-950 dark:text-white'
                          : isStepDone
                          ? 'font-medium text-neutral-700 dark:text-neutral-300'
                          : 'text-neutral-400 dark:text-neutral-500'
                      }`}
                    >
                      {config.label}
                    </span>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate">
                      · {config.detail}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
};
