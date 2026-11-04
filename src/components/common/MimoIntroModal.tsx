import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight, Check, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUpdateModalStore } from '../../stores/useUpdateModalStore';
import { MimoAvatar } from '../../features/mimo/components/MimoAvatar';

interface ComparisonItem {
  feature: string;
  oldWay: string;
  newWay: string;
}

const COMPARISONS: ComparisonItem[] = [
  {
    feature: 'Look & Battery Life',
    oldWay: 'Heavy 3D character that drained laptop battery, triggered cooling fans, and distracted your writing.',
    newWay: 'Clean, lightweight 2D companion with zero battery drain, calm expressions, and zero typing lag.',
  },
  {
    feature: 'How It Reads Your Notes',
    oldWay: 'A separate chat window where you had to manually copy, paste, and explain your entire document.',
    newWay: 'Reads right alongside you. It knows which paragraph you are editing without any tedious copy-pasting.',
  },
  {
    feature: 'Reviewing Suggestions',
    oldWay: 'Dumped raw text into chat boxes, forcing you to manually re-format and insert lines.',
    newWay: 'Shows a clean preview of changes directly in your document with 1-click "Apply" and instant ↺ Undo.',
  },
  {
    feature: 'Privacy & Control',
    oldWay: 'Unclear what was being shared, with no easy way to keep private notes completely shielded.',
    newWay: '100% transparent. Mark any document "Private" with one switch, and use your own free key anytime.',
  },
];

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

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mimo-intro-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans"
      onClick={closeMimoIntro}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0 bg-neutral-50/50 dark:bg-neutral-900/50">
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
                <div className="flex items-center gap-2">
                  <h2
                    id="mimo-intro-title"
                    className="text-lg sm:text-xl font-bold tracking-tight text-neutral-950 dark:text-white"
                  >
                    What&apos;s New in Mimo 2.1.0
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                    Simplified &amp; Faster
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Here is what changed from the older version, explained in simple everyday words.
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

        {/* Scrollable Comparison Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
          {/* Friendly Note */}
          <div className="p-3.5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed">
            We listened to your feedback. We removed confusing technical jargon, eliminated fake speed claims, and rebuilt Mimo to be a quiet helper that stays out of your way until you need it.
          </div>

          {/* Old vs New Cards */}
          <div className="space-y-3">
            {COMPARISONS.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-neutral-50/70 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-2.5"
              >
                <div className="font-semibold text-xs text-neutral-900 dark:text-white uppercase tracking-wider">
                  {item.feature}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {/* Before / Old */}
                  <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-neutral-700 dark:text-neutral-300 space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Before</span>
                    </div>
                    <p className="text-[11.5px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                      {item.oldWay}
                    </p>
                  </div>

                  {/* Now in 2.0.0 */}
                  <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-neutral-700 dark:text-neutral-300 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>Now in v2.1.0</span>
                    </div>
                    <p className="text-[11.5px] leading-relaxed text-neutral-800 dark:text-neutral-200">
                      {item.newWay}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Shortcut Callout */}
          <div className="p-3 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-neutral-600 dark:text-neutral-400">Shortcut in Document Editor:</span>
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
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-[0.98] shadow-xs transition-all cursor-pointer"
          >
            Open Document to Try
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
