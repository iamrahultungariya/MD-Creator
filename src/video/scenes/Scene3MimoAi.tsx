import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { AmbientBackground } from '../components/AmbientBackground';
import { WindowFrame } from '../components/WindowFrame';
import { EditorMock } from '../components/EditorMock';
import { MimoDrawerMock } from '../components/MimoDrawerMock';
import { AnimatedCursor, CursorKeyframe } from '../components/AnimatedCursor';
import { motionimoSpring } from '../utils/springs';

const CURSOR_PATH: CursorKeyframe[] = [
  { frame: 10, x: 25, y: 70 },
  { frame: 70, x: 74, y: 22 },
  { frame: 80, x: 74, y: 22, click: true }, // Click "Ask Mimo" trigger
  { frame: 140, x: 68, y: 35 },
  { frame: 360, x: 78, y: 88 },
  { frame: 380, x: 78, y: 88, click: true }, // Click "Accept Diff"
  { frame: 440, x: 60, y: 75 },
];

export const Scene3MimoAi: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance and exit opacity
  const sceneOpacity = interpolate(frame, [0, 20, 570, 600], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Drawer slide-in starts after first click at frame 80
  const drawerSpring = motionimoSpring(frame, fps, 80);
  const openProgress = interpolate(drawerSpring, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Streaming text calculation
  const fullStream = 'Analyzing structure with Gemini 2.5 Flash Lite... Rebalancing token weights and rendering interactive Mermaid diagram.';
  const streamCharCount = Math.min(
    fullStream.length,
    Math.max(0, Math.floor((frame - 110) * 0.9))
  );
  const streamedSlice = fullStream.slice(0, streamCharCount);

  return (
    <div
      style={{ opacity: sceneOpacity }}
      className="relative flex h-full w-full items-center justify-center bg-neutral-950 p-12 select-none overflow-hidden"
    >
      <AmbientBackground primaryGlowColor="#8257F5" secondaryGlowColor="#10b981" />

      {/* Main Studio Window Frame */}
      <div className="w-full max-w-6xl h-[620px] z-10 relative">
        <WindowFrame
          title="Architecture-Overview.md"
          subtitle="Mimo AI Private Agent Active"
          delay={0}
        >
          <EditorMock showPreview={true} />

          {/* Sliding Mimo AI Assistant Drawer */}
          <MimoDrawerMock
            openProgress={openProgress}
            streamingText={streamedSlice}
            showMermaid={frame >= 210}
            userPrompt="Refactor structure & add offline topology diagram"
          />

          {/* Top-Right Mimo Trigger Button inside Window */}
          <div className="absolute top-2 right-4 z-30">
            <button className="flex items-center gap-1.5 rounded-md border border-brand-500/40 bg-brand-600/30 px-3 py-1 text-xs font-semibold text-brand-300 backdrop-blur-md shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              <span>Ask Mimo ⌘K</span>
            </button>
          </div>
        </WindowFrame>

        {/* Animated Mouse Cursor */}
        <AnimatedCursor points={CURSOR_PATH} />
      </div>

      {/* Floating Bottom Badge */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-full border border-neutral-800 bg-neutral-900/90 px-4 py-1.5 text-xs text-neutral-300 font-mono shadow-xl backdrop-blur-md">
        <span className="h-2 w-2 rounded-full bg-brand-400 animate-ping" />
        <span>Gemini 2.5 Flash Lite • Surgical Non-Destructive Diffing</span>
      </div>
    </div>
  );
};
