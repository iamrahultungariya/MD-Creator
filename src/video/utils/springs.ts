import { spring } from 'remotion';

export interface MotionimoSpringConfig {
  damping?: number;
  mass?: number;
  stiffness?: number;
  overshootClamping?: boolean;
}

export const MOTIONIMO_TACTILE_SPRING: MotionimoSpringConfig = {
  mass: 0.8,
  damping: 14,
  stiffness: 140,
  overshootClamping: false,
};

export const MOTIONIMO_SMOOTH_SPRING: MotionimoSpringConfig = {
  mass: 1.0,
  damping: 20,
  stiffness: 100,
  overshootClamping: false,
};

/**
 * Calculates a spring progression (0 to 1) for a given frame and fps with optional delay.
 */
export const motionimoSpring = (
  frame: number,
  fps: number,
  delay: number = 0,
  config: MotionimoSpringConfig = MOTIONIMO_TACTILE_SPRING
): number => {
  return spring({
    frame: Math.max(0, frame - delay),
    fps,
    config,
  });
};
