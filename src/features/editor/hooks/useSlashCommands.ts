import { useState, useEffect, useCallback, useMemo } from 'react';
import { COMMANDS } from '../../../components/editor/SlashCommandMenu';
import { cleanAndNormalizeMarkdown } from '../../../utils/markdownSanitizer';

interface UseSlashCommandsOptions {
  content: string;
  setContent: (val: string) => void;
  executeSave: (content: string, title: string) => void;
  title: string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  updateCursorPosition: () => void;
  onOpenTableBuilder: () => void;
  onOpenTemplates: () => void;
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

  // Reset slash selection when query changes
  useEffect(() => {
    setSlashSelectedIndex(0);
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
      if (!textareaRef.current) return;
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

      if (snippet === '__ACTION_OPEN_TEMPLATES__') {
        setContent(cleanBefore + afterCursor);
        setIsSlashMenuOpen(false);
        setSlashQuery('');
        onOpenTemplates();
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

      if (snippet === '__ACTION_EXPORT_MD__') {
        setContent(cleanBefore + afterCursor);
        setIsSlashMenuOpen(false);
        setSlashQuery('');
        onExportMd?.();
        return;
      }

      if (snippet === '__ACTION_OPEN_PDF_STUDIO__') {
        setContent(cleanBefore + afterCursor);
        setIsSlashMenuOpen(false);
        setSlashQuery('');
        onOpenPdfStudio?.();
        return;
      }

      if (snippet === '__ACTION_CLEAN_FORMAT__') {
        const fullCleaned = cleanAndNormalizeMarkdown(cleanBefore + afterCursor);
        setContent(fullCleaned);
        setIsSlashMenuOpen(false);
        setSlashQuery('');
        executeSave(fullCleaned, title);
        return;
      }

      if (snippet === '__ACTION_INSERT_FRONTMATTER__') {
        const todayStr = new Date().toISOString().slice(0, 10);
        const yamlBlock = `---\ntitle: "${title || 'Untitled Document'}"\ndate: ${todayStr}\nauthor: "Author Name"\ntags: ["documentation", "guide"]\ndraft: false\n---\n\n`;
        
        let nextContent = '';
        if (content.startsWith('---')) {
          nextContent = cleanBefore + yamlBlock + afterCursor;
        } else {
          const stripped = cleanBefore + afterCursor;
          nextContent = yamlBlock + stripped;
        }

        setContent(nextContent);
        setIsSlashMenuOpen(false);
        setSlashQuery('');
        executeSave(nextContent, title);
        setTimeout(() => {
          if (textareaRef.current) {
            const prevScroll = textareaRef.current.scrollTop;
            textareaRef.current.focus({ preventScroll: true });
            const newPos = yamlBlock.length;
            textareaRef.current.setSelectionRange(newPos, newPos);
            textareaRef.current.scrollTop = prevScroll;
            updateCursorPosition();
          }
        }, 20);
        return;
      }

      const nextContent = cleanBefore + snippet + afterCursor;
      setContent(nextContent);
      setIsSlashMenuOpen(false);
      setSlashQuery('');
      setSlashSelectedIndex(0);

      setTimeout(() => {
        if (textareaRef.current) {
          const prevScroll = textareaRef.current.scrollTop;
          textareaRef.current.focus({ preventScroll: true });
          const newPos = cleanBefore.length + snippet.length;
          textareaRef.current.setSelectionRange(newPos, newPos);
          textareaRef.current.scrollTop = prevScroll;
          updateCursorPosition();
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
          setSlashSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSlashSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
          return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          const selected = filteredCommands[slashSelectedIndex % filteredCommands.length];
          if (selected) {
            handleInsertSnippet(selected.insertSnippet);
          }
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsSlashMenuOpen(false);
          setSlashQuery('');
          return;
        }
      }

      const ta = textareaRef.current;
      if (!ta) return;

      const { selectionStart, selectionEnd } = ta;
      const isMultiLineSelection =
        selectionStart !== selectionEnd && content.substring(selectionStart, selectionEnd).includes('\n');

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

      // 3. Tab & Shift+Tab Indentation
      if (e.key === 'Tab') {
        e.preventDefault();
        const lineStart = content.lastIndexOf('\n', selectionStart - 1) + 1;
        const lineEnd = content.indexOf('\n', selectionEnd) === -1 ? content.length : content.indexOf('\n', selectionEnd);
        const currentLine = content.substring(lineStart, lineEnd);
        const isListItem = /^(\s*)([-*+]|\d+\.|[-*+]\s+\[[ xX]\])\s+/.test(currentLine);

        if (e.shiftKey) {
          // Outdent (remove up to 2 leading spaces)
          const block = content.substring(lineStart, lineEnd);
          const lines = block.split('\n');
          let firstLineRemoved = 0;
          const outdented = lines
            .map((line, idx) => {
              if (line.startsWith('  ')) {
                if (idx === 0) firstLineRemoved = 2;
                return line.substring(2);
              } else if (line.startsWith(' ')) {
                if (idx === 0) firstLineRemoved = 1;
                return line.substring(1);
              }
              return line;
            })
            .join('\n');

          const next = content.substring(0, lineStart) + outdented + content.substring(lineEnd);
          setContent(next);
          executeSave(next, title);
          setTimeout(() => {
            ta.focus({ preventScroll: true });
            ta.setSelectionRange(
              Math.max(lineStart, selectionStart - firstLineRemoved),
              Math.max(lineStart, selectionEnd - (block.length - outdented.length))
            );
            updateCursorPosition();
          }, 10);
          return;
        } else {
          // Indent: if multi-line OR on any list item, indent the line at lineStart
          if (isMultiLineSelection || isListItem) {
            const block = content.substring(lineStart, lineEnd);
            const lines = block.split('\n');
            const indented = lines.map((line) => '  ' + line).join('\n');
            const next = content.substring(0, lineStart) + indented + content.substring(lineEnd);
            setContent(next);
            executeSave(next, title);
            setTimeout(() => {
              ta.focus({ preventScroll: true });
              ta.setSelectionRange(selectionStart + 2, selectionEnd + lines.length * 2);
              updateCursorPosition();
            }, 10);
            return;
          } else {
            // Plain text single cursor: insert 2 spaces
            const next = content.substring(0, selectionStart) + '  ' + content.substring(selectionEnd);
            setContent(next);
            executeSave(next, title);
            setTimeout(() => {
              ta.focus({ preventScroll: true });
              ta.setSelectionRange(selectionStart + 2, selectionStart + 2);
              updateCursorPosition();
            }, 10);
            return;
          }
        }
      }

      // 4. Smart List & Task Continuation on Enter with Progressive Outdent
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        const textBefore = content.substring(0, selectionStart);
        const lineStart = textBefore.lastIndexOf('\n') + 1;
        const currentLine = textBefore.substring(lineStart);

        const taskMatch = currentLine.match(/^(\s*)([-*+]\s+\[[ xX]\]\s*)(.*)$/);
        const bulletMatch = !taskMatch && currentLine.match(/^(\s*)([-*+]\s+)(.*)$/);
        const orderedMatch = !taskMatch && !bulletMatch && currentLine.match(/^(\s*)(\d+)\.\s+(.*)$/);

        if (taskMatch) {
          e.preventDefault();
          const indent = taskMatch[1];
          const marker = taskMatch[2];
          const text = taskMatch[3];
          if (!text.trim()) {
            if (indent.length >= 2) {
              // Outdent nested task item by 2 spaces
              const outdentedPrefix = indent.substring(2) + marker;
              const next = content.substring(0, lineStart) + outdentedPrefix + content.substring(selectionStart);
              setContent(next);
              executeSave(next, title);
              setTimeout(() => {
                ta.focus({ preventScroll: true });
                const newPos = lineStart + outdentedPrefix.length;
                ta.setSelectionRange(newPos, newPos);
                updateCursorPosition();
              }, 10);
            } else {
              // Empty root task item: break list
              const next = content.substring(0, lineStart) + content.substring(selectionStart);
              setContent(next);
              executeSave(next, title);
              setTimeout(() => {
                ta.focus({ preventScroll: true });
                ta.setSelectionRange(lineStart, lineStart);
                updateCursorPosition();
              }, 10);
            }
          } else {
            // Continue task with current indent
            const prefix = `\n${indent}- [ ] `;
            const next = content.substring(0, selectionStart) + prefix + content.substring(selectionEnd);
            setContent(next);
            executeSave(next, title);
            setTimeout(() => {
              ta.focus({ preventScroll: true });
              const newPos = selectionStart + prefix.length;
              ta.setSelectionRange(newPos, newPos);
              updateCursorPosition();
            }, 10);
          }
          return;
        } else if (bulletMatch) {
          e.preventDefault();
          const indent = bulletMatch[1];
          const bullet = bulletMatch[2].trim();
          const text = bulletMatch[3];
          if (!text.trim()) {
            if (indent.length >= 2) {
              // Outdent nested bullet item by 2 spaces
              const outdentedPrefix = indent.substring(2) + `${bullet} `;
              const next = content.substring(0, lineStart) + outdentedPrefix + content.substring(selectionStart);
              setContent(next);
              executeSave(next, title);
              setTimeout(() => {
                ta.focus({ preventScroll: true });
                const newPos = lineStart + outdentedPrefix.length;
                ta.setSelectionRange(newPos, newPos);
                updateCursorPosition();
              }, 10);
            } else {
              // Empty root bullet: break list
              const next = content.substring(0, lineStart) + content.substring(selectionStart);
              setContent(next);
              executeSave(next, title);
              setTimeout(() => {
                ta.focus({ preventScroll: true });
                ta.setSelectionRange(lineStart, lineStart);
                updateCursorPosition();
              }, 10);
            }
          } else {
            // Continue bullet with current indent
            const prefix = `\n${indent}${bullet} `;
            const next = content.substring(0, selectionStart) + prefix + content.substring(selectionEnd);
            setContent(next);
            executeSave(next, title);
            setTimeout(() => {
              ta.focus({ preventScroll: true });
              const newPos = selectionStart + prefix.length;
              ta.setSelectionRange(newPos, newPos);
              updateCursorPosition();
            }, 10);
          }
          return;
        } else if (orderedMatch) {
          e.preventDefault();
          const indent = orderedMatch[1];
          const num = parseInt(orderedMatch[2], 10);
          const text = orderedMatch[3];
          if (!text.trim()) {
            if (indent.length >= 2) {
              // Outdent nested numbered item by 2 spaces
              const outdentedPrefix = indent.substring(2) + '1. ';
              const next = content.substring(0, lineStart) + outdentedPrefix + content.substring(selectionStart);
              setContent(next);
              executeSave(next, title);
              setTimeout(() => {
                ta.focus({ preventScroll: true });
                const newPos = lineStart + outdentedPrefix.length;
                ta.setSelectionRange(newPos, newPos);
                updateCursorPosition();
              }, 10);
            } else {
              // Empty root numbered item: break list
              const next = content.substring(0, lineStart) + content.substring(selectionStart);
              setContent(next);
              executeSave(next, title);
              setTimeout(() => {
                ta.focus({ preventScroll: true });
                ta.setSelectionRange(lineStart, lineStart);
                updateCursorPosition();
              }, 10);
            }
          } else {
            // Continue numbered list with incremented number
            const prefix = `\n${indent}${num + 1}. `;
            const next = content.substring(0, selectionStart) + prefix + content.substring(selectionEnd);
            setContent(next);
            executeSave(next, title);
            setTimeout(() => {
              ta.focus({ preventScroll: true });
              const newPos = selectionStart + prefix.length;
              ta.setSelectionRange(newPos, newPos);
              updateCursorPosition();
            }, 10);
          }
          return;
        }
      }

      // 5. Auto-pairing & Selection Wrapping
      const PAIRS: Record<string, string> = {
        '(': ')',
        '[': ']',
        '{': '}',
        '"': '"',
        "'": "'",
        '`': '`',
        '*': '*',
        '~': '~',
      };

      // Selection wrapping
      if (selectionStart !== selectionEnd && PAIRS[e.key]) {
        e.preventDefault();
        const open = e.key;
        const close = PAIRS[e.key];
        const selected = content.substring(selectionStart, selectionEnd);
        const wrapped = open + selected + close;
        const next = content.substring(0, selectionStart) + wrapped + content.substring(selectionEnd);
        setContent(next);
        executeSave(next, title);
        setTimeout(() => {
          ta.focus({ preventScroll: true });
          ta.setSelectionRange(selectionStart + 1, selectionEnd + 1);
          updateCursorPosition();
        }, 10);
        return;
      }

      // Single-caret auto-pair
      if (selectionStart === selectionEnd) {
        // Step over closing character
        const CLOSING_CHARS = [')', ']', '}', '"', "'", '`'];
        if (CLOSING_CHARS.includes(e.key) && content[selectionStart] === e.key) {
          e.preventDefault();
          ta.setSelectionRange(selectionStart + 1, selectionStart + 1);
          updateCursorPosition();
          return;
        }

        // Insert opening pair
        const AUTO_CLOSE: Record<string, string> = {
          '(': ')',
          '[': ']',
          '{': '}',
          '"': '"',
          "'": "'",
          '`': '`',
        };
        if (AUTO_CLOSE[e.key]) {
          e.preventDefault();
          const open = e.key;
          const close = AUTO_CLOSE[e.key];
          const next = content.substring(0, selectionStart) + open + close + content.substring(selectionStart);
          setContent(next);
          executeSave(next, title);
          setTimeout(() => {
            ta.focus({ preventScroll: true });
            ta.setSelectionRange(selectionStart + 1, selectionStart + 1);
            updateCursorPosition();
          }, 10);
          return;
        }

        // Backspace between empty pair deletes both
        if (e.key === 'Backspace') {
          const charBefore = content[selectionStart - 1];
          const charAfter = content[selectionStart];
          if (
            (charBefore === '(' && charAfter === ')') ||
            (charBefore === '[' && charAfter === ']') ||
            (charBefore === '{' && charAfter === '}') ||
            (charBefore === '"' && charAfter === '"') ||
            (charBefore === "'" && charAfter === "'") ||
            (charBefore === '`' && charAfter === '`')
          ) {
            e.preventDefault();
            const next = content.substring(0, selectionStart - 1) + content.substring(selectionStart + 1);
            setContent(next);
            executeSave(next, title);
            setTimeout(() => {
              ta.focus({ preventScroll: true });
              ta.setSelectionRange(selectionStart - 1, selectionStart - 1);
              updateCursorPosition();
            }, 10);
            return;
          }
        }
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

  return {
    isSlashMenuOpen,
    setIsSlashMenuOpen,
    slashQuery,
    slashSelectedIndex,
    setSlashSelectedIndex,
    filteredCommands,
    handleInsertSnippet,
    handleTextareaKeyDown,
    checkSlashTrigger,
  };
}
