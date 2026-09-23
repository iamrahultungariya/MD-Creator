import React, { useRef, useEffect } from 'react';
import { 
  Type, 
  Minus, 
  Plus, 
  Check, 
  Sun,
  Coffee,
  Moon,
  Compass
} from 'lucide-react';
import { 
  useReaderSettingsStore, 
  ReaderTheme, 
  ReaderFontFamily, 
  ReaderFontSize, 
  ReaderColumnWidth 
} from '../../../stores/useReaderSettingsStore';

interface ReaderAppearancePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export const ReaderAppearancePopover: React.FC<ReaderAppearancePopoverProps> = ({
  isOpen,
  onClose,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const {
    theme,
    fontFamily,
    fontSize,
    columnWidth,
    setTheme,
    setFontFamily,
    setFontSize,
    setColumnWidth,
  } = useReaderSettingsStore();

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const THEMES: { id: ReaderTheme; label: string; bg: string; border: string; text: string; icon: React.ElementType }[] = [
    {
      id: 'default',
      label: 'Default',
      bg: 'bg-white dark:bg-neutral-900',
      border: 'border-neutral-200 dark:border-neutral-700',
      text: 'text-neutral-900 dark:text-white',
      icon: Sun,
    },
    {
      id: 'sepia',
      label: 'Warm Sepia',
      bg: 'bg-[#FBF0D9] dark:bg-[#27211C]',
      border: 'border-[#EADBC3] dark:border-[#3E342B]',
      text: 'text-[#382E25] dark:text-[#E2CBB7]',
      icon: Coffee,
    },
    {
      id: 'slate',
      label: 'Nordic Slate',
      bg: 'bg-[#F1F5F9] dark:bg-[#1E2530]',
      border: 'border-[#E2E8F0] dark:border-[#2C3646]',
      text: 'text-[#1E293B] dark:text-[#CBD5E1]',
      icon: Compass,
    },
    {
      id: 'midnight',
      label: 'Midnight',
      bg: 'bg-[#0B0C0E]',
      border: 'border-neutral-800',
      text: 'text-neutral-300',
      icon: Moon,
    },
  ];

  const FONT_FAMILIES: { id: ReaderFontFamily; label: string; fontClass: string; example: string }[] = [
    { id: 'serif', label: 'Serif', fontClass: 'font-serif-reading', example: 'Editorial / Books' },
    { id: 'sans', label: 'Sans', fontClass: 'font-sans-reading', example: 'Clean / Modern' },
    { id: 'mono', label: 'Mono', fontClass: 'font-mono-reading', example: 'Technical / Specs' },
  ];

  const FONT_SIZES: { id: ReaderFontSize; label: string; px: string }[] = [
    { id: 'sm', label: 'Small', px: '15px' },
    { id: 'base', label: 'Normal', px: '17px' },
    { id: 'lg', label: 'Large', px: '19px' },
    { id: 'xl', label: 'XL', px: '21px' },
  ];

  const COLUMN_WIDTHS: { id: ReaderColumnWidth; label: string; desc: string }[] = [
    { id: 'focused', label: 'Focused', desc: '580px' },
    { id: 'standard', label: 'Standard', desc: '740px' },
    { id: 'wide', label: 'Wide', desc: '960px' },
  ];

  const handleStepFontSize = (delta: number) => {
    const order: ReaderFontSize[] = ['sm', 'base', 'lg', 'xl'];
    const currentIndex = order.indexOf(fontSize);
    const nextIndex = Math.max(0, Math.min(order.length - 1, currentIndex + delta));
    setFontSize(order[nextIndex]);
  };

  return (
    <div
      ref={popoverRef}
      className="absolute top-14 right-4 sm:right-6 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-white/95 dark:bg-[#1a1b20]/95 backdrop-blur-xl border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xl p-4.5 z-50 text-neutral-900 dark:text-neutral-100 select-none animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100 dark:border-neutral-800/80">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-neutral-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Reading Appearance
          </h4>
        </div>
        <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
          Eye Comfort
        </span>
      </div>

      <div className="space-y-4">
        {/* 1. Paper / Eye-Comfort Themes */}
        <div>
          <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
            Environment & Paper Tone
          </label>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map((t) => {
              const isSelected = theme === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${t.bg} ${t.border} ${t.text} ${
                    isSelected ? 'ring-2 ring-neutral-900 dark:ring-white shadow-sm font-bold' : 'opacity-85 hover:opacity-100 hover:scale-[1.02]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs truncate">{t.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Typography Font Family */}
        <div>
          <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
            Typography Style
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/70 border border-neutral-200/60 dark:border-neutral-700/60">
            {FONT_FAMILIES.map((f) => {
              const isSelected = fontFamily === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFontFamily(f.id)}
                  className={`py-1.5 px-2 rounded-lg text-xs transition-all cursor-pointer text-center ${f.fontClass} ${
                    isSelected
                      ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white font-bold shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                  title={f.example}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Font Size Stepper */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
              Text Scale
            </label>
            <span className="text-[11px] font-mono text-neutral-400 font-medium">
              {FONT_SIZES.find((s) => s.id === fontSize)?.px}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/70 border border-neutral-200/60 dark:border-neutral-700/60">
            <button
              onClick={() => handleStepFontSize(-1)}
              disabled={fontSize === 'sm'}
              className="p-1.5 rounded-lg bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
              title="Decrease Font Size"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5 flex-1 justify-center">
              {FONT_SIZES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setFontSize(s.id)}
                  className={`w-7 h-7 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center justify-center ${
                    fontSize === s.id
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-700'
                  }`}
                >
                  A
                </button>
              ))}
            </div>

            <button
              onClick={() => handleStepFontSize(1)}
              disabled={fontSize === 'xl'}
              className="p-1.5 rounded-lg bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
              title="Increase Font Size"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4. Column Width */}
        <div>
          <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
            Reading Width
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/70 border border-neutral-200/60 dark:border-neutral-700/60 text-xs">
            {COLUMN_WIDTHS.map((w) => {
              const isSelected = columnWidth === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => setColumnWidth(w.id)}
                  className={`py-1.5 px-2 rounded-lg transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-medium'
                  }`}
                >
                  {w.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
