import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Check, 
  HardDrive, 
  Cloud,
  Zap
} from 'lucide-react';

interface BentoFeaturesProps {
  onExploreFeatures?: () => void;
  onOpenTemplates?: () => void;
  onExportClick?: () => void;
}

export const BentoFeatures: React.FC<BentoFeaturesProps> = () => {
  const navigate = useNavigate();

  return (
    <section id="features" className="py-20 sm:py-28 relative overflow-hidden bg-neutral-50/50 dark:bg-neutral-900/20 border-t border-neutral-200/80 dark:border-neutral-800 transition-colors font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">

        {/* ── SECTION HEADER ── */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
            <span>FEATURES &amp; CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-950 dark:text-white tracking-[-0.03em] leading-tight">
            Designed for clarity. Built for focus.
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            A high-performance markdown studio that respects your attention and keeps your files strictly under your control.
          </p>
        </div>

        {/* ── 3 CORE CAPABILITY CARDS (NO EXTRA SUB-SECTIONS) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          
          {/* Card 1: Local-First Writer • No Sign-Up */}
          <div className="p-7 sm:p-8 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 font-sans group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-800/50 shadow-2xs group-hover:scale-105 transition-transform">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                  Zero Barriers
                </div>
                <h3 className="font-bold text-lg text-neutral-950 dark:text-white tracking-tight">
                  Local-First Writer • No Sign-Up
                </h3>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Start writing the moment you open the app. No account creation, no password friction, and zero paywalls. Your notes persist locally to your browser and your local computer folders (<kbd className="font-mono">Ctrl+O</kbd>).
              </p>
            </div>

            <ul className="space-y-2.5 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 text-[11.5px] text-neutral-700 dark:text-neutral-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
                <span>100% offline: works in flights, subways &amp; remote</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
                <span>Direct local disk <code className="font-mono text-[10.5px]">.md</code> folder access</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
                <span>Zero telemetry: no keystroke or content tracking</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Cloud Sync • Cross-Device Support */}
          <div className="p-7 sm:p-8 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 font-sans group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/50 dark:border-blue-800/50 shadow-2xs group-hover:scale-105 transition-transform">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                  Seamless Harmony
                </div>
                <h3 className="font-bold text-lg text-neutral-950 dark:text-white tracking-tight">
                  Cloud Sync • Cross-Device Support
                </h3>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Seamlessly access and write notes across your laptop, desktop, tablet, and mobile. Real-time synchronization keeps your documents in continuous harmony without friction, plus 1-click password-protected public link sharing.
              </p>
            </div>

            <ul className="space-y-2.5 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 text-[11.5px] text-neutral-700 dark:text-neutral-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 stroke-[2.5]" />
                <span>Instant multi-device live sync across your screens</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 stroke-[2.5]" />
                <span>Responsive UI tailored for desktop, tablet &amp; mobile</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 stroke-[2.5]" />
                <span>Share password-protected or public read links</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Lightweight • Incredibly Powerful */}
          <div className="p-7 sm:p-8 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 font-sans group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/50 dark:border-amber-800/50 shadow-2xs group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                  Speed Meets Depth
                </div>
                <h3 className="font-bold text-lg text-neutral-950 dark:text-white tracking-tight">
                  Lightweight • Incredibly Powerful
                </h3>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Blazing-fast startup with zero menu bloat, equipped with heavy-duty tools: smart Excel/Sheets auto-table converter, math formulas, architecture diagrams, slash commands (<kbd className="font-mono">/</kbd>), and clean PDF export.
              </p>
            </div>

            <ul className="space-y-2.5 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 text-[11.5px] text-neutral-700 dark:text-neutral-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 stroke-[2.5]" />
                <span>Instant typing response with zero keystroke lag</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 stroke-[2.5]" />
                <span>Smart Clipboard: paste Excel/Sheets data as clean tables</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 stroke-[2.5]" />
                <span>Clean PDF Studio &amp; Word (.docx) publishing</span>
              </li>
            </ul>
          </div>

        </div>

        {/* ── BOTTOM EXPLORATION LINK ── */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={() => navigate('/editor')}
            className="px-6 py-2.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer group font-sans border border-neutral-200/80 dark:border-neutral-700 shadow-2xs"
          >
            <span>Open Markdown Studio &amp; Start Writing Free</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
};
