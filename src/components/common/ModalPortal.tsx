import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  lockScroll?: boolean;
  trapFocus?: boolean;
}

export const ModalPortal: React.FC<ModalPortalProps> = ({
  isOpen,
  onClose,
  children,
  lockScroll = true,
  trapFocus = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Lock body scroll while modal is active
  useEffect(() => {
    if (!isOpen || !lockScroll || typeof document === 'undefined') return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, lockScroll]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen || !onClose || typeof window === 'undefined') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus management: initial focus, Tab trapping, and focus restoration (WCAG 2.1 AA)
  useEffect(() => {
    if (!isOpen || !trapFocus || typeof document === 'undefined') return;

    // Capture currently focused element before modal renders
    if (document.activeElement instanceof HTMLElement) {
      previousActiveElementRef.current = document.activeElement;
    }

    const container = containerRef.current;
    if (!container) return;

    // Selector for all focusable, interactive elements
    const FOCUSABLE_SELECTOR =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    // Focus initial element: element with autoFocus / data-autofocus, or first focusable
    const timer = setTimeout(() => {
      const autofocusEl = container.querySelector<HTMLElement>('[data-autofocus], [autofocus]');
      if (autofocusEl) {
        autofocusEl.focus();
      } else {
        const firstFocusable = container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        firstFocusable?.focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => el.offsetParent !== null && !el.hasAttribute('disabled'));

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: if on first element, wrap around to last
        if (document.activeElement === firstElement || !container.contains(document.activeElement)) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: if on last element, wrap around to first
        if (document.activeElement === lastElement || !container.contains(document.activeElement)) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      // Restore previous focus on modal unmount
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen, trapFocus]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div ref={containerRef} data-modal-portal="true" className="contents">
      {children}
    </div>,
    document.body
  );
};
