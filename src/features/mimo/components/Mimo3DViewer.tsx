import React from 'react';
import { MascotState } from '../types/mimoTypes';
import { MimoAvatar } from './MimoAvatar';

export interface Mimo3DViewerProps {
  state?: MascotState;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

/**
 * Mimo Viewer — High-performance 2D transparent mascot renderer
 * Replaces heavy Spline WebGL runtime with lightweight, transparent PNG mood assets.
 */
export const Mimo3DViewer: React.FC<Mimo3DViewerProps> = ({
  state = 'happy',
  size = 'md',
  className = '',
  onClick,
}) => {
  return (
    <MimoAvatar
      state={state}
      size={size}
      className={className}
      onClick={onClick}
    />
  );
};
