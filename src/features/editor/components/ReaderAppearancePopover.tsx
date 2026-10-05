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
  const theme = useReaderSettingsStore((s) => s.theme);
  const fontFamily = useReaderSettingsStore((s) => s.fontFamily);
  const fontSize = useReaderSettingsStore((s) => s.fontSize);
  const columnWidth = useReaderSettingsStore((s) => s.columnWidth);
  const setTheme = useReaderSettingsStore((s) => s.setTheme);
  const setFontFamily = useReaderSettingsStore((s) => s.setFontFamily);
  const setFontSize = useReaderSettingsStore((s) => s.setFontSize);
  const setColumnWidth = useReaderSettingsStore((s) => s.setColumnWidth);

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
    { id: 'lexend', label: 'Lexend', fontClass: 'font-lexend', example: 'Reading Fluency' },
    { id: 'arial', label: 'Arial', fontClass: 'font-arial', example: 'Clean & Crisp' },
    { id: 'lato', label: 'Lato', fontClass: 'font-lato', example: 'Warm & Legible' },
  ];

  const FONT_SIZES: { id: ReaderFontSize; label: string; px: string }[] = [
    { id: 'sm', label: 'Small', px: '15px' },
    { id: 'base', label: 'Normal', px: '17px' },
    { id: 'lg', label: 'Large', px: '19px' },
    { id: 'xl', label: 'XL', px: '21px' },
  ];

  const COLUMN_WIDTHS: { id: ReaderColumnWidth; label: string; desc: string; persona: string }[] = [
    { id: 'focused', label: 'Zen Prose', desc: '680px', persona: 'Distraction-free' },
    { id: 'standard', label: 'Classic Doc', desc: '896px', persona: 'Balanced Specs' },
    { id: 'wide', label: 'Engineering', desc: '1360px', persona: 'Data & Diagrams' },
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
      className="absolute top-14 right-2 sm:right-6 w-80 max-w-[calc(100vw-1rem)] rounded-xl bg-white dark:bg-[#1a1b20] border border-neutral-200 dark:border-neutral-800 shadow-2xl p-4 z-50 text-neutral-900 dark:text-neutral-100 font-sans select-none animate-in fade-in duration-100 will-change-transform"
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100 dark:border-neutral-800/80">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-sans">
            Reading Appearance
          </h4>
        </div>
        <span className="text-[10px] font-sans font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md border border-neutral-200/70 dark:border-neutral-700/70">
          Eye Comfort
        </span>
      </div>

      <div className="space-y-4">
        {/* 1. Paper / Eye-Comfort Themes */}
        <div>
          <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-2 font-sans">
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
                  className={`p-2.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer font-sans ${t.bg} ${t.border} ${t.text} ${
                    isSelected ? 'ring-2 ring-brand-500 dark:ring-brand-400 shadow-xs font-bold' : 'opacity-85 hover:opacity-100 hover:scale-[1.02]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs truncate">{t.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-brand-600 dark:text-brand-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Typography Font Family */}
        <div>
          <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-2 font-sans">
            Typography Style
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/70 border border-neutral-200/60 dark:border-neutral-700/60 font-sans">
            {FONT_FAMILIES.map((f) => {
              const isSelected = fontFamily === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFontFamily(f.id)}
                  className={`py-1.5 px-2 rounded-md text-xs transition-all cursor-pointer text-center ${f.fontClass} ${
                    isSelected
                      ? 'bg-white dark:bg-neutral-900 text-brand-600 dark:text-brand-400 font-bold shadow-xs border border-neutral-200/60 dark:border-neutral-700/60'
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
            <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 font-sans">
              Text Scale
            </label>
            <span className="text-[11px] font-sans font-medium text-neutral-400">
              {FONT_SIZES.find((s) => s.id === fontSize)?.px}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/70 border border-neutral-200/60 dark:border-neutral-700/60">
            <button
              onClick={() => handleStepFontSize(-1)}
              disabled={fontSize === 'sm'}
              className="p-1.5 rounded-md bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
              title="Decrease Font Size"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5 flex-1 justify-center">
              {FONT_SIZES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setFontSize(s.id)}
                  className={`w-7 h-7 rounded-md text-[11px] font-medium transition-all cursor-pointer flex items-center justify-center ${
                    fontSize === s.id
                      ? 'bg-brand-500 text-white font-bold shadow-xs'
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
              className="p-1.5 rounded-md bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
              title="Increase Font Size"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4. Persona Column Width */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 font-sans">
              Reading Persona & Canvas
            </label>
            <span className="text-[10px] font-sans text-neutral-400 font-medium">
              {COLUMN_WIDTHS.find((w) => w.id === columnWidth)?.desc}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/70 border border-neutral-200/60 dark:border-neutral-700/60 text-xs font-sans">
            {COLUMN_WIDTHS.map((w) => {
              const isSelected = columnWidth === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => setColumnWidth(w.id)}
                  className={`py-2 px-1.5 rounded-md transition-all cursor-pointer text-center flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-medium'
                  }`}
                  title={`${w.label} (${w.desc}) - ${w.persona}`}
                >
                  <span className="text-[11px] font-semibold leading-tight">{w.label}</span>
                  <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-400 dark:text-neutral-500'}`}>
                    {w.persona}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
