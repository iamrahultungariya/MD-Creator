import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Check, 
  HardDrive, 
  Cloud, 
  Zap,
  Sparkles
} from 'lucide-react';

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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80">
            <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
            <span>CORE CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-950 dark:text-white tracking-[-0.03em] leading-tight">
            Designed for clarity. Built for focus.
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            A high-performance markdown studio that respects your attention and keeps your files strictly under your control.
          </p>
        </div>

        {/* ── 3 CORE CAPABILITY CARDS (MATCHING MIMODRAWER MINIMAL AESTHETIC) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          
          {/* Card 1: Local-First Storage */}
          <div className="p-7 sm:p-8 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 font-sans group">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center border border-neutral-200/80 dark:border-neutral-700 shadow-2xs group-hover:scale-105 transition-transform">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <div className="inline-block text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                  Offline First
                </div>
                <h3 className="font-semibold text-lg text-neutral-950 dark:text-white tracking-tight">
                  Local-First • Zero Friction
                </h3>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Start writing immediately. No account mandatory, no password friction, and zero paywalls. Your notes persist locally to your browser and local computer folders (<kbd className="font-mono">Ctrl+O</kbd>).
              </p>
            </div>

            <ul className="space-y-2.5 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 text-[11.5px] text-neutral-700 dark:text-neutral-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300 shrink-0 stroke-[2.5]" />
                <span>Works 100% offline: on flights, subways &amp; remote</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300 shrink-0 stroke-[2.5]" />
                <span>Direct local disk <code className="font-mono text-[10.5px]">.md</code> file management</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300 shrink-0 stroke-[2.5]" />
                <span>Zero telemetry: no keystroke or content tracking</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Cloud Sync & Multi-Device */}
          <div className="p-7 sm:p-8 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 font-sans group">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center border border-neutral-200/80 dark:border-neutral-700 shadow-2xs group-hover:scale-105 transition-transform">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <div className="inline-block text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                  Seamless Parity
                </div>
                <h3 className="font-semibold text-lg text-neutral-950 dark:text-white tracking-tight">
                  Multi-Device Cloud Sync
                </h3>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Access your drafts anywhere across your laptop, desktop, tablet, and mobile. Automatic reconciliation handles offline edits and cross-device deletions without conflicts.
              </p>
            </div>

            <ul className="space-y-2.5 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 text-[11.5px] text-neutral-700 dark:text-neutral-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300 shrink-0 stroke-[2.5]" />
                <span>Reliable cross-device sync with deletion tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300 shrink-0 stroke-[2.5]" />
                <span>Responsive UI tailored for desktop, tablet &amp; mobile</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300 shrink-0 stroke-[2.5]" />
                <span>Password-protected public link sharing</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Lightweight Markdown Power */}
          <div className="p-7 sm:p-8 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 font-sans group">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center border border-neutral-200/80 dark:border-neutral-700 shadow-2xs group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="inline-block text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                  Speed &amp; Depth
                </div>
                <h3 className="font-semibold text-lg text-neutral-950 dark:text-white tracking-tight">
                  Focused &amp; Capable
                </h3>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Instant launch with zero menu clutter. Equipped with powerful tools: Excel-to-markdown table paste, KaTeX math rendering, Mermaid diagrams, and clean PDF / Word export.
              </p>
            </div>

            <ul className="space-y-2.5 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 text-[11.5px] text-neutral-700 dark:text-neutral-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300 shrink-0 stroke-[2.5]" />
                <span>Smooth typing response with zero UI sluggishness</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300 shrink-0 stroke-[2.5]" />
                <span>Paste spreadsheet data as clean markdown tables</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300 shrink-0 stroke-[2.5]" />
                <span>Publication-grade PDF Studio &amp; Word (.docx) export</span>
              </li>
            </ul>
          </div>

        </div>

        {/* ── BOTTOM EXPLORATION LINK ── */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={() => navigate('/editor')}
            className="px-6 py-2.5 rounded-xl bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer group font-sans border border-neutral-200/90 dark:border-neutral-800 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700"
          >
            <span>Open Markdown Editor &amp; Start Writing Free</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
};
