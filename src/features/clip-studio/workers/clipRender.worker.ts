import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { ClipStudioConfig, PRESET_DIMENSIONS } from '../types';
import { generateGhostTyperSimulation, getTyperStateAt } from '../services/ghostTyperService';
import { CameraEngine, calculateCameraTarget } from '../services/cameraEngine';
import { drawClipStudioFrame } from '../services/clipCanvasRenderer';

self.onmessage = async (event: MessageEvent) => {
  const { type, config, text } = event.data;

  if (type === 'START_RENDER') {
    try {
      await renderClip(config as ClipStudioConfig, text as string);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      self.postMessage({
        type: 'ERROR',
        error: errorMessage || 'Failed to render video',
      });
    }
  }
};

async function renderClip(config: ClipStudioConfig, text: string) {
  const preset = PRESET_DIMENSIONS[config.preset];
  const width = preset.width;
  const height = preset.height;
  const fps = config.format === 'gif' ? 24 : config.fps;

  // 1. Prepare simulation keyframes
  self.postMessage({ type: 'PREPARING', message: 'Generating typing keyframes...' });
  const simulation = generateGhostTyperSimulation(text, config.cadence);
  const totalDurationMs = simulation.totalDurationMs;
  const totalFrames = Math.max(1, Math.ceil((totalDurationMs / 1000) * fps));

  // 2. Setup OffscreenCanvas
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
  if (!ctx) throw new Error('OffscreenCanvas 2D context is unavailable');

  // 3. Setup Camera Engine
  const cameraEngine = new CameraEngine(1.0);
  const dt = 1 / fps;

  if (config.format === 'mp4') {
    if (typeof VideoEncoder === 'undefined') {
      throw new Error('WebCodecs VideoEncoder is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }

    const muxerTarget = new ArrayBufferTarget();
    const muxer = new Muxer({
      target: muxerTarget,
      video: {
        codec: 'avc',
        width,
        height,
      },
      fastStart: 'in-memory',
    });

    let encoderError: Error | null = null;
    const videoEncoder = new VideoEncoder({
      output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
      error: (e) => {
        encoderError = e;
      },
    });

    videoEncoder.configure({
      codec: 'avc1.640028', // H.264 High Profile Level 4.0
      width,
      height,
      bitrate: config.bitrateMbps * 1_000_000,
      framerate: fps,
    });

    // Render frame-by-frame
    for (let frameIdx = 0; frameIdx < totalFrames; frameIdx++) {
      if (encoderError) throw encoderError;

      const timeMs = (frameIdx / fps) * 1000;
      const typerState = getTyperStateAt(simulation, timeMs);
      const isInitialRest = timeMs < 500;
      const isFinalHold = timeMs > totalDurationMs - 1400;

      // Approximate cursor coordinates within card
      const approxCursorX = (typerState.activeCol * 9.6);
      const approxCursorY = (typerState.activeLine * 28);

      const target = calculateCameraTarget({
        autoZoomEnabled: config.autoZoomEnabled,
        zoomScale: config.zoomScale,
        cursorX: approxCursorX,
        cursorY: approxCursorY,
        cardWidth: width - config.padding * 2,
        cardHeight: height - config.padding * 2,
        viewportWidth: width,
        viewportHeight: height,
        isInitialRest,
        isFinalHold,
      });

      const cameraState = cameraEngine.update(target, dt);

      // Draw onto OffscreenCanvas
      drawClipStudioFrame({
        ctx,
        config,
        camera: cameraState,
        currentText: typerState.text,
        activeLine: typerState.activeLine,
        activeCol: typerState.activeCol,
        isKeystroke: typerState.isKeystroke,
        progressPercent: frameIdx / totalFrames,
        canvasWidth: width,
        canvasHeight: height,
        timeMs,
      });

      // Backpressure management: wait if hardware encoder queue is saturated
      while (videoEncoder.encodeQueueSize > 4) {
        await new Promise((r) => setTimeout(r, 10));
      }

      // Cooperative yield every 3 frames to avoid starving worker event loop
      if (frameIdx % 3 === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }

      // Submit frame to WebCodecs
      const timestampMicros = (frameIdx * 1_000_000) / fps;
      const videoFrame = new VideoFrame(canvas, {
        timestamp: timestampMicros,
        duration: 1_000_000 / fps,
      });

      videoEncoder.encode(videoFrame, { keyFrame: frameIdx % (fps * 2) === 0 });
      videoFrame.close();

      // Post progress report every few frames
      if (frameIdx % 4 === 0 || frameIdx === totalFrames - 1) {
        self.postMessage({
          type: 'PROGRESS',
          currentFrame: frameIdx + 1,
          totalFrames,
          percentage: Math.round(((frameIdx + 1) / totalFrames) * 100),
        });
      }
    }

    self.postMessage({ type: 'ENCODING', message: 'Finalizing MP4 container with fast-start...' });
    await videoEncoder.flush();
    muxer.finalize();

    const mp4Blob = new Blob([muxerTarget.buffer], { type: 'video/mp4' });
    self.postMessage({
      type: 'COMPLETE',
      blob: mp4Blob,
      fileName: `${(config.title || 'clip').replace(/[^a-zA-Z0-9_-]/g, '_')}_${config.preset}.mp4`,
      format: 'mp4',
    });
  } else {
    // GIF Export via gifenc
    // For GIF, downscale slightly if full 1080p to keep file size reasonable (~720p)
    const gifScale = width > 1080 ? 0.5 : (width > 800 ? 0.65 : 1.0);
    const gifWidth = Math.round(width * gifScale);
    const gifHeight = Math.round(height * gifScale);

    const gifCanvas = new OffscreenCanvas(gifWidth, gifHeight);
    const gifCtx = gifCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

    const gif = GIFEncoder();
    const frameDelayMs = 1000 / fps;
    let cachedPalette: number[][] | null = null;

    for (let frameIdx = 0; frameIdx < totalFrames; frameIdx++) {
      // Yield every 2 frames to avoid starving the event loop
      if (frameIdx % 2 === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }

      const timeMs = (frameIdx / fps) * 1000;
      const typerState = getTyperStateAt(simulation, timeMs);
      const isInitialRest = timeMs < 500;
      const isFinalHold = timeMs > totalDurationMs - 1400;

      const approxCursorX = (typerState.activeCol * 9.6);
      const approxCursorY = (typerState.activeLine * 28);

      const target = calculateCameraTarget({
        autoZoomEnabled: config.autoZoomEnabled,
        zoomScale: config.zoomScale,
        cursorX: approxCursorX,
        cursorY: approxCursorY,
        cardWidth: width - config.padding * 2,
        cardHeight: height - config.padding * 2,
        viewportWidth: width,
        viewportHeight: height,
        isInitialRest,
        isFinalHold,
      });

      const cameraState = cameraEngine.update(target, dt);

      // Draw full resolution
      drawClipStudioFrame({
        ctx,
        config,
        camera: cameraState,
        currentText: typerState.text,
        activeLine: typerState.activeLine,
        activeCol: typerState.activeCol,
        isKeystroke: typerState.isKeystroke,
        progressPercent: frameIdx / totalFrames,
        canvasWidth: width,
        canvasHeight: height,
        timeMs,
      });

      // Downscale to gifCanvas
      gifCtx.clearRect(0, 0, gifWidth, gifHeight);
      gifCtx.drawImage(canvas, 0, 0, gifWidth, gifHeight);

      const imageData = gifCtx.getImageData(0, 0, gifWidth, gifHeight);
      const { data } = imageData;
      // Quantize palette only on key intervals to prevent CPU locking
      if (!cachedPalette || frameIdx % 8 === 0) {
        cachedPalette = quantize(data, 128);
      }
      const index = applyPalette(data, cachedPalette);

      gif.writeFrame(index, gifWidth, gifHeight, {
        palette: cachedPalette,
        delay: frameDelayMs,
      });

      if (frameIdx % 3 === 0 || frameIdx === totalFrames - 1) {
        self.postMessage({
          type: 'PROGRESS',
          currentFrame: frameIdx + 1,
          totalFrames,
          percentage: Math.round(((frameIdx + 1) / totalFrames) * 100),
        });
      }
    }

    gif.finish();
    const gifBlob = new Blob([gif.bytes()], { type: 'image/gif' });
    self.postMessage({
      type: 'COMPLETE',
      blob: gifBlob,
      fileName: `${(config.title || 'clip').replace(/[^a-zA-Z0-9_-]/g, '_')}_${config.preset}.gif`,
      format: 'gif',
    });
  }
}
