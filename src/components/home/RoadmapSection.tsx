import React from 'react';
import { 
  Search, 
  HardDrive, 
  RefreshCw, 
  Bot, 
  SlidersHorizontal,
  GitPullRequest,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { APP_VERSION_LABEL } from '../../config/version';
import { useUpdateModalStore } from '../../stores/useUpdateModalStore';

export const RoadmapSection: React.FC = () => {
  const { openUpdate } = useUpdateModalStore();

  const releaseFeatures = [
    {
      icon: Bot,
      category: 'AI Mascot',
      title: '30s Inactivity Auto-Sleep',
      badge: 'Ambient 2.1',
      desc: 'Intelligent sleep mode when idle, instant wake-up on hover/click, and real-time thinking, typing, and excited states.',
    },
    {
      icon: HelpCircle,
      category: 'Context Precision',
      title: 'Interactive Clarification Cards',
      badge: 'Zero Guesswork',
      desc: 'Mimo asks multi-choice questions with 3 options and a custom text field whenever requests need clearer direction.',
    },
    {
      icon: SlidersHorizontal,
      category: 'Controls',
      title: 'Anchored Settings & Token Saver',
      badge: 'Cost & Speed',
      desc: 'Clean popover menu anchored right above the input dock. Toggle Web Search grounding and disable thinking to save tokens.',
    },
    {
      icon: Layers,
      category: 'Scoped Edits',
      title: 'AST Section Surgeon',
      badge: '80% Token Drop',
      desc: 'Surgically edits only the active H2/H3 heading section without rewriting or repeating the rest of large documents.',
    },
    {
      icon: GitPullRequest,
      category: 'Diff Engine',
      title: 'Minimal Line-Numbered Diff',
      badge: 'Linear Style',
      desc: 'GitHub & Linear inspired diff card with line numbers, soft green/red syntax tints, and one-click copy and apply.',
    },
    {
      icon: RefreshCw,
      category: 'Sync',
      title: 'Seamless Device Sync',
      badge: 'Automatic',
      desc: 'Keep your notes updated across all your computers and mobile devices with automatic conflict-free background sync.',
    },
    {
      icon: Search,
      category: 'Search',
      title: 'Instant Search & Tag Vault',
      badge: 'Sub-10ms',
      desc: 'Quickly find any note, tag, or phrase as you type, matching titles and note contents without typing lag.',
    },
    {
      icon: HardDrive,
      category: 'Storage',
      title: 'Storage & Cache Control',
      badge: 'Local-First',
      desc: 'See exactly how much local IndexedDB space your documents use, with a 1-click button to free up memory anytime.',
    },
  ];

  return (
    <section id="whats-new" className="py-20 sm:py-24 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header — Minimal & Clean */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80 shadow-2xs">
            <Layers className="w-3.5 h-3.5" />
            <span>Product Highlights • {APP_VERSION_LABEL}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
            What&apos;s New in {APP_VERSION_LABEL}
          </h2>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Re-engineered for ambient AI companion intelligence, zero-guesswork interactive clarification, and surgical section editing.
          </p>
        </div>

        {/* Shipped Features Unified Container */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-xs space-y-6">
          
          {/* Card Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span>Shipped in {APP_VERSION_LABEL}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                    Live
                  </span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  8 major enhancements live and ready to use
                </p>
              </div>
            </div>

            <button
              onClick={openUpdate}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer shadow-2xs group"
            >
              <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
              <span>View Changelog</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Unified Clean Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {releaseFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200/70 dark:border-neutral-800 flex flex-col justify-between space-y-3 group hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-700/80 flex items-center justify-center text-neutral-700 dark:text-neutral-300 shadow-2xs">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full border border-neutral-200/60 dark:border-neutral-700/60 font-mono">
                        {feat.badge}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-neutral-400 dark:text-neutral-500 block">
                        {feat.category}
                      </span>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white mt-0.5">
                        {feat.title}
                      </h4>
                    </div>

                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
