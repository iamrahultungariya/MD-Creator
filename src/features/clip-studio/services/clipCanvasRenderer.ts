import { ClipStudioConfig } from '../types';
import { CameraState } from './cameraEngine';
import {
  AnyCanvasContext,
  roundRect,
  drawSyntaxLine,
  drawWatermark,
  drawBottomProgressBar,
  drawBackground,
} from './clipCanvasPrimitives';

export type { AnyCanvasContext };
export { roundRect };

export interface RenderFrameParams {
  ctx: AnyCanvasContext;
  config: ClipStudioConfig;
  camera: CameraState;
  currentText: string;
  activeLine: number;
  activeCol: number;
  isKeystroke: boolean;
  progressPercent: number; // 0 to 1
  canvasWidth: number;
  canvasHeight: number;
  timeMs: number;
}

/**
 * Universal canvas renderer for both Live Preview and Background Web Worker.
 * Ensures 100% visual parity between preview and final exported video.
 */
export function drawClipStudioFrame(params: RenderFrameParams) {
  const {
    ctx,
    config,
    camera,
    currentText,
    activeLine,
    activeCol,
    progressPercent,
    canvasWidth,
    canvasHeight,
    timeMs,
  } = params;

  ctx.save();
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 1. Draw Background
  drawBackground(ctx, config.background, canvasWidth, canvasHeight, timeMs);

  // 2. Camera Transform & 3D Perspective Tilt
  ctx.save();
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  // Center camera origin
  ctx.translate(centerX + camera.x, centerY + camera.y);
  ctx.scale(camera.scale, camera.scale);

  // Apply subtle 3D isometric perspective tilt via shear/scale
  if (config.tiltX !== 0 || config.tiltY !== 0) {
    const radX = (config.tiltX * Math.PI) / 180;
    const radY = (config.tiltY * Math.PI) / 180;
    // Simple 2.5D skew/perspective approximation
    ctx.transform(1, Math.tan(radY) * 0.35, Math.tan(radX) * 0.35, 1, 0, 0);
  }

  // Calculate Card Size based on preset dimensions & padding
  const cardPadding = config.padding * 2;
  const cardWidth = Math.max(480, canvasWidth - cardPadding);
  const cardHeight = Math.max(380, canvasHeight - cardPadding);
  const cardX = -cardWidth / 2;
  const cardY = -cardHeight / 2;

  // 3. Draw Window Drop Shadow
  if (config.showDropShadow && config.shadowDepth > 0) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = config.shadowDepth * 1.5;
    ctx.shadowOffsetY = config.shadowDepth * 0.8;
    ctx.fillStyle = '#1e1e2e';
    roundRect(ctx, cardX, cardY, cardWidth, cardHeight, config.cornerRadius);
    ctx.fill();
    ctx.restore();
  }

  // 4. Draw Window Background Card
  ctx.save();
  roundRect(ctx, cardX, cardY, cardWidth, cardHeight, config.cornerRadius);
  ctx.clip();

  // Theme background color
  const isDark = config.theme !== 'github-light';
  ctx.fillStyle = isDark ? '#141419' : '#ffffff';
  ctx.fillRect(cardX, cardY, cardWidth, cardHeight);

  // Window Border / Glass highlight
  ctx.lineWidth = 1;
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
  ctx.stroke();

  // 5. Draw macOS Window Header
  const headerHeight = 44;
  ctx.fillStyle = isDark ? 'rgba(25, 25, 32, 0.8)' : 'rgba(245, 245, 247, 0.9)';
  ctx.fillRect(cardX, cardY, cardWidth, headerHeight);

  // Header bottom divider line
  ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
  ctx.fillRect(cardX, cardY + headerHeight - 1, cardWidth, 1);

  // Traffic Light Buttons
  if (config.showMacButtons) {
    const btnRadius = 6;
    const btnY = cardY + headerHeight / 2;
    const startBtnX = cardX + 20;
    const spacing = 18;

    // Red
    ctx.beginPath();
    ctx.arc(startBtnX, btnY, btnRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff5f56';
    ctx.fill();

    // Yellow
    ctx.beginPath();
    ctx.arc(startBtnX + spacing, btnY, btnRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffbd2e';
    ctx.fill();

    // Green
    ctx.beginPath();
    ctx.arc(startBtnX + spacing * 2, btnY, btnRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#27c93f';
    ctx.fill();
  }

  // Window Title Bar
  const titleText = config.title || 'untitled.md';
  ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = isDark ? '#9ca3af' : '#4b5563';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(titleText, cardX + cardWidth / 2, cardY + headerHeight / 2);

  // 6. Draw Editor Content Area
  const contentX = cardX + 24;
  const contentY = cardY + headerHeight + 20;
  const lineHeight = 28;
  const lines = currentText.split('\n');

  // Font setup
  const fontSize = 16;
  ctx.font = `${fontSize}px "Geist Mono", "JetBrains Mono", Consolas, monospace`;
  ctx.textBaseline = 'top';

  for (let i = 0; i < lines.length; i++) {
    const lineY = contentY + i * lineHeight;
    if (lineY > cardY + cardHeight - 20) break; // Don't overflow bottom

    const isCurrentLine = i === activeLine;

    // Active line highlight pill
    if (config.highlightActiveLine && isCurrentLine) {
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.035)';
      roundRect(ctx, cardX + 8, lineY - 3, cardWidth - 16, lineHeight, 6);
      ctx.fill();
    }

    // Line number
    ctx.textAlign = 'right';
    ctx.fillStyle = isDark ? (isCurrentLine ? '#71717a' : '#3f3f46') : (isCurrentLine ? '#71717a' : '#d4d4d8');
    ctx.fillText(`${i + 1}`, contentX + 16, lineY);

    // Code/Text content
    ctx.textAlign = 'left';
    const lineContent = lines[i];

    // Dim non-active lines if highlightActiveLine is enabled
    if (config.highlightActiveLine && !isCurrentLine) {
      ctx.fillStyle = isDark ? 'rgba(161, 161, 170, 0.45)' : 'rgba(100, 116, 139, 0.45)';
    } else {
      ctx.fillStyle = isDark ? '#f4f4f5' : '#0f172a';
    }

    // Draw basic syntax tokens (comments, headers, bold, keywords)
    drawSyntaxLine(ctx, lineContent, contentX + 40, lineY, isDark);

    // 7. Draw Caret & Typing Ripple on active line
    if (isCurrentLine && config.showCaret) {
      const textBeforeCaret = lineContent.slice(0, activeCol);
      const caretX = contentX + 40 + ctx.measureText(textBeforeCaret).width;
      const blink = Math.sin(timeMs * 0.008) > 0;

      if (blink) {
        ctx.fillStyle = '#38bdf8'; // Electric blue caret
        if (config.caretStyle === 'block') {
          ctx.fillRect(caretX, lineY, 9, fontSize + 2);
        } else if (config.caretStyle === 'glow') {
          ctx.save();
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.fillRect(caretX, lineY, 2.5, fontSize + 2);
          ctx.restore();
        } else {
          // Standard bar
          ctx.fillRect(caretX, lineY, 2, fontSize + 2);
        }
      }

      // Keystroke Ripple Wave
      if (config.showKeystrokeRipples && params.isKeystroke) {
        ctx.save();
        ctx.beginPath();
        const rippleRadius = 14 + (Math.sin(timeMs * 0.05) * 4);
        ctx.arc(caretX + 1, lineY + fontSize / 2, rippleRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  ctx.restore(); // restore window card clip
  ctx.restore(); // restore camera transform & tilt

  // 8. Draw Social Handle Watermark Badge
  if (config.showWatermark && config.handle) {
    drawWatermark(ctx, config, canvasWidth, canvasHeight);
  }

  // 9. Draw Bottom Progress Indicator Bar
  if (config.showProgressBar) {
    drawBottomProgressBar(ctx, progressPercent, canvasWidth, canvasHeight);
  }

  ctx.restore();
}


export interface RenderScreenRecordFrameParams {
  ctx: AnyCanvasContext;
  config: ClipStudioConfig;
  camera: CameraState;
  videoSource: CanvasImageSource;
  progressPercent: number;
  canvasWidth: number;
  canvasHeight: number;
  timeMs: number;
  clickRipple?: { x: number; y: number; ageMs: number } | null;
}

export function drawScreenRecordedFrame(params: RenderScreenRecordFrameParams) {
  const {
    ctx,
    config,
    camera,
    videoSource,
    progressPercent,
    canvasWidth,
    canvasHeight,
    timeMs,
    clickRipple,
  } = params;

  ctx.save();
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 1. Draw Background
  drawBackground(ctx, config.background, canvasWidth, canvasHeight, timeMs);

  // 2. Camera Transform & 3D Perspective Tilt
  ctx.save();
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  ctx.translate(centerX + camera.x, centerY + camera.y);
  ctx.scale(camera.scale, camera.scale);

  if (config.tiltX !== 0 || config.tiltY !== 0) {
    const radX = (config.tiltX * Math.PI) / 180;
    const radY = (config.tiltY * Math.PI) / 180;
    ctx.transform(1, Math.tan(radY) * 0.35, Math.tan(radX) * 0.35, 1, 0, 0);
  }

  // Card Size based on preset dimensions & padding
  const cardPadding = config.padding * 2;
  const cardWidth = Math.max(360, canvasWidth - cardPadding);
  const cardHeight = Math.max(240, canvasHeight - cardPadding);
  const cardX = -cardWidth / 2;
  const cardY = -cardHeight / 2;

  // 3. Drop Shadow
  if (config.showDropShadow && config.shadowDepth > 0) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = config.shadowDepth * 1.5;
    ctx.shadowOffsetY = config.shadowDepth * 0.8;
    ctx.fillStyle = '#0f0b14';
    roundRect(ctx, cardX, cardY, cardWidth, cardHeight, config.cornerRadius);
    ctx.fill();
    ctx.restore();
  }

  // 4. Clip Window Card
  ctx.save();
  roundRect(ctx, cardX, cardY, cardWidth, cardHeight, config.cornerRadius);
  ctx.clip();

  // Background behind video
  ctx.fillStyle = '#0e0b14';
  ctx.fillRect(cardX, cardY, cardWidth, cardHeight);

  // macOS Header
  let headerHeight = 0;
  if (config.showMacButtons) {
    headerHeight = 36;
    ctx.fillStyle = '#15111e';
    ctx.fillRect(cardX, cardY, cardWidth, headerHeight);

    // Traffic Lights
    const btnRadius = 5.5;
    const btnY = cardY + headerHeight / 2;
    const startBtnX = cardX + 18;
    const spacing = 16;

    // Red
    ctx.beginPath();
    ctx.arc(startBtnX, btnY, btnRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff5f56';
    ctx.fill();

    // Yellow
    ctx.beginPath();
    ctx.arc(startBtnX + spacing, btnY, btnRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffbd2e';
    ctx.fill();

    // Green
    ctx.beginPath();
    ctx.arc(startBtnX + spacing * 2, btnY, btnRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#27c93f';
    ctx.fill();

    // Title
    const titleText = config.title || 'MD Writer';
    ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#9a93ad';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(titleText, cardX + cardWidth / 2, cardY + headerHeight / 2);

    // Divider line
    ctx.fillStyle = '#2a2338';
    ctx.fillRect(cardX, cardY + headerHeight - 1, cardWidth, 1);
  }

  // Draw Screen Recorded Video Frame
  const videoY = cardY + headerHeight;
  const videoHeight = cardHeight - headerHeight;

  try {
    ctx.drawImage(videoSource, cardX, videoY, cardWidth, videoHeight);
  } catch {
    // Fallback if video frame is not immediately accessible
  }

  // Window Border
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.stroke();

  // Draw Click Ripple if active
  if (clickRipple && config.showClickRipples && clickRipple.ageMs >= 0 && clickRipple.ageMs < 900) {
    const rippleCanvasX = cardX + clickRipple.x * cardWidth;
    const rippleCanvasY = videoY + clickRipple.y * videoHeight;
    const normAge = clickRipple.ageMs / 900; // 0 to 1
    const radius = 10 + normAge * 32;
    const alpha = Math.max(0, 1 - normAge);

    ctx.save();
    ctx.beginPath();
    ctx.arc(rippleCanvasX, rippleCanvasY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(130, 87, 245, ${alpha.toFixed(2)})`; // Brand Violet
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Small inner flash dot
    if (normAge < 0.35) {
      ctx.beginPath();
      ctx.arc(rippleCanvasX, rippleCanvasY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(168, 133, 255, ${(1 - normAge / 0.35).toFixed(2)})`;
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore(); // restore window card clip
  ctx.restore(); // restore camera transform & tilt

  // Watermark
  if (config.showWatermark && config.handle) {
    drawWatermark(ctx, config, canvasWidth, canvasHeight);
  }

  // Bottom Progress Bar
  if (config.showProgressBar) {
    drawBottomProgressBar(ctx, progressPercent, canvasWidth, canvasHeight);
  }

  ctx.restore();
}

