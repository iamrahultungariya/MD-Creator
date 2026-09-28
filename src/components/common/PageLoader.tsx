import React from 'react';

export const PageLoader: React.FC = () => {
  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors select-none"
      role="status"
      aria-label="Loading workspace"
    >
      <div className="relative w-36 sm:w-44 h-18 sm:h-22 flex items-center justify-center">
        <svg viewBox="0 0 176 84" fill="none" className="w-full h-full overflow-visible">
          <defs>
            {/* Writing Ink Gradient */}
            <linearGradient id="loaderInkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="45%" stopColor="#60A5FA" />
              <stop offset="85%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#A5B4FC" />
            </linearGradient>

            {/* Ink Tip Glow Filter */}
            <filter id="loaderTipGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Metallic Nib Gradient */}
            <linearGradient id="loaderNibMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#E2E8F0" />
              <stop offset="65%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>

            {/* Pen Barrel Gradient */}
            <linearGradient id="loaderBarrelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="45%" stopColor="#334155" />
              <stop offset="70%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0B0F19" />
            </linearGradient>
          </defs>

          {/* Faint Editorial Baseline */}
          <line 
            x1="10" 
            y1="52" 
            x2="162" 
            y2="52" 
            className="stroke-neutral-300/80 dark:stroke-neutral-800" 
            strokeWidth="1" 
            strokeDasharray="3 3" 
          />

          {/* Written Signature Stroke ("M" + Flourish) */}
          <path
            d="M 16 48 C 22 48, 26 16, 38 16 C 46 16, 49 38, 56 42 C 63 38, 66 16, 78 16 C 88 16, 92 48, 98 48 C 108 48, 126 48, 152 48"
            fill="none"
            stroke="url(#loaderInkGradient)"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="100"
            className="pen-writing-path"
          />

          {/* Pen Nib Group (tracked dynamically along offset-path) */}
          <g className="pen-writing-nib pointer-events-none">
            {/* Soft Shadow under Pen */}
            <ellipse cx="6" cy="4" rx="8" ry="3" fill="#000000" opacity="0.16" className="dark:opacity-35" filter="blur(2px)" />

            {/* Rotated Pen Body */}
            <g transform="rotate(-38)">
              {/* Pen Barrel */}
              <path d="M -4.5 -48 L -3.5 -78 L 3.5 -78 L 4.5 -48 Z" fill="url(#loaderBarrelGrad)" />
              
              {/* Electric Accent Ring */}
              <rect x="-5" y="-48.5" width="10" height="2.5" rx="0.6" fill="#38BDF8" opacity="0.95" />

              {/* Pen Grip Section */}
              <path d="M -5 -33 L -4.5 -46 L 4.5 -46 L 5 -33 Z" fill="#0F172A" />

              {/* Precision Luxury Nib */}
              <path
                d="M 0 0 C -1.8 -4, -6.5 -13, -7.5 -18 C -8.2 -22, -6.8 -27, -5.8 -33 L 5.8 -33 C 6.8 -27, 8.2 -22, 7.5 -18 C 6.5 -13, 1.8 -4, 0 0 Z"
                fill="url(#loaderNibMetallic)"
                stroke="#64748B"
                strokeWidth="0.5"
              />

              {/* Nib Center Slit & Breather Hole */}
              <line x1="0" y1="0" x2="0" y2="-18.5" stroke="#0F172A" strokeWidth="0.75" />
              <circle cx="0" cy="-20" r="1.3" fill="#0F172A" />

              {/* Nib Engraved Filigree Curve */}
              <path d="M -3 -15 C -1 -12, 1 -12, 3 -15" stroke="#64748B" strokeWidth="0.5" fill="none" opacity="0.7" />
            </g>

            {/* Luminous Ink Glow at Pen Tip */}
            <circle cx="0" cy="0" r="2.2" fill="#60A5FA" filter="url(#loaderTipGlow)" opacity="0.95" />
          </g>
        </svg>
      </div>

      <div className="mt-2 text-center">
        <span className="text-[10px] sm:text-[11px] font-semibold font-sans tracking-[0.24em] text-neutral-800 dark:text-neutral-200 uppercase">
          MD Writer
        </span>
      </div>
    </div>
  );
};
