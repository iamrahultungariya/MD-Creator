import React from 'react';
import { interpolate } from 'remotion';

interface MimoDrawerMockProps {
  openProgress?: number; // 0 to 1
  streamingText?: string;
  showMermaid?: boolean;
  userPrompt?: string;
}

export const MimoDrawerMock: React.FC<MimoDrawerMockProps> = ({
  openProgress = 1,
  streamingText = 'Analyzing document structure with Gemini 2.5 Flash Lite... Generating surgical diff hunk and Mermaid architecture diagram.',
  showMermaid = true,
  userPrompt = 'Refactor structure & add offline flow diagram',
}) => {
  // Slide in from right (100% to 0%)
  const translateX = interpolate(openProgress, [0, 1], [100, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        transform: `translateX(${translateX}%)`,
      }}
      className="absolute top-0 right-0 bottom-0 w-[420px] border-l border-neutral-800 bg-neutral-900/95 shadow-[-20px_0_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl flex flex-col z-40 select-none overflow-hidden font-sans"
    >
      {/* Drawer Header */}
      <div className="flex h-12 items-center justify-between border-b border-neutral-800/80 px-4 bg-neutral-950/60">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            M
          </div>
          <span className="font-semibold text-white text-sm">Mimo AI</span>
          <span className="rounded bg-brand-500/10 px-1.5 py-0.5 text-[10px] font-mono text-brand-400 border border-brand-500/20">
            2.5 Flash Lite
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
          <span className="text-[10px] text-emerald-400">180ms</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-hidden text-xs">
        {/* User Request Bubble */}
        <div className="flex flex-col items-end">
          <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-brand-600 px-3.5 py-2.5 text-white font-medium shadow-md">
            {userPrompt}
          </div>
          <span className="text-[10px] text-neutral-500 mt-1 font-mono">Just now</span>
        </div>

        {/* Mimo Assistant Bubble */}
        <div className="flex flex-col items-start space-y-2">
          <div className="max-w-[95%] rounded-2xl rounded-tl-sm border border-neutral-800 bg-neutral-950/80 p-3 text-neutral-200 shadow-sm space-y-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-brand-400">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-ping" />
              <span>Surgical Diff & Flow Generation</span>
            </div>

            <p className="text-neutral-300 leading-relaxed font-sans">
              {streamingText}
            </p>

            {/* Surgical Diff Card */}
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/90 p-2 font-mono text-[11px] space-y-1">
              <div className="text-[10px] text-neutral-500 pb-1 border-b border-neutral-800">
                PROPOSED DIFF (NON-DESTRUCTIVE)
              </div>
              <div className="text-rose-400 bg-rose-950/40 px-1 py-0.5 rounded-sm line-through">
                - static sync logic
              </div>
              <div className="text-emerald-400 bg-emerald-950/40 px-1 py-0.5 rounded-sm font-semibold">
                + local-first Dexie queue + conflict-free sync
              </div>
            </div>

            {/* Rendered Mermaid Card */}
            {showMermaid && (
              <div className="rounded-lg border border-brand-500/30 bg-neutral-950 p-2.5 font-mono text-[11px] text-center space-y-1.5 shadow-sm">
                <span className="text-[9px] uppercase tracking-wider text-brand-400 font-bold block">
                  Interactive Mermaid Topology
                </span>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <div className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-[10px] text-white">
                    Client UI
                  </div>
                  <span className="text-brand-400">➔</span>
                  <div className="rounded border border-emerald-700 bg-emerald-950/70 px-2 py-1 text-[10px] text-emerald-300 font-semibold">
                    IndexedDB
                  </div>
                  <span className="text-brand-400">➔</span>
                  <div className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-[10px] text-white">
                    Cloud
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Drawer Trigger in bottom right */}
      <div className="border-t border-neutral-800/80 p-3 bg-neutral-950/90 flex items-center justify-between">
        <span className="text-[11px] text-neutral-500 font-mono">Tokens: 142 / 8,192</span>
        <button className="rounded-md bg-emerald-600 hover:bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow-sm transition-colors">
          Accept Diff
        </button>
      </div>
    </div>
  );
};
