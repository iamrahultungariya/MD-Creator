import { useCallback, useRef } from 'react';
import { useMimoStore } from '../stores/useMimoStore';
import { MimoToolCall } from '../types/mimoTypes';

export interface UseMimoDocumentActionsProps {
  content: string;
  setContent: (val: string) => void;
  executeSave: (val: string, title: string) => Promise<void> | void;
  title: string;
  onToast: (msg: string) => void;
  onInsertSnippet?: (snippet: string) => void;
}

export function useMimoDocumentActions({
  content,
  setContent,
  executeSave,
  title,
  onToast,
  onInsertSnippet,
}: UseMimoDocumentActionsProps) {
  const applyActiveDiff = useMimoStore((s) => s.applyActiveDiff);
  const discardActiveDiff = useMimoStore((s) => s.discardActiveDiff);
  const updateLastMessage = useMimoStore((s) => s.updateLastMessage);
  const setMascotState = useMimoStore((s) => s.setMascotState);

  const previousContentBeforeToolRef = useRef<string | null>(null);

  const handleApplyDiff = useCallback(
    (hunkId?: string) => {
      const res = applyActiveDiff(content);
      if (res.success) {
        setContent(res.nextContent);
        executeSave(res.nextContent, title);
        onToast('✨ Applied Mimo changes to document!');
        if (hunkId) {
          updateLastMessage((m) => {
            if (m.diffHunk && m.diffHunk.id === hunkId) {
              return { ...m, diffHunk: { ...m.diffHunk, isApplied: true } };
            }
            return m;
          });
        }
      } else {
        onToast('Could not auto-apply diff. Please review modified lines.');
      }
    },
    [applyActiveDiff, content, setContent, executeSave, title, onToast, updateLastMessage]
  );

  const handleDiscardDiff = useCallback(
    (hunkId?: string) => {
      discardActiveDiff();
      onToast('Discarded proposed changes.');
      if (hunkId) {
        updateLastMessage((m) => {
          if (m.diffHunk && m.diffHunk.id === hunkId) {
            return { ...m, diffHunk: { ...m.diffHunk, isDiscarded: true } };
          }
          return m;
        });
      }
    },
    [discardActiveDiff, onToast, updateLastMessage]
  );

  const handleInsertSnippet = useCallback(
    (snippet: string) => {
      if (onInsertSnippet) {
        onInsertSnippet(snippet);
      } else {
        const next = content.trim() ? `${content.trim()}\n\n${snippet}\n` : `${snippet}\n`;
        setContent(next);
        executeSave(next, title);
        onToast('✨ Inserted snippet into document!');
      }
    },
    [onInsertSnippet, content, setContent, executeSave, title, onToast]
  );

  const handleApplyToolCall = useCallback(
    (toolCall: MimoToolCall) => {
      const { name, arguments: args } = toolCall;
      previousContentBeforeToolRef.current = content;

      if (name === 'insert_at_bottom') {
        const textToInsert = args.content || '';
        const separator = content.endsWith('\n\n') ? '' : content.endsWith('\n') ? '\n' : '\n\n';
        const next = content + separator + textToInsert;
        setContent(next);
        executeSave(next, title);
        onToast('✨ Added content to document bottom!');
      } else if (name === 'insert_at_top') {
        const textToInsert = args.content || '';
        const separator = textToInsert.endsWith('\n\n') ? '' : textToInsert.endsWith('\n') ? '\n' : '\n\n';
        const next = textToInsert + separator + content;
        setContent(next);
        executeSave(next, title);
        onToast('✨ Added content to document top!');
      } else if (name === 'insert_at_cursor' || name === 'generate_table') {
        const textToInsert = args.content || '';
        if (onInsertSnippet) {
          onInsertSnippet(textToInsert);
        } else {
          handleInsertSnippet(textToInsert);
        }
        onToast('✨ Inserted into document!');
      } else if (name === 'insert_katex_formula') {
        const formula = args.displayMode ? `$$\n${args.latex || ''}\n$$` : `$${args.latex || ''}$`;
        if (onInsertSnippet) {
          onInsertSnippet(formula);
        } else {
          handleInsertSnippet(formula);
        }
        onToast('✨ Inserted KaTeX formula!');
      } else if (name === 'set_document_title') {
        if (args.title) {
          executeSave(content, args.title);
          onToast(`✨ Renamed document to "${args.title}"`);
        }
      }

      updateLastMessage((m) => {
        if (m.toolCall && m.toolCall.id === toolCall.id) {
          return { ...m, toolCall: { ...m.toolCall, isApplied: true, isDiscarded: false } };
        }
        return m;
      });
      setMascotState('happy');
    },
    [content, setContent, executeSave, title, onToast, onInsertSnippet, handleInsertSnippet, updateLastMessage, setMascotState]
  );

  const handleDiscardToolCall = useCallback(
    (toolCallId: string) => {
      updateLastMessage((m) => {
        if (m.toolCall && m.toolCall.id === toolCallId) {
          return { ...m, toolCall: { ...m.toolCall, isDiscarded: true } };
        }
        return m;
      });
      onToast('Action discarded.');
    },
    [updateLastMessage, onToast]
  );

  const handleUndoToolCall = useCallback(
    (toolCall: MimoToolCall) => {
      if (previousContentBeforeToolRef.current !== null) {
        setContent(previousContentBeforeToolRef.current);
        executeSave(previousContentBeforeToolRef.current, title);
        onToast('↺ Undid applied Mimo action.');
        updateLastMessage((m) => {
          if (m.toolCall && m.toolCall.id === toolCall.id) {
            return { ...m, toolCall: { ...m.toolCall, isApplied: false } };
          }
          return m;
        });
      }
    },
    [setContent, executeSave, title, onToast, updateLastMessage]
  );

  return {
    handleApplyDiff,
    handleDiscardDiff,
    handleInsertSnippet,
    handleApplyToolCall,
    handleDiscardToolCall,
    handleUndoToolCall,
  };
}
