import React from 'react';

interface MockupMacBookFrameProps {
  children: React.ReactNode;
}

export const MockupMacBookFrame: React.FC<MockupMacBookFrameProps> = React.memo(({ children }) => {
  return (
    <div className="relative w-full max-w-3xl lg:max-w-none mx-auto select-none">
      {/* Main Flat Laptop Container */}
      <div className="relative z-10 mx-auto">
        {/* Apple MacBook Pro Lid & Display Bezel */}
        <div className="rounded-[26px] p-2.5 sm:p-3 bg-gradient-to-b from-[#2a2a30] via-[#1c1c22] to-[#121215] border border-neutral-700/60 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.55)] ring-1 ring-white/10 relative overflow-visible">
          {/* MacBook Display Camera Notch */}
          <div className="absolute top-2.5 sm:top-3 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center pointer-events-none">
            <div className="h-3 w-20 sm:w-24 bg-neutral-950 rounded-b-lg border-b border-x border-neutral-800/80 flex items-center justify-center gap-2 px-2.5 shadow-xs">
              {/* Webcam Lens */}
              <div className="w-1.5 h-1.5 rounded-full bg-[#0a0a0f] border border-neutral-700/60 flex items-center justify-center">
                <div className="w-0.5 h-0.5 rounded-full bg-blue-400/70" />
              </div>
              {/* Subtle status indicator */}
              <div className="w-1 h-1 rounded-full bg-emerald-500/80 shadow-[0_0_4px_rgba(16,185,129,0.8)]" />
            </div>
          </div>

          {children}
        </div>

        {/* Laptop Keyboard Deck (Unibody Base) */}
        <div className="relative mx-auto w-[104%] -left-[2%] h-4.5 bg-gradient-to-b from-[#2e2e36] via-[#1f1f24] to-[#141418] rounded-b-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] border-t border-neutral-600/50 flex items-start justify-center">
          {/* Machined Center Thumb Scoop / Display Open Indent */}
          <div className="w-16 h-1.5 bg-neutral-900/80 rounded-b-md border-b border-x border-neutral-700/50 shadow-inner" />
        </div>

        {/* Playful Handwritten Annotation & Curved Arrow Below Laptop */}
        <div className="relative mt-4 flex justify-end pr-8 sm:pr-12 pointer-events-none">
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
