import React from 'react';
import { Check, X, Zap, Shield, Sparkles, Database, Cpu } from 'lucide-react';

interface BenchmarkRow {
  feature: string;
  category: string;
  icon: React.ElementType;
  mdWriter: { text: string; status: 'highlight' | 'pass' };
  cloudSuites: { text: string; status: 'warn' | 'fail' };
  pluginEditors: { text: string; status: 'pass' | 'neutral' | 'warn' };
  siloedWorkspaces: { text: string; status: 'warn' | 'fail' };
}

const BENCHMARK_DATA: BenchmarkRow[] = [
  {
    feature: 'Cold Boot Latency',
    category: 'Performance',
    icon: Zap,
    mdWriter: { text: '<80ms (Instant Local Engine)', status: 'highlight' },
    cloudSuites: { text: '2,000ms – 3,500ms', status: 'fail' },
    pluginEditors: { text: '1,500ms – 2,200ms', status: 'warn' },
    siloedWorkspaces: { text: '2,400ms – 4,000ms', status: 'fail' },
  },
  {
    feature: '100% Offline Persistence',
    category: 'Storage',
    icon: Database,
    mdWriter: { text: 'Native IndexedDB + Local Disk', status: 'highlight' },
    cloudSuites: { text: 'Offline Wall / Read-only', status: 'fail' },
    pluginEditors: { text: 'Native Local Files', status: 'pass' },
    siloedWorkspaces: { text: 'Requires Active Connection', status: 'fail' },
  },
  {
    feature: 'AI Intelligence Architecture',
    category: 'AI Engine',
    icon: Cpu,
    mdWriter: { text: 'Direct BYOK (Google Gemini 3.x)', status: 'highlight' },
    cloudSuites: { text: '$10 – $20 / user / month', status: 'warn' },
    pluginEditors: { text: 'Community Plugin Setup', status: 'neutral' },
    siloedWorkspaces: { text: 'Rigid Proprietary Add-on', status: 'warn' },
  },
  {
    feature: 'Math & Diagrams Built-in',
    category: 'Typesetting',
    icon: Sparkles,
    mdWriter: { text: 'Native KaTeX & Mermaid.js', status: 'highlight' },
    cloudSuites: { text: 'Limited / Third-party add-ons', status: 'warn' },
    pluginEditors: { text: 'Requires Multiple Plugins', status: 'neutral' },
    siloedWorkspaces: { text: 'Rudimentary Formatting', status: 'fail' },
  },
  {
    feature: 'Data Sovereignty & Privacy',
    category: 'Privacy',
    icon: Shield,
    mdWriter: { text: 'Your Device First (Zero Telemetry)', status: 'highlight' },
    cloudSuites: { text: 'Vendor Lock-in Cloud Silo', status: 'fail' },
    pluginEditors: { text: 'Local Filesystem', status: 'pass' },
    siloedWorkspaces: { text: 'Mandatory Cloud Accounts', status: 'fail' },
  },
];

export const BenchmarkSection: React.FC = () => {
  return (
    <section id="benchmarks" className="py-20 sm:py-28 relative overflow-hidden bg-white dark:bg-neutral-950 border-t border-neutral-200/80 dark:border-neutral-800 transition-colors font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/80 dark:border-brand-800/80">
            <Zap className="w-3.5 h-3.5" />
            <span>ARCHITECTURAL BENCHMARK</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-[-0.03em] leading-tight">
            Engineered for pure speed and sovereignty.
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            See how MD Writer compares to traditional cloud office suites and heavy desktop editors across the core vectors technical writers care about.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/60">
                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 w-1/4">
                  Capability Matrix
                </th>
                <th className="py-4 px-6 text-xs font-bold text-brand-600 dark:text-brand-400 w-1/4 bg-brand-50/40 dark:bg-brand-950/30 border-x border-brand-200/40 dark:border-brand-800/40">
                  <div className="flex items-center gap-1.5">
                    <span>MD Writer</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 font-mono font-normal">v2.3.0</span>
                  </div>
                </th>
                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 w-1/4">
                  Traditional Cloud Suites
                </th>
                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 w-1/4">
                  Plugin-Heavy Editors
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs sm:text-sm">
              {BENCHMARK_DATA.map((row, idx) => {
                const IconComponent = row.icon;
                return (
                  <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    {/* Capability Name */}
                    <td className="py-4 px-6 font-medium text-neutral-900 dark:text-neutral-100">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div>{row.feature}</div>
                          <div className="text-[11px] text-neutral-400 font-mono font-normal">{row.category}</div>
                        </div>
                      </div>
                    </td>

                    {/* MD Writer Column (Highlighted) */}
                    <td className="py-4 px-6 font-semibold text-neutral-950 dark:text-white bg-brand-50/20 dark:bg-brand-950/15 border-x border-brand-200/30 dark:border-brand-800/30">
                      <div className="flex items-center gap-1.5 text-brand-700 dark:text-brand-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{row.mdWriter.text}</span>
                      </div>
                    </td>

                    {/* Traditional Cloud Suites */}
                    <td className="py-4 px-6 text-neutral-600 dark:text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        {row.cloudSuites.status === 'fail' ? (
                          <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        )}
                        <span>{row.cloudSuites.text}</span>
                      </div>
                    </td>

                    {/* Plugin Heavy Editors */}
                    <td className="py-4 px-6 text-neutral-600 dark:text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        {row.pluginEditors.status === 'pass' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0" />
                        )}
                        <span>{row.pluginEditors.text}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Micro-footnote */}
        <p className="text-center text-xs text-neutral-400 font-mono">
          * Comparative metrics measured on standard web browsers with local IndexedDB benchmarks. Zero platform tracking.
        </p>
      </div>
    </section>
  );
};
