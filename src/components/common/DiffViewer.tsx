import React, { useState, useMemo } from 'react';
import { Layers, Eye, EyeOff } from 'lucide-react';

export interface DiffViewerProps {
  original: string;
  modified: string;
  defaultOnlyDiffs?: boolean;
  className?: string;
}

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
  origLine?: number;
  modLine?: number;
}

interface DiffBlock {
  type: 'hunk' | 'folded';
  lines: DiffLine[];
  foldedCount?: number;
}

/**
 * High-performance line-by-line diff algorithm with Myers-style lookahead.
 */
function computeDiffLines(original: string, modified: string): {
  lines: DiffLine[];
  additions: number;
  deletions: number;
} {
  const origLines = original.split('\n');
  const modLines = modified.split('\n');

  let origIdx = 0;
  let modIdx = 0;
  let additions = 0;
  let deletions = 0;
  const result: DiffLine[] = [];

  while (origIdx < origLines.length || modIdx < modLines.length) {
    if (origIdx < origLines.length && modIdx < modLines.length && origLines[origIdx] === modLines[modIdx]) {
      result.push({
        type: 'unchanged',
        text: origLines[origIdx],
        origLine: origIdx + 1,
        modLine: modIdx + 1,
      });
      origIdx++;
      modIdx++;
    } else {
      // Lookahead window up to 6 lines to find resynchronization point
      let foundMod = -1;
      let foundOrig = -1;
      for (let k = 1; k <= 6; k++) {
        if (origIdx + k < origLines.length && origLines[origIdx + k] === modLines[modIdx]) {
          foundOrig = origIdx + k;
          break;
        }
        if (modIdx + k < modLines.length && origLines[origIdx] === modLines[modIdx + k]) {
          foundMod = modIdx + k;
          break;
        }
      }

      if (foundMod !== -1) {
        while (modIdx < foundMod) {
          result.push({
            type: 'added',
            text: modLines[modIdx],
            modLine: modIdx + 1,
          });
          additions++;
          modIdx++;
        }
      } else if (foundOrig !== -1) {
        while (origIdx < foundOrig) {
          result.push({
            type: 'removed',
            text: origLines[origIdx],
            origLine: origIdx + 1,
          });
          deletions++;
          origIdx++;
        }
      } else {
        if (origIdx < origLines.length) {
          result.push({
            type: 'removed',
            text: origLines[origIdx],
            origLine: origIdx + 1,
          });
          deletions++;
          origIdx++;
        }
        if (modIdx < modLines.length) {
          result.push({
            type: 'added',
            text: modLines[modIdx],
            modLine: modIdx + 1,
          });
          additions++;
          modIdx++;
        }
      }
    }
  }

  return { lines: result, additions, deletions };
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  original,
  modified,
  defaultOnlyDiffs = true,
  className = '',
}) => {
  const [onlyDiffs, setOnlyDiffs] = useState(defaultOnlyDiffs);

  const { lines, additions, deletions } = useMemo(() => {
    return computeDiffLines(original, modified);
  }, [original, modified]);

  // Group diff into hunks, collapsing runs of unchanged lines when onlyDiffs is true
  const blocks = useMemo(() => {
    if (!onlyDiffs) {
      return [{ type: 'hunk' as const, lines }];
    }

    const CONTEXT = 2; // lines of context around changes
    const isLineChanged = (idx: number) => {
      return lines[idx].type === 'added' || lines[idx].type === 'removed';
    };

    // Mark lines that are near changes
    const keepLine = new Array<boolean>(lines.length).fill(false);
    for (let i = 0; i < lines.length; i++) {
      if (isLineChanged(i)) {
        for (let c = Math.max(0, i - CONTEXT); c <= Math.min(lines.length - 1, i + CONTEXT); c++) {
          keepLine[c] = true;
        }
      }
    }

    const res: DiffBlock[] = [];
    let currentHunk: DiffLine[] = [];
    let foldedCount = 0;

    for (let i = 0; i < lines.length; i++) {
      if (keepLine[i]) {
        if (foldedCount > 0) {
          res.push({ type: 'folded', lines: [], foldedCount });
          foldedCount = 0;
        }
        currentHunk.push(lines[i]);
      } else {
        if (currentHunk.length > 0) {
          res.push({ type: 'hunk', lines: currentHunk });
          currentHunk = [];
        }
        foldedCount++;
      }
    }

    if (currentHunk.length > 0) {
      res.push({ type: 'hunk', lines: currentHunk });
    }
    if (foldedCount > 0) {
      res.push({ type: 'folded', lines: [], foldedCount });
    }

    return res;
  }, [lines, onlyDiffs]);

  const hasChanges = additions > 0 || deletions > 0;

  return (
    <div className={`flex flex-col rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#111116] overflow-hidden font-mono text-xs ${className}`}>
      {/* Diff Controls & Stats Header */}
      <div className="px-3.5 py-2.5 bg-neutral-50/80 dark:bg-neutral-900/80 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between font-sans shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Difference Preview</span>
          </span>

          {hasChanges ? (
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                +{additions}
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20">
                -{deletions}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-neutral-400 font-medium">No differences</span>
          )}
        </div>

        {/* Toggle between "Only Diffs" and "Full Document" */}
        <button
          type="button"
          onClick={() => setOnlyDiffs((prev) => !prev)}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
            onlyDiffs
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border-brand-200 dark:border-brand-800/80'
              : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
          }`}
          title={onlyDiffs ? 'Showing only differences' : 'Showing all lines'}
        >
          {onlyDiffs ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{onlyDiffs ? 'Only Differences' : 'Full Document'}</span>
        </button>
      </div>

      {/* Diff Lines Viewport */}
      <div className="flex-1 overflow-auto max-h-[60vh] divide-y divide-neutral-100 dark:divide-neutral-900/60 font-mono text-[11px] leading-relaxed">
        {!hasChanges ? (
          <div className="p-8 text-center text-neutral-400 font-sans text-xs">
            ✨ Both versions are identical. No content changed.
          </div>
        ) : (
          blocks.map((block, bIdx) => {
            if (block.type === 'folded') {
              return (
                <div
                  key={`folded-${bIdx}`}
                  className="px-4 py-1.5 bg-neutral-100/70 dark:bg-neutral-900/50 text-neutral-400 dark:text-neutral-500 text-[10px] flex items-center justify-center gap-2 select-none border-y border-neutral-200/50 dark:border-neutral-800/50"
                >
                  <span>···</span>
                  <span>{block.foldedCount} unchanged lines hidden</span>
                  <span>···</span>
                </div>
              );
            }

            return block.lines.map((line, lIdx) => {
              const isAdded = line.type === 'added';
              const isRemoved = line.type === 'removed';

              return (
                <div
                  key={`line-${bIdx}-${lIdx}`}
                  className={`flex items-start transition-colors ${
                    isAdded
                      ? 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-900 dark:text-emerald-200'
                      : isRemoved
                      ? 'bg-rose-500/10 dark:bg-rose-500/15 text-rose-900 dark:text-rose-300 line-through'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30'
                  }`}
                >
                  {/* Line Numbers */}
                  <div className="w-10 sm:w-12 px-1 text-right text-[10px] text-neutral-400 dark:text-neutral-600 select-none border-r border-neutral-200/60 dark:border-neutral-800/60 shrink-0">
                    {line.origLine || ''}
                  </div>
                  <div className="w-10 sm:w-12 px-1 text-right text-[10px] text-neutral-400 dark:text-neutral-600 select-none border-r border-neutral-200/60 dark:border-neutral-800/60 shrink-0">
                    {line.modLine || ''}
                  </div>

                  {/* Sign Indicator */}
                  <div className="w-5 text-center select-none font-bold shrink-0">
                    {isAdded ? (
                      <span className="text-emerald-600 dark:text-emerald-400">+</span>
                    ) : isRemoved ? (
                      <span className="text-rose-600 dark:text-rose-400">-</span>
                    ) : (
                      ' '
                    )}
                  </div>

                  {/* Line Text */}
                  <div className="flex-1 px-2 py-0.5 whitespace-pre-wrap break-all">
                    {line.text || ' '}
                  </div>
                </div>
              );
            });
          })
        )}
      </div>
    </div>
  );
};
