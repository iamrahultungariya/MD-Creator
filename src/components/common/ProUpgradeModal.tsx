import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, X, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle?: string;
  featureDescription?: string;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  isOpen,
  onClose,
  featureTitle = 'Pro Cloud & Advanced Publishing',
  featureDescription = 'This power feature is part of MD Writer Pro. All Pro capabilities are completely unlocked and free during our Beta period.'
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-7 overflow-hidden z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer z-10"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-center">
            {/* Pro Badge Icon */}
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 mb-2.5">
              <span>Pro Writer Feature</span>
            </div>

            <h3 className="text-xl font-black text-neutral-950 dark:text-white tracking-tight">
              {featureTitle}
            </h3>

            <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {featureDescription}
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Multi-device cloud synchronization &amp; auto-sync</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Password-protected web publishing &amp; sharing</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Publication-grade PDF Studio &amp; themes</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                navigate(user ? '/pricing' : '/auth?redirect=/pricing');
              }}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow"
            >
              <span>{user ? 'Explore Pro Privileges' : 'Sign In to Unlock Pro'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                onClose();
                navigate('/pricing');
              }}
              className="w-full py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            >
              View Full Pricing Details
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[10.5px] text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Zero obligation • No credit card required</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
