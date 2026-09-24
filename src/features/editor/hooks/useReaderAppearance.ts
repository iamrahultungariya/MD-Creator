import { useMemo } from 'react';
import { useReaderSettingsStore } from '../../../stores/useReaderSettingsStore';
import { useThemeStore } from '../../../stores/useThemeStore';

export function useReaderAppearance() {
  const {
    theme: readerTheme,
    fontFamily: readerFontFamily,
    fontSize: readerFontSize,
    columnWidth: readerColumnWidth,
    setReadingProgress,
  } = useReaderSettingsStore();
  const { isDark } = useThemeStore();

  const readerThemeClasses = useMemo(() => {
    switch (readerTheme) {
      case 'sepia':
        return isDark
          ? 'bg-[#27211C] text-[#E2CBB7]'
          : 'bg-[#FBF0D9] text-[#382E25]';
      case 'slate':
        return isDark
          ? 'bg-[#1E2530] text-[#CBD5E1]'
          : 'bg-[#F1F5F9] text-[#1E293B]';
      case 'midnight':
        return 'bg-[#0B0C0E] text-neutral-300';
      case 'default':
      default:
        return isDark
          ? 'bg-[#111114] text-neutral-100'
          : 'bg-white text-neutral-900';
    }
  }, [readerTheme, isDark]);

  const readerFontClass = useMemo(() => {
    switch (readerFontFamily) {
      case 'arial':
        return 'font-arial';
      case 'lato':
        return 'font-lato';
      case 'lexend':
      default:
        return 'font-lexend';
    }
  }, [readerFontFamily]);

  const readerSizeClass = useMemo(() => {
    switch (readerFontSize) {
      case 'sm':
        return 'reader-size-sm';
      case 'lg':
        return 'reader-size-lg';
      case 'xl':
        return 'reader-size-xl';
      case 'base':
      default:
        return 'reader-size-base';
    }
  }, [readerFontSize]);

  const readerWidthClass = useMemo(() => {
    switch (readerColumnWidth) {
      case 'focused':
        return 'max-w-xl mx-auto w-full';
      case 'wide':
        return 'max-w-6xl mx-auto w-full';
      case 'standard':
      default:
        return 'max-w-4xl mx-auto w-full';
    }
  }, [readerColumnWidth]);

  return {
    readerTheme,
    readerFontFamily,
    readerFontSize,
    readerColumnWidth,
    setReadingProgress,
    readerThemeClasses,
    readerFontClass,
    readerSizeClass,
    readerWidthClass,
    isDark,
  };
}
