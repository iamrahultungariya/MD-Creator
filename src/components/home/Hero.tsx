import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  BookOpen 
} from 'lucide-react';
import { InteractiveStudioShowcase } from './InteractiveStudioShowcase';
import { WritingHoverTrigger } from './WritingHoverTrigger';
import { useUpdateModalStore } from '../../stores/useUpdateModalStore';
import { APP_VERSION_LABEL } from '../../config/version';

interface HeroProps {
  onOpenCreateDoc?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCreateDoc }) => {
  const navigate = useNavigate();
  const { openUpdate } = useUpdateModalStore();

  const handleCreateDoc = () => {
    if (onOpenCreateDoc) {
      onOpenCreateDoc();
    } else {
      navigate('/editor');
    }
  };

  return (
    <section className="relative pt-10 pb-16 sm:pt-16 sm:pb-24 overflow-hidden text-center font-sans">
      {/* ── ATMOSPHERIC AMBIENT BACKGROUND GLOW ── */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[520px] -z-10 overflow-hidden"
      >
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] sm:w-[900px] h-[450px] bg-gradient-to-b from-brand-500/15 via-purple-500/10 to-transparent blur-3xl opacity-70 dark:opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_15%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* ── TOP RELEASE BADGE WITH LIVE PULSING INDICATOR ── */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-neutral-900/90 border border-neutral-200/90 dark:border-neutral-800 backdrop-blur-md text-neutral-800 dark:text-neutral-200 text-xs font-medium mb-6 select-none shadow-sm hover:border-brand-500/50 dark:hover:border-brand-500/40 transition-all cursor-pointer group"
          onClick={openUpdate}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openUpdate(); }}
        >
          {/* Animated live pulse beacon */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-semibold text-brand-600 dark:text-brand-400">
            {APP_VERSION_LABEL} Live
          </span>
          <span className="text-neutral-300 dark:text-neutral-700 font-light">•</span>
          <span className="text-neutral-600 dark:text-neutral-300 hidden xs:inline">
            Smooth Performance &amp; Reliable Sync
          </span>
          <span className="text-neutral-600 dark:text-neutral-300 xs:hidden">
            Fast &amp; Private
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-all" />
        </div>

        {/* ── EDITORIAL HIGH-IMPACT HEADLINE ── */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-950 dark:text-white tracking-[-0.035em] leading-[1.12] max-w-4xl mx-auto mb-6">
          A clean, distraction-free space <br className="hidden sm:inline" />
          for your notes and <WritingHoverTrigger />.
        </h1>

        {/* ── REFINED SUBTITLE ── */}
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-8">
          Write with pure focus and zero lag. Insert formulas and tables with <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono text-xs text-neutral-800 dark:text-neutral-200">/</kbd> slash commands, auto-save continuously, and sync seamlessly across your devices.
        </p>

        {/* ── HIGH-CONVERTING ACTION CTAS ── */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-4">
          <button
            onClick={handleCreateDoc}
            className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white px-7 py-3 rounded-xl font-semibold text-sm shadow-md shadow-brand-600/20 hover:shadow-lg hover:shadow-brand-600/30 transition-all cursor-pointer flex items-center justify-center group hover:scale-[1.01] active:scale-[0.99]"
          >
            Create Document
          </button>

          <button
            onClick={() => navigate('/documents')}
            className="w-full sm:w-auto bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/90 text-neutral-700 dark:text-neutral-200 border border-neutral-200/90 dark:border-neutral-800 px-5 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700"
          >
            <BookOpen className="w-4 h-4 text-neutral-400" />
            <span>Open Documents</span>
          </button>
        </div>

        {/* Micro-guarantee label */}
        <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium mb-12">
          100% Free &amp; Open Source • Zero Sign-Up Required • Completely Private*
        </p>

        {/* ── ELEVATED STUDIO SHOWCASE WITH AMBIENT REFLECTION ── */}
        <div className="relative mx-auto max-w-5xl">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/15 via-purple-500/10 to-indigo-500/15 rounded-2xl blur-xl opacity-60 dark:opacity-30 pointer-events-none" />
          <InteractiveStudioShowcase />
        </div>

      </div>
    </section>
  );
};
