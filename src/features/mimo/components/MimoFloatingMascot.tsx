import React from 'react';
import { Mimo3DCompanion } from './Mimo3DCompanion';

interface MimoFloatingMascotProps {
  className?: string;
}

/**
 * Mimo Floating Companion — Interactive Spline 3D Mascot Widget
 * Replaces the legacy 2D pill button with an alive, expressive 3D floating companion.
 */
export const MimoFloatingMascot: React.FC<MimoFloatingMascotProps> = ({ className = '' }) => {
  return <Mimo3DCompanion className={className} />;
};

export { Mimo3DCompanion };
