import { create } from 'zustand';
import { flushSync } from 'react-dom';

type ThemeMode = 'light' | 'dark' | 'system';

export type ThemeTransitionOrigin =
  | React.MouseEvent
  | MouseEvent
  | { clientX?: number; clientY?: number; currentTarget?: any; target?: any }
  | undefined;

interface ThemeState {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode, origin?: ThemeTransitionOrigin) => void;
  toggleTheme: (origin?: ThemeTransitionOrigin) => void;
}

const getSystemPrefersDark = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const applyThemeClass = (isDark: boolean) => {
  if (typeof document === 'undefined') return;
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('md-writer-theme') as ThemeMode;
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved;
  }
  return 'light';
};

/**
 * Accurately calculate the animation origin from the clicked element's bounding rect
 * or mouse/touch event coordinates, with graceful fallback for every device.
 */
const getTransitionOrigin = (origin?: ThemeTransitionOrigin): { x: number; y: number } => {
  if (typeof window === 'undefined') return { x: 0, y: 0 };

  if (origin) {
    // If an element was clicked/tapped, calculate its exact center point
    const target = (origin as any).currentTarget || (origin as any).target;
    if (target && typeof target.getBoundingClientRect === 'function') {
      const rect = target.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return {
          x: Math.round(rect.left + rect.width / 2),
          y: Math.round(rect.top + rect.height / 2),
        };
      }
    }

    // Direct client coordinates from pointer/touch
    if (typeof (origin as any).clientX === 'number' && (origin as any).clientX > 0) {
      return {
        x: Math.round((origin as any).clientX),
        y: Math.round((origin as any).clientY),
      };
    }
  }

  // Graceful fallback to top-right corner where navbar theme button is positioned
  const width = window.visualViewport?.width || window.innerWidth || 1024;
  return { x: Math.max(Math.round(width - 64), 0), y: 32 };
};

// Concurrency guard to prevent rapid clicks/taps from crashing or dropping frames
let isTransitionActive = false;

const runThemeTransition = (
  nextIsDark: boolean,
  commitState: () => void,
  origin?: ThemeTransitionOrigin
) => {
  const supportsViewTransition =
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Immediate synchronous fallback for browsers without View Transitions (Firefox, older iOS)
  if (!supportsViewTransition) {
    applyThemeClass(nextIsDark);
    commitState();
    return;
  }

  // If a transition is already animating, commit immediately without starting a conflicting transition
  if (isTransitionActive) {
    applyThemeClass(nextIsDark);
    commitState();
    return;
  }

  isTransitionActive = true;
  document.documentElement.classList.add('theme-transitioning');

  const { x, y } = getTransitionOrigin(origin);
  const viewportWidth = window.visualViewport?.width || window.innerWidth;
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  const endRadius = Math.hypot(
    Math.max(x, viewportWidth - x),
    Math.max(y, viewportHeight - y)
  );

  let transition: any;
  try {
    transition = (document as any).startViewTransition(() => {
      try {
        flushSync(() => {
          applyThemeClass(nextIsDark);
          commitState();
        });
      } catch {
        applyThemeClass(nextIsDark);
        commitState();
      }
    });
  } catch {
    document.documentElement.classList.remove('theme-transitioning');
    isTransitionActive = false;
    applyThemeClass(nextIsDark);
    commitState();
    return;
  }

  const cleanup = () => {
    document.documentElement.classList.remove('theme-transitioning');
    isTransitionActive = false;
  };

  if (transition) {
    if (typeof transition.finished?.then === 'function') {
      transition.finished.then(cleanup).catch(cleanup);
    } else {
      setTimeout(cleanup, 320);
    }

    if (typeof transition.ready?.then === 'function') {
      transition.ready
        .then(() => {
          try {
            const clipPath = [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ];
            // Highly optimized 300ms deceleration curve for 60/120fps hardware acceleration
            document.documentElement.animate(
              {
                clipPath,
              },
              {
                duration: 300,
                easing: 'cubic-bezier(0.19, 1, 0.22, 1)',
                pseudoElement: '::view-transition-new(root)',
              }
            );
          } catch {
            // Browser doesn't support pseudoElement in WAAPI, transition completes cleanly
          }
        })
        .catch(() => {
          cleanup();
        });
    }
  }
};

export const useThemeStore = create<ThemeState>((set, get) => {
  const initialTheme = getInitialTheme();
  const initialIsDark = initialTheme === 'system' ? getSystemPrefersDark() : initialTheme === 'dark';

  // Apply to DOM on load
  applyThemeClass(initialIsDark);

  return {
    theme: initialTheme,
    isDark: initialIsDark,
    setTheme: (theme: ThemeMode, origin?: ThemeTransitionOrigin) => {
      const isDark = theme === 'system' ? getSystemPrefersDark() : theme === 'dark';
      localStorage.setItem('md-writer-theme', theme);
      runThemeTransition(
        isDark,
        () => {
          set({ theme, isDark });
        },
        origin
      );
    },
    toggleTheme: (origin?: ThemeTransitionOrigin) => {
      const { isDark } = get();
      const nextIsDark = !isDark;
      const newTheme: ThemeMode = nextIsDark ? 'dark' : 'light';
      localStorage.setItem('md-writer-theme', newTheme);
      runThemeTransition(
        nextIsDark,
        () => {
          set({ theme: newTheme, isDark: nextIsDark });
        },
        origin
      );
    },
  };
});

// Listen to OS system color scheme changes if user selected 'system'
if (typeof window !== 'undefined') {
  try {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (useThemeStore.getState().theme === 'system') {
        applyThemeClass(e.matches);
        useThemeStore.setState({ isDark: e.matches });
      }
    };
    mediaQuery.addEventListener('change', handleSystemChange);
  } catch (e) {
    console.error('Failed to attach prefers-color-scheme listener', e);
  }
}

