import { useMemo } from 'react';
import { useReaderSettingsStore } from '../../../stores/useReaderSettingsStore';
import { useThemeStore } from '../../../stores/useThemeStore';

export function useReaderAppearance() {
  const readerTheme = useReaderSettingsStore((s) => s.theme);
  const readerFontFamily = useReaderSettingsStore((s) => s.fontFamily);
  const readerFontSize = useReaderSettingsStore((s) => s.fontSize);
  const readerColumnWidth = useReaderSettingsStore((s) => s.columnWidth);
  const setReadingProgress = useReaderSettingsStore((s) => s.setReadingProgress);
  const isDark = useThemeStore((s) => s.isDark);

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
        return 'reader-mode-zen max-w-2xl mx-auto w-full';
      case 'wide':
        return 'reader-mode-engineering max-w-[96%] xl:max-w-7xl mx-auto w-full';
      case 'standard':
      default:
        return 'reader-mode-classic max-w-4xl mx-auto w-full';
    }
  }, [readerColumnWidth]);

  const isReaderDark = useMemo(() => {
    if (readerTheme === 'midnight') return true;
    return isDark;
  }, [readerTheme, isDark]);

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
    isReaderDark,
  };
}
