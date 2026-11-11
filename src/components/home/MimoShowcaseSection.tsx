import React, { useState } from 'react';
import { CheckCircle2, Undo2 } from 'lucide-react';
import { MascotState } from '../../features/mimo/types/mimoTypes';

const MASCOT_STATES: { state: MascotState; label: string; tag: string; description: string; img: string }[] = [
  {
    state: 'excited',
    label: 'Ready to Help',
    tag: 'Active Co-Pilot',
    description: 'Proposes thoughtful suggestions, tables, and formulas directly inside your document.',
    img: '/mimo/excited.png',
  },
  {
    state: 'happy',
    label: 'Calm & Quiet',
    tag: 'Zero Lag',
    description: 'Waits quietly in the corner of your editor without consuming extra memory or battery.',
    img: '/mimo/happy.png',
  },
  {
    state: 'thinking',
    label: 'Reading Context',
    tag: 'Document Aware',
    description: 'Follows your active section and headings so you never have to re-paste your text.',
    img: '/mimo/thinking.png',
  },
  {
    state: 'typing',
    label: 'Writing',
    tag: 'Drafting Edits',
    description: 'Creates clean markdown, formatted bullet points, and KaTeX math formulas.',
    img: '/mimo/typing.png',
  },
  {
    state: 'sleeping',
    label: 'Resting & Private',
    tag: 'Offline Safe',
    description: 'Stays completely idle when you work offline or mark notes private.',
    img: '/mimo/sleeping.png',
  },
];

export const MimoShowcaseSection: React.FC = () => {
  const [activeMascotState, setActiveMascotState] = useState<MascotState>('excited');
  const [demoDiffApplied, setDemoDiffApplied] = useState(false);

  const currentMascot =
    MASCOT_STATES.find((m) => m.state === activeMascotState) || MASCOT_STATES[0];

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-neutral-50/40 dark:bg-neutral-900/20 border-t border-neutral-200/80 dark:border-neutral-800 transition-colors font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/80 dark:border-brand-800/80">
            <span>MEET MIMO • GEMINI 3.x INTENT ENGINE • v2.3.0</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-950 dark:text-white tracking-[-0.03em] leading-tight">
            An AI companion built for writers, not chatbots.
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Mimo doesn&apos;t blindly overwrite your files. It features direct BYOK for the Google Gemini 3.x family, respects privacy shields, and proposes clean non-destructive diffs you can inspect before applying.
          </p>
        </div>

        {/* Interactive Companion & Diff Preview Dock */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Mascot Selector & Minimal Card */}
          <div className="lg:col-span-5 p-6 sm:p-7 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col items-center justify-between text-center space-y-5">
            {/* Mascot State Tabs */}
            <div className="flex flex-wrap justify-center gap-1.5 w-full">
              {MASCOT_STATES.map((item) => (
                <button
                  key={item.state}
                  onClick={() => setActiveMascotState(item.state)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors active:translate-y-[1px] ${
                    activeMascotState === item.state
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs font-semibold'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/70 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mascot Visual Display (Clean Crisp 2D Image without scaling jitter) */}
            <div className="relative my-2 flex items-center justify-center w-40 h-40 sm:w-48 sm:h-48">
              <img
                src={currentMascot.img}
                alt={`Mimo ${currentMascot.label}`}
                className="w-full h-full object-contain select-none"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/mimo/happy.png';
                }}
              />
            </div>

            {/* Mascot State Metadata */}
            <div className="space-y-1.5 max-w-xs">
              <div className="inline-block text-[10px] font-mono font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-md border border-brand-200/60 dark:border-brand-800/60">
                {currentMascot.tag}
              </div>
              <h3 className="font-semibold text-sm text-neutral-950 dark:text-white">
                {currentMascot.label}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {currentMascot.description}
              </p>
            </div>
          </div>

          {/* Right Column: Sleek Non-Destructive Diff Demonstration */}
          <div className="lg:col-span-7 p-6 sm:p-7 rounded-2xl bg-neutral-950 text-neutral-100 border border-neutral-800 shadow-xs flex flex-col justify-between space-y-4 font-mono">
            {/* Diff Card Top Header with calm status indicator */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 font-sans">
              <div className="flex items-center gap-2">
                <span className="inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                <span className="text-xs font-semibold text-white">Mimo Proposed Changes</span>
                <span className="text-[10px] text-neutral-500 font-mono">Section: System Architecture</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-emerald-400 font-medium">+3 additions</span>
                <span className="text-rose-400 font-medium">-2 removals</span>
              </div>
            </div>

            {/* Code Diff Display */}
            <div className="space-y-1 text-xs leading-relaxed overflow-x-auto py-2 font-mono">
              <div className="text-neutral-500 select-none text-[11px]">@@ -14,5 +14,6 @@ System Architecture</div>
              <div className="text-neutral-400 select-none">&nbsp; ## 1. Storage &amp; Persistence</div>
              <div className="bg-rose-950/40 text-rose-300 border-l-2 border-rose-500 px-2.5 py-1 rounded-xs flex items-center gap-2">
                <span className="select-none text-rose-500 font-bold">-</span>
                <span>- Auto-upload every keystroke directly to remote server.</span>
              </div>
              <div className="bg-rose-950/40 text-rose-300 border-l-2 border-rose-500 px-2.5 py-1 rounded-xs flex items-center gap-2">
                <span className="select-none text-rose-500 font-bold">-</span>
                <span>- Lock documents behind mandatory account sign-up.</span>
              </div>
              <div className="bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500 px-2.5 py-1 rounded-xs flex items-center gap-2">
                <span className="select-none text-emerald-500 font-bold">+</span>
                <span>+ Local storage with zero keystroke latency.</span>
              </div>
              <div className="bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500 px-2.5 py-1 rounded-xs flex items-center gap-2">
                <span className="select-none text-emerald-500 font-bold">+</span>
                <span>+ Instant multi-device sync with offline deletion recovery.</span>
              </div>
              <div className="bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500 px-2.5 py-1 rounded-xs flex items-center gap-2">
                <span className="select-none text-emerald-500 font-bold">+</span>
                <span>+ Private shields to exclude sensitive notes from AI scanning.</span>
              </div>
              <div className="text-neutral-400 select-none">&nbsp; ## 2. Next Milestones</div>
            </div>

            {/* Interactive Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-800 font-sans">
              <div className="text-xs text-neutral-400">
                {demoDiffApplied ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Applied to document smoothly
                  </span>
                ) : (
                  <span>Click to test non-destructive review:</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {demoDiffApplied ? (
                  <button
                    onClick={() => setDemoDiffApplied(false)}
                    className="px-3 py-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs font-medium cursor-pointer transition-colors active:translate-y-[1px] flex items-center gap-1.5"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Undo</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setDemoDiffApplied(false)}
                      className="px-3 py-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs font-medium cursor-pointer transition-colors active:translate-y-[1px]"
                    >
                      Discard
                    </button>
                    <button
                      onClick={() => setDemoDiffApplied(true)}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer transition-colors active:translate-y-[1px] shadow-2xs"
                    >
                      <span>Accept Diff</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Minimalist Pillars (Typography-led, zero decorative icon boxes) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-2.5">
            <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              01 • Review
            </div>
            <h4 className="font-semibold text-sm text-neutral-950 dark:text-white">
              Surgical Visual Diffs
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Mimo generates clear line-by-line additions and deletions. You inspect the patch visually and accept or discard with 1 click.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-2.5">
            <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              02 • Control
            </div>
            <h4 className="font-semibold text-sm text-neutral-950 dark:text-white">
              Document Privacy Shield
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Mark any sensitive document &quot;Exclude from AI Scan&quot; with a single toggle. Private blocks stay entirely in your device memory.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-2.5">
            <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              03 • Autonomy
            </div>
            <h4 className="font-semibold text-sm text-neutral-950 dark:text-white">
              Bring Your Own Key (BYOK)
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Plug in your free personal Gemini API key for direct browser-to-Google processing, zero shared queues, and unlimited capacity.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
