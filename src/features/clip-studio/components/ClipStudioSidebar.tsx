import React, { useState } from 'react';
import {
  Camera,
  Layers,
  Palette,
  AtSign,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  ClipStudioConfig,
  AspectRatioPreset,
  PRESET_DIMENSIONS,
  BackgroundThemeId,
  TypingCadence,
  CaretStyle,
  RenderProgress,
} from '../types';

interface ClipStudioSidebarProps {
  config: ClipStudioConfig;
  setConfig: React.Dispatch<React.SetStateAction<ClipStudioConfig>>;
  onStartExport: () => void;
  renderProgress: RenderProgress;
  isRendering: boolean;
}

const BACKGROUND_OPTIONS: { id: BackgroundThemeId; label: string; previewClass: string }[] = [
  { id: 'raycast-purple', label: 'Raycast Purple', previewClass: 'from-purple-900 via-violet-800 to-indigo-950' },
  { id: 'sunset-glow', label: 'Sunset Glow', previewClass: 'from-stone-900 via-amber-900 to-purple-950' },
  { id: 'hyper-blue', label: 'Hyper Blue', previewClass: 'from-slate-950 via-sky-950 to-blue-800' },
  { id: 'neon-cyber', label: 'Neon Cyber', previewClass: 'from-emerald-950 via-teal-950 to-slate-950' },
  { id: 'aurora-ambient', label: 'Aurora Ambient', previewClass: 'from-indigo-900 via-pink-900 to-slate-950' },
  { id: 'studio-obsidian', label: 'Studio Obsidian', previewClass: 'from-neutral-900 to-black' },
  { id: 'studio-slate', label: 'Studio Slate', previewClass: 'from-slate-900 to-slate-950' },
  { id: 'transparent', label: 'Transparent', previewClass: 'bg-neutral-800 border border-dashed border-neutral-600' },
];

export const ClipStudioSidebar: React.FC<ClipStudioSidebarProps> = ({
  config,
  setConfig,
  onStartExport,
  renderProgress,
  isRendering,
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'camera' | 'style' | 'brand' | 'export'>('preset');

  const updateConfig = <K extends keyof ClipStudioConfig>(key: K, value: ClipStudioConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-80 md:w-96 flex flex-col bg-neutral-900 border-l border-neutral-800 h-full overflow-hidden select-none">
      {/* Tab Navigation */}
      <div className="flex items-center justify-around border-b border-neutral-800 p-2 bg-neutral-950/40">
        <button
          onClick={() => setActiveTab('preset')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
            activeTab === 'preset'
              ? 'bg-neutral-800 text-white shadow-2xs'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
          title="Format & Platform"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Format</span>
        </button>

        <button
          onClick={() => setActiveTab('camera')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
            activeTab === 'camera'
              ? 'bg-neutral-800 text-white shadow-2xs'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
          title="Auto-Zoom & Motion"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Motion</span>
        </button>

        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
            activeTab === 'style'
              ? 'bg-neutral-800 text-white shadow-2xs'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
          title="Aesthetics & Chrome"
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Style</span>
        </button>

        <button
          onClick={() => setActiveTab('brand')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
            activeTab === 'brand'
              ? 'bg-neutral-800 text-white shadow-2xs'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
          title="Branding & Social Handle"
        >
          <AtSign className="w-3.5 h-3.5" />
          <span>Brand</span>
        </button>

        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
            activeTab === 'export'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
          title="Export Video"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-neutral-200 text-xs">
        {/* TAB 1: FORMAT & PRESETS */}
        {activeTab === 'preset' && (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                Platform Preset
              </label>
              <div className="grid grid-cols-1 gap-2">
                {(Object.keys(PRESET_DIMENSIONS) as AspectRatioPreset[]).map((key) => {
                  const p = PRESET_DIMENSIONS[key];
                  const isSelected = config.preset === key;
                  return (
                    <button
                      key={key}
                      onClick={() => updateConfig('preset', key)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-sky-500 bg-sky-500/10 text-white ring-1 ring-sky-500/50'
                          : 'border-neutral-800 bg-neutral-950/40 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-xs text-white">{p.label}</div>
                        <div className="text-[11px] text-neutral-400">{p.sublabel}</div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                        {p.ratio}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                Window Title
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => updateConfig('title', e.target.value)}
                placeholder="untitled.md"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 text-xs focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>
        )}

        {/* TAB 2: CAMERA & MOTION */}
        {activeTab === 'camera' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-neutral-950/40 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Cinematic Auto-Zoom</div>
                  <div className="text-[11px] text-neutral-400">Punches in on active code/caret</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoZoomEnabled}
                  onChange={(e) => updateConfig('autoZoomEnabled', e.target.checked)}
                  className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                />
              </div>

              {config.autoZoomEnabled && (
                <div>
                  <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                    <span>Zoom Scale</span>
                    <span className="font-mono text-sky-400">{config.zoomScale.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={1.1}
                    max={2.0}
                    step={0.1}
                    value={config.zoomScale}
                    onChange={(e) => updateConfig('zoomScale', Number(e.target.value))}
                    className="w-full accent-sky-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Ghost Typer Cadence */}
            <div>
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                Ghost Typer Speed (Cadence)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['human', 'fast', 'blitz'] as TypingCadence[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => updateConfig('cadence', c)}
                    className={`py-2 px-2 rounded-xl border text-center font-medium capitalize transition-all cursor-pointer ${
                      config.cadence === c
                        ? 'border-sky-500 bg-sky-500/10 text-sky-300 font-semibold'
                        : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-neutral-500 mt-1.5">
                Humanized adds organic pauses at commas and punctuation for natural demo clips.
              </p>
            </div>

            {/* Visual Cursor Style */}
            <div>
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                Caret & Cursor Style
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['bar', 'block', 'glow'] as CaretStyle[]).map((style) => (
                  <button
                    key={style}
                    onClick={() => updateConfig('caretStyle', style)}
                    className={`py-1.5 px-2 rounded-xl border text-center capitalize transition-all cursor-pointer ${
                      config.caretStyle === style
                        ? 'border-sky-500 bg-sky-500/10 text-sky-300 font-semibold'
                        : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Keystroke Ripples & Active Line Pill */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/30 border border-neutral-800/80 cursor-pointer">
                <span>Keystroke Ripples</span>
                <input
                  type="checkbox"
                  checked={config.showKeystrokeRipples}
                  onChange={(e) => updateConfig('showKeystrokeRipples', e.target.checked)}
                  className="w-4 h-4 accent-sky-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/30 border border-neutral-800/80 cursor-pointer">
                <span>Active Line Highlight Pill</span>
                <input
                  type="checkbox"
                  checked={config.highlightActiveLine}
                  onChange={(e) => updateConfig('highlightActiveLine', e.target.checked)}
                  className="w-4 h-4 accent-sky-500 rounded"
                />
              </label>
            </div>
          </div>
        )}

        {/* TAB 3: AESTHETICS & WINDOW CHROME */}
        {activeTab === 'style' && (
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
        )}

        {/* TAB 4: BRANDING & SOCIAL WATERMARK */}
        {activeTab === 'brand' && (
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
        )}

        {/* TAB 5: EXPORT & RENDER */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                Export Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateConfig('format', 'mp4')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    config.format === 'mp4'
                      ? 'border-sky-500 bg-sky-500/10 text-white'
                      : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="font-bold text-xs text-white">MP4 Video</div>
                  <div className="text-[10px] text-neutral-400">H.264 Universal 60 FPS</div>
                </button>

                <button
                  onClick={() => updateConfig('format', 'gif')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    config.format === 'gif'
                      ? 'border-sky-500 bg-sky-500/10 text-white'
                      : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="font-bold text-xs text-white">Animated GIF</div>
                  <div className="text-[10px] text-neutral-400">Palette Quantized</div>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950/40 border border-neutral-800 text-[11px] text-neutral-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-neutral-200 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Isolated In-App Render</span>
              </div>
              <p>
                Zero browser tabs, URL bars, or extensions are captured. All frames render off-thread directly into full quality video.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Export Action Footer */}
      <div className="p-4 bg-neutral-950 border-t border-neutral-800 space-y-3">
        {/* Progress Bar when rendering */}
        {isRendering && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-neutral-300">
              <span>{renderProgress.message || 'Rendering...'}</span>
              <span className="font-mono text-sky-400">{renderProgress.percentage}%</span>
            </div>
            <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full transition-all duration-150"
                style={{ width: `${renderProgress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {renderProgress.status === 'complete' && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Download ready: {renderProgress.outputFileName}</span>
          </div>
        )}

        {renderProgress.status === 'error' && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="truncate">{renderProgress.error}</span>
          </div>
        )}

        <button
          onClick={onStartExport}
          disabled={isRendering}
          className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
            isRendering
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-sky-500/20'
          }`}
        >
          {isRendering ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Rendering Frame {renderProgress.currentFrame}/{renderProgress.totalFrames}...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Export {config.format.toUpperCase()} Clip</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
