import React from 'react';

interface BenchmarkRow {
  feature: string;
  category: string;
  mdWriter: { text: string; status: 'highlight' };
  cloudSuites: { text: string; status: 'warn' | 'fail' };
  desktopApps: { text: string; status: 'pass' | 'neutral' | 'warn' };
}

const BENCHMARK_DATA: BenchmarkRow[] = [
  {
    feature: 'Cold Boot Latency',
    category: 'Startup',
    mdWriter: { text: '< 80ms (Instant local engine)', status: 'highlight' },
    cloudSuites: { text: '2,000ms – 3,500ms', status: 'fail' },
    desktopApps: { text: '1,500ms – 2,200ms', status: 'warn' },
  },
  {
    feature: 'Offline Persistence',
    category: 'Storage',
    mdWriter: { text: 'Native IndexedDB (100% offline)', status: 'highlight' },
    cloudSuites: { text: 'Offline wall / Read-only', status: 'fail' },
    desktopApps: { text: 'Local filesystem only', status: 'pass' },
  },
  {
    feature: 'AI Intelligence Model',
    category: 'BYOK',
    mdWriter: { text: 'Direct BYOK (Google Gemini 3.x)', status: 'highlight' },
    cloudSuites: { text: '$10–$20/user/mo subscription markup', status: 'warn' },
    desktopApps: { text: 'Community plugin assembly', status: 'neutral' },
  },
  {
    feature: 'Mathematical Formulas & Typesetting',
    category: 'KaTeX',
    mdWriter: { text: 'Embedded KaTeX & Mermaid.js engine', status: 'highlight' },
    cloudSuites: { text: 'Restricted / Requires add-ons', status: 'warn' },
    desktopApps: { text: 'External plugin dependency', status: 'neutral' },
  },
  {
    feature: 'Telemetry & Tracking',
    category: 'Privacy',
    mdWriter: { text: 'Zero tracking • Browser sandboxed', status: 'highlight' },
    cloudSuites: { text: 'Mandatory telemetry & account silo', status: 'fail' },
    desktopApps: { text: 'Varies by ecosystem configuration', status: 'pass' },
  },
];

export const BenchmarkSection: React.FC = () => {
  return (
    <section id="benchmarks" className="py-16 sm:py-24 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-12 max-w-2xl">
          <div className="font-mono text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-2">
            Architectural Benchmark
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
            Engineered for pure speed and sovereignty.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Comparing MD Writer against traditional cloud office suites and plugin-heavy desktop applications.
          </p>
        </div>

        {/* Crisp Tabular Matrix */}
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-x-auto bg-white dark:bg-neutral-950">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-1/4">Capability Matrix</th>
                <th className="py-3 px-4 w-1/3 bg-neutral-100/60 dark:bg-neutral-900/60 border-x border-neutral-200 dark:border-neutral-800 text-neutral-950 dark:text-white">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">MD Writer</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-brand-200 dark:border-brand-800/80 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300">
                      v2.3
                    </span>
                  </div>
                </th>
                <th className="py-3 px-4 w-1/4">Traditional Cloud Suites</th>
                <th className="py-3 px-4 w-1/4">Plugin-Heavy Desktop Apps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
              {BENCHMARK_DATA.map((row, idx) => (
                <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-colors">
                  {/* Feature Label */}
                  <td className="py-3.5 px-4 font-medium text-neutral-900 dark:text-neutral-100">
                    <div>{row.feature}</div>
                    <div className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">{row.category}</div>
                  </td>

                  {/* MD Writer (Highlighted Column) */}
                  <td className="py-3.5 px-4 bg-neutral-100/60 dark:bg-neutral-900/60 border-x border-neutral-200 dark:border-neutral-800 font-medium text-neutral-950 dark:text-white">
                    <div className="flex items-center gap-1.5">
                      <span className="text-brand-600 dark:text-brand-400 font-bold select-none">✓</span>
                      <span className="tabular-nums">{row.mdWriter.text}</span>
                    </div>
                  </td>

                  {/* Traditional Cloud Suites */}
                  <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <span className="text-neutral-400 font-bold select-none">
                        {row.cloudSuites.status === 'fail' ? '—' : '·'}
                      </span>
                      <span className="tabular-nums">{row.cloudSuites.text}</span>
                    </div>
                  </td>

                  {/* Plugin-Heavy Desktop Apps */}
                  <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <span className="text-neutral-400 font-bold select-none">·</span>
                      <span className="tabular-nums">{row.desktopApps.text}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footnote */}
        <div className="mt-4 font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
          * Cold boot measured in Chromium V8 execution environments under 4G throttled conditions.
        </div>
      </div>
    </section>
  );
};
