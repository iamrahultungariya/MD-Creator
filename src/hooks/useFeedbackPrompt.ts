import { useState, useEffect, useCallback, useRef } from 'react';

export const FEEDBACK_SUBMITTED_KEY = 'md_writer_feedback_submitted';
export const FEEDBACK_SNOOZE_KEY = 'md_writer_feedback_snooze_until';
export const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000; // 1,296,000,000 ms
export const DEFAULT_DWELL_MS = 30 * 1000; // 30 seconds

export interface UseFeedbackPromptOptions {
  hasDocument: boolean;
  dwellMs?: number;
}

export interface UseFeedbackPromptResult {
  isToastVisible: boolean;
  isModalOpen: boolean;
  isSuccessBannerVisible: boolean;
  openModal: () => void;
  dismissToast: () => void;
  closeModal: () => void;
  markSubmitted: () => void;
  dismissSuccessBanner: () => void;
}

export function useFeedbackPrompt({
  hasDocument,
  dwellMs = DEFAULT_DWELL_MS
}: UseFeedbackPromptOptions): UseFeedbackPromptResult {
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessBannerVisible, setIsSuccessBannerVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check whether prompt is allowed based on localStorage
  const isPromptAllowed = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      const isSubmitted = localStorage.getItem(FEEDBACK_SUBMITTED_KEY) === 'true';
      if (isSubmitted) return false;

      const snoozeUntil = Number(localStorage.getItem(FEEDBACK_SNOOZE_KEY) || 0);
      if (snoozeUntil && Date.now() < snoozeUntil) return false;

      return true;
    } catch {
      return false;
    }
  }, []);

  // 30s dwell timer activation
  useEffect(() => {
    if (!hasDocument) return;
    if (!isPromptAllowed()) return;

    timerRef.current = setTimeout(() => {
      if (isPromptAllowed()) {
        setIsToastVisible(true);
      }
    }, dwellMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [hasDocument, dwellMs, isPromptAllowed]);

  // Open modal from toast
  const openModal = useCallback(() => {
    setIsToastVisible(false);
    setIsModalOpen(true);
  }, []);

  // Dismiss toast -> snooze for 15 days
  const dismissToast = useCallback(() => {
    setIsToastVisible(false);
    try {
      const snoozeTarget = Date.now() + FIFTEEN_DAYS_MS;
      localStorage.setItem(FEEDBACK_SNOOZE_KEY, String(snoozeTarget));
    } catch {
      // Ignore localStorage write errors
    }
  }, []);

  // Close modal without submitting -> snooze for 15 days
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    try {
      const snoozeTarget = Date.now() + FIFTEEN_DAYS_MS;
      localStorage.setItem(FEEDBACK_SNOOZE_KEY, String(snoozeTarget));
    } catch {
      // Ignore localStorage write errors
    }
  }, []);

  // Mark submitted permanently
  const markSubmitted = useCallback(() => {
    setIsModalOpen(false);
    setIsToastVisible(false);
    try {
      localStorage.setItem(FEEDBACK_SUBMITTED_KEY, 'true');
      localStorage.removeItem(FEEDBACK_SNOOZE_KEY);
    } catch {
      // Ignore localStorage errors
    }
    // Show success banner
    setIsSuccessBannerVisible(true);
  }, []);

  const dismissSuccessBanner = useCallback(() => {
    setIsSuccessBannerVisible(false);
  }, []);

  return {
    isToastVisible,
    isModalOpen,
    isSuccessBannerVisible,
    openModal,
    dismissToast,
    closeModal,
    markSubmitted,
    dismissSuccessBanner
  };
}
