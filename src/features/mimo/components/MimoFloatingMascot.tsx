import React from 'react';
import { Mimo3DCompanion } from './Mimo3DCompanion';

interface MimoFloatingMascotProps {
  className?: string;
  onClick?: () => void;
}

/**
 * Mimo Floating Companion — Interactive Transparent Robot Mascot Widget
 * Expressive 2D companion with mood states from transparent PNGs.
 */
export const MimoFloatingMascot: React.FC<MimoFloatingMascotProps> = ({ className = '', onClick }) => {
  return <Mimo3DCompanion className={className} onClick={onClick} />;
};

export { Mimo3DCompanion };
