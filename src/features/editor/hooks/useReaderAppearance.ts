import { useMemo } from 'react';
import { useReaderSettingsStore } from '../../../stores/useReaderSettingsStore';

export function useReaderAppearance() {
  const {
    theme: readerTheme,
    fontFamily: readerFontFamily,
    fontSize: readerFontSize,
    columnWidth: readerColumnWidth,
    setReadingProgress,
  } = useReaderSettingsStore();

  const readerThemeClasses = useMemo(() => {
    switch (readerTheme) {
      case 'sepia':
        return 'bg-[#FBF0D9] text-[#382E25] dark:bg-[#27211C] dark:text-[#E2CBB7]';
      case 'slate':
        return 'bg-[#F1F5F9] text-[#1E293B] dark:bg-[#1E2530] dark:text-[#CBD5E1]';
      case 'midnight':
        return 'bg-[#0B0C0E] text-neutral-300';
      case 'default':
      default:
        return 'bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200';
    }
  }, [readerTheme]);

  const readerFontClass = useMemo(() => {
    switch (readerFontFamily) {
      case 'serif':
        return 'font-serif-reading';
      case 'mono':
        return 'font-mono-reading';
      case 'sans':
      default:
        return 'font-sans-reading';
    }
  }, [readerFontFamily]);

  const readerSizeClass = useMemo(() => {
    switch (readerFontSize) {
      case 'sm':
        return 'text-[15px] leading-[1.8]';
      case 'lg':
        return 'text-[19px] leading-[1.9]';
      case 'xl':
        return 'text-[21px] leading-[1.95]';
      case 'base':
      default:
        return 'text-[17px] leading-[1.85]';
    }
  }, [readerFontSize]);

  const readerWidthClass = useMemo(() => {
    switch (readerColumnWidth) {
      case 'focused':
        return 'max-w-xl mx-auto w-full';
      case 'wide':
        return 'max-w-4xl mx-auto w-full';
      case 'standard':
      default:
        return 'max-w-2xl mx-auto w-full';
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
  };
}
