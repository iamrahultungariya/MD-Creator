import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { AmbientBackground } from '../components/AmbientBackground';
import { WindowFrame } from '../components/WindowFrame';
import { EditorMock } from '../components/EditorMock';
import { useAutoType } from '../components/AutoTypingEngine';

const FULL_DEMO_CODE = `# Q3 Architecture Plan

Optimized for **zero latency** and offline persistence.

$$\\mathcal{L}_{total} = \\lambda_1 \\mathcal{L}_{recon} + \\lambda_2 \\mathcal{L}_{kl}$$

- [x] IndexedDB Dexie Cache (0ms)
- [x] Gemini 2.5 Flash Lite Streaming
- [ ] Export to PDF & DOCX`;

export const Scene2EditorDemo: React.FC = () => {
  const frame = useCurrentFrame();

  // Entrance and exit opacity
  const sceneOpacity = interpolate(frame, [0, 20, 560, 600], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Camera scale: subtle cinematic push-in
  const cameraScale = interpolate(frame, [0, 600], [0.98, 1.02], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Auto-typing progress
  const { displayedText } = useAutoType(FULL_DEMO_CODE, 25, 0.75);

  return (
    <div
      style={{ opacity: sceneOpacity }}
      className="relative flex h-full w-full items-center justify-center bg-neutral-950 p-12 select-none overflow-hidden"
    >
      <AmbientBackground primaryGlowColor="#6366f1" secondaryGlowColor="#8257F5" />

      {/* Main Studio Window Frame (Flat, Crisp, Distraction-Free) */}
      <div
        style={{ transform: `scale(${cameraScale})` }}
        className="w-full max-w-6xl h-[620px] z-10 transition-transform"
      >
        <WindowFrame
          title="Architecture-Overview.md"
          subtitle="Real-Time KaTeX & Markdown Engine"
          delay={5}
        >
          <EditorMock typedCode={displayedText} showPreview={true} />
        </WindowFrame>
      </div>

      {/* Floating Bottom Badge */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-full border border-neutral-800 bg-neutral-900/90 px-4 py-1.5 text-xs text-neutral-300 font-mono shadow-xl backdrop-blur-md">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Dual-Pane CodeMirror & KaTeX Typeset Synced at 60 FPS</span>
      </div>
    </div>
  );
};
