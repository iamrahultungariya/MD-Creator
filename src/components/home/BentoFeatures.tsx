import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  HardDrive, 
  FolderOpen, 
  Cloud,
  Code2
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 sm:space-y-32">

        {/* ── SECTION HEADER ── */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
            <span>FEATURES &amp; CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-950 dark:text-white tracking-[-0.03em] leading-tight">
            Designed for clarity. Built for focus.
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            A high-performance markdown engine that respects your attention and keeps your files strictly under your control.
          </p>
        </div>

        {/* ── STORY BLOCK 1: THE WRITING ENGINE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Text Column (Left 5 cols) */}
          <div className="lg:col-span-5 space-y-5 text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              <Code2 className="w-4 h-4" />
              <span>The Writing Engine</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-semibold text-neutral-950 dark:text-white tracking-tight leading-snug">
              Everything you need to write. Nothing you don&apos;t.
            </h3>

            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Built on CodeMirror 6 with 0ms keystroke latency. Invoke formatting commands instantly with <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-xs">/</kbd>, paste spreadsheets directly as markdown tables, and format with standard keyboard shortcuts.
            </p>

            <ul className="space-y-2.5 text-xs text-neutral-700 dark:text-neutral-300 pt-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>Slash Commands (/)</strong>: Headings, callouts, and math blocks in 1 keystroke</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>Smart Clipboard</strong>: Converts Excel/Sheets tables to Markdown automatically</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>KaTeX &amp; Mermaid</strong>: Native proofs, complex formulas &amp; architecture graphs</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>Monospace Typography</strong>: Geist Mono, JetBrains Mono, or Consolas (<kbd>Ctrl+,</kbd>)</span>
              </li>
            </ul>
          </div>

          {/* Visual Showcase Column (Right 7 cols) - Clean, no floating action bar */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xl dark:shadow-black/40 space-y-4 text-left font-sans">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                {/* macOS Traffic Lights with Hover Symbols */}
                <div className="flex items-center gap-1.5 group/traffic cursor-pointer">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] border border-[#e0443e]/50 flex items-center justify-center text-[7px] font-bold text-[#4c0000] shadow-xs">
                    <span className="opacity-0 group-hover/traffic:opacity-100 transition-opacity leading-none">✕</span>
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] border border-[#dea123]/50 flex items-center justify-center text-[7px] font-bold text-[#5c3c00] shadow-xs">
                    <span className="opacity-0 group-hover/traffic:opacity-100 transition-opacity leading-none">−</span>
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] border border-[#1aab29]/50 flex items-center justify-center text-[7px] font-bold text-[#004d11] shadow-xs">
                    <span className="opacity-0 group-hover/traffic:opacity-100 transition-opacity leading-none">+</span>
                  </span>
                  <span className="font-mono text-xs text-neutral-400 ml-2">RFC-042-distributed-cache.md</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200/50 dark:border-emerald-800/60">
                  0ms Latency
                </span>
              </div>

              {/* Clean Code Snippet */}
              <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-950 font-mono text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                <p className="text-brand-600 dark:text-brand-400 font-bold"># Distributed Consensus Specification</p>
                <p className="text-neutral-500 italic">&gt; Standard RFC contract for high-throughput edge nodes.</p>
                
                <p className="text-neutral-700 dark:text-neutral-300 pt-1">
                  - [x] Immutable local log buffer<br />
                  - [x] Zero network reliance for note editing<br />
                  - [ ] Optional multi-device synchronization
                </p>

                <div className="p-2.5 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-400 mt-2">
                  | Component | Protocol | SLA Guarantee |<br />
                  | :--- | :--- | :--- |<br />
                  | In-Memory Cache | gRPC Stream | 99.999% uptime |<br />
                  | Local Database | IndexedDB | Sub-1ms Read/Write |
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── STORY BLOCK 2: LOCAL-FIRST PRIVACY TRIO ── */}
        <div className="space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Privacy &amp; Ownership</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-semibold text-neutral-950 dark:text-white tracking-tight">
              Your thoughts belong to you. Always.
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              No servers scanning your notes, no telemetry on your keystrokes, and zero lock-in.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Card A: 100% Offline IndexedDB */}
            <div className="p-6 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-3 font-sans">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/40 dark:border-emerald-800/40">
                <HardDrive className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-neutral-950 dark:text-white tracking-tight">
                Offline Dexie IndexedDB
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Every keystroke persists locally to your browser&apos;s indexed storage. The app works fully offline on airplanes, subways, or remote spots.
              </p>
            </div>

            {/* Card B: File System Access API */}
            <div className="p-6 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-3 font-sans">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/40 dark:border-blue-800/40">
                <FolderOpen className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-neutral-950 dark:text-white tracking-tight">
                Local Folder Access
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Connect your hard drive via the File System Access API (<kbd className="font-mono">Ctrl+O</kbd>). Read and write directly to your local <code className="font-mono">.md</code> files.
              </p>
            </div>

            {/* Card C: Optional Free Cloud Sync */}
            <div className="p-6 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-3 font-sans">
              <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/40 dark:border-purple-800/40">
                <Cloud className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-neutral-950 dark:text-white tracking-tight">
                Instant Free Cloud Sync
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Optionally sign in to sync across devices live with Supabase Realtime and publish password-protected notes on the web for free.
              </p>
            </div>
          </div>
        </div>

        {/* ── BOTTOM EXPLORATION LINK ── */}
        <div className="pt-4 flex justify-center">
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
