import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeroProps {
  onOpenCreateDoc?: () => void;
  onOpenTemplates?: () => void;
  onWatchTeaser?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCreateDoc, onOpenTemplates, onWatchTeaser }) => {
  const navigate = useNavigate();

  const handleCreateDoc = () => {
    if (onOpenCreateDoc) {
      onOpenCreateDoc();
    } else {
      navigate('/editor');
    }
  };

  const handleBrowseTemplates = () => {
    if (onOpenTemplates) {
      onOpenTemplates();
    } else {
      navigate('/?templates=open');
    }
  };

  return (
    <section className="relative pt-12 pb-14 sm:pt-20 sm:pb-18 overflow-hidden text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Monospace kicker badge with global rounded-full token */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100/80 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 font-mono text-xs mb-6 select-none shadow-2xs">
          <span>LOCAL-FIRST • ZERO TELEMETRY • GEMINI 3.X BYOK</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white leading-[1.12] mb-6">
          The plain text studio built for focused writing.
        </h1>

        {/* Subhead */}
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-8">
          No account required. Your documents stay in your browser's private local storage.
          Connect your own Google Gemini key for private, zero-markup AI editing.
        </p>

        {/* Actions with global rounded-xl tokens */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-6">
          <button
            onClick={handleCreateDoc}
            className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 active:translate-y-[1px] text-white font-semibold text-sm px-7 py-3 rounded-xl transition-colors duration-150 cursor-pointer shadow-xs hover:shadow"
          >
            Create Document
          </button>
          <button
            onClick={handleBrowseTemplates}
            className="w-full sm:w-auto border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium text-sm px-5 py-3 rounded-xl active:translate-y-[1px] transition-colors duration-150 cursor-pointer shadow-2xs"
          >
            Browse Templates
          </button>
          {onWatchTeaser && (
            <button
              onClick={onWatchTeaser}
              className="w-full sm:w-auto border border-brand-500/30 bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 font-medium text-sm px-5 py-3 rounded-xl active:translate-y-[1px] transition-colors duration-150 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Watch Teaser (60fps)</span>
            </button>
          )}
        </div>

        {/* Plain text secondary link */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/documents')}
            className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white underline-offset-4 hover:underline cursor-pointer"
          >
            Open Saved Documents
          </button>
        </div>

        {/* Typographic reassurance pill with global rounded-full token */}
        <div className="inline-block text-xs font-mono text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800/80 rounded-full px-4 py-1.5 bg-neutral-50 dark:bg-neutral-900/60 shadow-2xs">
          100% private • Works completely offline • Export directly to PDF, Word &amp; Markdown
        </div>
      </div>
    </section>
  );
};
