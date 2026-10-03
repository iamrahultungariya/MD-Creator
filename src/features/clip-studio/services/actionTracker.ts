import { InteractionEvent } from '../types';

export class ActionTracker {
  private events: InteractionEvent[] = [];
  private isTracking: boolean = false;
  private startTime: number = 0;

  // Smoothing states (Exponential Moving Average)
  private smoothX: number = 0.5;
  private smoothY: number = 0.5;
  private readonly alpha: number = 0.25; // smoothing factor (0 = static, 1 = raw jitter)

  private handlePointerMove = (e: PointerEvent | MouseEvent) => {
    if (!this.isTracking) return;

    const rawX = Math.max(0, Math.min(1, e.clientX / window.innerWidth));
    const rawY = Math.max(0, Math.min(1, e.clientY / window.innerHeight));

    // Apply EMA filter to eliminate hand tremors
    this.smoothX = this.smoothX * (1 - this.alpha) + rawX * this.alpha;
    this.smoothY = this.smoothY * (1 - this.alpha) + rawY * this.alpha;

    const timestamp = Math.round(performance.now() - this.startTime);
    this.events.push({
      timestamp,
      x: Number(this.smoothX.toFixed(4)),
      y: Number(this.smoothY.toFixed(4)),
      type: 'move',
    });
  };

  private handleMouseDown = (e: MouseEvent) => {
    if (!this.isTracking) return;

    const rawX = Math.max(0, Math.min(1, e.clientX / window.innerWidth));
    const rawY = Math.max(0, Math.min(1, e.clientY / window.innerHeight));

    const timestamp = Math.round(performance.now() - this.startTime);
    this.events.push({
      timestamp,
      x: Number(rawX.toFixed(4)),
      y: Number(rawY.toFixed(4)),
      type: 'click',
    });
  };

  private handleKeyDown = () => {
    if (!this.isTracking) return;
    const timestamp = Math.round(performance.now() - this.startTime);
    this.events.push({
      timestamp,
      x: Number(this.smoothX.toFixed(4)),
      y: Number(this.smoothY.toFixed(4)),
      type: 'key',
    });
  };

  public start() {
    this.events = [];
    this.isTracking = true;
    this.startTime = performance.now();
    this.smoothX = 0.5;
    this.smoothY = 0.5;

    window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
    window.addEventListener('mousedown', this.handleMouseDown, { passive: true });
    window.addEventListener('keydown', this.handleKeyDown, { passive: true });
  }

  public stop(): InteractionEvent[] {
    this.isTracking = false;
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('keydown', this.handleKeyDown);

    return [...this.events];
  }

  public getEvents(): InteractionEvent[] {
    return [...this.events];
  }
}

export const actionTracker = new ActionTracker();

export interface ActiveActionFocus {
  x: number; // normalized 0 to 1
  y: number; // normalized 0 to 1
  isRecentClick: boolean;
  clickAgeMs: number;
  isRecentActivity: boolean;
}

/**
 * Binary search to query the user's action focus at a specific timestamp.
 */
export function getActionFocusAt(events: InteractionEvent[], timeMs: number): ActiveActionFocus {
  if (!events || events.length === 0) {
    return {
      x: 0.5,
      y: 0.5,
      isRecentClick: false,
      clickAgeMs: 9999,
      isRecentActivity: false,
    };
  }

  // Find most recent event before or at timeMs
  let low = 0;
  let high = events.length - 1;
  let bestIdx = 0;

  while (low <= high) {
    const mid = (low + high) >> 1;
    if (events[mid].timestamp <= timeMs) {
      bestIdx = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const latestEvent = events[bestIdx];
  const age = timeMs - latestEvent.timestamp;
  const isRecentActivity = age < 2200; // active within 2.2 seconds

  // Check for recent clicks within the last 1200ms
  let isRecentClick = false;
  let clickAgeMs = 9999;
  let clickX = latestEvent.x;
  let clickY = latestEvent.y;

  // Scan backwards a few events to see if a click happened recently
  for (let i = bestIdx; i >= Math.max(0, bestIdx - 15); i--) {
    if (events[i].type === 'click') {
      const cAge = timeMs - events[i].timestamp;
      if (cAge >= 0 && cAge <= 1400) {
        isRecentClick = true;
        clickAgeMs = cAge;
        clickX = events[i].x;
        clickY = events[i].y;
        break;
      }
    }
  }

  return {
    x: isRecentClick ? clickX : latestEvent.x,
    y: isRecentClick ? clickY : latestEvent.y,
    isRecentClick,
    clickAgeMs,
    isRecentActivity,
  };
}
