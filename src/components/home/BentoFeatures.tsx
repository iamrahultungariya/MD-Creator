import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface BentoFeaturesProps {
  onExploreFeatures?: () => void;
  onOpenTemplates?: () => void;
  onExportClick?: () => void;
}

export const BentoFeatures: React.FC<BentoFeaturesProps> = () => {
  const navigate = useNavigate();

  return (
    <section id="features" className="py-20 sm:py-28 relative overflow-hidden bg-neutral-50/40 dark:bg-neutral-900/20 border-t border-neutral-200/80 dark:border-neutral-800 transition-colors font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">

        {/* ── SECTION HEADER ── */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
            <span>CORE CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-950 dark:text-white tracking-[-0.03em] leading-tight">
            Designed for clarity. Built for focus.
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            A high-performance markdown studio that respects your attention and keeps your files strictly under your control.
          </p>
        </div>

        {/* ── BESPOKE ASYMMETRIC EDITORIAL GRID (Zero AI Template Bias) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-stretch">
          
          {/* Main Hero Card: Local-First Privacy (7 Columns) */}
          <div className="lg:col-span-7 p-7 sm:p-9 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-col justify-between space-y-8 font-sans">
            <div className="space-y-4">
              <div className="inline-block text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Architecture • Offline-First
              </div>
              <h3 className="font-semibold text-2xl text-neutral-950 dark:text-white tracking-tight leading-snug">
                Your notes belong to your machine. Always.
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl">
                Start writing immediately. No account mandatory, no password friction, and zero subscription paywalls. Your notes persist directly to your local browser storage and local computer folders (<kbd className="font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200">Ctrl+O</kbd>).
              </p>
            </div>

            {/* Architectural Highlights (Typography & 1px tactile dividers) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-neutral-100 dark:border-neutral-800">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-neutral-950 dark:text-white">100% Offline</div>
                <div className="text-[11.5px] text-neutral-500 dark:text-neutral-400 leading-snug">
                  Full drafting and reading on flights, trains, and remote networks.
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold text-neutral-950 dark:text-white">Direct Disk Access</div>
                <div className="text-[11.5px] text-neutral-500 dark:text-neutral-400 leading-snug">
                  Edit and save standard <code className="font-mono text-[10.5px]">.md</code> files directly on your local drive.
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold text-neutral-950 dark:text-white">Zero Telemetry</div>
                <div className="text-[11.5px] text-neutral-500 dark:text-neutral-400 leading-snug">
                  No keystroke monitoring, ad beacons, or external content scanning.
                </div>
              </div>
            </div>
          </div>

          {/* Right Stack: 2 High-Contrast Capability Cards (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Card 1: Multi-Device Sync */}
            <div className="p-6 sm:p-7 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex-1 flex flex-col justify-between space-y-4 font-sans">
              <div className="space-y-2">
                <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Cloud Sync
                </div>
                <h4 className="font-semibold text-base text-neutral-950 dark:text-white tracking-tight">
                  Reliable Multi-Device Sync
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Access your drafts across your laptop, desktop, tablet, and phone. Automatic reconciliation syncs offline edits and handles deletions without collision.
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                <span>Encrypted transit</span>
                <span>•</span>
                <span>Optional Cloud Backup</span>
                <span>•</span>
                <span>Instant Deletion Parity</span>
              </div>
            </div>

            {/* Card 2: Technical Depth */}
            <div className="p-6 sm:p-7 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex-1 flex flex-col justify-between space-y-4 font-sans">
              <div className="space-y-2">
                <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Authoring Tools
                </div>
                <h4 className="font-semibold text-base text-neutral-950 dark:text-white tracking-tight">
                  Formulas, Tables &amp; Export
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Equipped for engineers and researchers. Paste spreadsheet rows as markdown tables, render KaTeX equations, draw Mermaid flowcharts, and export to crisp vector PDF or Word (.docx).
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                <span>KaTeX Math</span>
                <span>•</span>
                <span>Mermaid Graphs</span>
                <span>•</span>
                <span>Vector PDF Studio</span>
              </div>
            </div>

          </div>

        </div>

        {/* ── BOTTOM EXPLORATION LINK ── */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={() => navigate('/editor')}
            className="px-6 py-2.5 rounded-xl bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 active:translate-y-[1px] text-neutral-800 dark:text-neutral-200 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer font-sans border border-neutral-200 dark:border-neutral-800 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700"
          >
            <span>Open Markdown Editor &amp; Start Writing Free</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
          </button>
        </div>

      </div>
    </section>
  );
};
