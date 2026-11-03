import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMimoStore } from '../stores/useMimoStore';
import { MimoAvatar } from './MimoAvatar';

interface Mimo3DCompanionProps {
  className?: string;
}

export const Mimo3DCompanion: React.FC<Mimo3DCompanionProps> = ({ className = '' }) => {
  const isOpen = useMimoStore((s) => s.isOpen);
  const setIsOpen = useMimoStore((s) => s.setIsOpen);
  const mascotState = useMimoStore((s) => s.mascotState);

  // When drawer is open, hide floating companion
  if (isOpen) return null;

  return (
    <aside aria-label="Mimo Floating Companion" className="contents">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`fixed bottom-6 right-6 z-30 select-none no-print ${className}`}
        >
          <div
            className="cursor-pointer hover:scale-105 active:scale-95 transition-transform filter drop-shadow-md"
            onClick={() => setIsOpen(true)}
            title="Mimo (Click to open or press Ctrl+J)"
          >
            <MimoAvatar size="hero" state={mascotState} />
          </div>
        </motion.div>
      </AnimatePresence>
    </aside>
  );
};
