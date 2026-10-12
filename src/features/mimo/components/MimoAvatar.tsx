import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MascotState } from '../types/mimoTypes';
import { useMimoStore } from '../stores/useMimoStore';

interface MimoAvatarProps {
  state?: MascotState;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero';
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
  md: 'w-11 h-11',
  lg: 'w-16 h-16',
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
      title={`Mimo (State: ${activeState})`}
    >
      <motion.div
        animate={
          activeState === 'thinking'
            ? { y: [0, -3, 0], scale: [1, 1.02, 1] }
            : activeState === 'sleeping'
            ? { y: [0, 2, 0], opacity: [0.85, 0.95, 0.85] }
            : activeState === 'excited'
            ? { scale: [1, 1.08, 1], rotate: [-2, 2, 0] }
            : { y: [0, -2, 0] }
        }
        transition={{
          duration: activeState === 'thinking' ? 1.8 : 3.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`relative ${SIZE_CLASSES[size]} rounded-2xl flex items-center justify-center overflow-visible`}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={activeState}
            src={assetSrc}
            alt={`Mimo ${activeState}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full object-contain filter drop-shadow-md"
            onError={(e) => {
              // Fallback to hero or happy if specific asset fails
              (e.currentTarget as HTMLImageElement).src = '/mimo/happy.png';
            }}
          />
        </AnimatePresence>

        {/* Sleeping zZz visual indicator */}
        {activeState === 'sleeping' && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: [-2, -12], x: [0, 6] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
            className="absolute -top-3 -right-2 text-violet-500 font-extrabold text-xs pointer-events-none"
          >
            zZ
          </motion.div>
        )}

        {/* Thinking pulsing ring */}
        {activeState === 'thinking' && (
          <span className="absolute -inset-1 rounded-full bg-violet-400/20 dark:bg-violet-500/20 animate-ping pointer-events-none" />
        )}
      </motion.div>
    </div>
  );
};
