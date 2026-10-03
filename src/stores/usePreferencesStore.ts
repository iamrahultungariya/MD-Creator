import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type EditorFontFamily = 'Geist Mono' | 'JetBrains Mono' | 'Consolas' | 'monospace';
export type EditorLineHeight = 'compact' | 'normal' | 'relaxed';
export type EditorKeymapMode = 'default' | 'vim';

interface PreferencesState {
  // Typography
  fontFamily: EditorFontFamily;
  fontSize: number; // 13, 14, 15, 16, 18
  lineHeight: EditorLineHeight;

  // Behaviors
  wordWrap: boolean;
  tabSize: 2 | 4;
  lineNumbers: boolean;
  autoCloseBrackets: boolean;

  // Writing & Focus Experiences
  typewriterMode: boolean;
  focusMode: boolean;
  keymapMode: EditorKeymapMode;

  // Modal State
  isOpen: boolean;

  // Actions
  setFontFamily: (font: EditorFontFamily) => void;
  setFontSize: (size: number) => void;
  setLineHeight: (height: EditorLineHeight) => void;
  setWordWrap: (wrap: boolean) => void;
  setTabSize: (size: 2 | 4) => void;
  setLineNumbers: (show: boolean) => void;
  setAutoCloseBrackets: (enable: boolean) => void;
  setTypewriterMode: (enabled: boolean) => void;
  setFocusMode: (enabled: boolean) => void;
  setKeymapMode: (mode: EditorKeymapMode) => void;
  openPreferences: () => void;
  closePreferences: () => void;
  togglePreferences: () => void;
  resetPreferences: () => void;
}

const DEFAULT_PREFERENCES = {
  fontFamily: 'Geist Mono' as EditorFontFamily,
  fontSize: 15,
  lineHeight: 'normal' as EditorLineHeight,
  wordWrap: true,
  tabSize: 2 as 2 | 4,
  lineNumbers: true,
  autoCloseBrackets: true,
  typewriterMode: false,
  focusMode: false,
  keymapMode: 'default' as EditorKeymapMode,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      isOpen: false,

      setFontFamily: (fontFamily) => set({ fontFamily }),
      setFontSize: (fontSize) => set({ fontSize }),
      setLineHeight: (lineHeight) => set({ lineHeight }),
      setWordWrap: (wordWrap) => set({ wordWrap }),
      setTabSize: (tabSize) => set({ tabSize }),
      setLineNumbers: (lineNumbers) => set({ lineNumbers }),
      setAutoCloseBrackets: (autoCloseBrackets) => set({ autoCloseBrackets }),
      setTypewriterMode: (typewriterMode) => set({ typewriterMode }),
      setFocusMode: (focusMode) => set({ focusMode }),
      setKeymapMode: (keymapMode) => set({ keymapMode }),

      openPreferences: () => set({ isOpen: true }),
      closePreferences: () => set({ isOpen: false }),
      togglePreferences: () => set((state) => ({ isOpen: !state.isOpen })),

      resetPreferences: () => set({ ...DEFAULT_PREFERENCES }),
    }),
    {
      name: 'md-writer-preferences',
      partialize: (state) => ({
        fontFamily: state.fontFamily,
        fontSize: state.fontSize,
        lineHeight: state.lineHeight,
        wordWrap: state.wordWrap,
        tabSize: state.tabSize,
        lineNumbers: state.lineNumbers,
        autoCloseBrackets: state.autoCloseBrackets,
        typewriterMode: state.typewriterMode,
        focusMode: state.focusMode,
        keymapMode: state.keymapMode,
      }),
    }
  )
);
