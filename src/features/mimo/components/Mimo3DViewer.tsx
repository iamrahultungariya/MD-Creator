import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { Application } from '@splinetool/runtime';
import { MascotState } from '../types/mimoTypes';

const SPLINE_SCENE_URL = 'https://prod.spline.design/tYbEFt04AB2Cj833/scene.splinecode';

// All emotion text, titles, labels, and accessories to hide completely
const LABELS_TO_HIDE = [
  'Scene Title',
  'Exp1 Label',
  'Exp2 Label',
  'Exp3 Label',
  'Exp4 Label',
  'Exp5 Label',
  'Exp2 Think Question',
  'Exp5 Sleep z1',
  'Exp5 Sleep z2',
  'Exp5 Sleep z3',
];

const MASCOT_OBJECT_NAMES: Record<MascotState, string> = {
  happy: 'Hero Mimo',
  thinking: 'Expression Thinking',
  typing: 'Expression Typing',
  excited: 'Expression Excited',
  sleeping: 'Expression Sleeping',
};

const ALL_MASCOT_NAMES = [
  'Hero Mimo',
  'Expression Happy',
  'Expression Thinking',
  'Expression Excited',
  'Expression Typing',
  'Expression Sleeping',
];

interface Mimo3DViewerProps {
  state?: MascotState;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8',
  md: 'w-28 h-28',
  lg: 'w-36 h-36',
  hero: 'w-44 h-44 sm:w-48 sm:h-48',
};

// Object scale multiplier per display context
const OBJECT_SCALES = {
  sm: 0.75,
  md: 0.9,
  lg: 0.95,
  hero: 1.05,
};

// Vertical center offset per display context
const Y_OFFSETS = {
  sm: -8,
  md: -14,
  lg: -18,
  hero: -22,
};

export const Mimo3DViewer: React.FC<Mimo3DViewerProps> = ({
  state = 'happy',
  size = 'md',
  className = '',
  onClick,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const splineAppRef = useRef<Application | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Switch 3D expressions by toggling visibility, centering, and setting face forward
  const applyExpressionState = useCallback(
    (spline: Application, activeState: MascotState) => {
      try {
        // 1. Hide all 3D emotion text and labels completely
        for (const label of LABELS_TO_HIDE) {
          try {
            const obj = spline.findObjectByName(label);
            if (obj) obj.visible = false;
          } catch {
            // ignore
          }
        }

        const activeTargetName = MASCOT_OBJECT_NAMES[activeState] || 'Hero Mimo';
        const targetScale = OBJECT_SCALES[size];
        const yOffset = Y_OFFSETS[size];

        // 2. Center and orient active mascot directly facing forward (rotation y=0, z=0)
        for (const name of ALL_MASCOT_NAMES) {
          try {
            const obj = spline.findObjectByName(name);
            if (obj) {
              if (name === activeTargetName || (activeState === 'happy' && name === 'Hero Mimo')) {
                obj.visible = true;

                // Scale properly so Mimo is big, bold and clear (not a tiny dot!)
                if (obj.scale) {
                  obj.scale.x = targetScale;
                  obj.scale.y = targetScale;
                  obj.scale.z = targetScale;
                }

                // Center position
                if (obj.position) {
                  obj.position.x = 0;
                  obj.position.y = yOffset;
                  obj.position.z = 0;
                }

                // Fix face orientation: look directly forward at user (remove left-tilt)
                if (obj.rotation) {
                  obj.rotation.x = 0;
                  obj.rotation.y = 0; // Front facing
                  obj.rotation.z = 0;
                }

                if (name === 'Hero Mimo') {
                  try {
                    spline.emitEvent('start', 'Hero Mimo');
                  } catch {
                    // ignore
                  }
                }
              } else {
                obj.visible = false;
              }
            }
          } catch {
            // ignore
          }
        }
      } catch (e) {
        console.warn('[Mimo 3D] Error updating expression state:', e);
      }
    },
    [size]
  );

  // Initialize Spline Runtime
  useEffect(() => {
    let isMounted = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const spline = new Application(canvas);
    splineAppRef.current = spline;

    // Purge any watermark DOM nodes instantly
    const purgeWatermarks = () => {
      const selectors = '.spline-watermark, #spline-watermark, a[href*="spline.design"], a[href*="spline"]';
      if (containerRef.current) {
        containerRef.current.querySelectorAll(selectors).forEach((el) => el.remove());
      }
      document.querySelectorAll(selectors).forEach((el) => el.remove());
    };

    // Watch for any dynamically injected watermark nodes and remove them immediately
    const observer = new MutationObserver(() => {
      purgeWatermarks();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current, { childList: true, subtree: true });
    }
    observer.observe(document.body, { childList: true, subtree: true });

    spline
      .load(SPLINE_SCENE_URL)
      .then(() => {
        if (!isMounted) {
          spline.dispose();
          return;
        }
        try {
          spline.setBackgroundColor('transparent');
        } catch {
          // ignore
        }

        applyExpressionState(spline, state);
        setIsLoaded(true);
        purgeWatermarks();

        [50, 150, 300, 600, 1200].forEach((ms) => setTimeout(purgeWatermarks, ms));
      })
      .catch((err) => {
        console.warn('[Mimo 3D] Failed to load Spline scene:', err);
        if (isMounted) setHasError(true);
      });

    return () => {
      isMounted = false;
      observer.disconnect();
      try {
        spline.dispose();
      } catch {
        // ignore
      }
      splineAppRef.current = null;
    };
  }, [applyExpressionState, state]);

  // Update expression whenever state prop changes
  useEffect(() => {
    if (splineAppRef.current && isLoaded) {
      applyExpressionState(splineAppRef.current, state);
    }
  }, [state, isLoaded, applyExpressionState]);

  const handleClick = () => {
    if (splineAppRef.current && interactive) {
      try {
        splineAppRef.current.emitEvent('mouseDown', 'Hero Mimo');
      } catch {
        // ignore
      }
    }
    onClick?.();
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center select-none overflow-hidden bg-transparent ${SIZE_CLASSES[size]} ${
        onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''
      } ${className}`}
      title="Mimo 3D Companion"
    >
      {/* Aggressive CSS rule inside container to annihilate any Spline watermark */}
      <style>{`
        .spline-watermark,
        #spline-watermark,
        a[href*="spline.design"],
        a[href*="spline"] {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          width: 0 !important;
          height: 0 !important;
          position: absolute !important;
          top: -99999px !important;
        }
      `}</style>

      {/* Holographic Glowing Loader on Initial Load (Zero 2D image) */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative flex items-center justify-center">
            <span
              className={`animate-ping absolute inline-flex rounded-full bg-violet-400/25 ${
                size === 'sm' ? 'h-5 w-5' : 'h-12 w-12'
              }`}
            />
            <div
              className={`rounded-full bg-gradient-to-tr from-violet-600/30 to-fuchsia-500/20 border border-violet-400/40 backdrop-blur-md flex items-center justify-center shadow-lg ${
                size === 'sm' ? 'w-6 h-6' : 'w-12 h-12'
              }`}
            >
              <Sparkles className={`${size === 'sm' ? 'w-3 h-3' : 'w-5 h-5'} text-violet-400 animate-pulse`} />
            </div>
          </div>
        </div>
      )}

      {/* Spline 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full pointer-events-auto transition-opacity duration-300 ${
          isLoaded && !hasError ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ background: 'transparent' }}
      />
    </div>
  );
};
