import React from 'react';

export const CoreValuesSection: React.FC = () => {
  return (
    <section id="architecture" className="py-16 sm:py-24 border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-12 max-w-2xl">
          <div className="font-mono text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-2">
            Core Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
            Engineered for permanence, privacy, and speed.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Three deliberate design choices that separate MD Writer from conventional cloud editors.
          </p>
        </div>

        {/* 3 Pillars Separated by 1px Hairline Borders with Global rounded-2xl Token */}
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-neutral-950 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-neutral-800">
            {/* Pillar 1: Local Storage */}
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-neutral-400 dark:text-neutral-600 block mb-4">
                  01 / STORAGE
                </span>
                <h3 className="text-lg font-semibold tracking-tight text-neutral-950 dark:text-white mb-3">
                  Your thoughts stay on your machine.
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
                  Documents are stored directly inside your browser's private local IndexedDB database. 
                  Zero cloud telemetry, zero remote database dependencies, and complete offline sovereignty.
                </p>
              </div>
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-900 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                IndexedDB • 0ms offline latency
              </div>
            </div>

            {/* Pillar 2: BYOK AI */}
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-neutral-400 dark:text-neutral-600 block mb-4">
                  02 / INTELLIGENCE
                </span>
                <h3 className="text-lg font-semibold tracking-tight text-neutral-950 dark:text-white mb-3">
                  Pay zero markup on artificial intelligence.
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
                  Connect your own Google Gemini API key. Use Google's generous free tier or pay direct wholesale token pricing—we add zero middleman fees and never inspect your prompts.
                </p>
              </div>
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-900 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                BYOK Gemini 3.x • Wholesale rates
              </div>
            </div>

            {/* Pillar 3: Export Engine */}
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-neutral-400 dark:text-neutral-600 block mb-4">
                  03 / PUBLICATION
                </span>
                <h3 className="text-lg font-semibold tracking-tight text-neutral-950 dark:text-white mb-3">
                  Print-perfect output every single time.
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
                  Compile publication-ready vector PDFs with embedded KaTeX formulas, styled tables, and exact margin geometry entirely in the browser without server conversion.
                </p>
              </div>
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-900 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                Vector PDF • KaTeX • Word DOCX
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
