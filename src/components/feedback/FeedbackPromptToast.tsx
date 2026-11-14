import React, { useEffect } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';

export interface FeedbackPromptToastProps {
  isVisible: boolean;
  isSuccess?: boolean;
  onOpenFeedback: () => void;
  onDismiss: () => void;
  onDismissSuccess?: () => void;
}

export const FeedbackPromptToast: React.FC<FeedbackPromptToastProps> = ({
  isVisible,
  isSuccess = false,
  onOpenFeedback,
  onDismiss,
  onDismissSuccess
}) => {
  // Auto-dismiss success banner after 5 seconds
  useEffect(() => {
    if (isSuccess && onDismissSuccess) {
      const timer = setTimeout(() => {
        onDismissSuccess();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onDismissSuccess]);

  if (!isVisible && !isSuccess) {
    return null;
  }

  // Success banner view (Image 4)
  if (isSuccess) {
    return (
      <aside
        aria-label="Feedback confirmation banner"
        className="fixed bottom-6 left-6 z-40 max-w-sm w-full max-w-[calc(100vw-2rem)] sm:max-w-sm select-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
      >
        <div className="relative pt-6 pb-4 px-4 bg-white dark:bg-neutral-900 border border-emerald-200/90 dark:border-emerald-800/80 rounded-3xl shadow-2xl">
          {/* Peeking Thumbs-up Character */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 pointer-events-none z-10 flex justify-center">
            <img
              src="/FeedBackCharater/Smiling Cartoon Boy Giving Thumbs-Up.png"
              alt="Happy writer"
              className="w-24 h-24 object-contain drop-shadow-md"
              loading="lazy"
            />
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onDismissSuccess || onDismiss}
            aria-label="Close confirmation"
            className="absolute top-3.5 right-3.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content Row */}
          <div className="flex items-center gap-3.5 mt-2">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0 pr-6">
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
                Feedback Sent!
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">
                Thanks! Your feedback helps us improve.
              </p>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Initial prompt toast view (Image 3)
  return (
    <aside
      aria-label="Product feedback prompt"
      className="fixed bottom-6 left-6 z-40 max-w-sm w-full max-w-[calc(100vw-2rem)] sm:max-w-sm select-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="relative pt-6 pb-4 px-4 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-2xl">
        {/* Peeking Clipboard Boy Character */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 pointer-events-none z-10 flex justify-center">
          <img
            src="/FeedBackCharater/Cheerful 3D Cartoon with Clipboard.png"
            alt="Mascot with clipboard"
            className="w-24 h-24 object-contain drop-shadow-md"
            loading="lazy"
          />
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close feedback prompt"
          className="absolute top-3.5 right-3.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Row */}
        <div className="flex items-center gap-3 mt-2">
          {/* Speech bubble avatar icon container */}
          <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <line x1="8" y1="10" x2="8.01" y2="10" strokeWidth="2.5" />
              <line x1="12" y1="10" x2="12.01" y2="10" strokeWidth="2.5" />
              <line x1="16" y1="10" x2="16.01" y2="10" strokeWidth="2.5" />
            </svg>
          </div>

          <div className="min-w-0 pr-6">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
              Share Your Feedback
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">
              Help us make it even better!
            </p>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-end gap-2.5 mt-4 pt-1">
          <button
            type="button"
            onClick={onDismiss}
            className="px-3.5 py-1.5 text-xs font-medium rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors"
          >
            Not Now
          </button>
          <button
            type="button"
            onClick={onOpenFeedback}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
          >
            <span>Give Feedback</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
