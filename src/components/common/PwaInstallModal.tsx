import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Download, 
  Check, 
  WifiOff, 
  Zap, 
  ShieldCheck
} from 'lucide-react';
import { usePwaInstall } from '../../hooks/usePwaInstall';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, installApp } = usePwaInstall();
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [installFeedback, setInstallFeedback] = useState<string | null>(null);

  // Close on Escape key and prevent body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setIsInstalling(true);
    setInstallFeedback(null);
    try {
      const success = await installApp();
      if (success) {
        setInstallSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setInstallFeedback(
          'Please click the install icon in your browser address bar (⊕ or 🖥️) to add MD Writer to your system.'
        );
      }
    } catch {
      setInstallFeedback(
        'Please click the install icon in your browser address bar (⊕ or 🖥️) to add MD Writer to your system.'
      );
    } finally {
      setIsInstalling(false);
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-2xl p-6 sm:p-7 text-neutral-900 dark:text-neutral-100 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with App Logo */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black tracking-tight text-neutral-950 dark:text-white">
                Install MD Writer
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold font-mono">
                PWA
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Dedicated window, native shortcuts, and instant launch.
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-center">
            <WifiOff className="w-4 h-4 text-sky-500 mx-auto mb-1.5" />
            <div className="text-[11px] font-bold">100% Offline</div>
            <div className="text-[9.5px] text-neutral-400">IndexedDB sync</div>
          </div>
          <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-center">
            <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1.5" />
            <div className="text-[11px] font-bold">Instant Launch</div>
            <div className="text-[9.5px] text-neutral-400">Zero startup lag</div>
          </div>
          <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-500 mx-auto mb-1.5" />
            <div className="text-[11px] font-bold">Local First</div>
            <div className="text-[9.5px] text-neutral-400">100% private</div>
          </div>
        </div>

        {/* Primary Action Button */}
        {installSuccess || isInstalled ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center justify-center gap-2 text-xs font-bold mb-4">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>MD Writer is installed as an application</span>
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="w-full py-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-sky-400 dark:text-sky-600" />
              <span>
                {isInstalling
                  ? 'Installing...'
                  : isInstallable
                  ? 'Install MD Writer App'
                  : 'Install via Browser'}
              </span>
            </button>

            {installFeedback && (
              <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs leading-relaxed text-center">
                {installFeedback}
              </div>
            )}
          </div>
        )}

        {/* Footer Close Button */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
