import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { motionimoSpring } from '../utils/springs';

interface WindowFrameProps {
  title?: string;
  subtitle?: string;
  delay?: number;
  width?: string | number;
  height?: string | number;
  children: React.ReactNode;
  className?: string;
  scaleEntrance?: boolean;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  title = 'MD-Writer — Architecture.md',
  subtitle = 'Markdown Studio v2.3',
  delay = 0,
  width = '100%',
  height = '100%',
  children,
  className = '',
  scaleEntrance = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Clean flat entrance (scale + opacity, no 2.5D tilt per user request)
  const springVal = scaleEntrance ? motionimoSpring(frame, fps, delay) : 1;

  const scale = scaleEntrance
    ? interpolate(springVal, [0, 1], [0.96, 1.0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const opacity = scaleEntrance
    ? interpolate(springVal, [0, 1], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  return (
    <div
      style={{
        width,
        height,
        transform: `scale(${scale})`,
        opacity,
      }}
      className={`relative flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900/90 shadow-[0_30px_90px_rgba(0,0,0,0.65)] backdrop-blur-xl overflow-hidden ${className}`}
    >
      {/* Titlebar / macOS Chrome */}
      <div className="flex h-12 w-full items-center justify-between border-b border-neutral-800/80 bg-neutral-950/60 px-5 select-none">
        {/* Traffic Light Buttons */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50" />
          <div className="h-3 w-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50" />
          <div className="h-3 w-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50" />
        </div>

        {/* Center Title Pill */}
        <div className="flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900/80 px-3 py-1 text-xs text-neutral-300 font-mono tracking-wide">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
          <span className="font-semibold text-white">{title}</span>
          <span className="text-neutral-500">•</span>
          <span className="text-neutral-400 text-[11px]">{subtitle}</span>
        </div>

        {/* Right Status Indicator */}
        <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
          <span className="rounded bg-neutral-800/70 px-2 py-0.5 text-[10px] text-neutral-300 border border-neutral-700/60">
            LOCAL-FIRST
          </span>
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* Main Window Body Content */}
      <div className="relative flex-1 overflow-hidden bg-neutral-950/40">
        {children}
      </div>
    </div>
  );
};
