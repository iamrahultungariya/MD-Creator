import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Check, 
  Clock, 
  Flame, 
  CloudOff, 
  ListTree
} from 'lucide-react';
import { CodeMirrorEditor, CodeMirrorEditorHandle } from './CodeMirrorEditor';
import { SlashCommandMenu } from '../../../components/editor/SlashCommandMenu';
import { FloatingFormattingDock, FormatAction, DockCoords } from './FloatingFormattingDock';

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
  onSlashTrigger?: (query: string, pos: number) => void;
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
  onSlashTrigger,
}) => {
  // Quick Formatting Toolbar visibility & cursor-anchored positioning:
  // When user is typing or moving cursor, it completely disappears immediately.
  // After 500ms of stopping on cursor/typing, it smoothly appears directly above the cursor/caret.
  // After 2 seconds (2000ms) of appearing, if user is not typing or interacting, it automatically disappears.
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const [dockCoords, setDockCoords] = useState<DockCoords | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const scheduleAutoDismiss = useCallback(() => {
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
    }
    autoDismissTimerRef.current = setTimeout(() => {
      setIsToolbarVisible(false);
    }, 2000);
  }, []);

  const updateDockPosition = useCallback(() => {
    // If title input is currently focused, do not position toolbar over editor
    if (document.activeElement === titleInputRef.current) {
      setIsToolbarVisible(false);
      return;
    }

    const caretCoords = editorRef?.current?.getCaretCoords();
    if (!caretCoords) {
      setIsToolbarVisible(false);
      return;
    }

    // Check if cursor is within visible viewport (not scrolled off screen)
    if (caretCoords.bottom < 40 || caretCoords.top > window.innerHeight - 40) {
      setIsToolbarVisible(false);
      return;
    }

    const DOCK_HALF_WIDTH = 165;
    const MARGIN = 12;
    let clampedLeft = caretCoords.left;
    if (window.innerWidth <= (DOCK_HALF_WIDTH + MARGIN) * 2) {
      clampedLeft = window.innerWidth / 2;
    } else {
      clampedLeft = Math.max(
        DOCK_HALF_WIDTH + MARGIN,
        Math.min(caretCoords.left, window.innerWidth - DOCK_HALF_WIDTH - MARGIN)
      );
    }

    const placement: 'top' | 'bottom' = caretCoords.top < 70 ? 'bottom' : 'top';
    const clampedTop = placement === 'bottom' ? caretCoords.bottom + 8 : caretCoords.top - 8;

    setDockCoords({
      left: Math.round(clampedLeft),
      top: Math.round(clampedTop),
      placement,
    });
    setIsToolbarVisible(true);

    // Automatically disappear 2 seconds after appearing if user is not typing
    scheduleAutoDismiss();
  }, [editorRef, scheduleAutoDismiss]);

  const notifyUserActivity = useCallback(() => {
    // Instantly hide the toolbar upon any typing or cursor action
    setIsToolbarVisible(false);

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
    }

    // Smoothly appear after 500ms stop on cursor
    idleTimerRef.current = setTimeout(() => {
      updateDockPosition();
    }, 500);
  }, [updateDockPosition]);

  // Pause auto-dismiss when hovering over the dock so the user can click actions freely
  const handleDockMouseEnter = useCallback(() => {
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
    }
  }, []);

  const handleDockMouseLeave = useCallback(() => {
    scheduleAutoDismiss();
  }, [scheduleAutoDismiss]);

  // Auto-fade dock & trigger 500ms idle timer
  const handleContentChange = useCallback(
    (newVal: string) => {
      setContent(newVal);
      queueAutoSave(newVal, title);
      notifyUserActivity();
    },
    [setContent, queueAutoSave, title, notifyUserActivity]
  );

  const handleEditorKeyDown = useCallback(
    (e: KeyboardEvent) => {
      notifyUserActivity();
      if (onKeyDown) {
        return onKeyDown(e);
      }
    },
    [notifyUserActivity, onKeyDown]
  );

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    notifyUserActivity();
    if (e.key === 'Enter') {
      e.preventDefault();
      editorRef?.current?.focus();
    }
  };

  // Robust slash trigger handler that respects pos === -1 to close the menu
  const handleSlashTrigger = useCallback(
    (query: string, pos: number) => {
      if (onSlashTrigger) {
        onSlashTrigger(query, pos);
      } else {
        if (pos === -1 || (!query && pos < 0)) {
          setIsSlashMenuOpen(false);
        } else {
          setIsSlashMenuOpen(true);
        }
      }
    },
    [onSlashTrigger, setIsSlashMenuOpen]
  );

  // Minimal Floating Formatting Dock actions
  const handleFormat = useCallback(
    (action: FormatAction) => {
      const ed = editorRef?.current;
      if (!ed) return;

      const selection = ed.getSelection();
      const hasSelection = selection.length > 0;

      switch (action) {
        case 'bold': {
          if (hasSelection) {
            ed.replaceSelection(`**${selection}**`);
          } else {
            ed.replaceSelection('****');
            const start = ed.getSelectionStart();
            ed.setCursor(start - 2);
          }
          break;
        }
        case 'italic': {
          if (hasSelection) {
            ed.replaceSelection(`*${selection}*`);
          } else {
            ed.replaceSelection('**');
            const start = ed.getSelectionStart();
            ed.setCursor(start - 1);
          }
          break;
        }
        case 'strike': {
          if (hasSelection) {
            ed.replaceSelection(`~~${selection}~~`);
          } else {
            ed.replaceSelection('~~~~');
            const start = ed.getSelectionStart();
            ed.setCursor(start - 2);
          }
          break;
        }
        case 'code': {
          if (hasSelection) {
            if (selection.includes('\n')) {
              ed.replaceSelection(`\n\`\`\`\n${selection}\n\`\`\`\n`);
            } else {
              ed.replaceSelection(`\`${selection}\``);
            }
          } else {
            ed.replaceSelection('``');
            const start = ed.getSelectionStart();
            ed.setCursor(start - 1);
          }
          break;
        }
        case 'link': {
          if (hasSelection) {
            ed.replaceSelection(`[${selection}](https://)`);
          } else {
            ed.replaceSelection('[link](https://)');
          }
          break;
        }
        case 'bullet': {
          if (hasSelection) {
            const formatted = selection
              .split('\n')
              .map((line) => (line.startsWith('- ') ? line.slice(2) : `- ${line}`))
              .join('\n');
            ed.replaceSelection(formatted);
          } else {
            ed.replaceSelection('\n- ');
          }
          break;
        }
        case 'ordered': {
          if (hasSelection) {
            let count = 1;
            const formatted = selection
              .split('\n')
              .map((line) => `${count++}. ${line.replace(/^\d+\.\s*/, '')}`)
              .join('\n');
            ed.replaceSelection(formatted);
          } else {
            ed.replaceSelection('\n1. ');
          }
          break;
        }
        case 'quote': {
          if (hasSelection) {
            const formatted = selection
              .split('\n')
              .map((line) => (line.startsWith('> ') ? line.slice(2) : `> ${line}`))
              .join('\n');
            ed.replaceSelection(formatted);
          } else {
            ed.replaceSelection('\n> ');
          }
          break;
        }
      }

      ed.focus();
    },
    [editorRef]
  );

  useEffect(() => {
    // Position toolbar near initial cursor after editor mount
    const initialTimer = setTimeout(() => {
      updateDockPosition();
    }, 600);

    return () => {
      clearTimeout(initialTimer);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
    };
  }, [updateDockPosition]);

  return (
    <div className="relative flex-1 flex flex-col h-full bg-[#fdfdfd] dark:bg-[#111114] text-neutral-800 dark:text-neutral-100 transition-colors overflow-hidden select-text">
      {/* Floating Minimal Formatting Dock Anchored at Cursor Coordinates */}
      <FloatingFormattingDock 
        onFormat={handleFormat} 
        isVisible={isToolbarVisible} 
        coords={dockCoords} 
        onMouseEnter={handleDockMouseEnter}
        onMouseLeave={handleDockMouseLeave}
      />

      {/* Integrated Document Title Header with Generous Screen Spacing */}
      <div className="w-full max-w-4xl mx-auto px-6 sm:px-12 md:px-16 pt-16 sm:pt-20 pb-3 shrink-0">
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            notifyUserActivity();
          }}
          onFocus={() => {
            setIsToolbarVisible(false);
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
          }}
          onKeyDown={handleTitleKeyDown}
          onBlur={() => executeSave(content, title)}
          placeholder="Untitled Document..."
          className="w-full bg-transparent font-black text-2xl sm:text-4xl text-neutral-900 dark:text-white placeholder-neutral-300 dark:placeholder-neutral-700 focus:outline-none tracking-tight leading-tight transition-colors border-b border-transparent focus:border-neutral-200 dark:focus:border-neutral-800/60 pb-2"
        />
      </div>

      {/* CodeMirror 6 Virtualized Document Writing Area with Dimmed Line Numbers */}
      <div 
        onPointerDown={notifyUserActivity}
        className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-10 md:px-14 pb-24 overflow-hidden relative"
      >
        <CodeMirrorEditor
          value={content}
          onChange={handleContentChange}
          onCursorChange={notifyUserActivity}
          onScroll={notifyUserActivity}
          onSlashTrigger={handleSlashTrigger}
          showLineNumbers={true} // Clean dimmed paper line numbers per redesign mockup
          placeholder="Write your thoughts, ideas, specs or story... (Type / for quick actions)"
          onPasteImage={onPasteImage}
          onDropImage={onDropImage}
          editorRef={editorRef}
          onKeyDown={handleEditorKeyDown}
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
          !isToolbarVisible ? 'opacity-25 hover:opacity-100' : 'opacity-100'
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
