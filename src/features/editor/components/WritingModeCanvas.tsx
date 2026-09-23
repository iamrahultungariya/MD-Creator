import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Check, 
  Clock, 
  Flame, 
  ArrowUpDown, 
  CloudOff, 
  ListTree
} from 'lucide-react';
import { CodeMirrorEditor, CodeMirrorEditorHandle } from './CodeMirrorEditor';
import { SlashCommandMenu } from '../../../components/editor/SlashCommandMenu';

interface WritingModeCanvasProps {
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  executeSave: (content: string, title: string) => void;
  queueAutoSave: (content: string, title: string) => void;
  isSaved: boolean;
  isSaving: boolean;
  isOffline?: boolean;
  wordCount: number;
  readingTime: number | string;
  isTypewriterMode: boolean;
  onToggleTypewriter: () => void;
  isSprintActive?: boolean;
  wordsWrittenInSprint?: number;
  onOpenSprintPopover?: () => void;
  onOpenOutline?: () => void;
  onPasteImage?: (file: File) => void;
  onDropImage?: (file: File) => void;
  editorRef?: React.RefObject<CodeMirrorEditorHandle | null>;
  // Slash commands
  isSlashMenuOpen: boolean;
  setIsSlashMenuOpen: (open: boolean) => void;
  slashSelectedIndex: number;
  slashQuery: string;
  onInsertSnippet: (snippet: string) => void;
  onKeyDown?: (e: KeyboardEvent) => boolean | void;
}

export const WritingModeCanvas: React.FC<WritingModeCanvasProps> = ({
  title,
  setTitle,
  content,
  setContent,
  executeSave,
  queueAutoSave,
  isSaved,
  isSaving,
  isOffline = false,
  wordCount,
  readingTime,
  isTypewriterMode,
  onToggleTypewriter,
  isSprintActive = false,
  wordsWrittenInSprint = 0,
  onOpenSprintPopover,
  onOpenOutline,
  onPasteImage,
  onDropImage,
  editorRef,
  onKeyDown,
  isSlashMenuOpen,
  setIsSlashMenuOpen,
  slashSelectedIndex,
  slashQuery,
  onInsertSnippet,
}) => {
  const [isTypingActive, setIsTypingActive] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Auto-fade dock while actively writing
  const handleContentChange = useCallback(
    (newVal: string) => {
      setContent(newVal);
      queueAutoSave(newVal, title);

      setIsTypingActive(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        setIsTypingActive(false);
      }, 1800);
    },
    [setContent, queueAutoSave, title]
  );

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      editorRef?.current?.focus();
    }
  };

  const handleSlashTrigger = (_query: string) => {
    // If slash typed, open slash menu
    setIsSlashMenuOpen(true);
  };

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  return (
    <div className="relative flex-1 flex flex-col h-full bg-[#fdfdfd] dark:bg-[#111114] text-neutral-800 dark:text-neutral-100 transition-colors overflow-hidden select-text">
      {/* Integrated Document Title Header (Notion / Craft style) */}
      <div className="w-full max-w-3xl mx-auto px-6 sm:px-12 pt-8 sm:pt-10 pb-2 shrink-0">
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleTitleKeyDown}
          onBlur={() => executeSave(content, title)}
          placeholder="Untitled Document..."
          className="w-full bg-transparent font-black text-2xl sm:text-4xl text-neutral-900 dark:text-white placeholder-neutral-300 dark:placeholder-neutral-700 focus:outline-none tracking-tight leading-tight transition-colors border-b border-transparent focus:border-neutral-200 dark:focus:border-neutral-800/60 pb-2"
        />
      </div>

      {/* CodeMirror 6 Virtualized Document Writing Area */}
      <div className="flex-1 w-full max-w-3xl mx-auto px-6 sm:px-12 pb-20 overflow-hidden relative">
        <CodeMirrorEditor
          value={content}
          onChange={handleContentChange}
          onSlashTrigger={handleSlashTrigger}
          isTypewriterMode={isTypewriterMode}
          showLineNumbers={false} // Clean paper feel for writers!
          placeholder="Write your thoughts, ideas, specs or story... (Type / for quick actions)"
          onPasteImage={onPasteImage}
          onDropImage={onDropImage}
          editorRef={editorRef}
          onKeyDown={onKeyDown}
          className="h-full w-full"
          autoFocus
        />

        {/* Slash Command Palette Floating Inside Canvas */}
        <div className="relative">
          <SlashCommandMenu
            isOpen={isSlashMenuOpen}
            selectedIndex={slashSelectedIndex}
            searchQuery={slashQuery}
            onSelect={(snippet) => {
              onInsertSnippet(snippet);
              setIsSlashMenuOpen(false);
            }}
            onClose={() => setIsSlashMenuOpen(false)}
          />
        </div>
      </div>

      {/* Floating Ambient Writer Dock (Bottom Pill) */}
      <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 pointer-events-auto ${
          isTypingActive ? 'opacity-25 hover:opacity-100' : 'opacity-100'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200/90 dark:border-neutral-800/90 shadow-xl text-xs select-none">
          {/* Telemetry: Words & Reading Time */}
          <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300 font-medium px-1">
            <span className="font-semibold text-neutral-900 dark:text-white">
              {wordCount.toLocaleString()}
            </span>
            <span className="text-[11px] text-neutral-400">words</span>
            <span className="text-neutral-300 dark:text-neutral-700 mx-0.5">•</span>
            <div className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400">
              <Clock className="w-3 h-3 text-neutral-400" />
              <span>{typeof readingTime === 'number' ? `${readingTime}m` : readingTime}</span>
            </div>
          </div>

          <div className="h-3.5 w-px bg-neutral-200 dark:bg-neutral-800" />

          {/* Save Status Badge */}
          <div className="flex items-center gap-1.5 px-1 font-mono text-[11px]">
            {isOffline ? (
              <span className="text-amber-500 flex items-center gap-1" title="Offline: Saved in local cache">
                <CloudOff className="w-3 h-3" />
                <span className="hidden sm:inline">Offline</span>
              </span>
            ) : isSaving ? (
              <span className="text-amber-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                <span className="hidden sm:inline">Saving</span>
              </span>
            ) : isSaved ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span className="hidden sm:inline">Saved</span>
              </span>
            ) : (
              <span className="text-neutral-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="hidden sm:inline">Editing</span>
              </span>
            )}
          </div>

          <div className="h-3.5 w-px bg-neutral-200 dark:bg-neutral-800" />

          {/* Quick Action: Typewriter Centering Toggle */}
          <button
            onClick={onToggleTypewriter}
            className={`px-2 py-1 rounded-full flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
              isTypewriterMode
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300 font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
            title={isTypewriterMode ? 'Typewriter Mode: ON' : 'Typewriter Mode: OFF'}
          >
            <ArrowUpDown className="w-3 h-3" />
            <span className="hidden md:inline">Typewriter</span>
          </button>

          {/* Quick Action: Focus Sprint Timer */}
          {onOpenSprintPopover && (
            <button
              onClick={onOpenSprintPopover}
              className={`px-2 py-1 rounded-full flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
                isSprintActive
                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 font-semibold animate-pulse'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Focus Sprint Timer"
            >
              <Flame className="w-3 h-3 text-amber-500" />
              {isSprintActive && (
                <span className="font-mono text-[10px]">{wordsWrittenInSprint}w</span>
              )}
            </button>
          )}

          {/* Quick Action: Outline TOC */}
          {onOpenOutline && (
            <button
              onClick={onOpenOutline}
              className="p-1 rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Document Outline & Table of Contents"
            >
              <ListTree className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
