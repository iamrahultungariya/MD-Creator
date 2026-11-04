import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMimoStore } from '../stores/useMimoStore';
import { MimoAvatar } from './MimoAvatar';
import { useMimoInactivityTimer } from '../hooks/useMimoInactivityTimer';

interface Mimo3DCompanionProps {
  className?: string;
  onClick?: () => void;
}

export const Mimo3DCompanion: React.FC<Mimo3DCompanionProps> = ({ className = '', onClick }) => {
  const isOpen = useMimoStore((s) => s.isOpen);
  const setIsOpen = useMimoStore((s) => s.setIsOpen);
  const mascotState = useMimoStore((s) => s.mascotState);
  const touchMimoActivity = useMimoStore((s) => s.touchMimoActivity);

  // Run 30-second idle inactivity timer
  useMimoInactivityTimer();

  // When drawer is open, hide floating companion
  if (isOpen) return null;

  const handleClick = () => {
    touchMimoActivity();
    if (onClick) {
      onClick();
    } else {
      setIsOpen(true);
    }
  };

  const handleMouseEnter = () => {
    touchMimoActivity();
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
            onMouseEnter={handleMouseEnter}
            className="group relative flex items-center justify-center p-0 bg-transparent border-0 hover:scale-110 active:scale-95 transition-transform cursor-pointer focus:outline-none filter drop-shadow-md hover:drop-shadow-lg"
            title={`Mimo AI Companion (${mascotState}) — Click to open or press Ctrl+J`}
            aria-label="Toggle Mimo AI Companion"
          >
            <MimoAvatar size="floating" state={mascotState} />
          </button>
        </motion.div>
      </AnimatePresence>
    </aside>
  );
};
