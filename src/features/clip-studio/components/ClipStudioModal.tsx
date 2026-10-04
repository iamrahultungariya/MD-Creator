import React, { useState, useEffect, useCallback } from 'react';
import { X, Film, Video, Sparkles, Download } from 'lucide-react';
import { ClipStudioConfig, RecordedClip, RenderProgress } from '../types';
import { ClipStudioPreview } from './ClipStudioPreview';
import { ClipStudioSidebar } from './ClipStudioSidebar';
import { clipExportService } from '../services/clipExportService';

interface ClipStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  content?: string;
  recordedClip?: RecordedClip | null;
}

export const ClipStudioModal: React.FC<ClipStudioModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  recordedClip,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState<RenderProgress>({
    status: 'idle',
    currentFrame: 0,
    totalFrames: 0,
    percentage: 0,
  });

  // Studio Configuration State
  const [config, setConfig] = useState<ClipStudioConfig>({
    sourceType: recordedClip ? 'screen-recording' : 'ghost-typer',
    preset: 'reels-9-16',
    title: title || 'MD Writer',
    showMacButtons: true,
    showDropShadow: true,
    shadowDepth: 35,
    cornerRadius: 18,
    padding: 36,
    tiltX: 0,
    tiltY: 0,
    background: 'raycast-purple',
    theme: 'one-dark',
    autoZoomEnabled: true,
    zoomScale: 1.4,
    cameraSmoothness: 0.15,
    showClickRipples: true,
    mode: 'ghost-typer',
    cadence: 'human',
    showCaret: true,
    caretStyle: 'glow',
    showKeystrokeRipples: true,
    highlightActiveLine: true,
    showWatermark: true,
    handle: '@rahul_dev',
    platformBadge: 'x',
    watermarkPosition: 'bottom-left',
    showProgressBar: true,
    showSafeZones: false,
    format: 'mp4',
    fps: 60,
    bitrateMbps: 18,
  });

  // Synchronize source type and title when props update
  useEffect(() => {
    if (recordedClip) {
      setConfig((c) => ({
        ...c,
        sourceType: 'screen-recording',
        title: title || 'MD Writer Recording',
      }));
    } else if (title) {
      setConfig((c) => ({ ...c, title }));
    }
  }, [recordedClip, title]);

  // Handle Raw Video Instant Download
  const handleDownloadRaw = useCallback(() => {
    if (!recordedClip?.blob) return;
    const isMp4 = recordedClip.blob.type.includes('mp4');
    const ext = isMp4 ? 'mp4' : 'webm';
    const fileName = `${(config.title || 'recording').replace(/[^a-zA-Z0-9_-]/g, '_')}_raw.${ext}`;
    clipExportService.downloadBlob(recordedClip.blob, fileName);
  }, [recordedClip, config.title]);

  // Handle Export Execution
  const handleStartExport = useCallback(async () => {
    if (isRendering) return;
    setIsRendering(true);
    setIsPlaying(false);

    try {
      const result = await clipExportService.startRender(
        config,
        content || '# Hello World\nWelcome to MD Writer.',
        (progress) => {
          setRenderProgress(progress);
        }
      );

      // Auto-trigger download
      clipExportService.downloadBlob(result.blob, result.fileName);
    } catch (err) {
      console.error('[ClipStudio] Export error:', err);
    } finally {
      setIsRendering(false);
    }
  }, [config, content, isRendering]);

  // Global keydown within modal (Space to play/pause, Esc to close)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (isRendering) {
          clipExportService.cancelRender();
          setIsRendering(false);
        }
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isRendering, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-2 md:p-6 animate-in fade-in duration-200 font-sans">
      <div className="w-full h-full max-w-7xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl flex flex-col overflow-hidden text-neutral-100 font-sans">
        {/* Header Bar */}
        <div className="h-14 border-b border-neutral-800 px-5 flex items-center justify-between bg-neutral-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-2xs shadow-brand-500/20">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Social Clip Studio</span>
                <span className="px-2 py-0.5 rounded-md bg-brand-500/10 border border-brand-500/30 text-brand-300 font-mono text-[10px] font-semibold flex items-center gap-1">
                  <span>Recordly Engine</span>
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Smooth auto-zoom, studio framing, and non-blocking 60 FPS export
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs (if both recorded video and text are present) */}
          <div className="hidden sm:flex items-center p-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs">
            <button
              type="button"
              onClick={() => setConfig((c) => ({ ...c, sourceType: 'screen-recording' }))}
              disabled={!recordedClip}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                config.sourceType === 'screen-recording'
                  ? 'bg-brand-600 text-white shadow-2xs'
                  : recordedClip
                  ? 'text-neutral-400 hover:text-white cursor-pointer'
                  : 'text-neutral-600 cursor-not-allowed'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Screen Recording</span>
            </button>
            <button
              type="button"
              onClick={() => setConfig((c) => ({ ...c, sourceType: 'ghost-typer' }))}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                config.sourceType === 'ghost-typer'
                  ? 'bg-brand-600 text-white shadow-2xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Markdown Auto-Typer</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {recordedClip && (
              <button
                type="button"
                onClick={handleDownloadRaw}
                className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-neutral-200 text-xs font-medium transition-colors cursor-pointer"
                title="Download raw capture without re-encoding"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Raw Download</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (isRendering) {
                  clipExportService.cancelRender();
                }
                onClose();
              }}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          <ClipStudioPreview
            config={config}
            text={content || '# Hello World\nWelcome to MD Writer.'}
            recordedClip={recordedClip}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />

          <ClipStudioSidebar
            config={config}
            setConfig={setConfig}
            onStartExport={handleStartExport}
            onDownloadRaw={handleDownloadRaw}
            renderProgress={renderProgress}
            isRendering={isRendering}
          />
        </div>
      </div>
    </div>
  );
};
