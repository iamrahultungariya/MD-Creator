import { ClipStudioConfig } from '../types';

export type AnyCanvasContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

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

/**
 * Lightweight syntax colorizer for markdown and code.
 */
export function drawSyntaxLine(
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
export function drawWatermark(
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
export function drawBottomProgressBar(
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
 * Draws studio background variations.
 */
export function drawBackground(
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
    grad.addColorStop(0, '#0E0B14');
    grad.addColorStop(0.5, '#2F1A63');
    grad.addColorStop(1, '#09060E');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Glowing ambient orb (Brand Violet)
    const radial = ctx.createRadialGradient(width * 0.7, height * 0.3, 20, width * 0.7, height * 0.3, width * 0.6);
    radial.addColorStop(0, 'rgba(130, 87, 245, 0.32)');
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
