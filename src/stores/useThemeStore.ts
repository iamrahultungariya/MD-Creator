import { create } from 'zustand';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
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

const runWithViewTransition = (callback: () => void) => {
  if (
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    (document as any).startViewTransition(callback);
  } else {
    callback();
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
    setTheme: (theme: ThemeMode) => {
      const isDark = theme === 'system' ? getSystemPrefersDark() : theme === 'dark';
      localStorage.setItem('md-writer-theme', theme);
      runWithViewTransition(() => {
        applyThemeClass(isDark);
        set({ theme, isDark });
      });
    },
    toggleTheme: () => {
      const { isDark } = get();
      const nextIsDark = !isDark;
      const newTheme: ThemeMode = nextIsDark ? 'dark' : 'light';
      localStorage.setItem('md-writer-theme', newTheme);
      runWithViewTransition(() => {
        applyThemeClass(nextIsDark);
        set({ theme: newTheme, isDark: nextIsDark });
      });
    }
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

