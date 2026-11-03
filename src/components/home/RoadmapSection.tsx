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
  CheckCircle2
} from 'lucide-react';
import { APP_VERSION_LABEL } from '../../config/version';
import { useUpdateModalStore } from '../../stores/useUpdateModalStore';

export const RoadmapSection: React.FC = () => {
  const navigate = useNavigate();
  const { openUpdate } = useUpdateModalStore();

  const releaseFeatures = [
    {
      icon: Zap,
      category: 'Speed',
      title: 'Faster & Smoother',
      badge: 'Snappy',
      desc: 'Documents open quickly, searching feels instantaneous, and typing stays completely smooth even with large notebooks.',
    },
    {
      icon: LayoutTemplate,
      category: 'Workspace',
      title: 'Cleaner Document Vault',
      badge: 'Uncluttered',
      desc: 'A spacious, organized document list with clean tag filters, adjustable view sizes (6, 12, or 24 files), and simple menus.',
    },
    {
      icon: Search,
      category: 'Search',
      title: 'Instant Search',
      badge: 'Real-Time',
      desc: 'Quickly find any note or phrase as you type, matching titles and note contents without waiting.',
    },
    {
      icon: HardDrive,
      category: 'Storage',
      title: 'Storage & Cache Control',
      badge: '1-Click Cleanup',
      desc: 'See exactly how much space your documents use on your device, with a one-click button to free up memory anytime.',
    },
    {
      icon: RefreshCw,
      category: 'Sync',
      title: 'Seamless Device Sync',
      badge: 'Automatic',
      desc: 'Keep your notes updated across all your computers and mobile devices. Edits and deletions stay reliable everywhere.',
    },
    {
      icon: Bot,
      category: 'AI Assistant',
      title: 'Mimo Writing Companion',
      badge: 'Helpful AI',
      desc: 'Your friendly mascot helper can summarize notes, check grammar, create tables, or brainstorm ideas whenever you need.',
    },
    {
      icon: ShieldCheck,
      category: 'Comfort',
      title: 'Clean Dark & Light Modes',
      badge: 'Easy on Eyes',
      desc: 'High-contrast typography and polished dark and light themes make reading comfortable during long study and writing sessions.',
    },
    {
      icon: MessageSquarePlus,
      category: 'Community',
      title: 'Community Feedback',
      badge: 'User Driven',
      desc: 'Suggest features or report issues directly from within the app. We read every message and ship improvements regularly.',
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
            Re-architected from the ground up for lightning speed, multi-device synchronization, and an ambient AI companion.
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

          {/* Unified Clean Feature Grid (No Rainbow Colors) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {releaseFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={idx} 
                  className="group relative p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 hover:bg-white dark:hover:bg-neutral-800/60 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-150 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    {/* Header Row: Icon + Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 group-hover:text-neutral-950 dark:group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700/60">
                        {feat.badge}
                      </span>
                    </div>

                    {/* Category & Title */}
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-neutral-400 dark:text-neutral-500">
                        {feat.category}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white mt-0.5">
                        {feat.title}
                      </h4>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bug Reporting & Feedback Banner — Minimal */}
        <div className="p-5 sm:p-6 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
              <MessageSquarePlus className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-neutral-950 dark:text-white">
                Noticed a bug or have an idea?
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                We review community reports directly and ship fixes quickly.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/feedback')}
            className="px-3.5 py-2 rounded-lg bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-200/80 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
          >
            <span>Feedback &amp; Ideas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
};
