import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MascotState } from '../types/mimoTypes';
import { useMimoStore } from '../stores/useMimoStore';

export interface MimoAvatarProps {
  state?: MascotState;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'floating' | 'hero';
  className?: string;
  showSleepTimer?: boolean;
  onClick?: () => void;
}

const STATE_ASSETS: Record<MascotState, string> = {
  happy: '/mimo/happy.png',
  thinking: '/mimo/thinking.png',
  excited: '/mimo/excited.png',
  typing: '/mimo/typing.png',
  sleeping: '/mimo/sleeping.png',
};

const SIZE_CLASSES = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
  floating: 'w-12 h-12 sm:w-14 sm:h-14',
  hero: 'w-24 h-24 sm:w-28 sm:h-28',
};

export const MimoAvatar: React.FC<MimoAvatarProps> = ({
  state: propState,
  size = 'md',
  className = '',
  showSleepTimer = false,
  onClick,
}) => {
  const storeState = useMimoStore((s) => s.mascotState);
  const setMascotState = useMimoStore((s) => s.setMascotState);
  const activeState = propState || storeState;

  // Auto-sleep timer (45 seconds of idle inactivity triggers sleep mode)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!showSleepTimer) return;

    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (activeState === 'sleeping') {
        setMascotState('happy');
      }
      idleTimerRef.current = setTimeout(() => {
        setMascotState('sleeping');
      }, 45000);
    };

    window.addEventListener('mousemove', resetIdleTimer, { passive: true });
    window.addEventListener('keydown', resetIdleTimer, { passive: true });
    resetIdleTimer();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
    };
  }, [showSleepTimer, activeState, setMascotState]);

  const assetSrc = STATE_ASSETS[activeState] || STATE_ASSETS.happy;

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center select-none ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
      title={`Mimo (${activeState})`}
    >
      <motion.div
        animate={
          activeState === 'thinking'
            ? { y: [0, -3, 0], scale: [1, 1.02, 1] }
            : activeState === 'sleeping'
            ? { y: [0, 2, 0], opacity: [0.85, 0.95, 0.85] }
            : activeState === 'excited'
            ? { scale: [1, 1.04, 1], y: [0, -3, 0] }
            : activeState === 'typing'
            ? { y: [0, -2, 0] }
            : { y: [0, -2, 0] }
        }
        transition={{
          duration: activeState === 'thinking' ? 2 : activeState === 'sleeping' ? 3.5 : 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`relative ${SIZE_CLASSES[size]} flex items-center justify-center overflow-visible`}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={activeState}
            src={assetSrc}
            alt={`Mimo ${activeState}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="w-full h-full object-contain filter drop-shadow-sm select-none pointer-events-none"
            draggable={false}
          />
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
