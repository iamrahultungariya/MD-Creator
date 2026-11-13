import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface AmbientBackgroundProps {
  primaryGlowColor?: string;
  secondaryGlowColor?: string;
  showGrid?: boolean;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  primaryGlowColor = '#8257F5', // Brand Electric Violet
  secondaryGlowColor = '#3b82f6', // Electric Indigo/Blue
  showGrid = true,
}) => {
  const frame = useCurrentFrame();

  // Subtle floating orbs drift
  const orb1X = interpolate(frame % 600, [0, 300, 600], [20, 35, 20]);
  const orb1Y = interpolate(frame % 600, [0, 300, 600], [15, 30, 15]);
  const orb1Scale = interpolate(frame % 400, [0, 200, 400], [1, 1.15, 1]);

  const orb2X = interpolate(frame % 700, [0, 350, 700], [75, 60, 75]);
  const orb2Y = interpolate(frame % 700, [0, 350, 700], [70, 55, 70]);
  const orb2Scale = interpolate(frame % 500, [0, 250, 500], [1.1, 0.95, 1.1]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-neutral-950 pointer-events-none select-none">
      {/* Animated Glowing Radial Orb 1 */}
      <div
        className="absolute rounded-full filter blur-[140px] opacity-40 transition-transform duration-75"
        style={{
          width: '750px',
          height: '750px',
          left: `${orb1X}%`,
          top: `${orb1Y}%`,
          transform: `translate(-50%, -50%) scale(${orb1Scale})`,
          background: `radial-gradient(circle, ${primaryGlowColor} 0%, rgba(130, 87, 245, 0) 70%)`,
        }}
      />

      {/* Animated Glowing Radial Orb 2 */}
      <div
        className="absolute rounded-full filter blur-[160px] opacity-30 transition-transform duration-75"
        style={{
          width: '850px',
          height: '850px',
          left: `${orb2X}%`,
          top: `${orb2Y}%`,
          transform: `translate(-50%, -50%) scale(${orb2Scale})`,
          background: `radial-gradient(circle, ${secondaryGlowColor} 0%, rgba(59, 130, 246, 0) 70%)`,
        }}
      />

      {/* Subtle Dot Grid Pattern */}
      {showGrid && (
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255, 255, 255, 0.8) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
      )}

      {/* Peripheral Vignette */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-neutral-950/80" />
    </div>
  );
};
