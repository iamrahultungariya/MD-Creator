import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check } from 'lucide-react';
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
    oldWay: 'Heavy 3D character that drained laptop battery and triggered cooling fans.',
    newWay: 'Clean, lightweight 2D companion with zero battery drain and calm expressions.',
  },
  {
    feature: 'How It Reads Your Notes',
    oldWay: 'A separate chat window where you had to manually copy and paste your document.',
    newWay: 'Reads alongside your active section without tedious copy-pasting.',
  },
  {
    feature: 'Reviewing Suggestions',
    oldWay: 'Dumped raw text into chat boxes, forcing manual line-by-line formatting.',
    newWay: 'Shows clean visual diffs directly in your document with 1-click apply & undo.',
  },
  {
    feature: 'Privacy & Control',
    oldWay: 'Unclear what was shared, with no easy way to shield private notes.',
    newWay: '100% transparent. Mark any document private with one switch, and use your own key.',
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150 font-sans"
      onClick={closeMimoIntro}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <MimoAvatar size="md" state="happy" />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    id="mimo-intro-title"
                    className="text-base sm:text-lg font-bold tracking-tight text-neutral-950 dark:text-white"
                  >
                    What&apos;s New in Mimo 2.1.0
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                    Fast &amp; Quiet
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Rebuilt to be a quiet helper that stays out of your way until called.
                </p>
              </div>
            </div>

            <button
              onClick={closeMimoIntro}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
              title="Close dialog"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content (Flattened list - zero Russian-doll card clutter) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
          {/* Note */}
          <div className="p-3.5 rounded-lg bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed">
            We removed confusing technical jargon, eliminated battery-draining 3D canvas loads, and engineered Mimo to stay idle until you press <kbd className="font-mono px-1 py-0.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200">Ctrl+J</kbd>.
          </div>

          {/* Comparison Rows */}
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 border border-neutral-200/80 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-neutral-900">
            {COMPARISONS.map((item, idx) => (
              <div key={idx} className="p-4 space-y-2">
                <div className="font-semibold text-xs text-neutral-900 dark:text-white uppercase tracking-wider">
                  {item.feature}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-0.5 text-neutral-500 dark:text-neutral-400">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
                      Before
                    </span>
                    <p className="leading-relaxed">{item.oldWay}</p>
                  </div>

                  <div className="space-y-0.5 text-neutral-800 dark:text-neutral-200 font-medium">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Now in v2.1.0
                    </span>
                    <p className="leading-relaxed">{item.newWay}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Shortcut Callout */}
          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between text-xs">
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
            className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleOpenEditor}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 active:translate-y-[1px] shadow-xs transition-colors duration-150 cursor-pointer"
          >
            Open Document to Try
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
