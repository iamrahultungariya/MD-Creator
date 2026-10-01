import React, { useState, useEffect, useCallback } from 'react';
import { X, Film, Shield, AlertTriangle } from 'lucide-react';
import { ClipStudioConfig, RenderProgress } from '../types';
import { ClipStudioPreview } from './ClipStudioPreview';
import { ClipStudioSidebar } from './ClipStudioSidebar';
import { clipExportService } from '../services/clipExportService';
import { isCurrentUserAdmin } from '../../../utils/adminAuth';

interface ClipStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export const ClipStudioModal: React.FC<ClipStudioModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
}) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
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
    preset: 'reels-9-16',
    title: title || 'untitled.md',
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
    zoomScale: 1.5,
    cameraSmoothness: 0.15,
    mode: 'ghost-typer',
    cadence: 'human',
    showCaret: true,
    caretStyle: 'glow',
    showKeystrokeRipples: true,
    highlightActiveLine: true,
    showWatermark: true,
    handle: '@developer',
    platformBadge: 'instagram',
    watermarkPosition: 'bottom-left',
    showProgressBar: true,
    showSafeZones: false,
    format: 'mp4',
    fps: 60,
    bitrateMbps: 18,
  });

  // Verify Admin Access
  useEffect(() => {
    if (isOpen) {
      isCurrentUserAdmin().then((admin) => {
        setIsAdmin(admin);
      });
    }
  }, [isOpen]);

  // Synchronize document title
  useEffect(() => {
    if (title) {
      setConfig((c) => ({ ...c, title }));
    }
  }, [title]);

  // Handle Export Execution
  const handleStartExport = useCallback(async () => {
    if (isRendering) return;
    setIsRendering(true);
    setIsPlaying(false);

    try {
      const result = await clipExportService.startRender(
        config,
        content || '# Hello World\nWelcome to MD Creator.',
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
      // Don't intercept if user is typing inside an input/textarea
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 md:p-6 animate-in fade-in duration-200">
      <div className="w-full h-full max-w-7xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-100">
        {/* Header Bar */}
        <div className="h-14 border-b border-neutral-800 px-5 flex items-center justify-between bg-neutral-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Social Clip Studio</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-semibold flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>Admin Access</span>
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Isolated 60 FPS recording for Instagram Reels, Threads, & X
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (isRendering) {
                  clipExportService.cancelRender();
                }
                onClose();
              }}
              className="p-2 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {isAdmin === false ? (
          // Unauthorized Screen
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-white">Admin Privileges Required</h3>
              <p className="text-xs text-neutral-400 max-w-sm">
                Social Clip Studio is an administrative-only studio tool. Your current account does not have access.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold cursor-pointer"
            >
              Return to Editor
            </button>
          </div>
        ) : (
          // Admin Authorized Studio
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
            <ClipStudioPreview
              config={config}
              text={content || '# Hello World\nWelcome to MD Creator.'}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
            />

            <ClipStudioSidebar
              config={config}
              setConfig={setConfig}
              onStartExport={handleStartExport}
              renderProgress={renderProgress}
              isRendering={isRendering}
            />
          </div>
        )}
      </div>
    </div>
  );
};
