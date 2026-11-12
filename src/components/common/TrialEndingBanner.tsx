import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useCheckoutModalStore } from '../../stores/useCheckoutModalStore';
import {
  computeTrialStatus,
  markTrialWarningNotifiedToday,
  isTrialWarningNotifiedToday,
  enforceTrialLifecycle,
} from '../../services/trialService';

export const TrialEndingBanner: React.FC = () => {
  const { user } = useAuthStore();
  const { openCheckout } = useCheckoutModalStore();
  const [isVisible, setIsVisible] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);

  useEffect(() => {
    const status = computeTrialStatus(user);

    if (status.shouldDeactivate) {
      enforceTrialLifecycle();
      setIsVisible(false);
      return;
    }

    if (status.status === 'warning') {
      setDaysRemaining(status.daysRemaining);
      // Show if not already dismissed today
      const alreadyNotified = isTrialWarningNotifiedToday();
      setIsVisible(!alreadyNotified);
    } else {
      setIsVisible(false);
    }
  }, [user]);

  if (!isVisible || daysRemaining <= 0) return null;

  const handleDismiss = () => {
    markTrialWarningNotifiedToday();
    setIsVisible(false);
  };

  const handleReviewPlans = () => {
    markTrialWarningNotifiedToday();
    setIsVisible(false);
    openCheckout('lifetime');
  };

  return (
    <aside
      aria-label="Trial expiration notice"
      className="relative z-40 w-full px-4 py-2 border-b border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 text-xs flex items-center justify-between gap-3 font-sans transition-colors"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
        <p className="truncate">
          Your Pro Studio trial ends in{' '}
          <strong className="font-semibold tabular-nums">
            {daysRemaining} day{daysRemaining > 1 ? 's' : ''}
          </strong>
          . Lock in your early-bird rate to retain continuous cloud sync and delta snapshots.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleReviewPlans}
          className="px-2.5 py-1 rounded-md bg-amber-900/10 dark:bg-amber-100/10 hover:bg-amber-900/20 dark:hover:bg-amber-100/20 text-amber-900 dark:text-amber-100 font-medium text-[11px] transition-colors cursor-pointer"
        >
          Review Plans
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss trial notice for today"
          className="p-1 rounded text-amber-700 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-100 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
