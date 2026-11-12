import React, { useState } from 'react';
import { ActivityTelemetry, MimoProtocolStepStatus } from '../types/mimoTypes';

interface MimoExecutionTimelineProps {
  activity?: ActivityTelemetry;
  isStreaming: boolean;
}

const STEP_MARKER: Record<MimoProtocolStepStatus, string> = {
  pending: 'bg-neutral-300 dark:bg-neutral-700',
  active: 'bg-neutral-900 dark:bg-white',
  done: 'bg-emerald-600 dark:bg-emerald-400',
};

export const MimoExecutionTimeline: React.FC<MimoExecutionTimelineProps> = ({
  activity,
  isStreaming,
}) => {
  const timeline = activity?.protocolTimeline;
  const [expandedAfterDone, setExpandedAfterDone] = useState(false);

  if (!timeline?.enabled) return null;

  const isDone = Boolean(activity?.isDone) && !isStreaming;
  const isExpanded = !isDone || expandedAfterDone;
  const elapsedSeconds = activity?.metrics?.elapsedMs
    ? (activity.metrics.elapsedMs / 1000).toFixed(1)
    : null;
  const activeStep = timeline.steps.find((s) => s.status === 'active') ?? timeline.steps[0];

  return (
    <div className="mb-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 text-xs">
      <button
        type="button"
        onClick={() => isDone && setExpandedAfterDone((prev) => !prev)}
        disabled={!isDone}
        aria-expanded={isExpanded}
        className={`w-full px-3 py-1.5 flex items-center justify-between text-left ${
          isDone ? 'cursor-pointer hover:bg-neutral-100/70 dark:hover:bg-neutral-800/40' : 'cursor-default'
        } transition-colors`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isDone ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-neutral-900 dark:bg-neutral-100'
            }`}
          />
          <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
            {isDone
              ? timeline.summaryLabel || '5-step protocol complete'
              : `${activeStep.label} — ${activeStep.detail}`}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono tabular-nums">
          <span>{elapsedSeconds ? `${elapsedSeconds}s` : '3.5 Lite'}</span>
          {isDone && (
            <span className="text-[10px] font-sans text-neutral-400">
              {isExpanded ? 'Hide' : 'Steps'}
            </span>
          )}
        </div>
      </button>

      {isExpanded && (
        <ol className="grid grid-cols-5 border-t border-neutral-200 dark:border-neutral-800 divide-x divide-neutral-200 dark:divide-neutral-800">
          {timeline.steps.map((step, index) => {
            const isStepDone = step.status === 'done';
            const isStepActive = step.status === 'active';
            return (
              <li
                key={step.id}
                className={`px-2 py-1.5 min-w-0 transition-colors ${
                  isStepActive
                    ? 'bg-white dark:bg-neutral-950'
                    : isStepDone
                    ? 'bg-transparent'
                    : 'opacity-55'
                }`}
                title={`${index + 1}. ${step.label}: ${step.detail}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STEP_MARKER[step.status]}`} />
                  <span
                    className={`text-[10.5px] truncate ${
                      isStepActive
                        ? 'font-semibold text-neutral-950 dark:text-white'
                        : isStepDone
                        ? 'font-medium text-neutral-700 dark:text-neutral-300'
                        : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};
