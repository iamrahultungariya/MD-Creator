import React from 'react';
import { Check, X, ExternalLink, ShieldCheck } from 'lucide-react';

export type PillarId = 'pdf' | 'math' | 'offline' | 'slash' | 'media';

interface FeaturesComparisonTableProps {
  onScrollToPillar: (pillar: PillarId) => void;
}

export const FeaturesComparisonTable: React.FC<FeaturesComparisonTableProps> = ({ onScrollToPillar }) => {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-neutral-200/80 dark:border-neutral-800">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl font-black text-neutral-950 dark:text-white tracking-tight mb-3">
          How MD Writer Compares
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Verifiable side-by-side capabilities against standard tools. Click any row to jump to its live interactive showcase.
        </p>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-850">
              <th className="p-4 font-bold text-neutral-950 dark:text-white">Capability</th>
              <th className="p-4 font-bold text-blue-600 dark:text-blue-400">MD Writer</th>
              <th className="p-4 font-medium text-neutral-500">Notion</th>
              <th className="p-4 font-medium text-neutral-500">Obsidian</th>
              <th className="p-4 font-medium text-neutral-400 text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
            {[
              { 
                feat: 'Works 100% Offline with Zero Sign-Up', 
                md: true, 
                notion: false, 
                obsidian: true, 
                pillar: 'offline' as PillarId,
                badge: null
              },
              { 
                feat: 'Publication-Ready PDF Cover & Dynamic TOC', 
                md: true, 
                notion: false, 
                obsidian: false, 
                pillar: 'pdf' as PillarId,
                badge: null
              },
              { 
                feat: 'Pre-Categorized KaTeX Formula Studio', 
                md: true, 
                notion: false, 
                obsidian: false, 
                pillar: 'math' as PillarId,
                badge: null
              },
              { 
                feat: 'Native Instant Slash Block Commands (/)', 
                md: true, 
                notion: true, 
                obsidian: false, // requires plugin
                pillar: 'slash' as PillarId,
                badge: null
              },
              { 
                feat: 'Direct Clipboard Image WebP Compression', 
                md: true, 
                notion: false, 
                obsidian: false, 
                pillar: 'media' as PillarId,
                badge: null
              },
              { 
                feat: '1-Click Progressive Web App (PWA) Install', 
                md: true, 
                notion: false, 
                obsidian: false, 
                pillar: 'offline' as PillarId,
                badge: null
              },
            ].map((row, idx) => (
              <tr 
                key={idx} 
                onClick={() => onScrollToPillar(row.pillar)}
                className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors cursor-pointer group"
                title={`Click to view ${row.feat} specifications`}
              >
                <td className="p-4 font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <span>{row.feat}</span>
                  {row.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                      {row.badge}
                    </span>
                  )}
                </td>
                <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </td>
                <td className="p-4 text-neutral-400">
                  {row.notion ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-neutral-300 dark:text-neutral-700" />}
                </td>
                <td className="p-4 text-neutral-400">
                  {row.obsidian ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-neutral-300 dark:text-neutral-700" />}
                </td>
                <td className="p-4 text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 opacity-80 group-hover:opacity-100 transition-opacity">
                    <span>View Spec</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legal Safety & Accuracy Footnote */}
      <div className="mt-4 flex items-start gap-2 text-[11px] text-neutral-400 leading-relaxed max-w-4xl mx-auto">
        <ShieldCheck className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
        <p>
          * Feature comparison verified as of September 2026. Third-party software features (Notion, Obsidian) refer to core default functionality without community plugin modifications and may evolve over time.
        </p>
      </div>
    </section>
  );
};
