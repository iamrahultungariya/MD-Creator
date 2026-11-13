import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { motionimoSpring } from '../utils/springs';

interface KineticTextProps {
  text: string;
  delay?: number;
  className?: string;
  stagger?: number;
  mode?: 'words' | 'characters';
  highlightGradient?: boolean;
}

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  delay = 0,
  className = 'text-5xl font-bold tracking-tight text-white',
  stagger = 4, // 4 frames between words/chars
  mode = 'words',
  highlightGradient = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tokens = mode === 'words' ? text.split(' ') : text.split('');

  return (
    <div className={`inline-flex flex-wrap items-center gap-x-3 gap-y-1 ${className}`}>
      {tokens.map((token, index) => {
        const tokenDelay = delay + index * stagger;
        const springVal = motionimoSpring(frame, fps, tokenDelay);

        const opacity = interpolate(springVal, [0, 1], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const translateY = interpolate(springVal, [0, 1], [24, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const scale = interpolate(springVal, [0, 1], [0.94, 1.0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <span
            key={index}
            style={{
              opacity,
              transform: `translateY(${translateY}px) scale(${scale})`,
              display: 'inline-block',
            }}
            className={
              highlightGradient
                ? 'bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent'
                : ''
            }
          >
            {token}
            {mode === 'words' ? '' : ''}
          </span>
        );
      })}
    </div>
  );
};
