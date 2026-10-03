import React, { useState } from 'react';
import {
  Camera,
  Layers,
  Palette,
  AtSign,
  Download,
} from 'lucide-react';
import {
  ClipStudioConfig,
  AspectRatioPreset,
  PRESET_DIMENSIONS,
  TypingCadence,
  CaretStyle,
  RenderProgress,
} from '../types';
import {
  ClipStudioExportPanel,
  ClipStudioFooterActions,
} from './ClipStudioExportPanel';
import {
  ClipStudioStylePanel,
  ClipStudioBrandPanel,
} from './ClipStudioStylePanel';

interface ClipStudioSidebarProps {
  config: ClipStudioConfig;
  setConfig: React.Dispatch<React.SetStateAction<ClipStudioConfig>>;
  onStartExport: () => void;
  onDownloadRaw?: () => void;
  renderProgress: RenderProgress;
  isRendering: boolean;
}

export const ClipStudioSidebar: React.FC<ClipStudioSidebarProps> = ({
  config,
  setConfig,
  onStartExport,
  onDownloadRaw,
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
                    className="w-full accent-brand-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                </div>
              )}

              {config.autoZoomEnabled && (
                <label className="flex items-center justify-between pt-2 border-t border-neutral-800/80 cursor-pointer">
                  <div>
                    <div className="font-semibold text-white text-xs">Click Ripple Rings</div>
                    <div className="text-[10px] text-neutral-400">Pulsing accent ring on click events</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.showClickRipples}
                    onChange={(e) => updateConfig('showClickRipples', e.target.checked)}
                    className="w-4 h-4 accent-brand-500 rounded cursor-pointer"
                  />
                </label>
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

            {/* Caret Style */}
            <div>
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                Caret Blink Style
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['bar', 'block', 'glow'] as CaretStyle[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => updateConfig('caretStyle', st)}
                    className={`py-2 px-2 rounded-xl border text-center font-medium capitalize transition-all cursor-pointer ${
                      config.caretStyle === st
                        ? 'border-sky-500 bg-sky-500/10 text-sky-300 font-semibold'
                        : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AESTHETICS & WINDOW CHROME */}
        {activeTab === 'style' && (
          <ClipStudioStylePanel config={config} updateConfig={updateConfig} />
        )}

        {/* TAB 4: BRANDING & SOCIAL WATERMARK */}
        {activeTab === 'brand' && (
          <ClipStudioBrandPanel config={config} updateConfig={updateConfig} />
        )}

        {/* TAB 5: EXPORT & RENDER */}
        {activeTab === 'export' && (
          <ClipStudioExportPanel
            config={config}
            updateConfig={updateConfig}
            onStartExport={onStartExport}
            onDownloadRaw={onDownloadRaw}
            renderProgress={renderProgress}
            isRendering={isRendering}
          />
        )}
      </div>

      {/* Bottom Export Action Footer */}
      <ClipStudioFooterActions
        onStartExport={onStartExport}
        renderProgress={renderProgress}
        isRendering={isRendering}
      />
    </div>
  );
};
