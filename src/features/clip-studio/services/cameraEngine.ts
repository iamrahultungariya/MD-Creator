export interface CameraState {
  x: number;
  y: number;
  scale: number;
}

export interface CameraTarget {
  x: number;
  y: number;
  scale: number;
}

/**
 * Spring-based camera physics interpolator for cinematic auto-zoom.
 */
export class CameraEngine {
  private current: CameraState = { x: 0, y: 0, scale: 1.0 };
  private velocity: CameraState = { x: 0, y: 0, scale: 0 };
  
  // Spring constants
  private stiffness: number = 70;
  private damping: number = 14;

  constructor(initialScale: number = 1.0) {
    this.current = { x: 0, y: 0, scale: initialScale };
  }

  public reset(scale: number = 1.0) {
    this.current = { x: 0, y: 0, scale };
    this.velocity = { x: 0, y: 0, scale: 0 };
  }

  public update(target: CameraTarget, deltaSeconds: number): CameraState {
    const dt = Math.min(deltaSeconds, 0.1); // clamp to prevent explosive jumps

    // Spring calculation: F = -k * (x - target) - c * v
    const fx = -this.stiffness * (this.current.x - target.x) - this.damping * this.velocity.x;
    const fy = -this.stiffness * (this.current.y - target.y) - this.damping * this.velocity.y;
    const fScale = -this.stiffness * (this.current.scale - target.scale) - this.damping * this.velocity.scale;

    this.velocity.x += fx * dt;
    this.velocity.y += fy * dt;
    this.velocity.scale += fScale * dt;

    this.current.x += this.velocity.x * dt;
    this.current.y += this.velocity.y * dt;
    this.current.scale += this.velocity.scale * dt;

    return { ...this.current };
  }

  public getState(): CameraState {
    return { ...this.current };
  }
}

/**
 * Calculates the ideal camera target based on current playback progress and cursor location.
 */
export function calculateCameraTarget(params: {
  autoZoomEnabled: boolean;
  zoomScale: number;
  cursorX: number;
  cursorY: number;
  cardWidth: number;
  cardHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  isInitialRest: boolean;
  isFinalHold: boolean;
}): CameraTarget {
  const {
    autoZoomEnabled,
    zoomScale,
    cursorX,
    cursorY,
    cardWidth,
    cardHeight,
    isInitialRest,
    isFinalHold,
  } = params;

  if (!autoZoomEnabled || isInitialRest || isFinalHold) {
    // Overview mode: centered, scale = 1.0
    return { x: 0, y: 0, scale: 1.0 };
  }

  // Punch in on active line
  const targetScale = zoomScale;

  // Relative offset from card center to cursor
  const cardCenterX = cardWidth / 2;
  const cardCenterY = cardHeight / 2;

  const rawOffsetX = cardCenterX - cursorX;
  const rawOffsetY = cardCenterY - cursorY;

  // Clamp offsets so the window card stays partially bounded within camera frustum
  const maxPanX = cardWidth * 0.35;
  const maxPanY = cardHeight * 0.4;

  const clampedX = Math.max(-maxPanX, Math.min(maxPanX, rawOffsetX));
  const clampedY = Math.max(-maxPanY, Math.min(maxPanY, rawOffsetY));

  return {
    x: clampedX * (targetScale - 0.3),
    y: clampedY * (targetScale - 0.3),
    scale: targetScale,
  };
}

/**
 * Calculates camera target for real recorded screen video using normalized cursor coordinates (0 to 1).
 */
export function calculateScreenRecordCameraTarget(params: {
  autoZoomEnabled: boolean;
  zoomScale: number;
  normX: number; // 0 to 1
  normY: number; // 0 to 1
  isRecentActivity: boolean;
  cardWidth: number;
  cardHeight: number;
}): CameraTarget {
  const {
    autoZoomEnabled,
    zoomScale,
    normX,
    normY,
    isRecentActivity,
    cardWidth,
    cardHeight,
  } = params;

  if (!autoZoomEnabled || !isRecentActivity) {
    return { x: 0, y: 0, scale: 1.0 };
  }

  const targetScale = zoomScale;
  const panMultiplier = (targetScale - 1.0);

  // Offset from center (0.5)
  const rawOffsetX = (0.5 - normX) * cardWidth * panMultiplier;
  const rawOffsetY = (0.5 - normY) * cardHeight * panMultiplier;

  // Maximum allowed pan to ensure framing remains aesthetic
  const maxPanX = (cardWidth * 0.45) * panMultiplier;
  const maxPanY = (cardHeight * 0.45) * panMultiplier;

  const clampedX = Math.max(-maxPanX, Math.min(maxPanX, rawOffsetX));
  const clampedY = Math.max(-maxPanY, Math.min(maxPanY, rawOffsetY));

  return {
    x: clampedX,
    y: clampedY,
    scale: targetScale,
  };
}

