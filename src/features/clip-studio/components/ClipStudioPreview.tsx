import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Play, Pause, RotateCcw, ShieldAlert, Sparkles, ZoomIn, Video } from 'lucide-react';
import { ClipStudioConfig, PRESET_DIMENSIONS, RecordedClip } from '../types';
import { generateGhostTyperSimulation, getTyperStateAt, TyperSimulation } from '../services/ghostTyperService';
import { CameraEngine, calculateCameraTarget, calculateScreenRecordCameraTarget } from '../services/cameraEngine';
import { drawClipStudioFrame, drawScreenRecordedFrame } from '../services/clipCanvasRenderer';
import { getActionFocusAt } from '../services/actionTracker';
import { SocialSafeZoneOverlay } from './SocialSafeZoneOverlay';

interface ClipStudioPreviewProps {
  config: ClipStudioConfig;
  text: string;
  recordedClip?: RecordedClip | null;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ClipStudioPreview: React.FC<ClipStudioPreviewProps> = ({
  config,
  text,
  recordedClip,
  isPlaying,
  setIsPlaying,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [displayTimeMs, setDisplayTimeMs] = useState(0);

  const isScreenRecording = Boolean(recordedClip && config.sourceType === 'screen-recording');
  const preset = PRESET_DIMENSIONS[config.preset];

  // Pre-generate deterministic typing simulation for ghost-typer mode
  const simulation: TyperSimulation = useMemo(() => {
    return generateGhostTyperSimulation(text, config.cadence);
  }, [text, config.cadence]);

  const totalDurationMs = isScreenRecording
    ? (recordedClip?.durationMs || 5000)
    : (simulation.totalDurationMs || 5000);

  const cameraEngineRef = useRef<CameraEngine>(new CameraEngine(1.0));
  const currentTimeRef = useRef<number>(0);
  const lastUiUpdateRef = useRef<number>(0);

  // Synchronize HTML5 video element with play/pause state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isScreenRecording) return;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, isScreenRecording]);

  // Handle loop and time sync for screen-recorded video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isScreenRecording) return;

    const handleEnded = () => {
      video.currentTime = 0;
      currentTimeRef.current = 0;
      setDisplayTimeMs(0);
      setIsPlaying(false);
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, [isScreenRecording, setIsPlaying]);

  // Main Render Frame callback
  const renderFrameAtTime = useCallback(
    (time: number, dtSeconds: number = 0.016) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const progressPercent = totalDurationMs > 0 ? Math.min(1, time / totalDurationMs) : 0;

      if (isScreenRecording && videoRef.current) {
        const video = videoRef.current;
        const events = recordedClip?.events || [];
        const action = getActionFocusAt(events, time);

        const cardWidth = Math.max(360, preset.width - config.padding * 2);
        const cardHeight = Math.max(240, preset.height - config.padding * 2);

        const target = calculateScreenRecordCameraTarget({
          autoZoomEnabled: config.autoZoomEnabled,
          zoomScale: config.zoomScale,
          normX: action.x,
          normY: action.y,
          isRecentActivity: action.isRecentActivity,
          cardWidth,
          cardHeight,
        });

        const cameraState = cameraEngineRef.current.update(target, dtSeconds);

        drawScreenRecordedFrame({
          ctx,
          config,
          camera: cameraState,
          videoSource: video,
          progressPercent,
          canvasWidth: preset.width,
          canvasHeight: preset.height,
          timeMs: time,
          clickRipple: action.isRecentClick
            ? { x: action.x, y: action.y, ageMs: action.clickAgeMs }
            : null,
        });
      } else {
        // Ghost Typer fallback mode
        const typerState = getTyperStateAt(simulation, time);
        const isInitialRest = time < 500;
        const isFinalHold = time > totalDurationMs - 1400;

        const approxCursorX = typerState.activeCol * 9.6;
        const approxCursorY = typerState.activeLine * 28;

        const target = calculateCameraTarget({
          autoZoomEnabled: config.autoZoomEnabled,
          zoomScale: config.zoomScale,
          cursorX: approxCursorX,
          cursorY: approxCursorY,
          cardWidth: preset.width - config.padding * 2,
          cardHeight: preset.height - config.padding * 2,
          viewportWidth: preset.width,
          viewportHeight: preset.height,
          isInitialRest,
          isFinalHold,
        });

        const cameraState = cameraEngineRef.current.update(target, dtSeconds);

        drawClipStudioFrame({
          ctx,
          config,
          camera: cameraState,
          currentText: typerState.text,
          activeLine: typerState.activeLine,
          activeCol: typerState.activeCol,
          isKeystroke: typerState.isKeystroke,
          progressPercent,
          canvasWidth: preset.width,
          canvasHeight: preset.height,
          timeMs: time,
        });
      }
    },
    [isScreenRecording, recordedClip, totalDurationMs, preset, config, simulation]
  );

  // Playback Animation Loop (Throttled UI updates for 60 FPS smoothness)
  useEffect(() => {
    let animId: number;
    let lastTimestamp = performance.now();

    const loop = (now: number) => {
      const deltaMs = now - lastTimestamp;
      lastTimestamp = now;
      const dtSeconds = Math.min(0.1, deltaMs / 1000);

      if (isScreenRecording && videoRef.current) {
        if (!videoRef.current.paused) {
          currentTimeRef.current = videoRef.current.currentTime * 1000;
        }
      } else if (isPlaying) {
        currentTimeRef.current += deltaMs;
        if (currentTimeRef.current >= totalDurationMs) {
          currentTimeRef.current = totalDurationMs;
          setIsPlaying(false);
        }
      }

      // Draw onto canvas at native 60 FPS
      renderFrameAtTime(currentTimeRef.current, dtSeconds);

      // Throttle React state update for scrubber to ~100ms (10 FPS) to eliminate re-render choking
      if (now - lastUiUpdateRef.current > 100) {
        lastUiUpdateRef.current = now;
        setDisplayTimeMs(Math.round(currentTimeRef.current));
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isScreenRecording, totalDurationMs, renderFrameAtTime, setIsPlaying]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    currentTimeRef.current = val;
    setDisplayTimeMs(val);

    if (isScreenRecording && videoRef.current) {
      videoRef.current.currentTime = val / 1000;
    }
    renderFrameAtTime(val, 0.05);
  };

  const handleRestart = () => {
    cameraEngineRef.current.reset(1.0);
    currentTimeRef.current = 0;
    setDisplayTimeMs(0);

    if (isScreenRecording && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(true);
    renderFrameAtTime(0, 0.05);
  };

  const formatSeconds = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-4 md:p-6 bg-neutral-950/60 overflow-hidden relative select-none">
      {/* Hidden offscreen video source for screen-recording playback */}
      {isScreenRecording && recordedClip?.url && (
        <video
          ref={videoRef}
          src={recordedClip.url}
          playsInline
          muted
          preload="auto"
          className="hidden"
        />
      )}

      {/* Top Info Bar */}
      <div className="w-full flex items-center justify-between px-2 py-1 text-xs text-neutral-400 font-medium">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800/80 border border-neutral-700/60 text-neutral-200">
            {isScreenRecording ? (
              <Video className="w-3.5 h-3.5 text-brand-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{preset.label}</span>
          </span>
          <span className="text-neutral-500 font-mono text-[11px]">
            {preset.width} × {preset.height} px
          </span>
        </div>

        {config.autoZoomEnabled && (
          <div className="flex items-center gap-1 text-brand-300 font-mono text-[11px] bg-brand-950/60 border border-brand-800/60 px-2.5 py-0.5 rounded-full">
            <ZoomIn className="w-3 h-3 text-brand-400" />
            <span>Recordly Zoom {config.zoomScale.toFixed(1)}x</span>
          </div>
        )}
      </div>

      {/* Main Canvas Viewport Area */}
      <div
        ref={containerRef}
        className="flex-1 w-full flex items-center justify-center my-3 relative min-h-0"
      >
        <div
          className="relative max-h-full max-w-full rounded-2xl overflow-hidden shadow-2xl border border-neutral-800/80 flex items-center justify-center bg-black"
          style={{
            aspectRatio: preset.ratio,
          }}
        >
          <canvas
            ref={canvasRef}
            width={preset.width}
            height={preset.height}
            className="w-full h-full object-contain"
          />

          {/* Social Platform Safe Zone Overlay */}
          <SocialSafeZoneOverlay
            preset={config.preset}
            visible={config.showSafeZones}
          />
        </div>
      </div>

      {/* Bottom Scrubber & Playback Controls */}
      <div className="w-full max-w-2xl bg-neutral-900/90 border border-neutral-800/80 backdrop-blur-md rounded-2xl p-3 flex flex-col gap-2.5 shadow-xl">
        {/* Scrubber Slider */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-neutral-400 w-11 text-right">
            {formatSeconds(displayTimeMs)}
          </span>
          <input
            type="range"
            min={0}
            max={totalDurationMs}
            value={displayTimeMs}
            onChange={handleSliderChange}
            className="flex-1 accent-brand-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
          />
          <span className="text-[11px] font-mono text-neutral-500 w-11">
            {formatSeconds(totalDurationMs)}
          </span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-bold flex items-center gap-1.5 text-xs transition-colors shadow-md shadow-brand-500/20 cursor-pointer"
              title="Spacebar to toggle"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="p-2 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-neutral-300 transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="Replay from start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                config.showSafeZones = !config.showSafeZones;
                renderFrameAtTime(currentTimeRef.current);
              }}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                config.showSafeZones
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                  : 'border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Safe Zones</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
