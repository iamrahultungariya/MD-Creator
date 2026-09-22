import React, { useEffect, useRef } from 'react';
import { useWritingFxStore, TypingEffect } from '../../stores/useWritingFxStore';

interface EditorWritingFxProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

// Fixed-capacity Particle Pool (Zero GC Pressure, Zero Allocation during typing)
interface PooledParticle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  size: number;
  color: string;
  type: TypingEffect;
  currentRadius: number;
  char: string;
}

const POOL_SIZE = 256;
const MATRIX_CHARS = ['0', '1', '{', '}', '*', '#', '_', '>', '$', 'λ', 'π', '∆', '⚡', '∑'];

// Persistent off-screen mirror singleton for zero-reflow caret positioning
let mirrorDiv: HTMLDivElement | null = null;
let mirrorSpan: HTMLSpanElement | null = null;
let cachedMetrics = {
  lineHeight: 24,
  borderLeft: 0,
  borderTop: 0,
  fontSize: 14
};

export function shouldDisableHotPathFx(): boolean {
  if (typeof window === 'undefined') return true;
  // 1. Reduced motion preference
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return true;
  }
  // 2. Mobile screen (< 768px)
  if (window.innerWidth < 768) {
    return true;
  }
  // 3. Low CPU hardware concurrency <= 4
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
    return true;
  }
  // 4. Low device memory <= 4GB
  if ((navigator as any).deviceMemory && (navigator as any).deviceMemory <= 4) {
    return true;
  }
  return false;
}

function getOrCreateMirror(): { mirror: HTMLDivElement; span: HTMLSpanElement } {
  if (!mirrorDiv) {
    mirrorDiv = document.createElement('div');
    mirrorDiv.id = 'editor-caret-mirror-pool';
    mirrorDiv.style.position = 'fixed';
    mirrorDiv.style.top = '-99999px';
    mirrorDiv.style.left = '-99999px';
    mirrorDiv.style.visibility = 'hidden';
    mirrorDiv.style.pointerEvents = 'none';
    mirrorDiv.style.whiteSpace = 'pre-wrap';
    mirrorDiv.style.wordWrap = 'break-word';
    mirrorDiv.style.overflow = 'hidden';
    document.body.appendChild(mirrorDiv);

    mirrorSpan = document.createElement('span');
    mirrorSpan.textContent = '.';
  }

  return { mirror: mirrorDiv, span: mirrorSpan! };
}

function syncMirrorStyles(textarea: HTMLTextAreaElement) {
  const { mirror } = getOrCreateMirror();
  const computed = window.getComputedStyle(textarea);

  cachedMetrics = {
    lineHeight: parseFloat(computed.lineHeight) || 24,
    borderLeft: parseFloat(computed.borderLeftWidth) || 0,
    borderTop: parseFloat(computed.borderTopWidth) || 0,
    fontSize: parseFloat(computed.fontSize) || 14
  };

  const props = [
    'direction', 'boxSizing', 'width', 'height',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderStyle',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'fontStyle', 'fontVariant', 'fontWeight', 'fontSize', 'lineHeight', 'fontFamily',
    'letterSpacing', 'wordSpacing', 'tabSize', 'whiteSpace', 'wordWrap', 'lineBreak'
  ] as const;

  for (const p of props) {
    (mirror.style as any)[p] = computed[p as any];
  }
}

function measureCaret(textarea: HTMLTextAreaElement): { x: number; y: number; height: number; isInside: boolean } {
  const { mirror, span } = getOrCreateMirror();
  const pos = textarea.selectionStart || 0;
  const val = textarea.value;
  const rect = textarea.getBoundingClientRect();
  const height = cachedMetrics.lineHeight;

  let x: number;
  let y: number;

  if (val.length > 5000) {
    // Ultra-fast line-sliced caret measurement for large documents (avoids massive DOM reflow)
    let lineIndex = 0;
    let lastNewline = -1;
    for (let i = 0; i < pos; i++) {
      if (val.charCodeAt(i) === 10) {
        lineIndex++;
        lastNewline = i;
      }
    }
    const currentLineText = val.substring(lastNewline + 1, pos);
    mirror.textContent = currentLineText;
    mirror.appendChild(span);

    x = rect.left + span.offsetLeft + cachedMetrics.borderLeft - textarea.scrollLeft;
    y = rect.top + lineIndex * height + cachedMetrics.borderTop - textarea.scrollTop;
  } else {
    mirror.textContent = val.substring(0, pos);
    mirror.appendChild(span);
    x = rect.left + span.offsetLeft + cachedMetrics.borderLeft - textarea.scrollLeft;
    y = rect.top + span.offsetTop + cachedMetrics.borderTop - textarea.scrollTop;
  }

  const isInside = (
    y >= rect.top - 5 &&
    y <= rect.bottom - height + 5 &&
    x >= rect.left &&
    x <= rect.right
  );

  return { x, y, height, isInside };
}

export const EditorWritingFx: React.FC<EditorWritingFxProps> = ({ textareaRef }) => {
  const { cursorStyle, typingEffect, lowPowerMode } = useWritingFxStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const isFocusedRef = useRef<boolean>(false);

  // Pre-allocated Particle Pool
  const poolRef = useRef<PooledParticle[]>([]);
  const activeCountRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Initialize Particle Pool once
  if (poolRef.current.length === 0) {
    for (let i = 0; i < POOL_SIZE; i++) {
      poolRef.current.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        alpha: 0,
        decay: 0.04,
        size: 3,
        color: '#38bdf8',
        type: 'sparks',
        currentRadius: 0,
        char: '1'
      });
    }
  }

  // Direct DOM cursor positioning (Bypasses React rerenders completely)
  const updateCursorDirect = () => {
    const textarea = textareaRef.current;
    const cursor = cursorRef.current;
    if (!textarea || !cursor) return;

    if (cursorStyle === 'default' || !isFocusedRef.current) {
      cursor.style.display = 'none';
      return;
    }

    const { x, y, height, isInside } = measureCaret(textarea);
    if (!isInside) {
      cursor.style.display = 'none';
      return;
    }

    cursor.style.display = 'block';
    cursor.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y + 2)}px, 0)`;
    cursor.style.height = `${Math.round(height - 4)}px`;
  };

  // High-performance Canvas RAF Game Loop
  const gameLoop = (timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      rafIdRef.current = null;
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      rafIdRef.current = null;
      return;
    }

    const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.033);
    lastTimeRef.current = timestamp;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    const pool = poolRef.current;
    let aliveCount = 0;

    for (let i = 0; i < POOL_SIZE; i++) {
      const p = pool[i];
      if (!p.active) continue;

      p.alpha -= p.decay * dt * 60;
      if (p.alpha <= 0) {
        p.active = false;
        continue;
      }

      aliveCount++;

      if (p.type === 'ripple') {
        p.currentRadius += 75 * dt;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.strokeStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.currentRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (p.type === 'matrix') {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.font = 'bold 11px monospace';
        ctx.fillText(p.char, p.x, p.y);
        ctx.restore();
      } else {
        // Sparks or Float
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.type === 'sparks') {
          p.vy += 32 * dt; // gravity
          p.vx *= 0.95;   // air resistance
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.size * p.alpha), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    activeCountRef.current = aliveCount;

    if (aliveCount > 0) {
      rafIdRef.current = requestAnimationFrame(gameLoop);
    } else {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      rafIdRef.current = null; // Auto-sleeps loop when idle! (0% CPU usage)
    }
  };

  // Emit particles from fixed pool (Zero allocation)
  const emitParticlesAt = (x: number, y: number) => {
    if (lowPowerMode || typingEffect === 'none' || shouldDisableHotPathFx()) return;

    const colors = cursorStyle === 'terminal' 
      ? ['#22c55e', '#4ade80', '#86efac'] 
      : cursorStyle === 'amber'
        ? ['#f59e0b', '#fbbf24', '#fde68a']
        : ['#06b6d4', '#38bdf8', '#818cf8', '#ec4899', '#a855f7'];

    const count = typingEffect === 'sparks' ? 4 : typingEffect === 'ripple' ? 1 : typingEffect === 'matrix' ? 3 : 3;
    const pool = poolRef.current;
    let spawned = 0;

    for (let i = 0; i < POOL_SIZE && spawned < count; i++) {
      const p = pool[i];
      if (!p.active) {
        p.active = true;
        p.x = x;
        p.y = y;
        p.type = typingEffect;
        p.color = colors[(Math.random() * colors.length) | 0];

        if (typingEffect === 'ripple') {
          p.currentRadius = 4;
          p.alpha = 0.9;
          p.decay = 0.045;
          p.vx = 0;
          p.vy = 0;
        } else if (typingEffect === 'matrix') {
          p.char = MATRIX_CHARS[(Math.random() * MATRIX_CHARS.length) | 0];
          p.alpha = 1.0;
          p.decay = 0.035;
          p.vx = (Math.random() - 0.5) * 8;
          p.vy = 24 + Math.random() * 30;
        } else if (typingEffect === 'float') {
          p.alpha = 0.85;
          p.decay = 0.025;
          p.vx = (Math.random() - 0.5) * 14;
          p.vy = -18 - Math.random() * 22;
          p.size = 2.5 + Math.random() * 2;
        } else {
          // Sparks
          const angle = Math.random() * Math.PI * 2;
          const speed = 28 + Math.random() * 50;
          p.vx = Math.cos(angle) * speed;
          p.vy = Math.sin(angle) * speed - 14;
          p.alpha = 1.0;
          p.decay = 0.042 + Math.random() * 0.02;
          p.size = 3 + Math.random() * 3;
        }

        spawned++;
        activeCountRef.current++;
      }
    }

    // Wake up game loop
    if (rafIdRef.current === null && activeCountRef.current > 0) {
      lastTimeRef.current = performance.now();
      rafIdRef.current = requestAnimationFrame(gameLoop);
    }
  };

  // Setup listeners and sync
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Set caretColor based on custom cursor style
    textarea.style.caretColor = cursorStyle === 'default' ? 'auto' : 'transparent';

    // Sync mirror metrics once
    syncMirrorStyles(textarea);

    // High-DPI Canvas sizing
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      syncMirrorStyles(textarea);
      updateCursorDirect();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // ResizeObserver for textarea dimension changes
    const ro = new ResizeObserver(() => {
      syncMirrorStyles(textarea);
      updateCursorDirect();
    });
    ro.observe(textarea);

    const onFocus = () => {
      isFocusedRef.current = true;
      updateCursorDirect();
    };

    const onBlur = () => {
      isFocusedRef.current = false;
      updateCursorDirect();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      updateCursorDirect();

      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        return;
      }

      const { x, y, height, isInside } = measureCaret(textarea);
      if (isInside) {
        emitParticlesAt(x, y + height / 2);
      }
    };

    const onSelectionOrScroll = () => {
      updateCursorDirect();
    };

    textarea.addEventListener('focus', onFocus, { passive: true });
    textarea.addEventListener('blur', onBlur, { passive: true });
    textarea.addEventListener('keydown', onKeyDown, { passive: true });
    textarea.addEventListener('input', onSelectionOrScroll, { passive: true });
    textarea.addEventListener('click', onSelectionOrScroll, { passive: true });
    textarea.addEventListener('keyup', onSelectionOrScroll, { passive: true });
    textarea.addEventListener('scroll', onSelectionOrScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      ro.disconnect();
      textarea.removeEventListener('focus', onFocus);
      textarea.removeEventListener('blur', onBlur);
      textarea.removeEventListener('keydown', onKeyDown);
      textarea.removeEventListener('input', onSelectionOrScroll);
      textarea.removeEventListener('click', onSelectionOrScroll);
      textarea.removeEventListener('keyup', onSelectionOrScroll);
      textarea.removeEventListener('scroll', onSelectionOrScroll);

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [textareaRef, cursorStyle, typingEffect, lowPowerMode]);

  const getCursorClass = () => {
    switch (cursorStyle) {
      case 'neon':
        return 'w-1 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4,0_0_20px_#06b6d4] animate-pulse';
      case 'terminal':
        return 'w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981] [animation:caretTerminalBlink_1s_steps(2,start)_infinite]';
      case 'amber':
        return 'w-2.5 bg-amber-500 shadow-[0_0_8px_#f59e0b] [animation:caretAmberCrt_1.2s_ease-in-out_infinite]';
      case 'minimal':
        return 'w-0.5 bg-neutral-900 dark:bg-white animate-pulse';
      default:
        return 'hidden';
    }
  };

  return (
    <>
      {/* 1. Direct GPU-composited Custom Cursor (Zero React State) */}
      <div
        ref={cursorRef}
        className={`fixed pointer-events-none z-30 transition-none ${getCursorClass()}`}
        style={{ display: 'none', top: 0, left: 0, willChange: 'transform' }}
      />

      {/* 2. 60-144FPS Hardware-Accelerated 2D Canvas Layer (Zero React DOM Overhead) */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-40"
        style={{ willChange: 'contents' }}
      />
    </>
  );
};
