import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { AmbientBackground } from '../components/AmbientBackground';
import { motionimoSpring } from '../utils/springs';

interface BlitzCardProps {
  number: string;
  title: string;
  tagline: string;
  metric: string;
  badge: string;
  delay: number;
}

const BlitzCard: React.FC<BlitzCardProps> = ({
  number,
  title,
  tagline,
  metric,
  badge,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const springVal = motionimoSpring(frame, fps, delay);
  const opacity = interpolate(springVal, [0, 1], [0, 1]);
  const translateY = interpolate(springVal, [0, 1], [40, 0]);
  const scale = interpolate(springVal, [0, 1], [0.92, 1.0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
      }}
      className="flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/80 p-8 shadow-2xl backdrop-blur-xl hover:border-neutral-700 transition-colors"
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-bold text-neutral-500">{number}</span>
          <span className="rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-[11px] font-mono font-medium text-brand-400">
            {badge}
          </span>
        </div>
        <h3 className="mt-6 text-2xl font-bold tracking-tight text-white">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-neutral-400">{tagline}</p>
      </div>

      <div className="mt-8 pt-4 border-t border-neutral-800/80 flex items-center justify-between">
        <span className="font-mono text-xs text-neutral-500">BENCHMARK</span>
        <span className="font-mono text-sm font-semibold text-emerald-400">{metric}</span>
      </div>
    </div>
  );
};

export const Scene4FeatureBlitz: React.FC = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 20, 450, 480], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{ opacity: sceneOpacity }}
      className="relative flex h-full w-full flex-col items-center justify-center bg-neutral-950 p-12 select-none overflow-hidden font-sans"
    >
      <AmbientBackground primaryGlowColor="#3b82f6" secondaryGlowColor="#8257F5" />

      {/* Header */}
      <div className="text-center z-10 mb-12">
        <span className="rounded-full border border-neutral-800 bg-neutral-900/80 px-4 py-1.5 text-xs font-mono text-neutral-400 tracking-widest uppercase">
          Precision Engineering
        </span>
        <h2 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          Built for High-Velocity Thinking
        </h2>
      </div>

      {/* 3 Staggered Feature Cards */}
      <div className="grid grid-cols-3 gap-6 w-full max-w-6xl z-10">
        <BlitzCard
          number="01"
          badge="LOCAL-FIRST"
          title="IndexedDB Architecture"
          tagline="Instant startup with zero cloud delay. Your writing stays private on your machine."
          metric="0.0 ms Read Latency"
          delay={20}
        />
        <BlitzCard
          number="02"
          badge="NATIVE TYPESETTING"
          title="KaTeX & Mermaid Native"
          tagline="Complex math equations and flowcharts render synchronously side-by-side as you type."
          metric="60 FPS Live Sync"
          delay={50}
        />
        <BlitzCard
          number="03"
          badge="ZERO LOCK-IN"
          title="Universal Clean Export"
          tagline="One-click publication to styled PDF, Word DOCX, standalone HTML, and raw Markdown."
          metric="100% Data Ownership"
          delay={80}
        />
      </div>
    </div>
  );
};
