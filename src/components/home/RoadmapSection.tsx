import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Zap, 
  FileDown, 
  Save, 
  Presentation, 
  WifiOff, 
  Bug, 
  ArrowRight,
  Layers,
  Database
} from 'lucide-react';
import { APP_VERSION_LABEL } from '../../config/version';

export const RoadmapSection: React.FC = () => {
  const navigate = useNavigate();

  const shippedFeatures = [
    {
      icon: Database,
      title: 'Delta Storage & LZ Compression',
      desc: 'Diff-match-patch deltas and 3x-5x LZ compression save ~80% browser storage with automatic 50-checkpoint pruning.',
    },
    {
      icon: FileDown,
      title: 'Multi-Format Export',
      desc: 'Download your work cleanly as formatted PDF, Microsoft Word (.docx), or plain Markdown (.md).',
    },
    {
      icon: Zap,
      title: 'Instant Slash Commands (/)',
      desc: 'Type / on any line to insert tables, math equations, callouts, and checklists in one click.',
    },
    {
      icon: Save,
      title: 'Continuous Auto-Save & Coalescing',
      desc: 'Local drafts save continuously while revisions coalesce after 45s of idle typing.',
    },
    {
      icon: Presentation,
      title: 'Notes-to-Slides Deck',
      desc: 'Press Ctrl+M to instantly convert your document headings into an interactive presentation.',
    },
    {
      icon: WifiOff,
      title: '100% Offline Support',
      desc: 'Write and organize your documents anywhere with zero internet dependency.',
    },
  ];

  return (
    <section className="py-20 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200/60 dark:border-brand-800/60 shadow-2xs">
            <Layers className="w-3.5 h-3.5" />
            <span>Product Highlights • {APP_VERSION_LABEL}</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
            What&apos;s New in {APP_VERSION_LABEL}
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Reliable, focused writing with zero fluff. Everything listed below is live and ready to use in your browser.
          </p>
        </div>

        {/* Shipped Features Card */}
        <div className="p-7 sm:p-9 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-xs space-y-7">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-950 dark:text-white">
                  Shipped in {APP_VERSION_LABEL}
                </h3>
                <p className="text-[11px] text-neutral-500">Live, battle-tested, and ready to use</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              Live Now
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shippedFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="flex items-start gap-3.5 group p-3.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-brand-500/10 group-hover:text-brand-500 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                      {feat.title}
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bug Reporting & Feedback Callout Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <Bug className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-neutral-950 dark:text-white">
                Noticed a bug or have a suggestion?
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Help us improve MD Writer. We review community reports directly and ship fixes quickly.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/feedback')}
            className="px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-200/80 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
          >
            <span>Report Bug / Idea</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
};
