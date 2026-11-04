import React, { useState } from 'react';
import { Check, X, GitPullRequest, ArrowRight, Copy, CheckCheck } from 'lucide-react';
import { MimoDiffHunk } from '../types/mimoTypes';
import { computeLineDiff } from '../services/diffService';

interface MimoDiffCardProps {
  hunk: MimoDiffHunk;
  onApply: () => void;
  onDiscard: () => void;
}

export const MimoDiffCard: React.FC<MimoDiffCardProps> = ({ hunk, onApply, onDiscard }) => {
  const [copied, setCopied] = useState(false);
  const { lines, additions, deletions } = computeLineDiff(
    hunk.originalLines,
    hunk.proposedLines
  );

  const handleCopyProposed = () => {
    navigator.clipboard.writeText(hunk.proposedLines);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="w-full my-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs overflow-hidden text-xs font-sans">
      {/* Premium Minimal Header */}
      <div className="px-3.5 py-2.5 bg-neutral-50/70 dark:bg-neutral-900/50 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 shrink-0">
            <GitPullRequest className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs truncate">
            Proposed Modification
          </span>
          <div className="flex items-center gap-1.5 font-mono text-[10px] shrink-0">
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200/60 dark:border-emerald-800/60">
              +{additions}
            </span>
            <span className="px-1.5 py-0.2 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-semibold border border-rose-200/60 dark:border-rose-800/60">
              -{deletions}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Copy Proposed Code Action */}
          <button
            type="button"
            onClick={handleCopyProposed}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Copy proposed text"
            aria-label="Copy proposed text"
          >
            {copied ? (
              <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* State Badge */}
          {hunk.isApplied ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
              Applied
            </span>
          ) : hunk.isDiscarded ? (
            <span className="text-[10px] font-medium text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
              Discarded
            </span>
          ) : (
            <span className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-700">
              Review Needed
            </span>
          )}
        </div>
      </div>

      {/* Description / Explanation */}
      {hunk.explanation && (
        <div className="px-3.5 py-1.5 bg-neutral-50/30 dark:bg-neutral-900/30 text-[11px] text-neutral-500 dark:text-neutral-400 border-b border-neutral-100 dark:border-neutral-800/80">
          {hunk.explanation}
        </div>
      )}

      {/* Modern Line-Numbered Diff Gutter */}
      <div className="font-mono text-[11px] leading-relaxed max-h-56 overflow-y-auto bg-neutral-50/50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 select-text divide-y divide-neutral-100/60 dark:divide-neutral-900/60">
        {lines.map((l, idx) => {
          if (l.type === 'added') {
            return (
              <div
                key={idx}
                className="py-1 px-3 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 border-l-2 border-emerald-500 flex items-start gap-2"
              >
                <div className="flex items-center gap-1.5 w-10 shrink-0 text-[10px] font-mono text-emerald-600/70 dark:text-emerald-400/70 select-none text-right justify-end">
                  <span>{l.proposedLineNum ?? ''}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">+</span>
                </div>
                <span className="break-all whitespace-pre-wrap flex-1">{l.text || ' '}</span>
              </div>
            );
          }
          if (l.type === 'removed') {
            return (
              <div
                key={idx}
                className="py-1 px-3 bg-rose-500/10 text-rose-900 dark:text-rose-300 border-l-2 border-rose-500 flex items-start gap-2"
              >
                <div className="flex items-center gap-1.5 w-10 shrink-0 text-[10px] font-mono text-rose-600/70 dark:text-rose-400/70 select-none text-right justify-end">
                  <span>{l.originalLineNum ?? ''}</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">-</span>
                </div>
                <span className="break-all whitespace-pre-wrap line-through opacity-80 flex-1">
                  {l.text || ' '}
                </span>
              </div>
            );
          }
          return (
            <div
              key={idx}
              className="py-1 px-3 text-neutral-600 dark:text-neutral-400 border-l-2 border-transparent flex items-start gap-2 hover:bg-neutral-100/40 dark:hover:bg-neutral-900/40 transition-colors"
            >
              <div className="flex items-center gap-1.5 w-10 shrink-0 text-[10px] font-mono text-neutral-400/60 dark:text-neutral-600 select-none text-right justify-end">
                <span>{l.originalLineNum ?? l.proposedLineNum ?? ''}</span>
                <span className="opacity-0"> </span>
              </div>
              <span className="break-all whitespace-pre-wrap flex-1">{l.text || ' '}</span>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      {!hunk.isApplied && !hunk.isDiscarded && (
        <div className="px-3.5 py-2 bg-neutral-50/70 dark:bg-neutral-900/50 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onDiscard}
            className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 dark:hover:border-rose-800 text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-medium cursor-pointer transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Discard</span>
          </button>
          <button
            type="button"
            onClick={onApply}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-950 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Changes</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
