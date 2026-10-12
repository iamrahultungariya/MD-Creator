import React from 'react';
import { Check, X, GitPullRequest, ArrowRight } from 'lucide-react';
import { MimoDiffHunk } from '../types/mimoTypes';
import { computeLineDiff } from '../services/diffService';

interface MimoDiffCardProps {
  hunk: MimoDiffHunk;
  onApply: () => void;
  onDiscard: () => void;
}

export const MimoDiffCard: React.FC<MimoDiffCardProps> = ({ hunk, onApply, onDiscard }) => {
  const { lines, additions, deletions } = computeLineDiff(
    hunk.originalLines,
    hunk.proposedLines
  );

  return (
    <div className="w-full my-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden text-xs font-sans">
      {/* Header */}
      <div className="px-3.5 py-2.5 bg-neutral-50/80 dark:bg-neutral-900/60 border-b border-neutral-200/70 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitPullRequest className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            Proposed Modification
          </span>
          <div className="flex items-center gap-1.5 font-mono text-[10px] ml-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{additions}</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">-{deletions}</span>
          </div>
        </div>

        {/* State Pill */}
        {hunk.isApplied ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <Check className="w-3 h-3" />
            Applied
          </span>
        ) : hunk.isDiscarded ? (
          <span className="text-[10px] text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
            Discarded
          </span>
        ) : (
          <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
            Review Needed
          </span>
        )}
      </div>

      {/* Description */}
      {hunk.explanation && (
        <div className="px-3.5 py-2 bg-neutral-50/30 dark:bg-neutral-900/30 text-[11px] text-neutral-500 border-b border-neutral-100 dark:border-neutral-800/80">
          {hunk.explanation}
        </div>
      )}

      {/* Unified Git Hunk Line Comparison */}
      <div className="p-2 font-mono text-[11px] leading-relaxed max-h-52 overflow-y-auto bg-neutral-950 text-neutral-200 divide-y divide-neutral-900 select-text">
        {lines.map((l, idx) => {
          if (l.type === 'added') {
            return (
              <div
                key={idx}
                className="py-0.5 px-2 bg-emerald-950/50 text-emerald-300 flex items-start gap-2"
              >
                <span className="text-emerald-500 font-bold select-none">+</span>
                <span className="break-all whitespace-pre-wrap">{l.text || ' '}</span>
              </div>
            );
          }
          if (l.type === 'removed') {
            return (
              <div
                key={idx}
                className="py-0.5 px-2 bg-rose-950/50 text-rose-300 flex items-start gap-2"
              >
                <span className="text-rose-500 font-bold select-none">-</span>
                <span className="break-all whitespace-pre-wrap line-through opacity-85">
                  {l.text || ' '}
                </span>
              </div>
            );
          }
          return (
            <div key={idx} className="py-0.5 px-2 text-neutral-400 flex items-start gap-2">
              <span className="opacity-40 select-none"> </span>
              <span className="break-all whitespace-pre-wrap">{l.text}</span>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      {!hunk.isApplied && !hunk.isDiscarded && (
        <div className="px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200/70 dark:border-neutral-800 flex items-center justify-end gap-2">
          <button
            onClick={onDiscard}
            className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-medium cursor-pointer transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Discard
          </button>
          <button
            onClick={onApply}
            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            Apply to Editor
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
