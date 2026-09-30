import React from 'react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightBorderColor?: string;
  spotlightSurfaceColor?: string;
  spotlightRadius?: number;
  isDimmed?: boolean;
  isActiveGlow?: boolean;
}

/**
 * Raycast & Linear style mouse-following spotlight card.
 * Features:
 * - Dynamic 60fps mouse-following radial border illumination (masked to 1.25px stroke)
 * - Dynamic mouse-following inner surface illumination
 * - Zero lag using Framer Motion motion-values (no re-renders on mousemove)
 */
export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightBorderColor,
  spotlightSurfaceColor,
  spotlightRadius = 320,
  isDimmed = false,
  isActiveGlow = true,
  onMouseMove,
  onMouseLeave,
  ...props
}) => {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
    if (onMouseMove) onMouseMove(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseX.set(-1000);
    mouseY.set(-1000);
    if (onMouseLeave) onMouseLeave(e);
  };

  const borderBackground = useMotionTemplate`
    radial-gradient(
      ${spotlightRadius}px circle at ${mouseX}px ${mouseY}px,
      ${spotlightBorderColor || 'var(--spotlight-border, rgba(59, 130, 246, 0.45))'},
      transparent 80%
    )
  `;

  const surfaceBackground = useMotionTemplate`
    radial-gradient(
      ${spotlightRadius * 1.25}px circle at ${mouseX}px ${mouseY}px,
      ${spotlightSurfaceColor || 'var(--spotlight-surface, rgba(59, 130, 246, 0.05))'},
      transparent 70%
    )
  `;

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative overflow-hidden rounded-2xl transition-all duration-200 ${
        isDimmed ? 'opacity-55' : 'opacity-100'
      } ${className}`}
      {...props}
    >
      {/* 1. Dynamic Mouse-following 1.25px Border Glow (Masked so only border illuminates!) */}
      {isActiveGlow && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
          style={{
            background: borderBackground,
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            padding: '1.25px',
          }}
        />
      )}

      {/* 2. Dynamic Mouse-following Inner Surface Glow */}
      {isActiveGlow && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          style={{
            background: surfaceBackground,
          }}
        />
      )}

      {/* Card Content */}
      <div className="relative z-10 h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
};
