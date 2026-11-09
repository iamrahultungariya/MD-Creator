import React from 'react';
import { useNavigate } from 'react-router-dom';
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
      {/* ── SUBTLE GEOMETRIC BACKGROUND GRID (Zero ambient blur slop) ── */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[520px] -z-10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_15%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* ── TOP RELEASE BADGE WITH CALM INDICATOR ── */}
        <div 
          className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-medium mb-6 select-none shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors cursor-pointer"
          onClick={openUpdate}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openUpdate(); }}
        >
          {/* Calm static indicator dot */}
          <span className="inline-flex rounded-full h-2 w-2 bg-emerald-500" />
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
        </div>

        {/* ── EDITORIAL HIGH-IMPACT HEADLINE ── */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-950 dark:text-white tracking-[-0.035em] leading-[1.12] max-w-4xl mx-auto mb-6">
          A clean, distraction-free space <br className="hidden sm:inline" />
          for your notes and <WritingHoverTrigger />.
        </h1>

        {/* ── REFINED HUMAN-CENTRIC SUBTITLE ── */}
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-8">
          Write with pure focus and zero lag. Insert formulas and tables with <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono text-xs text-neutral-800 dark:text-neutral-200">/</kbd> slash commands, auto-save continuously, and sync automatically across your devices.
        </p>

        {/* ── TACTILE BESPOKE ACTION CTAS ── */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-4">
          <button
            onClick={handleCreateDoc}
            className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 active:translate-y-[1px] text-white px-7 py-3 rounded-xl font-semibold text-sm shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-center justify-center"
          >
            Create Document
          </button>

          <button
            onClick={() => navigate('/documents')}
            className="w-full sm:w-auto bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/90 active:translate-y-[1px] text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 px-5 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer flex items-center justify-center shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700"
          >
            <span>Open Documents</span>
          </button>
        </div>

        {/* Micro-guarantee label */}
        <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium mb-12">
          100% Free &amp; Open Source • Zero Sign-Up Required • Completely Private*
        </p>

        {/* ── ELEVATED STUDIO SHOWCASE ── */}
        <div className="relative mx-auto max-w-5xl">
          <InteractiveStudioShowcase />
        </div>

      </div>
    </section>
  );
};
