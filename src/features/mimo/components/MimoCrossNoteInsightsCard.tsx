import React from 'react';
import { Link2, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import type { CrossNoteReport } from '../services/crossNoteLinkerService';

export interface MimoCrossNoteInsightsCardProps {
  report: CrossNoteReport;
  onInsertLink?: (originalText: string, linkText: string) => void;
  onDismissFinding?: (id: string) => void;
}

export const MimoCrossNoteInsightsCard: React.FC<MimoCrossNoteInsightsCardProps> = ({
  report,
  onInsertLink,
  onDismissFinding,
}) => {
  const { findings, totalDocsScanned } = report;

  if (findings.length === 0) {
    return (
      <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>
          Scanned {totalDocsScanned} vault note(s). All parameters consistent and no unlinked titles detected.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/50 via-white to-neutral-50/60 dark:from-indigo-950/20 dark:via-neutral-900/40 dark:to-neutral-950/40 p-3.5 space-y-3 shadow-xs">
      <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/40 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Link2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
              Vault Graph & Fact-Check Insights
            </h4>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
              Scanned {totalDocsScanned} local documents
            </p>
          </div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
          {findings.length} Insight{findings.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2">
        {findings.map((finding) => (
          <div
            key={finding.id}
            className={`p-2.5 rounded-xl border text-left text-xs space-y-1.5 transition-all ${
              finding.type === 'fact_check'
                ? 'border-amber-500/40 bg-amber-50/60 dark:bg-amber-950/20'
                : 'border-neutral-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/70'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {finding.type === 'fact_check' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    Parameter Divergence
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                    <Link2 className="w-3 h-3" />
                    Unlinked Vault Note
                  </span>
                )}
              </div>

              {onDismissFinding && (
                <button
                  type="button"
                  onClick={() => onDismissFinding(finding.id)}
                  className="text-[10px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                >
                  Dismiss
                </button>
              )}
            </div>

            <p className="text-[11px] text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {finding.explanation}
            </p>

            {finding.lineContext && (
              <div className="p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800/80 font-mono text-[10px] text-neutral-600 dark:text-neutral-300 truncate">
                "{finding.lineContext}"
              </div>
            )}

            {finding.suggestedLink && onInsertLink && (
              <div className="pt-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() =>
                    onInsertLink(finding.matchedText, finding.suggestedLink!)
                  }
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <span>Insert {finding.suggestedLink}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
