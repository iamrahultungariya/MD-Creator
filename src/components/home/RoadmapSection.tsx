import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  LayoutTemplate, 
  Search, 
  HardDrive, 
  RefreshCw, 
  Bot, 
  ShieldCheck, 
  MessageSquarePlus, 
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { APP_VERSION_LABEL } from '../../config/version';
import { useUpdateModalStore } from '../../stores/useUpdateModalStore';

export const RoadmapSection: React.FC = () => {
  const navigate = useNavigate();
  const { openUpdate } = useUpdateModalStore();

  const v3Features = [
    {
      icon: Zap,
      category: 'Speed & Architecture',
      title: 'Groundbreaking Performance',
      badge: '~75% Faster',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      iconColor: 'bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white',
      desc: '~75% faster initial library loading, ~85% quicker file search, ~70% lighter DOM footprint, and ~65% reduced memory usage for fluid 60 FPS editing.',
    },
    {
      icon: LayoutTemplate,
      category: 'UI & Ergonomics',
      title: 'Refined Workspace',
      badge: 'Decluttered UI',
      badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      iconColor: 'bg-sky-500/10 text-sky-500 group-hover:bg-sky-500 group-hover:text-white',
      desc: 'Cleaner document vault layout with generous breathing room, customizable page sizes (6, 12, 24), streamlined toolbars, and improved tag hierarchy.',
    },
    {
      icon: Search,
      category: 'Fast Retrieval',
      title: 'Instant Search & Tag Indexing',
      badge: 'Zero Latency',
      badgeColor: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
      iconColor: 'bg-violet-500/10 text-violet-500 group-hover:bg-violet-500 group-hover:text-white',
      desc: 'Instantaneous title and body search matching with zero input latency. Indexed tag switching delivers immediate notebook filtering across massive vaults.',
    },
    {
      icon: HardDrive,
      category: 'User Control',
      title: 'Cache & Storage Management',
      badge: '1-Click Cleanup',
      badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      iconColor: 'bg-teal-500/10 text-teal-500 group-hover:bg-teal-500 group-hover:text-white',
      desc: 'Direct control over application cache and storage quotas in Preferences, transparent size breakdowns for attachments, and instant 1-click cache purge.',
    },
    {
      icon: RefreshCw,
      category: 'Cloud Synchronization',
      title: 'Seamless Multi-Device Sync',
      badge: 'Real-Time Sync',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      iconColor: 'bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white',
      desc: 'Live WebSocket change propagation, intelligent conflict resolution, and resilient offline deletion queues ensure edits are never lost across devices.',
    },
    {
      icon: Bot,
      category: 'AI Writing Partner',
      title: 'Mimo 2.0.0 Co-Pilot',
      badge: 'Gemini 3.8 Flash',
      badgeColor: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
      iconColor: 'bg-pink-500/10 text-pink-500 group-hover:bg-pink-500 group-hover:text-white',
      desc: 'Ambient mascot companion with ~1.2s first-token response, publication-grade KaTeX formulas, 1-click action cards with instant ↺ Undo, and Ctrl+J shortcut.',
    },
    {
      icon: ShieldCheck,
      category: 'Refinements',
      title: 'Accessibility & High Contrast',
      badge: 'WCAG Compliant',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      iconColor: 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white',
      desc: 'Polished modal dialogs with keyboard focus trapping, enhanced screen-reader semantics, and refined contrast across both dark and light modes.',
    },
    {
      icon: MessageSquarePlus,
      category: 'Community Driven',
      title: 'Feedback & Bug Reporting',
      badge: 'Live Channel',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      iconColor: 'bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white',
      desc: 'Direct in-app feedback channel connected to developer workflows. Rapid patches, community idea submissions, and regular feature updates.',
    },
  ];

  return (
    <section id="whats-new" className="py-20 sm:py-24 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200/60 dark:border-brand-800/60 shadow-2xs">
            <Layers className="w-3.5 h-3.5" />
            <span>Product Highlights • {APP_VERSION_LABEL}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
            What&apos;s New in {APP_VERSION_LABEL}
          </h2>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Re-architected from the ground up for lightning speed, multi-device synchronization, and an ambient AI companion. Everything listed below is live right now in your browser.
          </p>
        </div>

        {/* Shipped Features Bento Container */}
        <div className="p-6 sm:p-9 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-xs space-y-8">
          
          {/* Card Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span>Shipped in {APP_VERSION_LABEL}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                    Live Now
                  </span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  8 major enhancements live, battle-tested, and ready to use
                </p>
              </div>
            </div>

            <button
              onClick={openUpdate}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 transition-all cursor-pointer shadow-2xs group"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>View Interactive Changelog</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* 8 Feature Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {v3Features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={idx} 
                  className="group relative p-5 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 hover:bg-white dark:hover:bg-neutral-800/70 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-3.5"
                >
                  <div className="space-y-3">
                    {/* Header Row: Icon + Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${feat.iconColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${feat.badgeColor}`}>
                        {feat.badge}
                      </span>
                    </div>

                    {/* Category & Title */}
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-neutral-400 dark:text-neutral-500">
                        {feat.category}
                      </span>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {feat.title}
                      </h4>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Access to Preferences Note */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-800/80">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
              <span>All features can be customized directly in the <strong>Preferences</strong> modal.</span>
            </div>
            <button
              onClick={openUpdate}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Explore all release notes</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Bug Reporting & Feedback Callout Banner */}
        <div className="p-6 rounded-2xl bg-neutral-100/80 dark:bg-neutral-900/60 border border-neutral-200/90 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-950 dark:text-white">
                Noticed a bug or have an idea for v3.1?
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                We read and act on every community submission. Share your thoughts directly with the maintainers.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/feedback')}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-200/90 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-100 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-2xs hover:shadow"
          >
            <span>Open Feedback &amp; Ideas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
};
