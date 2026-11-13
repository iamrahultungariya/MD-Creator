import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export interface CursorKeyframe {
  frame: number;
  x: number; // percentage (0 - 100) or pixel
  y: number; // percentage (0 - 100) or pixel
  click?: boolean;
}

interface AnimatedCursorProps {
  points: CursorKeyframe[];
  color?: string;
  size?: number;
}

export const AnimatedCursor: React.FC<AnimatedCursorProps> = ({
  points,
  color = '#8257F5',
  size = 24,
}) => {
  const frame = useCurrentFrame();

  if (!points || points.length === 0) return null;

  // If before first point or after last point
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  let currentX = firstPoint.x;
  let currentY = firstPoint.y;
  let isClicking = false;
  let clickFrame = -999;

  if (frame <= firstPoint.frame) {
    currentX = firstPoint.x;
    currentY = firstPoint.y;
    if (firstPoint.click && Math.abs(frame - firstPoint.frame) <= 8) {
      isClicking = true;
      clickFrame = firstPoint.frame;
    }
  } else if (frame >= lastPoint.frame) {
    currentX = lastPoint.x;
    currentY = lastPoint.y;
    if (lastPoint.click && Math.abs(frame - lastPoint.frame) <= 8) {
      isClicking = true;
      clickFrame = lastPoint.frame;
    }
  } else {
    // Find the two surrounding keyframes
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      if (frame >= p1.frame && frame <= p2.frame) {
        currentX = interpolate(frame, [p1.frame, p2.frame], [p1.x, p2.x], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        currentY = interpolate(frame, [p1.frame, p2.frame], [p1.y, p2.y], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        break;
      }
    }

    // Check if any click happens near this frame
    for (const p of points) {
      if (p.click && frame >= p.frame && frame <= p.frame + 16) {
        isClicking = true;
        clickFrame = p.frame;
        break;
      }
    }
  }

  // Click scale animation (press down and rebound)
  const clickScale = isClicking
    ? interpolate(frame - clickFrame, [0, 4, 12], [0.82, 0.88, 1.0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1.0;

  // Expanding click ripple wave
  const rippleProgress = isClicking
    ? interpolate(frame - clickFrame, [0, 16], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  const rippleScale = interpolate(rippleProgress, [0, 1], [0.5, 2.4]);
  const rippleOpacity = interpolate(rippleProgress, [0, 0.3, 1], [0.7, 0.5, 0]);

  return (
    <div
      className="pointer-events-none absolute z-50 transition-none"
      style={{
        left: `${currentX}%`,
        top: `${currentY}%`,
        transform: `translate(-2px, -2px) scale(${clickScale})`,
      }}
    >
      {/* Click ripple circle */}
      {isClicking && (
        <div
          className="absolute -top-3 -left-3 rounded-full border-2 border-brand-400 bg-brand-500/20"
          style={{
            width: '32px',
            height: '32px',
            transform: `scale(${rippleScale})`,
            opacity: rippleOpacity,
          }}
        />
      )}

      {/* SVG Modern macOS Arrow Cursor */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
      >
        <path
          d="M5.5 3.5L18.5 11.5L12.5 13L9.5 20L5.5 3.5Z"
          fill="#FFFFFF"
          stroke="#171717"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="2" fill={color} opacity="0.9" />
      </svg>
    </div>
  );
};
