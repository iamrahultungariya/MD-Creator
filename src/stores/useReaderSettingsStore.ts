import { create } from 'zustand';

export type ReaderTheme = 'default' | 'sepia' | 'slate' | 'midnight';
export type ReaderFontFamily = 'lexend' | 'arial' | 'lato';
export type ReaderFontSize = 'sm' | 'base' | 'lg' | 'xl';
export type ReaderColumnWidth = 'focused' | 'standard' | 'wide';

export interface ReaderSettingsState {
  theme: ReaderTheme;
  fontFamily: ReaderFontFamily;
  fontSize: ReaderFontSize;
  columnWidth: ReaderColumnWidth;
  readingProgress: number; // 0 to 100
  isOutlineOpen: boolean;
  isFullscreen: boolean;

  setTheme: (theme: ReaderTheme) => void;
  setFontFamily: (fontFamily: ReaderFontFamily) => void;
  setFontSize: (fontSize: ReaderFontSize) => void;
  setColumnWidth: (columnWidth: ReaderColumnWidth) => void;
  setReadingProgress: (progress: number) => void;
  setIsOutlineOpen: (open: boolean) => void;
  toggleOutline: () => void;
  setIsFullscreen: (fullscreen: boolean) => void;
  toggleFullscreen: () => void;
}

const STORAGE_KEY = 'md-writer-reader-settings';

interface StoredSettings {
  theme?: ReaderTheme;
  fontFamily?: ReaderFontFamily;
  fontSize?: ReaderFontSize;
  columnWidth?: ReaderColumnWidth;
}

const getStoredSettings = (): StoredSettings => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Sanitize and migrate legacy font keys
    if (parsed.fontFamily && !['lexend', 'arial', 'lato'].includes(parsed.fontFamily)) {
      parsed.fontFamily = 'lexend';
    }
    return parsed;
  } catch {
    return {};
  }
};

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const saveSettings = (settings: StoredSettings) => {
  if (typeof window === 'undefined') return;
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      const current = getStoredSettings();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...settings }));
    } catch {
      // Ignore storage quota errors
    }
  }, 100);
};

export const useReaderSettingsStore = create<ReaderSettingsState>((set) => {
  const initial = getStoredSettings();

  return {
    theme: initial.theme || 'default',
    fontFamily: (initial.fontFamily as ReaderFontFamily) || 'lexend',
    fontSize: initial.fontSize || 'base',
    columnWidth: initial.columnWidth || 'standard',
    readingProgress: 0,
    isOutlineOpen: false,
    isFullscreen: false,

    setTheme: (theme) => {
      saveSettings({ theme });
      set({ theme });
    },
    setFontFamily: (fontFamily) => {
      saveSettings({ fontFamily });
      set({ fontFamily });
    },
    setFontSize: (fontSize) => {
      saveSettings({ fontSize });
      set({ fontSize });
    },
    setColumnWidth: (columnWidth) => {
      saveSettings({ columnWidth });
      set({ columnWidth });
    },
    setReadingProgress: (progress) => {
      set({ readingProgress: Math.min(100, Math.max(0, Math.round(progress))) });
    },
    setIsOutlineOpen: (open) => {
      set({ isOutlineOpen: open });
    },
    toggleOutline: () => {
      set((prev) => ({ isOutlineOpen: !prev.isOutlineOpen }));
    },
    setIsFullscreen: (fullscreen) => {
      set({ isFullscreen: fullscreen });
    },
    toggleFullscreen: () => {
      set((prev) => {
        const next = !prev.isFullscreen;
        if (typeof document !== 'undefined') {
          if (next && !document.fullscreenElement) {
            document.documentElement.requestFullscreen?.().catch(() => {});
          } else if (!next && document.fullscreenElement) {
            document.exitFullscreen?.().catch(() => {});
          }
        }
        return { isFullscreen: next };
      });
    },
  };
});
