import { TypingCadence } from '../types';

export interface TyperKeyframe {
  timeMs: number;
  text: string;
  activeLine: number;
  activeCol: number;
  isKeystroke: boolean;
  charJustTyped?: string;
}

export interface TyperSimulation {
  totalDurationMs: number;
  keyframes: TyperKeyframe[];
  finalText: string;
  lines: string[];
}

/**
 * Pre-computes deterministic keyframes for typing simulation.
 * This allows both live playback and offline frame-by-frame rendering at any FPS.
 */
export function generateGhostTyperSimulation(
  rawText: string,
  cadence: TypingCadence = 'human'
): TyperSimulation {
  // Truncate text if excessively long for a short social video (keep up to ~600 chars or 25 lines max)
  const lines = rawText.split('\n');
  const targetLines = lines.slice(0, 28);
  const text = targetLines.join('\n');

  const keyframes: TyperKeyframe[] = [];
  let currentTimeMs = 600; // Initial 600ms resting pause before typing begins
  let currentBuffer = '';
  let activeLine = 0;
  let activeCol = 0;

  // Initial resting frame
  keyframes.push({
    timeMs: 0,
    text: '',
    activeLine: 0,
    activeCol: 0,
    isKeystroke: false,
  });

  const chars = Array.from(text);

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    currentBuffer += char;

    if (char === '\n') {
      activeLine++;
      activeCol = 0;
    } else {
      activeCol++;
    }

    let delay = 45;
    if (cadence === 'human') {
      // Natural human variance
      const jitter = (Math.sin(i * 12.34) * 0.5 + 0.5) * 35; // 0 to 35ms deterministic pseudo-random jitter
      delay = 40 + jitter;

      if (char === ' ') {
        delay += 30;
      } else if (char === ',' || char === ';') {
        delay += 140;
      } else if (char === '.' || char === '!' || char === '?') {
        delay += 300;
      } else if (char === '\n') {
        delay += 350;
      } else if (char === '`' || char === '{' || char === '(') {
        delay += 60;
      }
    } else if (cadence === 'fast') {
      delay = char === '\n' ? 120 : (char === ' ' ? 30 : 22);
    } else if (cadence === 'blitz') {
      delay = char === '\n' ? 60 : 12;
    }

    currentTimeMs += delay;

    keyframes.push({
      timeMs: currentTimeMs,
      text: currentBuffer,
      activeLine,
      activeCol,
      isKeystroke: true,
      charJustTyped: char,
    });
  }

  // End pause (hold for 1.8s so viewer can admire the final rendered output)
  const finalHoldMs = 1800;
  const totalDurationMs = currentTimeMs + finalHoldMs;

  keyframes.push({
    timeMs: totalDurationMs,
    text: currentBuffer,
    activeLine,
    activeCol,
    isKeystroke: false,
  });

  return {
    totalDurationMs,
    keyframes,
    finalText: currentBuffer,
    lines: currentBuffer.split('\n'),
  };
}

/**
 * Binary search to query the simulation state at any timestamp t.
 */
export function getTyperStateAt(simulation: TyperSimulation, timeMs: number): TyperKeyframe {
  const { keyframes, totalDurationMs } = simulation;
  if (keyframes.length === 0) {
    return { timeMs: 0, text: '', activeLine: 0, activeCol: 0, isKeystroke: false };
  }

  const clampedTime = Math.max(0, Math.min(timeMs, totalDurationMs));

  // Binary search for closest keyframe <= clampedTime
  let low = 0;
  let high = keyframes.length - 1;
  let best = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (keyframes[mid].timeMs <= clampedTime) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return keyframes[best];
}
