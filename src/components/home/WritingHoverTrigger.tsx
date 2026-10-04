import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SAMPLE_TEXT = `# Quiet your mind
- [x] Write in plain text
- [x] Local-first storage
> "Simplicity is clarity."`;

export const WritingHoverTrigger: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-typing animation when hover is active
  useEffect(() => {
    if (isOpen) {
      setIsTyping(true);
      setDisplayedText('');
      let index = 0;

      const typeNextChar = () => {
        if (index < SAMPLE_TEXT.length) {
          setDisplayedText(SAMPLE_TEXT.slice(0, index + 1));
          index++;
          // Natural human keystroke timing
          const char = SAMPLE_TEXT[index - 1];
          const delay = char === '\n' ? 120 : 30 + Math.random() * 20;
          timerRef.current = setTimeout(typeNextChar, delay);
        } else {
          setIsTyping(false);
        }
      };

      timerRef.current = setTimeout(typeNextChar, 120);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      setDisplayedText('');
      setIsTyping(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen]);

  const lines = displayedText.split('\n');

  return (
    <span 
      className="relative inline align-baseline"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
      tabIndex={0}
      role="button"
      aria-label="Interactive writing preview"
    >
      {/* Interactive Trigger Word in Theme Font with Purple Dotted Border */}
      <span className="relative z-10 font-sans font-semibold text-brand-600 dark:text-brand-400 border-b-2 border-dotted border-brand-500/70 dark:border-brand-400/70 pb-0.5 cursor-pointer hover:text-brand-700 dark:hover:text-brand-300 hover:border-brand-700 dark:hover:border-brand-300 transition-colors tracking-normal inline">
        writing
      </span>

      {/* Floating Mini Editor Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 z-50 w-72 sm:w-80 pointer-events-none select-none text-left"
          >
            {/* Window Card Frame */}
            <div className="rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-2xl shadow-neutral-900/15 dark:shadow-black/70 overflow-hidden font-sans">
              
              {/* Mini Titlebar with macOS Traffic Lights */}
              <div className="px-3.5 py-2 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-950/50">
                <div className="flex items-center gap-1.5 group/traffic cursor-pointer">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] border border-[#e0443e]/50 flex items-center justify-center text-[7px] font-bold text-[#4c0000] shadow-xs">
                    <span className="opacity-0 group-hover/traffic:opacity-100 transition-opacity leading-none">✕</span>
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] border border-[#dea123]/50 flex items-center justify-center text-[7px] font-bold text-[#5c3c00] shadow-xs">
                    <span className="opacity-0 group-hover/traffic:opacity-100 transition-opacity leading-none">−</span>
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] border border-[#1aab29]/50 flex items-center justify-center text-[7px] font-bold text-[#004d11] shadow-xs">
                    <span className="opacity-0 group-hover/traffic:opacity-100 transition-opacity leading-none">+</span>
                  </span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 font-medium">
                  spark.md
                </span>
                <span className="text-[9px] font-mono text-neutral-500 dark:text-neutral-400">
                  0ms
                </span>
              </div>

              {/* Editor Code Area with Connected Inline Caret */}
              <div className="p-3.5 font-mono text-[11px] tracking-normal leading-[1.65] min-h-[110px] text-neutral-800 dark:text-neutral-200 whitespace-pre font-normal">
                {lines.map((line, idx) => {
                  const isLastLine = idx === lines.length - 1;
                  let lineStyle = 'text-neutral-700 dark:text-neutral-300';
                  
                  if (line.startsWith('#')) {
                    lineStyle = 'font-semibold text-neutral-950 dark:text-white';
                  } else if (line.startsWith('- [x]')) {
                    lineStyle = 'text-neutral-800 dark:text-neutral-200';
                  } else if (line.startsWith('>')) {
                    lineStyle = 'text-neutral-500 dark:text-neutral-400 italic';
                  }

                  return (
                    <div key={idx} className={`${lineStyle} flex items-center flex-wrap`}>
                      <span>{line}</span>
                      {/* Cursor attached directly to the last typed character */}
                      {isLastLine && (
                        <span 
                          className={`inline-block w-1.5 h-3.5 bg-neutral-900 dark:bg-white ml-0.5 align-middle ${
                            isTyping ? 'opacity-100' : 'animate-pulse'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mini Footer Micro-telemetry */}
              <div className="px-3.5 py-1.5 border-t border-neutral-100 dark:border-neutral-800/70 bg-neutral-50/50 dark:bg-neutral-950/30 flex items-center justify-between text-[9px] font-mono text-neutral-400">
                <span>Markdown Buffer</span>
                <span className="text-neutral-500">100% Local</span>
              </div>

            </div>

            {/* Bottom Caret / Arrow */}
            <div className="w-2.5 h-2.5 bg-white dark:bg-neutral-900 border-r border-b border-neutral-200/90 dark:border-neutral-800 rotate-45 mx-auto -mt-1 shadow-xs" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};
