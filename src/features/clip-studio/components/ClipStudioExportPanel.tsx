import React from 'react';
import { Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ClipStudioConfig, RenderProgress } from '../types';

interface ClipStudioExportPanelProps {
  config: ClipStudioConfig;
  updateConfig: <K extends keyof ClipStudioConfig>(key: K, value: ClipStudioConfig[K]) => void;
  onStartExport: () => void;
  onDownloadRaw?: () => void;
  renderProgress: RenderProgress;
  isRendering: boolean;
}

export const ClipStudioExportPanel: React.FC<ClipStudioExportPanelProps> = ({
  config,
  updateConfig,
  onDownloadRaw,
}) => {
  return (
    <div className="space-y-4">
      {config.sourceType === 'screen-recording' && onDownloadRaw && (
        <div className="p-3.5 rounded-xl bg-brand-950/40 border border-brand-800/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-bold text-xs text-brand-300">Instant Raw Video</div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-semibold">
              0s / Direct
            </span>
          </div>
          <p className="text-[11px] text-neutral-300">
            Instantly download the raw recorded video directly without re-rendering or waiting.
          </p>
          <button
            type="button"
            onClick={onDownloadRaw}
            className="w-full py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand-500/20 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Raw Video (Instant)</span>
          </button>
        </div>
      )}

      <div>
        <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
          Export Format
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateConfig('format', 'mp4')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              config.format === 'mp4'
                ? 'border-brand-500 bg-brand-500/10 text-white'
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
                ? 'border-brand-500 bg-brand-500/10 text-white'
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
          <span>Non-Blocking Studio Pipeline</span>
        </div>
        <p>
          Zero browser tabs, URL bars, or taskbars are captured. Enhanced frames render with hardware acceleration and backpressure control so your browser never freezes.
        </p>
      </div>
    </div>
  );
};

export const ClipStudioFooterActions: React.FC<{
  onStartExport: () => void;
  renderProgress: RenderProgress;
  isRendering: boolean;
}> = ({ onStartExport, renderProgress, isRendering }) => {
  return (
    <div className="p-4 bg-neutral-950 border-t border-neutral-800 space-y-3">
      {/* Progress Bar when rendering */}
      {isRendering && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-neutral-300">
            <span>{renderProgress.message || 'Rendering...'}</span>
            <span className="font-mono text-brand-400">{renderProgress.percentage}%</span>
          </div>
          <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-500 to-indigo-500 h-full transition-all duration-150"
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
            : 'bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white shadow-brand-500/25'
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
            <span>Export Framed & Zoomed Clip</span>
          </>
        )}
      </button>
    </div>
  );
};
