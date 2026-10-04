import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';
import { InteractiveStudioShowcase } from './InteractiveStudioShowcase';

import { WritingHoverTrigger } from './WritingHoverTrigger';

interface HeroProps {
  onOpenTemplates?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenTemplates }) => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden text-center">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Minimal Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100/90 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80 text-neutral-700 dark:text-neutral-300 text-xs font-medium mb-6 select-none shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>100% Free &amp; Local-First Markdown Studio</span>
        </div>

        {/* Refined Centered Slogan with Interactive Hover Trigger */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-neutral-950 dark:text-white tracking-[-0.035em] leading-[1.12] max-w-4xl mx-auto mb-6">
          A quiet space for markdown <br className="hidden sm:inline" />
          and focused <WritingHoverTrigger />.
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-8">
          Write distraction-free in plain text. Instant local storage, zero formatting friction, and clean export without paywalls.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-10">
          <button
            onClick={() => navigate('/editor')}
            className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white px-7 py-3 rounded-lg font-semibold text-sm shadow-xs hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2 group hover:scale-[1.01] font-sans"
          >
            <span>Start Writing — It&apos;s Free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {onOpenTemplates && (
            <button
              onClick={onOpenTemplates}
              className="w-full sm:w-auto bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-800 px-5 py-3 rounded-lg font-medium text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs font-sans"
            >
              <BookOpen className="w-4 h-4 text-neutral-400" />
              <span>Browse Blueprints</span>
            </button>
          )}
        </div>

        {/* Trust Indicators Bar */}
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-neutral-500 dark:text-neutral-400 mb-14">
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 stroke-[2.5]" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">100% Offline-First</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400 stroke-[2.5]" />
            <span>No sign-up required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400 stroke-[2.5]" />
            <span>Export to PDF &amp; Word</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
            <span>Zero data lock-in</span>
          </div>
        </div>

        {/* Elevated Notion-Style Interactive Studio Showcase */}
        <InteractiveStudioShowcase />

      </div>
    </section>
  );
};
