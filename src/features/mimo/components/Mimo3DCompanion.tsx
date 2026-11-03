import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMimoStore } from '../stores/useMimoStore';
import { MimoAvatar } from './MimoAvatar';

interface Mimo3DCompanionProps {
  className?: string;
  onClick?: () => void;
}

export const Mimo3DCompanion: React.FC<Mimo3DCompanionProps> = ({ className = '', onClick }) => {
  const isOpen = useMimoStore((s) => s.isOpen);
  const setIsOpen = useMimoStore((s) => s.setIsOpen);
  const mascotState = useMimoStore((s) => s.mascotState);

  // When drawer is open, hide floating companion
  if (isOpen) return null;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsOpen(true);
    }
  };

  return (
    <aside aria-label="Mimo Floating Companion" className="contents">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 select-none no-print ${className}`}
        >
          <button
            type="button"
            onClick={handleClick}
            className="group relative flex items-center justify-center p-2 rounded-2xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-neutral-200/90 dark:border-neutral-700/90 shadow-lg hover:shadow-xl hover:border-brand-500/50 dark:hover:border-brand-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            title="Mimo AI Companion (Click to open or press Ctrl+J)"
            aria-label="Toggle Mimo AI Companion"
          >
            <MimoAvatar size="floating" state={mascotState} />
            {/* Live active beacon */}
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 pointer-events-none">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500 border border-white dark:border-neutral-900" />
            </span>
          </button>
        </motion.div>
      </AnimatePresence>
    </aside>
  );
};
