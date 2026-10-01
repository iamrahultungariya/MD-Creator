import React from 'react';
import { AspectRatioPreset } from '../types';

interface SocialSafeZoneOverlayProps {
  preset: AspectRatioPreset;
  visible: boolean;
}

export const SocialSafeZoneOverlay: React.FC<SocialSafeZoneOverlayProps> = ({ preset, visible }) => {
  if (!visible) return null;

  if (preset === 'reels-9-16') {
    return (
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden text-[10px] font-mono tracking-tight select-none">
        {/* Top App Bar Safe Zone */}
        <div className="absolute top-0 left-0 right-0 h-[10%] border-b border-dashed border-rose-500/40 bg-rose-500/10 flex items-center justify-center text-rose-300">
          <span>Camera Notch & Instagram Header (Avoid Key Text)</span>
        </div>

        {/* Right Interaction Column (Likes, Comments, Audio) */}
        <div className="absolute top-[25%] bottom-[25%] right-0 w-[18%] border-l border-dashed border-amber-500/40 bg-amber-500/10 flex flex-col items-center justify-center text-amber-300 gap-1 text-center p-1">
          <span>Reels UI</span>
          <span>(Likes / Share)</span>
        </div>

        {/* Bottom Caption & Audio Pill Area */}
        <div className="absolute bottom-0 left-0 right-0 h-[22%] border-t border-dashed border-rose-500/40 bg-rose-500/10 flex items-center justify-center text-rose-300 text-center px-4">
          <span>Instagram Caption, User Handle & Audio Pill Zone</span>
        </div>

        {/* Center Golden Safe Zone */}
        <div className="absolute top-[12%] bottom-[24%] left-[6%] right-[20%] border border-emerald-500/30 rounded-xl pointer-events-none flex items-start justify-end p-2 text-emerald-400 font-sans font-semibold text-[11px]">
          <span className="bg-neutral-900/80 px-2 py-0.5 rounded shadow">✓ Golden Content Zone</span>
        </div>
      </div>
    );
  }

  if (preset === 'x-16-9') {
    return (
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden text-[10px] font-mono tracking-tight select-none">
        <div className="absolute inset-[6%] border border-dashed border-sky-500/40 rounded-lg flex items-start justify-end p-2 text-sky-400">
          <span className="bg-neutral-900/80 px-2 py-0.5 rounded shadow">X (Twitter) Feed Safe Area</span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden text-[10px] font-mono tracking-tight select-none">
      <div className="absolute inset-[5%] border border-dashed border-violet-500/40 rounded-lg flex items-start justify-end p-2 text-violet-400">
        <span className="bg-neutral-900/80 px-2 py-0.5 rounded shadow">Feed Card Safe Area</span>
      </div>
    </div>
  );
};
