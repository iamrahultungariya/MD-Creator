import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { AmbientBackground } from '../components/AmbientBackground';
import { KineticText } from '../components/KineticText';
import { motionimoSpring } from '../utils/springs';

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for tag pill
  const pillSpring = motionimoSpring(frame, fps, 5);
  const pillOpacity = interpolate(pillSpring, [0, 1], [0, 1]);
  const pillTranslateY = interpolate(pillSpring, [0, 1], [15, 0]);

  // Subtitle fade in
  const subSpring = motionimoSpring(frame, fps, 120);
  const subOpacity = interpolate(subSpring, [0, 1], [0, 1]);
  const subTranslateY = interpolate(subSpring, [0, 1], [10, 0]);

  // Scene exit fade out (frames 270 - 300)
  const exitOpacity = interpolate(frame, [270, 300], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{ opacity: exitOpacity }}
      className="relative flex h-full w-full flex-col items-center justify-center bg-neutral-950 px-8 text-center font-sans select-none overflow-hidden"
    >
      <AmbientBackground primaryGlowColor="#8257F5" secondaryGlowColor="#3b82f6" />

      {/* Top Pre-header Pill */}
      <div
        style={{
          opacity: pillOpacity,
          transform: `translateY(${pillTranslateY}px)`,
        }}
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-mono tracking-widest text-brand-400 uppercase shadow-lg shadow-brand-500/5 backdrop-blur-md"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-ping" />
        <span>Next-Generation Studio</span>
      </div>

      {/* Primary Kinetic Typography Display */}
      <div className="flex flex-col items-center gap-4 max-w-5xl z-10">
        <KineticText
          text="Writing in Markdown..."
          delay={15}
          className="text-6xl font-bold tracking-tight text-neutral-300 md:text-7xl"
        />

        <KineticText
          text="...should feel like pure craft."
          delay={60}
          highlightGradient={true}
          className="text-6xl font-extrabold tracking-tight text-white md:text-7xl"
        />
      </div>

      {/* Outcome Subtitle */}
      <div
        style={{
          opacity: subOpacity,
          transform: `translateY(${subTranslateY}px)`,
        }}
        className="mt-10 flex items-center gap-6 text-sm font-mono text-neutral-400 z-10"
      >
        <span className="flex items-center gap-2">
          <span className="text-emerald-400">●</span> 0ms Local Reads
        </span>
        <span className="text-neutral-700">|</span>
        <span className="flex items-center gap-2">
          <span className="text-brand-400">●</span> Real-Time Math & Diagrams
        </span>
        <span className="text-neutral-700">|</span>
        <span className="flex items-center gap-2">
          <span className="text-sky-400">●</span> Private Gemini Intelligence
        </span>
      </div>
    </div>
  );
};
