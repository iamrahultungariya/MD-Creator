import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Search, 
  ChevronUp, 
  ChevronDown, 
  X, 
  ChevronRight 
} from 'lucide-react';

interface FindReplaceBarProps {
  isOpen: boolean;
  onClose: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  content: string;
  setContent: (val: string) => void;
  executeSave: (content: string, title: string) => void;
  title: string;
  initialMode?: 'find' | 'replace';
}

interface MatchPosition {
  start: number;
  end: number;
}

export const FindReplaceBar: React.FC<FindReplaceBarProps> = ({
  isOpen,
  onClose,
  textareaRef,
  content,
  setContent,
  executeSave,
  title,
  initialMode = 'find',
}) => {
  const [findQuery, setFindQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [isReplaceOpen, setIsReplaceOpen] = useState(initialMode === 'replace');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const findInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Sync replace mode with initialMode prop
  useEffect(() => {
    if (isOpen) {
      if (initialMode === 'replace') {
        setIsReplaceOpen(true);
      }
      setTimeout(() => {
        findInputRef.current?.focus();
        findInputRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialMode]);

  // Compute all match positions
  const matches = useMemo<MatchPosition[]>(() => {
    if (!findQuery) return [];

    let pattern = findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (wholeWord) {
      pattern = `\\b${pattern}\\b`;
    }

    try {
      const regex = new RegExp(pattern, caseSensitive ? 'g' : 'gi');
      const results: MatchPosition[] = [];
      let match: RegExpExecArray | null;

      while ((match = regex.exec(content)) !== null) {
        results.push({
          start: match.index,
          end: match.index + match[0].length,
        });
      }
      return results;
    } catch {
      return [];
    }
  }, [findQuery, content, caseSensitive, wholeWord]);

  // Clamp current match index when matches change
  useEffect(() => {
    if (matches.length === 0) {
      setCurrentMatchIndex(0);
    } else if (currentMatchIndex >= matches.length) {
      setCurrentMatchIndex(0);
    }
  }, [matches, currentMatchIndex]);

  // Select and scroll to active match
  const highlightMatch = useCallback(
    (index: number) => {
      if (matches.length === 0 || !textareaRef.current) return;
      const target = matches[index];
      if (!target) return;

      const ta = textareaRef.current;
      ta.focus({ preventScroll: true });
      ta.setSelectionRange(target.start, target.end);

      // Scroll cursor into view
      const textBefore = content.substring(0, target.start);
      const lineNumber = textBefore.split('\n').length;
      const lineHeight = 24;
      const targetScroll = Math.max(0, (lineNumber - 1) * lineHeight - ta.clientHeight / 2);
      ta.scrollTop = targetScroll;
    },
    [matches, textareaRef, content]
  );

  const handleNext = useCallback(() => {
    if (matches.length === 0) return;
    const next = (currentMatchIndex + 1) % matches.length;
    setCurrentMatchIndex(next);
    highlightMatch(next);
  }, [matches, currentMatchIndex, highlightMatch]);

  const handlePrev = useCallback(() => {
    if (matches.length === 0) return;
    const prev = (currentMatchIndex - 1 + matches.length) % matches.length;
    setCurrentMatchIndex(prev);
    highlightMatch(prev);
  }, [matches, currentMatchIndex, highlightMatch]);

  const handleReplaceCurrent = useCallback(() => {
    if (matches.length === 0 || !textareaRef.current) return;
    const target = matches[currentMatchIndex];
    if (!target) return;

    const before = content.substring(0, target.start);
    const after = content.substring(target.end);
    const nextContent = before + replaceQuery + after;

    setContent(nextContent);
    executeSave(nextContent, title);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus({ preventScroll: true });
        const newCaret = target.start + replaceQuery.length;
        textareaRef.current.setSelectionRange(newCaret, newCaret);
      }
    }, 20);
  }, [matches, currentMatchIndex, content, replaceQuery, setContent, executeSave, title, textareaRef]);

  const handleReplaceAll = useCallback(() => {
    if (matches.length === 0) return;

    let pattern = findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (wholeWord) {
      pattern = `\\b${pattern}\\b`;
    }

    const regex = new RegExp(pattern, caseSensitive ? 'g' : 'gi');
    const nextContent = content.replace(regex, replaceQuery);

    setContent(nextContent);
    executeSave(nextContent, title);
    setCurrentMatchIndex(0);
  }, [findQuery, replaceQuery, content, caseSensitive, wholeWord, setContent, executeSave, title, matches.length]);

  // Keydown shortcuts inside find input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        handlePrev();
      } else {
        handleNext();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      textareaRef.current?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-2 right-4 z-40 bg-white/95 dark:bg-[#1f1f26]/95 backdrop-blur-md border border-neutral-200 dark:border-neutral-700/80 shadow-2xl rounded-2xl p-2.5 w-[330px] sm:w-[380px] text-xs animate-in fade-in slide-in-from-top-2 duration-150 select-none">
      {/* Row 1: Find Input & Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setIsReplaceOpen((prev) => !prev)}
          className={`p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-transform ${
            isReplaceOpen ? 'rotate-90 text-neutral-900 dark:text-white' : ''
          }`}
          title="Toggle Replace"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <div className="relative flex-1">
          <input
            ref={findInputRef}
            type="text"
            value={findQuery}
            onChange={(e) => {
              setFindQuery(e.target.value);
              setCurrentMatchIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Find (Ctrl+F)..."
            className="w-full pl-7 pr-16 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/80 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100 text-xs font-mono"
          />
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />

          {/* Match Counter Badge */}
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
            {findQuery ? (matches.length > 0 ? `${currentMatchIndex + 1}/${matches.length}` : '0 results') : ''}
          </span>
        </div>

        {/* Options: Case Sensitive & Whole Word */}
        <button
          onClick={() => setCaseSensitive((prev) => !prev)}
          className={`px-1.5 py-1 rounded-lg border font-mono font-bold text-[10px] transition-colors ${
            caseSensitive
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-transparent'
              : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          title="Match Case"
        >
          Aa
        </button>

        <button
          onClick={() => setWholeWord((prev) => !prev)}
          className={`px-1.5 py-1 rounded-lg border font-mono font-bold text-[10px] transition-colors ${
            wholeWord
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-transparent'
              : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          title="Match Whole Word"
        >
          \b
        </button>

        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          disabled={matches.length === 0}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Previous Match (Shift+Enter)"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleNext}
          disabled={matches.length === 0}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Next Match (Enter)"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => {
            onClose();
            textareaRef.current?.focus();
          }}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          title="Close (Esc)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Row 2: Replace Input & Buttons (Collapsible) */}
      {isReplaceOpen && (
        <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center gap-1.5 animate-in fade-in duration-100">
          <div className="relative flex-1 pl-5">
            <input
              ref={replaceInputRef}
              type="text"
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleReplaceCurrent();
                } else if (e.key === 'Escape') {
                  onClose();
                  textareaRef.current?.focus();
                }
              }}
              placeholder="Replace (Ctrl+H)..."
              className="w-full px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/80 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100 text-xs font-mono"
            />
          </div>

          <button
            onClick={handleReplaceCurrent}
            disabled={matches.length === 0}
            className="px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed font-medium text-[11px] transition-colors"
            title="Replace current match"
          >
            Replace
          </button>

          <button
            onClick={handleReplaceAll}
            disabled={matches.length === 0}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold text-[11px] hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Replace all occurrences"
          >
            All
          </button>
        </div>
      )}
    </div>
  );
};
