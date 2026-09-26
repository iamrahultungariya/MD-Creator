import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  RotateCcw, 
  FileText, 
  X, 
  Palette,
  HelpCircle
} from 'lucide-react';
import { parseSlides, SlideData } from '../../utils/slideParser';
import { MarkdownPreview } from '../../components/editor/MarkdownPreview';
import { useThemeStore } from '../../stores/useThemeStore';

export type PresentationTheme = 'dark' | 'paper' | 'sepia' | 'nordic';

interface PresentationViewProps {
  content: string;
  title: string;
  onExit: () => void;
}

export const PresentationView: React.FC<PresentationViewProps> = ({
  content,
  title: _title,
  onExit,
}) => {
  const slides = useMemo(() => parseSlides(content), [content]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [theme, setTheme] = useState<PresentationTheme>('dark');
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHudVisible, setIsHudVisible] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  // Presenter Stopwatch
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const hudTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalSlides = slides.length;
  const currentSlide: SlideData = slides[currentSlideIndex] || slides[0];

  // Stopwatch interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Slide navigation
  const nextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.min(prev + 1, totalSlides - 1));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToSlide = (idx: number) => {
    if (idx >= 0 && idx < totalSlides) {
      setCurrentSlideIndex(idx);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.warn('Fullscreen request failed:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.warn('Exit fullscreen failed:', err);
      }
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is inside an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
        case 'Enter':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'Backspace':
          e.preventDefault();
          prevSlide();
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          goToSlide(totalSlides - 1);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          setIsNotesOpen((prev) => !prev);
          break;
        case '?':
          e.preventDefault();
          setShowHelp((prev) => !prev);
          break;
        case 'Escape':
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(console.warn);
          }
          onExit();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, totalSlides, toggleFullscreen, onExit]);

  // Auto-hiding HUD on mouse idle
  const handleMouseMove = useCallback(() => {
    setIsHudVisible(true);
    if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    hudTimeoutRef.current = setTimeout(() => {
      setIsHudVisible(false);
    }, 2800);
  }, []);

  useEffect(() => {
    return () => {
      if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    };
  }, []);

  // Synchronize document.documentElement '.dark' class with presentation theme
  // (dark/nordic -> add dark, paper/sepia -> remove dark).
  // Restore original theme state on unmount.
  useEffect(() => {
    const isPresentationDark = theme === 'dark' || theme === 'nordic';
    if (isPresentationDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return () => {
      const originalIsDark = useThemeStore.getState().isDark;
      if (originalIsDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
  }, [theme]);

  // Theme styles
  const themeClasses: Record<PresentationTheme, { bg: string; text: string; card: string; border: string; prose: string }> = {
    dark: {
      bg: 'bg-[#0c0d12]',
      text: 'text-neutral-100',
      card: 'bg-[#14151c]/90 text-neutral-100',
      border: 'border-neutral-800/80',
      prose: 'prose-invert text-neutral-100',
    },
    paper: {
      bg: 'bg-[#f8f6f2]',
      text: 'text-neutral-900',
      card: 'bg-white/95 text-neutral-900',
      border: 'border-neutral-200/90',
      prose: 'text-neutral-900',
    },
    sepia: {
      bg: 'bg-[#f6ebd7]',
      text: 'text-[#3b2d20]',
      card: 'bg-[#fbf4e8]/95 text-[#3b2d20]',
      border: 'border-[#ebd5bc]',
      prose: 'text-[#3b2d20]',
    },
    nordic: {
      bg: 'bg-[#181d24]',
      text: 'text-[#d8dee9]',
      card: 'bg-[#202731]/95 text-[#d8dee9]',
      border: 'border-[#2e3745]',
      prose: 'prose-invert text-[#d8dee9]',
    },
  };

  const currentTheme = themeClasses[theme];
  const progressPercent = ((currentSlideIndex + 1) / totalSlides) * 100;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-50 flex flex-col select-none overflow-hidden transition-colors duration-300 ${currentTheme.bg} ${currentTheme.text}`}
    >
      {/* Top Floating Mini Header (Exit & Slide Jumper) */}
      <div 
        className={`absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none transition-opacity duration-200 ${
          isHudVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onExit}
            className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-lg border border-white/10 transition-all hover:scale-105"
            title="Exit Presentation Mode (Esc)"
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit</span>
            <kbd className="font-mono text-[10px] bg-white/20 px-1 py-0.2 rounded ml-0.5">Esc</kbd>
          </button>

          <button
            onClick={() => setShowHelp((prev) => !prev)}
            className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white backdrop-blur-md cursor-pointer border border-white/10 transition-all"
            title="Keyboard Shortcuts (?)"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Slide Counter Selector */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-mono border border-white/10 shadow-lg">
          <select
            value={currentSlideIndex}
            onChange={(e) => goToSlide(Number(e.target.value))}
            className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
          >
            {slides.map((s, idx) => (
              <option key={s.index} value={idx} className="bg-neutral-900 text-white">
                Slide {idx + 1}: {s.title.slice(0, 24)}
              </option>
            ))}
          </select>
          <span className="text-white/40">/</span>
          <span>{totalSlides}</span>
        </div>
      </div>

      {/* Main Slide Stage */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 md:p-16 overflow-y-auto">
        <div 
          className={`w-full max-w-5xl rounded-3xl p-8 sm:p-14 md:p-20 shadow-2xl transition-all duration-300 border flex flex-col justify-center min-h-[60vh] max-h-[85vh] overflow-y-auto select-text ${currentTheme.card} ${currentTheme.border}`}
        >
          <div className={`prose prose-lg sm:prose-xl lg:prose-2xl max-w-none text-inherit leading-relaxed font-sans ${currentTheme.prose}`}>
            <MarkdownPreview content={currentSlide.body} className="text-inherit" />
          </div>
        </div>
      </div>

      {/* Slide Navigation Click Zones (Invisible desktop arrows on edges) */}
      <button
        onClick={prevSlide}
        disabled={currentSlideIndex === 0}
        className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md transition-all cursor-pointer border border-white/10 shadow-xl ${
          currentSlideIndex === 0 ? 'opacity-0 pointer-events-none' : isHudVisible ? 'opacity-70 hover:opacity-100 hover:scale-110' : 'opacity-0'
        }`}
        title="Previous Slide (← / Backspace)"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        disabled={currentSlideIndex === totalSlides - 1}
        className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md transition-all cursor-pointer border border-white/10 shadow-xl ${
          currentSlideIndex === totalSlides - 1 ? 'opacity-0 pointer-events-none' : isHudVisible ? 'opacity-70 hover:opacity-100 hover:scale-110' : 'opacity-0'
        }`}
        title="Next Slide (→ / Space / Enter)"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Speaker Notes Drawer (Optional) */}
      {isNotesOpen && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-11/12 max-w-2xl bg-neutral-900/95 text-neutral-200 border border-neutral-700/80 rounded-2xl p-4 backdrop-blur-xl shadow-2xl z-40 text-xs animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 font-semibold text-neutral-400">
            <div className="flex items-center gap-1.5 text-white font-mono">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Speaker Notes (Slide {currentSlideIndex + 1})</span>
            </div>
            <button
              onClick={() => setIsNotesOpen(false)}
              className="text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {currentSlide.notes || (
              <span className="text-neutral-500 italic">
                No speaker notes for this slide. Add notes in markdown using:
                <br />
                <code className="text-amber-400 font-mono text-[11px]">&lt;!-- note: your notes here --&gt;</code>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-neutral-900 text-white border border-neutral-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 font-bold">
              <span>Presentation Shortcuts</span>
              <button onClick={() => setShowHelp(false)} className="text-neutral-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="text-neutral-400">Next Slide</div>
              <div className="text-right">→ / Space / Enter</div>
              <div className="text-neutral-400">Previous Slide</div>
              <div className="text-right">← / Backspace</div>
              <div className="text-neutral-400">First / Last Slide</div>
              <div className="text-right">Home / End</div>
              <div className="text-neutral-400">Speaker Notes</div>
              <div className="text-right">N</div>
              <div className="text-neutral-400">Toggle Fullscreen</div>
              <div className="text-right">F</div>
              <div className="text-neutral-400">Exit Presentation</div>
              <div className="text-right">Esc</div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Presenter HUD */}
      <div
        className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-40 transition-opacity duration-200 select-none ${
          isHudVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3 px-4 py-2 rounded-full bg-neutral-950/85 text-neutral-300 backdrop-blur-xl border border-white/10 shadow-2xl text-xs">
          {/* Previous / Next */}
          <div className="flex items-center gap-1">
            <button
              onClick={prevSlide}
              disabled={currentSlideIndex === 0}
              className="p-1.5 rounded-full hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all"
              title="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs text-white font-bold px-1">
              {currentSlideIndex + 1} <span className="text-neutral-500 font-normal">/ {totalSlides}</span>
            </span>
            <button
              onClick={nextSlide}
              disabled={currentSlideIndex === totalSlides - 1}
              className="p-1.5 rounded-full hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all"
              title="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="h-3.5 w-px bg-white/15" />

          {/* Presenter Stopwatch */}
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-300">
            <button
              onClick={() => setIsTimerRunning((prev) => !prev)}
              className="p-1 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
              title={isTimerRunning ? 'Pause timer' : 'Resume timer'}
            >
              {isTimerRunning ? <Pause className="w-3 h-3 text-emerald-400" /> : <Play className="w-3 h-3 text-amber-400" />}
            </button>
            <span className="font-semibold text-white tracking-wider">{formatTimer(timerSeconds)}</span>
            <button
              onClick={() => setTimerSeconds(0)}
              className="p-1 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
              title="Reset stopwatch"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <div className="h-3.5 w-px bg-white/15" />

          {/* Theme switcher */}
          <div className="flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-neutral-400 mr-0.5" />
            {(['dark', 'paper', 'sepia', 'nordic'] as PresentationTheme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                  t === 'dark' ? 'bg-[#0c0d12] border-neutral-600' :
                  t === 'paper' ? 'bg-[#f8f6f2] border-neutral-400' :
                  t === 'sepia' ? 'bg-[#f6ebd7] border-amber-400' :
                  'bg-[#181d24] border-blue-400'
                } ${theme === t ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'}`}
                title={`Theme: ${t}`}
              />
            ))}
          </div>

          <div className="h-3.5 w-px bg-white/15" />

          {/* Speaker Notes Toggle */}
          <button
            onClick={() => setIsNotesOpen((prev) => !prev)}
            className={`p-1.5 rounded-full cursor-pointer transition-all ${
              isNotesOpen ? 'bg-amber-500 text-neutral-950 font-bold' : 'hover:bg-white/10 text-neutral-300 hover:text-white'
            }`}
            title="Toggle Speaker Notes (N)"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white cursor-pointer transition-all"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
        <div
          className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
