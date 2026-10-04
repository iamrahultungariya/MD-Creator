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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-md rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-2xl p-6 text-neutral-900 dark:text-neutral-100 animate-in zoom-in-95 duration-150 font-sans"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with App Logo */}
        <div className="flex items-center gap-3.5 mb-5">
          <img 
            src="/logo.png" 
            alt="MD Writer Logo" 
            className="w-11 h-11 rounded-lg object-contain shadow-2xs shrink-0 border border-neutral-200/80 dark:border-neutral-800" 
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight text-neutral-950 dark:text-white">
                Install MD Writer
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                PWA
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Dedicated window, native shortcuts, and instant launch.
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-center">
            <WifiOff className="w-4 h-4 text-sky-500 mx-auto mb-1.5" />
            <div className="text-[11px] font-bold">100% Offline</div>
            <div className="text-[9.5px] text-neutral-400">IndexedDB sync</div>
          </div>
          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-center">
            <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1.5" />
            <div className="text-[11px] font-bold">Instant Launch</div>
            <div className="text-[9.5px] text-neutral-400">Zero startup lag</div>
          </div>
          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-center">
            <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400 mx-auto mb-1.5" />
            <div className="text-[11px] font-bold">Local First</div>
            <div className="text-[9.5px] text-neutral-400">100% private</div>
          </div>
        </div>

        {/* Primary Action Button */}
        {installSuccess || isInstalled ? (
          <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center justify-center gap-2 text-xs font-bold mb-4 shadow-2xs">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>MD Writer is installed as an application</span>
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>
                {isInstalling
                  ? 'Installing...'
                  : isInstallable
                  ? 'Install MD Writer App'
                  : 'Install via Browser'}
              </span>
            </button>

            {installFeedback && (
              <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs leading-relaxed text-center">
                {installFeedback}
              </div>
            )}
          </div>
        )}

        {/* Footer Close Button */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
