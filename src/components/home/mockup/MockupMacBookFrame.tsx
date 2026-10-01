import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface MockupMacBookFrameProps {
  children: React.ReactNode;
}

export const MockupMacBookFrame: React.FC<MockupMacBookFrameProps> = React.memo(({ children }) => {
  const [animationKey, setAnimationKey] = useState(0);

  const replayAnimation = useCallback(() => {
    setAnimationKey((prev) => prev + 1);
  }, []);

  // Secret Key Shortcut: Shift + Ctrl + Alt to silently replay laptop open animation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.ctrlKey && e.altKey) {
        e.preventDefault();
        replayAnimation();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [replayAnimation]);

  return (
    <div className="relative w-full max-w-3xl lg:max-w-none mx-auto select-none [perspective:1400px]">

      {/* Main Laptop 3D Container */}
      <div className="relative z-10 mx-auto [transform-style:preserve-3d]">
        {/* Apple MacBook Pro Lid & Display Bezel with 3D Clamshell Opening Animation */}
        <motion.div
          key={animationKey}
          initial={{ rotateX: -85, scale: 0.95, opacity: 0.7 }}
          animate={{ rotateX: 0, scale: 1, opacity: 1 }}
          transition={{
            duration: 1.25,
            ease: [0.16, 1, 0.3, 1], // Smooth Apple-like hydraulic hinge curve
          }}
          style={{ transformOrigin: 'bottom center', transformStyle: 'preserve-3d' }}
          className="rounded-[26px] p-2.5 sm:p-3 bg-gradient-to-b from-[#2a2a30] via-[#1c1c22] to-[#121215] border border-neutral-700/60 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.55)] ring-1 ring-white/10 relative overflow-visible will-change-transform"
        >
          {/* Subtle Dynamic Screen Glare on Open */}
          <motion.div
            initial={{ opacity: 0.5, x: '-100%' }}
            animate={{ opacity: 0, x: '220%' }}
            transition={{ duration: 1.4, ease: 'easeOut', delay: 0.15 }}
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent z-50 skew-x-12 overflow-hidden rounded-[24px]"
          />

          {/* MacBook Display Camera Notch */}
          <div className="absolute top-2.5 sm:top-3 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center pointer-events-none">
            <div className="h-3 w-20 sm:w-24 bg-neutral-950 rounded-b-lg border-b border-x border-neutral-800/80 flex items-center justify-center gap-2 px-2.5 shadow-xs">
              {/* Webcam Lens */}
              <div className="w-1.5 h-1.5 rounded-full bg-[#0a0a0f] border border-neutral-700/60 flex items-center justify-center">
                <div className="w-0.5 h-0.5 rounded-full bg-brand-400/70" />
              </div>
              {/* Subtle status indicator */}
              <div className="w-1 h-1 rounded-full bg-emerald-500/80 shadow-[0_0_4px_rgba(16,185,129,0.8)]" />
            </div>
          </div>

          {children}
        </motion.div>

        {/* Laptop Keyboard Deck (Unibody Base) */}
        <div className="relative mx-auto w-[104%] -left-[2%] h-4.5 bg-gradient-to-b from-[#2e2e36] via-[#1f1f24] to-[#141418] rounded-b-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] border-t border-neutral-600/50 flex items-start justify-center">
          {/* Machined Center Thumb Scoop / Display Open Indent */}
          <div className="w-16 h-1.5 bg-neutral-900/80 rounded-b-md border-b border-x border-neutral-700/50 shadow-inner" />
        </div>

        {/* Playful Handwritten Annotation & Curved Arrow Below Laptop */}
        <div className="relative mt-4 flex items-center justify-end px-2 sm:px-6 pointer-events-none">
          <div className="flex items-center gap-2">
            <svg
              className="w-14 h-8 text-neutral-700 dark:text-neutral-300"
              viewBox="0 0 70 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 32 C 25 35, 45 28, 55 12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M48 9 L 56 11 L 58 19"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <span className="font-handwriting text-xl sm:text-2xl text-neutral-800 dark:text-neutral-200 tracking-wide -rotate-3 select-none">
              Try typing directly in the laptop!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

MockupMacBookFrame.displayName = 'MockupMacBookFrame';
