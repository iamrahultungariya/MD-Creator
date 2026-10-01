import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Play, Pause, RotateCcw, ShieldAlert, Sparkles, ZoomIn } from 'lucide-react';
import { ClipStudioConfig, PRESET_DIMENSIONS } from '../types';
import { generateGhostTyperSimulation, getTyperStateAt, TyperSimulation } from '../services/ghostTyperService';
import { CameraEngine, calculateCameraTarget } from '../services/cameraEngine';
import { drawClipStudioFrame } from '../services/clipCanvasRenderer';
import { SocialSafeZoneOverlay } from './SocialSafeZoneOverlay';

interface ClipStudioPreviewProps {
  config: ClipStudioConfig;
  text: string;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ClipStudioPreview: React.FC<ClipStudioPreviewProps> = ({
  config,
  text,
  isPlaying,
  setIsPlaying,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);

  const preset = PRESET_DIMENSIONS[config.preset];

  // Pre-generate deterministic typing simulation
  const simulation: TyperSimulation = useMemo(() => {
    return generateGhostTyperSimulation(text, config.cadence);
  }, [text, config.cadence]);

  const totalDurationMs = simulation.totalDurationMs || 5000;
  const cameraEngineRef = useRef<CameraEngine>(new CameraEngine(1.0));

  // Render current frame
  const renderFrameAtTime = useCallback(
    (time: number, dtSeconds: number = 0.016) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

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
        progressPercent: time / totalDurationMs,
        canvasWidth: preset.width,
        canvasHeight: preset.height,
        timeMs: time,
      });
    },
    [simulation, config, preset, totalDurationMs]
  );

  // Playback Animation Loop
  useEffect(() => {
    let animId: number;
    let lastTimestamp = performance.now();

    const loop = (now: number) => {
      const deltaMs = now - lastTimestamp;
      lastTimestamp = now;

      if (isPlaying) {
        setCurrentTimeMs((prev) => {
          const next = prev + deltaMs;
          if (next >= totalDurationMs) {
            setIsPlaying(false);
            return totalDurationMs;
          }
          return next;
        });
      }

      renderFrameAtTime(currentTimeMs, deltaMs / 1000);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, currentTimeMs, totalDurationMs, renderFrameAtTime, setIsPlaying]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTimeMs(val);
    renderFrameAtTime(val, 0.05);
  };

  const handleRestart = () => {
    cameraEngineRef.current.reset(1.0);
    setCurrentTimeMs(0);
    renderFrameAtTime(0, 0.05);
    setIsPlaying(true);
  };

  const formatSeconds = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-4 md:p-6 bg-neutral-950/60 overflow-hidden relative select-none">
      {/* Top Info Bar */}
      <div className="w-full flex items-center justify-between px-2 py-1 text-xs text-neutral-400 font-medium">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800/80 border border-neutral-700/60 text-neutral-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{preset.label}</span>
          </span>
          <span className="text-neutral-500 font-mono text-[11px]">
            {preset.width} × {preset.height} px
          </span>
        </div>

        {config.autoZoomEnabled && (
          <div className="flex items-center gap-1 text-sky-400 font-mono text-[11px] bg-sky-950/50 border border-sky-800/60 px-2 py-0.5 rounded-md">
            <ZoomIn className="w-3 h-3" />
            <span>Auto-Zoom {config.zoomScale.toFixed(1)}x</span>
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
            {formatSeconds(currentTimeMs)}
          </span>
          <input
            type="range"
            min={0}
            max={totalDurationMs}
            value={currentTimeMs}
            onChange={handleSliderChange}
            className="flex-1 accent-sky-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
          />
          <span className="text-[11px] font-mono text-neutral-500 w-11">
            {formatSeconds(totalDurationMs)}
          </span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="p-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold flex items-center gap-1.5 text-xs transition-colors shadow cursor-pointer"
              title="Spacebar to toggle"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
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
              onClick={() => {
                // Toggle safe zone guides
                config.showSafeZones = !config.showSafeZones;
                renderFrameAtTime(currentTimeMs);
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
