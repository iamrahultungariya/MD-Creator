import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { APP_VERSION_LABEL } from '../../config/version';
import { useUpdateModalStore } from '../../stores/useUpdateModalStore';

export const UpdateAvailableModal: React.FC = () => {
  const { isUpdateOpen, closeUpdate } = useUpdateModalStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isUpdateOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeUpdate();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUpdateOpen, closeUpdate]);

  if (!isUpdateOpen) return null;

  const handleCheckoutChanges = () => {
    closeUpdate();
    navigate('/changelog');
  };

  return createPortal(
    <aside
      role="status"
      aria-live="polite"
      aria-label={`${APP_VERSION_LABEL} is live`}
      className="fixed bottom-5 right-5 z-[90] w-[calc(100vw-2.5rem)] max-w-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-lg p-3.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-sm font-medium tracking-tight tabular-nums text-neutral-950 dark:text-white">
              {APP_VERSION_LABEL} is live
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            New updates and improvements are available.
          </p>
        </div>

        <button
          type="button"
          onClick={closeUpdate}
          aria-label="Dismiss update notification"
          className="p-1 rounded-md text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={closeUpdate}
          className="px-2.5 py-1 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          Dismiss
        </button>
        <button
          type="button"
          onClick={handleCheckoutChanges}
          className="px-3 py-1 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
        >
          Check out changes
        </button>
      </div>
    </aside>,
    document.body
  );
};
