import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMimoStore } from '../stores/useMimoStore';
import { Mimo3DViewer } from './Mimo3DViewer';

interface Mimo3DCompanionProps {
  className?: string;
}

export const Mimo3DCompanion: React.FC<Mimo3DCompanionProps> = ({ className = '' }) => {
  const isOpen = useMimoStore((s) => s.isOpen);
  const setIsOpen = useMimoStore((s) => s.setIsOpen);
  const mascotState = useMimoStore((s) => s.mascotState);
  const activeDiffHunk = useMimoStore((s) => s.activeDiffHunk);

  const hasPendingDiff = !!activeDiffHunk && !activeDiffHunk.isApplied && !activeDiffHunk.isDiscarded;

  // When drawer is open, hide floating companion so there's zero clutter and GPU is freed
  if (isOpen) return null;

  const handleClick = () => {
    setIsOpen(true);
  };

  return (
    <aside aria-label="Mimo 3D Floating Companion" className="contents">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 25 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`fixed bottom-6 right-6 z-30 select-none no-print ${className}`}
        >
          <div className="relative group cursor-pointer" onClick={handleClick}>
            {/* Ambient Radial Glow Aura (Changes color by state without any distracting emotion text) */}
            <div
              className={`absolute -inset-2 rounded-full blur-2xl transition-all duration-700 opacity-60 pointer-events-none ${
                hasPendingDiff
                  ? 'bg-emerald-500/35'
                  : mascotState === 'thinking'
                  ? 'bg-violet-500/40'
                  : mascotState === 'excited'
                  ? 'bg-amber-400/35'
                  : mascotState === 'typing'
                  ? 'bg-cyan-500/35'
                  : 'bg-violet-400/25 group-hover:bg-violet-500/45'
              }`}
            />

            {/* 3D Canvas / Animated Floating Bobbing (Zero emotion text / pills) */}
            <motion.div
              animate={{
                y: mascotState === 'sleeping' ? [0, 4, 0] : [0, -10, 0],
                rotate: mascotState === 'excited' ? [-2, 2, -2] : [0, 0.8, 0],
              }}
              transition={{
                y: {
                  duration: mascotState === 'thinking' ? 2 : 3.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
                rotate: {
                  duration: mascotState === 'excited' ? 0.6 : 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
              className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center filter drop-shadow-2xl hover:scale-105 active:scale-95 transition-transform"
              title="Mimo ✦ (Click to chat or press Ctrl+J)"
            >
              <Mimo3DViewer size="hero" state={mascotState} />
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </aside>
  );
};
