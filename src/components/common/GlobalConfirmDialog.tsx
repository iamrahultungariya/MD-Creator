import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Trash2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  LogOut, 
  FileX, 
  X 
} from 'lucide-react';
import { useConfirmStore, ConfirmVariant, ConfirmIcon } from '../../stores/useConfirmStore';

export const GlobalConfirmDialog: React.FC = () => {
  const { isOpen, options, handleConfirm, handleCancel } = useConfirmStore();
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // Auto-focus management for safety
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (options.variant === 'danger') {
          cancelBtnRef.current?.focus();
        } else {
          confirmBtnRef.current?.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, options.variant]);

  // Keyboard navigation: Escape cancels
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, handleCancel]);

  const renderIcon = (variant: ConfirmVariant = 'danger', iconType?: ConfirmIcon) => {
    const icon = iconType || (variant === 'danger' ? 'trash' : variant === 'warning' ? 'alert' : 'info');

    switch (icon) {
      case 'trash':
        return (
          <div className="w-11 h-11 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-200 dark:border-red-900/50 shadow-inner">
            <Trash2 className="w-5 h-5" />
          </div>
        );
      case 'logout':
        return (
          <div className="w-11 h-11 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-200 dark:border-orange-900/50 shadow-inner">
            <LogOut className="w-5 h-5" />
          </div>
        );
      case 'clear':
        return (
          <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-900/50 shadow-inner">
            <FileX className="w-5 h-5" />
          </div>
        );
      case 'warning':
      case 'alert':
        return (
          <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-900/50 shadow-inner">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-11 h-11 rounded-2xl bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-200 dark:border-brand-900/50 shadow-inner">
            <Info className="w-5 h-5" />
          </div>
        );
    }
  };

  const getConfirmButtonClasses = (variant: ConfirmVariant = 'danger') => {
    if (options.confirmButtonClass) return options.confirmButtonClass;
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-600/20 active:scale-98';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/20 active:scale-98';
      case 'info':
      case 'primary':
      default:
        return 'bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 active:scale-98';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop Blur Layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={handleCancel}
            className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-xs"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ type: 'spring', damping: 26, stiffness: 380 }}
            className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 shadow-2xl overflow-hidden p-6 z-10"
          >
            {/* Close button in top right */}
            <button
              onClick={handleCancel}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content Area */}
            <div className="flex items-start gap-4">
              {renderIcon(options.variant, options.icon)}

              <div className="flex-1 min-w-0 pr-4">
                <h3 className="font-bold text-base text-neutral-950 dark:text-white tracking-tight leading-snug">
                  {options.title || 'Confirm Action'}
                </h3>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1.5 leading-relaxed">
                  {options.message}
                </div>

                {options.description && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-neutral-400" />
                    <span>{options.description}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
              <button
                ref={cancelBtnRef}
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer border border-neutral-200 dark:border-neutral-700"
              >
                {options.cancelText || 'Cancel'}
              </button>

              <button
                ref={confirmBtnRef}
                type="button"
                onClick={handleConfirm}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${getConfirmButtonClasses(options.variant)}`}
              >
                {options.confirmText || 'Confirm'}
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
