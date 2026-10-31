import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Brain, Wand2, ArrowRight, Eye, Code, Zap, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUpdateModalStore } from '../../stores/useUpdateModalStore';
import { MimoAvatar } from '../../features/mimo/components/MimoAvatar';

export const MimoIntroModal: React.FC = () => {
  const { isMimoIntroOpen, closeMimoIntro } = useUpdateModalStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isMimoIntroOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMimoIntro();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMimoIntroOpen, closeMimoIntro]);

  if (!isMimoIntroOpen) return null;

  const handleOpenEditor = () => {
    closeMimoIntro();
    navigate('/editor');
  };

  const capabilities = [
    {
      icon: Brain,
      title: 'Context Engine & Memory',
      desc: '10-turn sliding memory that remembers your discussion history and tracks your exact heading path.',
    },
    {
      icon: Zap,
      title: '1-Click Document Actions',
      desc: 'Directly append footers, insert frontmatter, or generate tables with interactive action cards and instant ↺ Undo.',
    },
    {
      icon: Eye,
      title: 'Focused Selection Targeting',
      desc: 'Highlight any text in the editor, and Mimo automatically focuses solely on refining that excerpt.',
    },
    {
      icon: Calculator,
      title: 'KaTeX Math & Logic',
      desc: 'Generates and live-renders complex mathematical symbols, formulas, and truth tables with publication-grade clarity.',
    },
    {
      icon: Code,
      title: 'Non-Destructive Diffs',
      desc: 'Proposes surgical line-by-line visual diffs so you can review and accept changes with complete peace of mind.',
    },
    {
      icon: Wand2,
      title: 'Contextual Prompt Enhancer',
      desc: 'Smart wand optimizes your rough prompts into surgical instructions without adding unwanted boilerplate.',
    },
  ];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mimo-intro-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/60 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={closeMimoIntro}
    >
      <div
        className="w-full max-w-xl max-h-[90vh] bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <MimoAvatar size="md" state="happy" />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2
                    id="mimo-intro-title"
                    className="text-lg sm:text-xl font-bold tracking-tight text-neutral-950 dark:text-white"
                  >
                    Meet Mimo 2.0.0 ✦
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                    Your MD Companion
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Intelligent pair writer & agentic markdown co-pilot
                </p>
              </div>
            </div>

            <button
              onClick={closeMimoIntro}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:bg-neutral-800 transition-colors cursor-pointer shrink-0"
              title="Close dialog"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
          {/* Overview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50/70 via-brand-50/40 to-transparent dark:from-violet-950/20 dark:via-brand-950/10 dark:to-transparent border border-violet-200/60 dark:border-violet-800/60 space-y-2">
            <h3 className="font-bold text-neutral-900 dark:text-white text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-500" />
              What is Mimo?
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-xs">
              Mimo isn't a disconnected generic chatbot—it is an <strong>agentic writing partner</strong> living directly inside your document workspace. Powered by Google Gemini, Mimo understands your document structure, follows your cursor line-by-line, and executes real markdown edits with your approval.
            </p>
          </div>

          {/* Capabilities Grid */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-1">
              What Mimo Can Do
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {capabilities.map((cap, idx) => {
                const Icon = cap.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200/70 dark:border-neutral-800 space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="font-bold text-xs text-neutral-900 dark:text-white">
                        {cap.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shortcut Callout */}
          <div className="p-3 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-neutral-600 dark:text-neutral-400">Quick Keyboard Shortcut</span>
            <div className="flex items-center gap-1 font-mono font-semibold text-neutral-800 dark:text-neutral-200">
              <kbd className="px-2 py-0.5 rounded bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 shadow-2xs">
                Ctrl
              </kbd>
              <span>+</span>
              <kbd className="px-2 py-0.5 rounded bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 shadow-2xs">
                J
              </kbd>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0 flex items-center justify-end gap-2.5">
          <button
            onClick={closeMimoIntro}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleOpenEditor}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-[0.98] shadow-md shadow-brand-500/25 transition-all cursor-pointer"
          >
            Try Mimo in Editor
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
