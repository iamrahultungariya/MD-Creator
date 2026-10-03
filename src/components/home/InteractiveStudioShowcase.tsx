import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Code2, 
  Eye, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

export type ShowcaseTab = 'editor' | 'focus';

export const InteractiveStudioShowcase: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ShowcaseTab>('editor');

  return (
    <div className="w-full max-w-5xl mx-auto text-left select-none">
      {/* Outer Window Container with Clean Hairline Border */}
      <div className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#111115] shadow-2xl shadow-neutral-900/5 dark:shadow-black/60 overflow-hidden">
        
        {/* Window Titlebar & Mode Segmented Controller */}
        <div className="px-4 py-3 border-b border-neutral-200/80 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-neutral-50/70 dark:bg-[#16161c]">
          {/* Left: Window Controls */}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/50 shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/50 shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/50 shadow-xs" />
            <span className="ml-2 font-mono text-[11px] text-neutral-400 hidden sm:inline">
              md-writer // studio-preview
            </span>
          </div>

          {/* Center: Segmented Mode Controller (Markdown Studio vs Focus Canvas) */}
          <div className="inline-flex rounded-xl bg-neutral-200/70 dark:bg-neutral-800/90 p-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-xs font-bold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Markdown Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('focus')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'focus'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-xs font-bold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Focus Canvas</span>
            </button>
          </div>

          {/* Right: Quick Action Launch */}
          <button
            onClick={() => navigate('/editor')}
            className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Launch Live</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dynamic Window Body */}
        <div className="relative min-h-[460px] sm:min-h-[500px] bg-neutral-100/40 dark:bg-[#0c0c0f] overflow-hidden">
          <AnimatePresence mode="wait">
            {/* ── TAB 1: REAL MARKDOWN STUDIO SPLIT VIEW (Zero Artificial Purple/Green) ── */}
            {activeTab === 'editor' && (
              <motion.div
                key="tab-editor"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="h-full flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-neutral-800"
              >
                {/* Editor Plain Text Source Pane (Left) */}
                <div className="w-full md:w-1/2 p-6 font-mono text-xs text-neutral-800 dark:text-neutral-200 space-y-3 overflow-hidden bg-white dark:bg-[#111115]">
                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/80 pb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-medium">
                      Markdown Source
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      UTF-8 Plain Text
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-1 font-mono text-[11.5px] leading-relaxed">
                    <p className="font-semibold text-neutral-950 dark:text-white text-sm">
                      <span className="text-neutral-400 dark:text-neutral-500 font-normal mr-1">#</span>
                      Systems Architecture Proposal
                    </p>
                    <p className="text-neutral-500 italic">
                      <span className="text-neutral-400 mr-1">&gt;</span>
                      High-reliability local-first notes specification.
                    </p>
                    <p className="text-neutral-700 dark:text-neutral-300">
                      - [x] Sub-10ms local persistence<br />
                      - [x] Auto-table conversion from spreadsheets<br />
                      - [ ] Edge synchronization channel
                    </p>
                    <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-400">
                      <span className="text-neutral-400">| Module | Latency | Redundancy |</span><br />
                      <span className="text-neutral-400">| :--- | :--- | :--- |</span><br />
                      <span>| Dexie Vault | 0.8ms | Triple Local |</span><br />
                      <span>| Print Slicer | 42ms | Vector A4 |</span>
                    </div>
                    <p className="text-neutral-500 font-mono text-[11px]">
                      {"$$\\mathcal{L} = \\sum_{i=1}^{N} (y_i - \\hat{y}_i)^2 + \\lambda \\|\\mathbf{w}\\|_2^2$$"}
                    </p>
                  </div>
                </div>

                {/* Rendered Output Preview Pane (Right - Authentic High-Contrast Monochrome) */}
                <div className="w-full md:w-1/2 p-6 overflow-hidden bg-neutral-50/50 dark:bg-[#0e0e12] space-y-4">
                  <div className="border-b border-neutral-200 dark:border-neutral-800 pb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-medium">
                      Live Preview
                    </span>
                    <h2 className="text-lg font-bold text-neutral-950 dark:text-white mt-1 tracking-tight">
                      Systems Architecture Proposal
                    </h2>
                  </div>

                  {/* Clean Markdown Blockquote / Callout */}
                  <blockquote className="border-l-2 border-brand-500 dark:border-brand-400 bg-neutral-100/70 dark:bg-neutral-900/60 p-3 rounded-r-xl text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed italic">
                    High-reliability local-first notes specification. All documents persist locally in IndexedDB with 0ms typing latency and zero cloud dependency.
                  </blockquote>

                  {/* Rendered Pipe Table - Clean Monochrome */}
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 font-semibold border-b border-neutral-200 dark:border-neutral-700">
                        <tr>
                          <th className="p-2.5">Module</th>
                          <th className="p-2.5">Latency</th>
                          <th className="p-2.5">Redundancy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800 text-[11.5px] text-neutral-700 dark:text-neutral-300">
                        <tr>
                          <td className="p-2.5 font-mono text-neutral-950 dark:text-white">Dexie Vault</td>
                          <td className="p-2.5 font-mono">0.8ms</td>
                          <td className="p-2.5">Triple Local</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono text-neutral-950 dark:text-white">Print Slicer</td>
                          <td className="p-2.5 font-mono">42ms</td>
                          <td className="p-2.5">Vector A4</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Rendered KaTeX Formula Card */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center font-mono text-xs text-neutral-800 dark:text-neutral-200 shadow-2xs">
                    <span className="text-[10px] text-neutral-400 block mb-1">KaTeX Formula</span>
                    <span className="font-serif italic text-sm text-neutral-900 dark:text-white">
                      ℒ = ∑ (yᵢ − ŷᵢ)² + λ ‖w‖²
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── TAB 2: AUTHENTIC TYPEWRITER FOCUS CANVAS ── */}
            {activeTab === 'focus' && (
              <motion.div
                key="tab-focus"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="h-full py-10 sm:py-14 px-6 sm:px-12 flex flex-col justify-between bg-white dark:bg-[#101014]"
              >
                {/* Simulated Typewriter Focus Document */}
                <div className="max-w-xl mx-auto w-full space-y-6 text-left">
                  {/* Document Path Indicator */}
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Essays / The Architecture of Thought.md</span>
                  </div>

                  {/* Dimmed Previous Paragraph (Typewriter Sentence Focus) */}
                  <p className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-600 leading-relaxed font-sans select-none">
                    When visual clutter disappears, genuine thinking begins. Most modern editors flood the creative canvas with sidebars, toolbars, and floating AI suggestions that interrupt the natural rhythm of thought.
                  </p>

                  {/* Active Focused Paragraph (High-Contrast with Blinking Caret) */}
                  <div className="p-4 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800/80">
                    <h3 className="text-xl sm:text-2xl font-semibold text-neutral-950 dark:text-white tracking-tight mb-2">
                      The Intimacy of Plain Text
                    </h3>
                    <p className="text-sm sm:text-base text-neutral-900 dark:text-neutral-100 leading-relaxed">
                      Markdown restores the direct intimacy between cognition and the page. Plain text files survive decades, require zero network connection, and will never hold your ideas hostage behind a subscription wall.
                      <span className="inline-block w-1.5 h-4 bg-brand-500 ml-1.5 align-middle animate-pulse" />
                    </p>
                  </div>

                  {/* Dimmed Subsequent Thoughts */}
                  <p className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-600 leading-relaxed font-sans italic select-none">
                    &gt; Every keystroke is saved immediately to local IndexedDB. No sync conflicts. No spinning wheels.
                  </p>
                </div>

                {/* Zen Micro-Telemetry Footer */}
                <div className="max-w-xl mx-auto w-full pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Typewriter Focus Active</span>
                  </span>
                  <span>284 words · 2 min read · 0 distractions</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Window Status Footer */}
        <div className="px-5 py-2.5 border-t border-neutral-200/70 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-[#131318] flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Offline-First (IndexedDB)</span>
            </span>
            <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">•</span>
            <span className="hidden sm:inline text-[11px]">Zero Formatting Friction</span>
          </div>

          <button
            onClick={() => navigate('/editor')}
            className="font-semibold text-xs text-neutral-900 dark:text-white hover:text-brand-500 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Open Studio</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </div>
    </div>
  );
};
