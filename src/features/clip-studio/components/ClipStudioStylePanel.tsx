import React from 'react';
import { ClipStudioConfig, BackgroundThemeId } from '../types';

export const BACKGROUND_OPTIONS: { id: BackgroundThemeId; label: string; previewClass: string }[] = [
  { id: 'raycast-purple', label: 'Raycast Purple', previewClass: 'from-purple-900 via-violet-800 to-indigo-950' },
  { id: 'sunset-glow', label: 'Sunset Glow', previewClass: 'from-stone-900 via-amber-900 to-purple-950' },
  { id: 'hyper-blue', label: 'Hyper Blue', previewClass: 'from-slate-950 via-sky-950 to-blue-800' },
  { id: 'neon-cyber', label: 'Neon Cyber', previewClass: 'from-emerald-950 via-teal-950 to-slate-950' },
  { id: 'aurora-ambient', label: 'Aurora Ambient', previewClass: 'from-indigo-900 via-pink-900 to-slate-950' },
  { id: 'studio-obsidian', label: 'Studio Obsidian', previewClass: 'from-neutral-900 to-black' },
  { id: 'studio-slate', label: 'Studio Slate', previewClass: 'from-slate-900 to-slate-950' },
  { id: 'transparent', label: 'Transparent', previewClass: 'bg-neutral-800 border border-dashed border-neutral-600' },
];

interface ClipStudioStylePanelProps {
  config: ClipStudioConfig;
  updateConfig: <K extends keyof ClipStudioConfig>(key: K, value: ClipStudioConfig[K]) => void;
}

export const ClipStudioStylePanel: React.FC<ClipStudioStylePanelProps> = ({
  config,
  updateConfig,
}) => {
  return (
    <div className="space-y-4">
      {/* Studio Backgrounds */}
      <div>
        <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
          Studio Background
        </label>
        <div className="grid grid-cols-2 gap-2">
          {BACKGROUND_OPTIONS.map((bg) => {
            const isSelected = config.background === bg.id;
            return (
              <button
                key={bg.id}
                onClick={() => updateConfig('background', bg.id)}
                className={`p-2 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-sky-500 bg-sky-500/10 text-white'
                    : 'border-neutral-800 bg-neutral-950/40 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${bg.previewClass} shadow-xs shrink-0`} />
                <span className="text-[11px] truncate font-medium">{bg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Window Chrome Settings */}
      <div className="space-y-3 pt-2">
        <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/30 border border-neutral-800/80 cursor-pointer">
          <span>macOS Traffic Lights</span>
          <input
            type="checkbox"
            checked={config.showMacButtons}
            onChange={(e) => updateConfig('showMacButtons', e.target.checked)}
            className="w-4 h-4 accent-sky-500 rounded"
          />
        </label>

        <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/30 border border-neutral-800/80 cursor-pointer">
          <span>Window Drop Shadow</span>
          <input
            type="checkbox"
            checked={config.showDropShadow}
            onChange={(e) => updateConfig('showDropShadow', e.target.checked)}
            className="w-4 h-4 accent-sky-500 rounded"
          />
        </label>

        {/* Shadow Depth Slider */}
        {config.showDropShadow && (
          <div>
            <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
              <span>Shadow Depth</span>
              <span className="font-mono text-neutral-300">{config.shadowDepth}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              value={config.shadowDepth}
              onChange={(e) => updateConfig('shadowDepth', Number(e.target.value))}
              className="w-full accent-sky-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>
        )}

        {/* Padding & Corner Radius */}
        <div>
          <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
            <span>Card Padding</span>
            <span className="font-mono text-neutral-300">{config.padding}px</span>
          </div>
          <input
            type="range"
            min={20}
            max={70}
            value={config.padding}
            onChange={(e) => updateConfig('padding', Number(e.target.value))}
            className="w-full accent-sky-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* 3D Isometric Perspective Tilt */}
        <div className="pt-2 border-t border-neutral-800/80 space-y-2">
          <div className="font-semibold text-white text-[11px]">3D Isometric Perspective</div>
          <div>
            <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
              <span>X Tilt</span>
              <span className="font-mono text-neutral-300">{config.tiltX}°</span>
            </div>
            <input
              type="range"
              min={-12}
              max={12}
              value={config.tiltX}
              onChange={(e) => updateConfig('tiltX', Number(e.target.value))}
              className="w-full accent-sky-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
              <span>Y Tilt</span>
              <span className="font-mono text-neutral-300">{config.tiltY}°</span>
            </div>
            <input
              type="range"
              min={-12}
              max={12}
              value={config.tiltY}
              onChange={(e) => updateConfig('tiltY', Number(e.target.value))}
              className="w-full accent-sky-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ClipStudioBrandPanel: React.FC<ClipStudioStylePanelProps> = ({
  config,
  updateConfig,
}) => {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-neutral-950/40 border border-neutral-800 space-y-3">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <div className="font-semibold text-white">Social Handle Watermark</div>
            <div className="text-[11px] text-neutral-400">Displays custom badge on clip</div>
          </div>
          <input
            type="checkbox"
            checked={config.showWatermark}
            onChange={(e) => updateConfig('showWatermark', e.target.checked)}
            className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
          />
        </label>

        {config.showWatermark && (
          <div className="space-y-3 pt-2 border-t border-neutral-800">
            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Your Handle</label>
              <input
                type="text"
                value={config.handle}
                onChange={(e) => updateConfig('handle', e.target.value)}
                placeholder="@rahul_dev"
                className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 text-xs focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Platform Badge</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['instagram', 'threads', 'x'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => updateConfig('platformBadge', p)}
                    className={`py-1.5 px-2 rounded-xl border text-center capitalize transition-all cursor-pointer ${
                      config.platformBadge === p
                        ? 'border-sky-500 bg-sky-500/10 text-sky-300 font-semibold'
                        : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Progress Bar */}
      <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/40 border border-neutral-800 cursor-pointer">
        <div>
          <div className="font-semibold text-white">Bottom Progress Line</div>
          <div className="text-[11px] text-neutral-400">Sleek timer line at video bottom</div>
        </div>
        <input
          type="checkbox"
          checked={config.showProgressBar}
          onChange={(e) => updateConfig('showProgressBar', e.target.checked)}
          className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
        />
      </label>
    </div>
  );
};
