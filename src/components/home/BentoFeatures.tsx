import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, HardDrive, Cpu, RefreshCw, FileText } from 'lucide-react';

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
            <span>CORE ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-950 dark:text-white tracking-[-0.03em] leading-tight">
            Designed for clarity. Built for focus.
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            A high-performance markdown studio that respects your attention and keeps your files strictly under your control.
          </p>
        </div>

        {/* ── 5-CARD BESPOKE EDITORIAL BENTO GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 text-left items-stretch">
          
          {/* Card 1: Local-First Sovereignty (7 Cols) */}
          <div className="lg:col-span-7 p-7 sm:p-9 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-col justify-between space-y-8 font-sans">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                <HardDrive className="w-3.5 h-3.5 text-brand-500" />
                <span>Architecture • Offline-First</span>
              </div>
              <h3 className="font-semibold text-2xl text-neutral-950 dark:text-white tracking-tight leading-snug">
                Your notes belong to your machine. Always.
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl">
                Start writing immediately with zero login barriers. Your notes persist directly to your local browser IndexedDB and local computer folders (<kbd className="font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200">Ctrl+O</kbd>).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-neutral-100 dark:border-neutral-800">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-neutral-950 dark:text-white">100% Offline</div>
                <div className="text-[11.5px] text-neutral-500 dark:text-neutral-400 leading-snug">
                  Full drafting and reading on flights, trains, and disconnected networks.
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
                  No keystroke monitoring, ad beacons, or external telemetry scanning.
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Mimo AI Engine & BYOK (5 Cols) */}
          <div className="lg:col-span-5 p-7 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-col justify-between space-y-6 font-sans">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                <Cpu className="w-3.5 h-3.5" />
                <span>Pair Writer • Gemini 3.x</span>
              </div>
              <h3 className="font-semibold text-xl text-neutral-950 dark:text-white tracking-tight">
                Mimo AI: Direct BYOK Intelligence
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Exclusively engineered for the Google Gemini 3.x family. Bring your personal Google AI Studio key to unlock pair writing, non-destructive diffs, and AST scoped section editing with zero token markup.
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
              <span>gemini-3.5-flash-lite</span>
              <span>•</span>
              <span>gemini-3.5-flash</span>
              <span>•</span>
              <span>gemini-3.8-flash</span>
            </div>
          </div>

          {/* Card 3: Deep Technical Typesetting (4 Cols) */}
          <div className="lg:col-span-4 p-6 sm:p-7 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-col justify-between space-y-4 font-sans">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Typesetting</span>
              </div>
              <h4 className="font-semibold text-base text-neutral-950 dark:text-white tracking-tight">
                Formulas, Tables &amp; Charts
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Equipped for researchers and engineers. Render complex KaTeX math formulas, draw Mermaid flowcharts, and edit spreadsheet-style tables interactively.
              </p>
            </div>
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
              <span>KaTeX LaTeX Math</span> • <span>Mermaid Graphs</span> • <span>Alert Callouts</span>
            </div>
          </div>

          {/* Card 4: Multi-Device Sync & Conflict Guard (4 Cols) */}
          <div className="lg:col-span-4 p-6 sm:p-7 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-col justify-between space-y-4 font-sans">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Cloud Sync</span>
              </div>
              <h4 className="font-semibold text-base text-neutral-950 dark:text-white tracking-tight">
                Multi-Device Cloud Backup
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Connect your account whenever you want continuous encrypted backup across your laptop, tablet, and mobile device with automatic deletion protection.
              </p>
            </div>
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
              <span>Encrypted Transit</span> • <span>Offline Queue</span> • <span>Conflict Shield</span>
            </div>
          </div>

          {/* Card 5: Studio Export Suite [Beta] (4 Cols) */}
          <div className="lg:col-span-4 p-6 sm:p-7 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-col justify-between space-y-4 font-sans">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Export Studio</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono">
                  Beta
                </span>
              </div>
              <h4 className="font-semibold text-base text-neutral-950 dark:text-white tracking-tight">
                Vector PDF, Word &amp; Slides
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Export notes to vector PDF with custom margins and page headers, clean Microsoft Word (.docx) with formatted tables, or switch to slide presentation mode.
              </p>
            </div>
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
              <span>Vector PDF</span> • <span>Word .docx</span> • <span>Slide Decks</span>
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
