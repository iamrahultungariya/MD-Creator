import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { AmbientBackground } from '../components/AmbientBackground';
import { motionimoSpring } from '../utils/springs';

export const Scene5Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo entrance
  const logoSpring = motionimoSpring(frame, fps, 10);
  const logoScale = interpolate(logoSpring, [0, 1], [0.8, 1]);
  const logoOpacity = interpolate(logoSpring, [0, 1], [0, 1]);

  // Title entrance
  const titleSpring = motionimoSpring(frame, fps, 30);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);
  const titleTranslateY = interpolate(titleSpring, [0, 1], [20, 0]);

  // CTA button entrance
  const ctaSpring = motionimoSpring(frame, fps, 65);
  const ctaOpacity = interpolate(ctaSpring, [0, 1], [0, 1]);
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.9, 1]);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center bg-neutral-950 px-8 text-center font-sans select-none overflow-hidden">
      <AmbientBackground primaryGlowColor="#8257F5" secondaryGlowColor="#38bdf8" />

      {/* Emblem Logo */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
        }}
        className="relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl border border-brand-500/40 bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 shadow-[0_0_60px_rgba(130,87,245,0.4)]"
      >
        <span className="font-mono text-4xl font-extrabold text-white tracking-tighter">
          MD
        </span>
      </div>

      {/* Brand Title and Tagline */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleTranslateY}px)`,
        }}
        className="mt-8 z-10 space-y-3"
      >
        <h1 className="text-6xl font-extrabold tracking-tight text-white md:text-7xl">
          MD Writer <span className="text-brand-400 font-mono text-4xl">v2.3</span>
        </h1>
        <p className="text-xl text-neutral-400 font-medium max-w-xl mx-auto">
          The High-Density, Local-First Markdown Studio.
        </p>
      </div>

      {/* Interactive CTA Pill */}
      <div
        style={{
          opacity: ctaOpacity,
          transform: `scale(${ctaScale})`,
        }}
        className="mt-10 z-10 flex flex-col items-center gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="rounded-xl border border-brand-500 bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-[0_0_35px_rgba(130,87,245,0.4)]">
            Start Writing Free
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 px-6 py-3.5 text-base font-semibold text-neutral-300">
            Star on GitHub ★
          </div>
        </div>

        {/* URL Pill */}
        <div className="mt-4 rounded-full border border-neutral-800/80 bg-neutral-900/60 px-5 py-1.5 font-mono text-xs text-neutral-400">
          https://writermd.vercel.app
        </div>
      </div>
    </div>
  );
};
