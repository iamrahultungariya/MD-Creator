import { ClipStudioConfig } from '../types';
import { CameraState } from './cameraEngine';

export type AnyCanvasContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

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

/**
 * Draws studio background variations.
 */
function drawBackground(
  ctx: AnyCanvasContext,
  bgId: string,
  width: number,
  height: number,
  timeMs: number
) {
  if (bgId === 'transparent') {
    return;
  }

  if (bgId === 'raycast-purple') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#190a2e');
    grad.addColorStop(0.5, '#2e1065');
    grad.addColorStop(1, '#0f051d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Glowing orb
    const radial = ctx.createRadialGradient(width * 0.7, height * 0.3, 20, width * 0.7, height * 0.3, width * 0.6);
    radial.addColorStop(0, 'rgba(168, 85, 247, 0.28)');
    radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);
  } else if (bgId === 'sunset-glow') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#1c1917');
    grad.addColorStop(0.5, '#451a03');
    grad.addColorStop(1, '#2e1065');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const radial = ctx.createRadialGradient(width * 0.3, height * 0.7, 40, width * 0.3, height * 0.7, width * 0.7);
    radial.addColorStop(0, 'rgba(249, 115, 22, 0.25)');
    radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);
  } else if (bgId === 'hyper-blue') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#020617');
    grad.addColorStop(0.6, '#0f172a');
    grad.addColorStop(1, '#0369a1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const radial = ctx.createRadialGradient(width * 0.5, height * 0.4, 30, width * 0.5, height * 0.4, width * 0.6);
    radial.addColorStop(0, 'rgba(14, 165, 233, 0.25)');
    radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);
  } else if (bgId === 'neon-cyber') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#052e16');
    grad.addColorStop(0.5, '#022c22');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const radial = ctx.createRadialGradient(width * 0.6, height * 0.5, 30, width * 0.6, height * 0.5, width * 0.6);
    radial.addColorStop(0, 'rgba(16, 185, 129, 0.22)');
    radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);
  } else if (bgId === 'aurora-ambient') {
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, width, height);

    // Floating moving aura
    const shift = Math.sin(timeMs * 0.001) * 60;
    const radial1 = ctx.createRadialGradient(width * 0.3 + shift, height * 0.3, 10, width * 0.3 + shift, height * 0.3, width * 0.55);
    radial1.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
    radial1.addColorStop(1, 'transparent');
    ctx.fillStyle = radial1;
    ctx.fillRect(0, 0, width, height);

    const radial2 = ctx.createRadialGradient(width * 0.7 - shift, height * 0.7, 10, width * 0.7 - shift, height * 0.7, width * 0.55);
    radial2.addColorStop(0, 'rgba(236, 72, 153, 0.25)');
    radial2.addColorStop(1, 'transparent');
    ctx.fillStyle = radial2;
    ctx.fillRect(0, 0, width, height);
  } else if (bgId === 'studio-slate') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Subtle technical grid
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  } else {
    // studio-obsidian
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    const radial = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.7);
    radial.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
    radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);
  }
}

/**
 * Lightweight syntax colorizer for markdown and code.
 */
function drawSyntaxLine(
  ctx: AnyCanvasContext,
  line: string,
  startX: number,
  y: number,
  isDark: boolean
) {
  // Headings
  if (line.startsWith('#')) {
    ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
    ctx.fillText(line, startX, y);
    return;
  }
  // Comments
  if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
    ctx.fillStyle = isDark ? '#6b7280' : '#9ca3af';
    ctx.fillText(line, startX, y);
    return;
  }
  // Code block fence
  if (line.trim().startsWith('```')) {
    ctx.fillStyle = isDark ? '#f472b6' : '#db2777';
    ctx.fillText(line, startX, y);
    return;
  }
  // Lists / Blockquotes
  if (line.trim().startsWith('- ') || line.trim().startsWith('* ') || line.trim().startsWith('>')) {
    ctx.fillStyle = isDark ? '#a78bfa' : '#7c3aed';
    ctx.fillText(line, startX, y);
    return;
  }

  // Keywords
  if (/\b(const|let|var|function|return|import|export|if|else|interface|type|class)\b/.test(line)) {
    ctx.fillStyle = isDark ? '#c084fc' : '#9333ea';
  }

  ctx.fillText(line, startX, y);
}

/**
 * Draws the social handle watermark pill.
 */
function drawWatermark(
  ctx: AnyCanvasContext,
  config: ClipStudioConfig,
  width: number,
  height: number
) {
  const text = config.handle.startsWith('@') ? config.handle : `@${config.handle}`;
  ctx.save();
  ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const textMetrics = ctx.measureText(text);
  const pillWidth = textMetrics.width + 42;
  const pillHeight = 32;

  let x = 32;
  let y = 32;

  if (config.watermarkPosition === 'top-right') {
    x = width - pillWidth - 32;
    y = 32;
  } else if (config.watermarkPosition === 'bottom-left') {
    x = 32;
    y = height - pillHeight - (config.showProgressBar ? 44 : 32);
  } else if (config.watermarkPosition === 'bottom-right') {
    x = width - pillWidth - 32;
    y = height - pillHeight - (config.showProgressBar ? 44 : 32);
  }

  // Draw pill background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  roundRect(ctx, x, y, pillWidth, pillHeight, 16);
  ctx.fill();

  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.stroke();

  // Draw icon circle
  const iconX = x + 16;
  const iconY = y + pillHeight / 2;
  ctx.beginPath();
  ctx.arc(iconX, iconY, 6, 0, Math.PI * 2);

  if (config.platformBadge === 'instagram') {
    ctx.fillStyle = '#e1306c';
  } else if (config.platformBadge === 'threads') {
    ctx.fillStyle = '#ffffff';
  } else if (config.platformBadge === 'x') {
    ctx.fillStyle = '#1d9bf0';
  } else {
    ctx.fillStyle = '#38bdf8';
  }
  ctx.fill();

  // Draw handle text
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + 28, y + pillHeight / 2);

  ctx.restore();
}

/**
 * Draws the slim bottom video progress bar.
 */
function drawBottomProgressBar(
  ctx: AnyCanvasContext,
  progress: number,
  width: number,
  height: number
) {
  const barHeight = 4;
  const barY = height - barHeight;

  // Background track
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(0, barY, width, barHeight);

  // Active progress fill
  const fillWidth = Math.max(0, Math.min(width, width * progress));
  const grad = ctx.createLinearGradient(0, barY, width, barY);
  grad.addColorStop(0, '#38bdf8');
  grad.addColorStop(0.5, '#a855f7');
  grad.addColorStop(1, '#ec4899');
  ctx.fillStyle = grad;
  ctx.fillRect(0, barY, fillWidth, barHeight);
}

/**
 * Helper to draw rounded rectangle.
 */
export function roundRect(
  ctx: AnyCanvasContext,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
