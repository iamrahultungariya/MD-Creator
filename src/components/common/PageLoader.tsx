import React from 'react';

export const PageLoader: React.FC = () => {
  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors select-none"
      role="status"
      aria-label="Loading page content"
    >
      <div className="relative flex items-center justify-center">
        {/* Outer subtle track ring */}
        <div className="w-10 h-10 rounded-full border-[1.5px] border-neutral-200/80 dark:border-neutral-800" />
        
        {/* Active spinning orbital arc */}
        <div 
          className="absolute inset-0 w-10 h-10 rounded-full border-[1.5px] border-transparent border-t-neutral-900 dark:border-t-neutral-100 animate-spin" 
          style={{ animationDuration: '0.85s', animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
        />

        {/* Center subtle core dot */}
        <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white animate-pulse" />
      </div>

      <div className="mt-5 flex flex-col items-center gap-1">
        <span className="text-[10px] font-mono font-medium tracking-[0.22em] text-neutral-500 dark:text-neutral-400 uppercase">
          MD Writer
        </span>
      </div>
    </div>
  );
};
