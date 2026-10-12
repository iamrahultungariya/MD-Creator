import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  GitBranch,
  BrainCircuit,
  Lock,
  ArrowRight,
  Check,
  CheckCircle2,
  FileCode,
  Zap,
} from 'lucide-react';
import { MascotState } from '../../features/mimo/types/mimoTypes';

const MASCOT_STATES: { state: MascotState; label: string; tag: string; description: string; img: string }[] = [
  {
    state: 'happy',
    label: 'Ready & Listening',
    tag: 'Idle Presence',
    description: 'Lightweight companion waiting quietly at the edge of your screen. 0% background overhead.',
    img: '/mimo/happy.png',
  },
  {
    state: 'thinking',
    label: 'Autonomous Reasoning',
    tag: 'Deep Context Scan',
    description: 'Evaluates document outline, token velocity, and LOC boundaries to plan surgical edits.',
    img: '/mimo/thinking.png',
  },
  {
    state: 'typing',
    label: 'Real-time Synthesis',
    tag: 'Streaming Tokens',
    description: 'Generates structured markdown, formatted tables, and precise syntax without fluff.',
    img: '/mimo/typing.png',
  },
  {
    state: 'excited',
    label: 'Diff Discovered',
    tag: 'Unified Hunk',
    description: 'Celebrates when non-destructive git patches are ready for your 1-click review.',
    img: '/mimo/excited.png',
  },
  {
    state: 'sleeping',
    label: 'Offline Repose',
    tag: 'Shielded Mode',
    description: 'Rests peacefully when documents are marked private or when working fully disconnected.',
    img: '/mimo/sleeping.png',
  },
];

export const MimoShowcaseSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeMascotState, setActiveMascotState] = useState<MascotState>('excited');
  const [demoDiffApplied, setDemoDiffApplied] = useState(false);

  const currentMascot =
    MASCOT_STATES.find((m) => m.state === activeMascotState) || MASCOT_STATES[0];

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-gradient-to-b from-white via-violet-50/20 to-white dark:from-neutral-950 dark:via-violet-950/10 dark:to-neutral-950 border-t border-neutral-200/80 dark:border-neutral-800 transition-colors font-sans">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-violet-400/10 dark:bg-violet-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200/80 dark:border-violet-800/80 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-violet-500 animate-pulse" />
            <span>MEET MIMO • VERSION 1.2.0 FLAGSHIP</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-neutral-950 dark:text-white tracking-[-0.03em] leading-tight">
            An AI companion built for writers, not chatbots.
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Mimo doesn’t blindly overwrite your files. It understands document structure, respects privacy shields, and proposes clean non-destructive diffs you can inspect before applying.
          </p>
        </div>

        {/* Interactive Mascot & Live Companion Dock Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Interactive Mascot Selector & 3D Character */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-xl flex flex-col items-center text-center space-y-6 relative overflow-hidden">
            {/* Top Mascot State Pills */}
            <div className="flex flex-wrap justify-center gap-1.5 w-full">
              {MASCOT_STATES.map((item) => (
                <button
                  key={item.state}
                  onClick={() => setActiveMascotState(item.state)}
                  className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
                    activeMascotState === item.state
                      ? 'bg-violet-600 text-white shadow-xs scale-105'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mascot Visual Display with Glow */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 bg-violet-500/15 rounded-full blur-2xl scale-125" />
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center rounded-3xl bg-radial from-violet-50/50 via-neutral-50/30 to-transparent dark:from-violet-950/30 dark:via-neutral-900/40 p-4 transition-all duration-300">
                <img
                  src={currentMascot.img}
                  alt={`Mimo ${currentMascot.label}`}
                  className="w-full h-full object-contain drop-shadow-2xl transition-all duration-300 hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/mimo/happy.png';
                  }}
                />
              </div>
            </div>

            {/* Mascot State Metadata */}
            <div className="space-y-1.5 max-w-sm">
              <div className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 rounded-md border border-violet-200/60 dark:border-violet-800/60">
                {currentMascot.tag}
              </div>
              <h4 className="font-bold text-base text-neutral-900 dark:text-white">
                {currentMascot.label}
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {currentMascot.description}
              </p>
            </div>
          </div>

          {/* Right Column: Live Interactive Diff & Feature Mockup */}
          <div className="lg:col-span-7 space-y-6">
            {/* The Non-Destructive Diff Interactive Demo Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-neutral-950 text-neutral-100 border border-neutral-800 shadow-2xl space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3 font-sans">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-white">Mimo Proposed Diff</span>
                  <span className="text-[10px] text-neutral-400 font-mono">lines 14–22</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-emerald-400 font-semibold">+3 additions</span>
                  <span className="text-rose-400 font-semibold">-2 deletions</span>
                </div>
              </div>

              {/* Code comparison hunk */}
              <div className="space-y-1 text-xs leading-relaxed overflow-x-auto py-2 font-mono">
                <div className="text-neutral-500 select-none">@@ -14,5 +14,6 @@ Section Outline</div>
                <div className="text-neutral-400 select-none">&nbsp; ## 1. System Architecture</div>
                <div className="bg-rose-950/50 text-rose-300 border-l-2 border-rose-500 px-2 py-0.5 rounded-xs flex items-center gap-2">
                  <span className="select-none text-rose-500">-</span>
                  <span>- Synchronous file saving via client memory buffers.</span>
                </div>
                <div className="bg-rose-950/50 text-rose-300 border-l-2 border-rose-500 px-2 py-0.5 rounded-xs flex items-center gap-2">
                  <span className="select-none text-rose-500">-</span>
                  <span>- Global cloud upload on every stroke.</span>
                </div>
                <div className="bg-emerald-950/50 text-emerald-300 border-l-2 border-emerald-500 px-2 py-0.5 rounded-xs flex items-center gap-2">
                  <span className="select-none text-emerald-500">+</span>
                  <span>- IndexedDB local-first storage with idle delta coalescing.</span>
                </div>
                <div className="bg-emerald-950/50 text-emerald-300 border-l-2 border-emerald-500 px-2 py-0.5 rounded-xs flex items-center gap-2">
                  <span className="select-none text-emerald-500">+</span>
                  <span>- Private Vault encryption for sensitive &lt;private&gt; tokens.</span>
                </div>
                <div className="bg-emerald-950/50 text-emerald-300 border-l-2 border-emerald-500 px-2 py-0.5 rounded-xs flex items-center gap-2">
                  <span className="select-none text-emerald-500">+</span>
                  <span>- Non-blocking background worker diff computation.</span>
                </div>
                <div className="text-neutral-400 select-none">&nbsp; ## 2. Next Milestones</div>
              </div>

              {/* Interactive Action Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-800 font-sans">
                <div className="text-[11px] text-neutral-400">
                  {demoDiffApplied ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Applied to document cleanly
                    </span>
                  ) : (
                    <span>Test the non-destructive action:</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDemoDiffApplied(false)}
                    className="px-3 py-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs font-medium cursor-pointer transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    onClick={() => setDemoDiffApplied(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept Diff</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick 2-Column Capability Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-bold text-xs">Privacy Shield Vault</span>
                </div>
                <p className="text-[11.5px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Toggle <span className="font-semibold text-neutral-900 dark:text-white">Exclude from AI Scan</span> for any sensitive note. Passwords, PINs, and <code className="text-[10px] bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">/private</code> blocks are auto-redacted before leaving device memory.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <BrainCircuit className="w-4 h-4" />
                  <span className="font-bold text-xs">1000 LOC Guardrail</span>
                </div>
                <p className="text-[11.5px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Large technical manuscripts are never blindly uploaded in bulk. Mimo summarizes document outlines locally and only inspects the active focus section.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Architecture Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 pt-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-200/60 dark:border-violet-800/60">
              <GitBranch className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
              Surgical Git Diffs
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Never worry about accidental loss. Mimo computes patches against your exact lines so you always have full veto power.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/60">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
              Zero-Exposure BYOK
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Bring your own Gemini API key for private, zero-retention requests. Or write 100% offline with AI completely turned off.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/60">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
              Hinglish &amp; Multi-lingual
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Instruct Mimo in English, Hindi, or conversational Hinglish. The prompt router adapts tone and outputs clean technical prose.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60">
              <FileCode className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
              Structured Tables &amp; Code
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Generates beautifully formatted GitHub markdown tables, LaTeX equations, and syntax-highlighted code with 1-click copying.
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="text-center pt-4">
          <button
            onClick={() => navigate('/editor')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer group"
          >
            <span>Launch Editor &amp; Try Mimo</span>
            <kbd className="text-[10px] bg-neutral-800 dark:bg-neutral-200 text-neutral-200 dark:text-neutral-800 px-1.5 py-0.5 rounded font-mono">
              Ctrl+J
            </kbd>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
