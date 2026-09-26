import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { COMMANDS } from '../../../components/editor/SlashCommandMenu';
import { CodeMirrorEditorHandle } from '../components/CodeMirrorEditor';
import { handleEditorAutoPair } from '../utils/editorAutoPair';
import { handleEditorListShortcuts } from '../utils/editorListShortcuts';

interface UseSlashCommandsOptions {
  content: string;
  setContent: (val: string) => void;
  executeSave: (content: string, title: string) => void;
  title: string;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  editorRef?: React.RefObject<CodeMirrorEditorHandle | null>;
  updateCursorPosition?: () => void;
  onOpenTableBuilder: () => void;
  onOpenTemplates?: () => void;
  onOpenMathStudio: () => void;
  onOpenImageModal?: () => void;
  onExportMd?: () => void;
  onOpenPdfStudio?: () => void;
  onOpenFind?: () => void;
  onOpenReplace?: () => void;
}

export function useSlashCommands({
  content,
  setContent,
  executeSave,
  title,
  textareaRef,
  editorRef,
  updateCursorPosition,
  onOpenTableBuilder,
  onOpenTemplates,
  onOpenMathStudio,
  onOpenImageModal,
  onExportMd,
  onOpenPdfStudio,
  onOpenFind,
  onOpenReplace,
}: UseSlashCommandsOptions) {
  const [isSlashMenuOpen, setIsSlashMenuOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);
  const slashTriggerPosRef = useRef<number>(-1);
  const hasNavigatedRef = useRef<boolean>(false);

  // Handle slash trigger event from editor
  const handleSlashTrigger = useCallback((query: string, pos: number) => {
    if (pos === -1 || (!query && pos < 0)) {
      setIsSlashMenuOpen(false);
      setSlashQuery('');
      hasNavigatedRef.current = false;
      slashTriggerPosRef.current = -1;
      return;
    }
    slashTriggerPosRef.current = Math.max(0, pos - query.length - 1);
    setSlashQuery(query);
    hasNavigatedRef.current = false;
    setIsSlashMenuOpen(true);
  }, []);

  // Reset slash selection when query changes
  useEffect(() => {
    setSlashSelectedIndex(0);
    hasNavigatedRef.current = false;
  }, [slashQuery]);

  // Filtered commands list
  const filteredCommands = useMemo(() => {
    return COMMANDS.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(slashQuery.toLowerCase()) ||
        cmd.description.toLowerCase().includes(slashQuery.toLowerCase()) ||
        cmd.shortcut.toLowerCase().includes(slashQuery.toLowerCase())
    );
  }, [slashQuery]);

  // Insert slash command snippet at cursor
  const handleInsertSnippet = useCallback(
    (snippet: string) => {
      if (editorRef?.current) {
        const ed = editorRef.current;
        const cursor = ed.getSelectionStart();
        const fullText = ed.getValue();
        const textBeforeCursor = fullText.substring(0, cursor);
        const lastSlashIndex = textBeforeCursor.lastIndexOf('/');
        const from = slashTriggerPosRef.current >= 0 
          ? slashTriggerPosRef.current 
          : (lastSlashIndex !== -1 ? lastSlashIndex : cursor);
        slashTriggerPosRef.current = -1;

        if (snippet === '__ACTION_OPEN_TABLE_BUILDER__') {
          ed.setSelectionRange(from, cursor);
          ed.replaceSelection('');
          setIsSlashMenuOpen(false);
          setSlashQuery('');
          onOpenTableBuilder();
          return;
        }

        if (snippet === '__ACTION_OPEN_MATH_STUDIO__') {
          ed.setSelectionRange(from, cursor);
          ed.replaceSelection('');
          setIsSlashMenuOpen(false);
          setSlashQuery('');
          onOpenMathStudio();
          return;
        }

        if (snippet === '__ACTION_OPEN_IMAGE_MODAL__') {
          ed.setSelectionRange(from, cursor);
          ed.replaceSelection('');
          setIsSlashMenuOpen(false);
          setSlashQuery('');
          onOpenImageModal?.();
          return;
        }

        if (snippet === '__ACTION_OPEN_FIND__') {
          ed.setSelectionRange(from, cursor);
          ed.replaceSelection('');
          setIsSlashMenuOpen(false);
          setSlashQuery('');
          onOpenFind?.();
          return;
        }

        if (snippet === '__ACTION_OPEN_REPLACE__') {
          ed.setSelectionRange(from, cursor);
          ed.replaceSelection('');
          setIsSlashMenuOpen(false);
          setSlashQuery('');
          onOpenReplace?.();
          return;
        }

        ed.setSelectionRange(from, cursor);
        ed.replaceSelection(snippet);
        const updated = ed.getValue();
        setContent(updated);
        executeSave(updated, title);
        setIsSlashMenuOpen(false);
        setSlashQuery('');
        setSlashSelectedIndex(0);
        ed.focus();
        return;
      }

      if (!textareaRef?.current) return;
      const cursor = textareaRef.current.selectionStart;
      const textBeforeCursor = content.substring(0, cursor);
      const afterCursor = content.substring(cursor);

      const lastSlashIndex = textBeforeCursor.lastIndexOf('/');
      const cleanBefore = lastSlashIndex !== -1 ? textBeforeCursor.substring(0, lastSlashIndex) : textBeforeCursor;

      if (snippet === '__ACTION_OPEN_TABLE_BUILDER__') {
        setContent(cleanBefore + afterCursor);
        setIsSlashMenuOpen(false);
        setSlashQuery('');
        onOpenTableBuilder();
        return;
      }

      if (snippet === '__ACTION_OPEN_MATH_STUDIO__') {
        setContent(cleanBefore + afterCursor);
        setIsSlashMenuOpen(false);
        setSlashQuery('');
        onOpenMathStudio();
        return;
      }

      if (snippet === '__ACTION_OPEN_IMAGE_MODAL__') {
        setContent(cleanBefore + afterCursor);
        setIsSlashMenuOpen(false);
        setSlashQuery('');
        onOpenImageModal?.();
        return;
      }

      const nextContent = cleanBefore + snippet + afterCursor;
      setContent(nextContent);
      setIsSlashMenuOpen(false);
      setSlashQuery('');
      setSlashSelectedIndex(0);

      setTimeout(() => {
        if (textareaRef?.current) {
          const prevScroll = textareaRef.current.scrollTop;
          textareaRef.current.focus({ preventScroll: true });
          const newPos = cleanBefore.length + snippet.length;
          textareaRef.current.setSelectionRange(newPos, newPos);
          textareaRef.current.scrollTop = prevScroll;
          updateCursorPosition?.();
        }
      }, 20);

      executeSave(nextContent, title);
    },
    [content, title, setContent, executeSave, textareaRef, updateCursorPosition, onOpenTableBuilder, onOpenTemplates, onOpenMathStudio, onOpenImageModal, onExportMd, onOpenPdfStudio]
  );

  // Keyboard navigation, smart lists, tab indent, auto-pairing and find shortcuts
  const handleTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // 1. If Slash menu is open, handle navigation and selection
      if (isSlashMenuOpen && filteredCommands.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          hasNavigatedRef.current = true;
          setSlashSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          hasNavigatedRef.current = true;
          setSlashSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
          return;
        }
        if (e.key === 'Tab') {
          e.preventDefault();
          const selected = filteredCommands[slashSelectedIndex % filteredCommands.length];
          if (selected) {
            handleInsertSnippet(selected.insertSnippet);
          }
          return;
        }
        if (e.key === 'Enter') {
          if (hasNavigatedRef.current || slashQuery.trim().length > 0) {
            e.preventDefault();
            const selected = filteredCommands[slashSelectedIndex % filteredCommands.length];
            if (selected) {
              handleInsertSnippet(selected.insertSnippet);
            }
            return;
          }
          setIsSlashMenuOpen(false);
          setSlashQuery('');
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsSlashMenuOpen(false);
          setSlashQuery('');
          return;
        }
      }

      const ta = textareaRef?.current;
      if (!ta) return;

      // 2. Find & Replace Shortcuts (Ctrl+F, Ctrl+H)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        onOpenFind?.();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        onOpenReplace?.();
        return;
      }

      // 3. Tab Indentation & Smart List Continuation on Enter
      if (handleEditorListShortcuts(e, content, setContent, executeSave, title, ta, updateCursorPosition || (() => {}))) {
        return;
      }

      // 4. Auto-pairing & Selection Wrapping
      if (handleEditorAutoPair(e, content, setContent, executeSave, title, ta, updateCursorPosition || (() => {}))) {
        return;
      }
    },
    [
      isSlashMenuOpen,
      filteredCommands,
      slashSelectedIndex,
      handleInsertSnippet,
      content,
      setContent,
      executeSave,
      title,
      textareaRef,
      updateCursorPosition,
      onOpenFind,
      onOpenReplace,
    ]
  );

  // Check cursor position for slash command activation on text change
  const checkSlashTrigger = useCallback((val: string, cursor: number) => {
    const textBeforeCursor = val.substring(0, cursor);
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');

    if (lastSlashIndex !== -1) {
      const charBeforeSlash = lastSlashIndex > 0 ? textBeforeCursor[lastSlashIndex - 1] : '\n';
      const textAfterSlash = textBeforeCursor.substring(lastSlashIndex + 1);

      if (
        (charBeforeSlash === '\n' || charBeforeSlash === ' ') &&
        !textAfterSlash.includes(' ') &&
        !textAfterSlash.includes('\n')
      ) {
        setIsSlashMenuOpen(true);
        setSlashQuery(textAfterSlash);
        return;
      }
    }

    setIsSlashMenuOpen(false);
    setSlashQuery('');
  }, []);

  // Keyboard handler for CodeMirror domEventHandlers (returns true if key was consumed)
  const handleSlashKeyDown = useCallback(
    (e: KeyboardEvent | React.KeyboardEvent): boolean => {
      if (!isSlashMenuOpen || filteredCommands.length === 0) return false;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        hasNavigatedRef.current = true;
        setSlashSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
        return true;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        hasNavigatedRef.current = true;
        setSlashSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        return true;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        const selected = filteredCommands[slashSelectedIndex % filteredCommands.length];
        if (selected) {
          handleInsertSnippet(selected.insertSnippet);
        }
        return true;
      }
      if (e.key === 'Enter') {
        // Only consume Enter if user actively typed a search query or navigated with arrow keys
        if (hasNavigatedRef.current || slashQuery.trim().length > 0) {
          e.preventDefault();
          const selected = filteredCommands[slashSelectedIndex % filteredCommands.length];
          if (selected) {
            handleInsertSnippet(selected.insertSnippet);
          }
          return true;
        }
        // User typed / and immediately pressed Enter without navigating -> close menu and allow natural newline
        setIsSlashMenuOpen(false);
        setSlashQuery('');
        return false;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsSlashMenuOpen(false);
        setSlashQuery('');
        return true;
      }

      return false;
    },
    [isSlashMenuOpen, filteredCommands, slashSelectedIndex, slashQuery, handleInsertSnippet]
  );

  return {
    isSlashMenuOpen,
    setIsSlashMenuOpen,
    slashQuery,
    slashSelectedIndex,
    setSlashSelectedIndex,
    filteredCommands,
    handleInsertSnippet,
    handleTextareaKeyDown,
    handleSlashKeyDown,
    checkSlashTrigger,
    handleSlashTrigger,
  };
}
