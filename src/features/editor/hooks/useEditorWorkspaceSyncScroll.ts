import { useRef, useCallback, useState, useEffect } from 'react';
import { ViewMode } from '../types';
import { CodeMirrorEditorHandle } from '../components/CodeMirrorEditor';

interface UseEditorWorkspaceSyncScrollProps {
  viewMode: ViewMode;
  editorRef?: React.RefObject<CodeMirrorEditorHandle | null>;
  setReadingProgress: (progress: number) => void;
  onToggleTask: (taskIndex: number, currentChecked: boolean) => void;
  setContent?: (val: string) => void;
  queueAutoSave?: (content: string, title: string) => void;
  title: string;
}

export function useEditorWorkspaceSyncScroll({
  viewMode,
  editorRef,
  setReadingProgress,
  onToggleTask,
  setContent,
  queueAutoSave,
  title,
}: UseEditorWorkspaceSyncScrollProps) {
  const [isSyncScrollEnabled, setIsSyncScrollEnabled] = useState(true);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingEditorRef = useRef(false);
  const isScrollingPreviewRef = useRef(false);
  const isLiveEditingInPreviewRef = useRef(false);
  const savedPreviewScrollTopRef = useRef<number | null>(null);
  const scrollEditorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollPreviewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorRafRef = useRef<number | null>(null);
  const previewRafRef = useRef<number | null>(null);

  // Clean up any pending rAF frames and debounce timeouts on unmount
  useEffect(() => {
    return () => {
      if (scrollEditorTimeoutRef.current) clearTimeout(scrollEditorTimeoutRef.current);
      if (scrollPreviewTimeoutRef.current) clearTimeout(scrollPreviewTimeoutRef.current);
      if (editorRafRef.current) cancelAnimationFrame(editorRafRef.current);
      if (previewRafRef.current) cancelAnimationFrame(previewRafRef.current);
    };
  }, []);

  // Synchronized Split-Pane Proportional Scrolling (Editor -> Preview) with 60/120fps rAF
  const handleEditorScroll = useCallback((_e: Event, scrollDOM: HTMLElement) => {
    if (!isSyncScrollEnabled || viewMode !== 'split') return;
    if (isScrollingPreviewRef.current || isLiveEditingInPreviewRef.current) return;

    isScrollingEditorRef.current = true;
    if (scrollEditorTimeoutRef.current) clearTimeout(scrollEditorTimeoutRef.current);
    scrollEditorTimeoutRef.current = setTimeout(() => {
      isScrollingEditorRef.current = false;
    }, 100);

    if (editorRafRef.current) cancelAnimationFrame(editorRafRef.current);
    editorRafRef.current = requestAnimationFrame(() => {
      const preview = previewContainerRef.current;
      if (!preview) return;

      const maxEditor = scrollDOM.scrollHeight - scrollDOM.clientHeight;
      if (maxEditor <= 0) return;

      const ratio = scrollDOM.scrollTop / maxEditor;
      const maxPreview = preview.scrollHeight - preview.clientHeight;
      if (maxPreview > 0) {
        preview.scrollTop = ratio * maxPreview;
      }
    });
  }, [isSyncScrollEnabled, viewMode]);

  // Synchronized Split-Pane Proportional Scrolling (Preview -> Editor) & Read Mode Progress
  const handlePreviewScroll = useCallback(() => {
    const prev = previewContainerRef.current;
    if (!prev) return;

    // In Read Mode, calculate and track reading progress percentage
    if (viewMode === 'read') {
      const maxPrev = prev.scrollHeight - prev.clientHeight;
      const progress = maxPrev > 0 ? (prev.scrollTop / maxPrev) * 100 : 0;
      setReadingProgress(progress);
      return;
    }

    // In Split Mode: sync preview -> editor with 60/120fps rAF
    if (viewMode === 'split' && isSyncScrollEnabled) {
      if (isScrollingEditorRef.current || isLiveEditingInPreviewRef.current) return;

      isScrollingPreviewRef.current = true;
      if (scrollPreviewTimeoutRef.current) clearTimeout(scrollPreviewTimeoutRef.current);
      scrollPreviewTimeoutRef.current = setTimeout(() => {
        isScrollingPreviewRef.current = false;
      }, 100);

      if (previewRafRef.current) cancelAnimationFrame(previewRafRef.current);
      previewRafRef.current = requestAnimationFrame(() => {
        const maxPrev = prev.scrollHeight - prev.clientHeight;
        if (maxPrev <= 0) return;

        const ratio = prev.scrollTop / maxPrev;
        editorRef?.current?.scrollToRatio(ratio);
      });
    }
  }, [viewMode, isSyncScrollEnabled, setReadingProgress, editorRef]);

  const savedEditorScrollTopRef = useRef<number | null>(null);

  // Wrapped task toggle preserving preview and editor scroll positions
  const handleToggleTaskWithScrollLock = useCallback((taskIndex: number, currentChecked: boolean) => {
    if (previewContainerRef.current) {
      savedPreviewScrollTopRef.current = previewContainerRef.current.scrollTop;
    }
    const edScrollDOM = editorRef?.current?.getScrollDOM();
    if (edScrollDOM) {
      savedEditorScrollTopRef.current = edScrollDOM.scrollTop;
    }
    isLiveEditingInPreviewRef.current = true;

    onToggleTask(taskIndex, currentChecked);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (previewContainerRef.current && savedPreviewScrollTopRef.current !== null) {
          previewContainerRef.current.scrollTop = savedPreviewScrollTopRef.current;
        }
        if (edScrollDOM && savedEditorScrollTopRef.current !== null) {
          edScrollDOM.scrollTop = savedEditorScrollTopRef.current;
        }
        setTimeout(() => {
          isLiveEditingInPreviewRef.current = false;
          savedPreviewScrollTopRef.current = null;
          savedEditorScrollTopRef.current = null;
        }, 120);
      });
    });
  }, [onToggleTask, editorRef]);

  // Wrapped content update from preview (e.g. table edits) preserving preview and editor scroll positions
  const handlePreviewContentUpdate = useCallback((newContent: string) => {
    if (previewContainerRef.current) {
      savedPreviewScrollTopRef.current = previewContainerRef.current.scrollTop;
    }
    const edScrollDOM = editorRef?.current?.getScrollDOM();
    if (edScrollDOM) {
      savedEditorScrollTopRef.current = edScrollDOM.scrollTop;
    }
    isLiveEditingInPreviewRef.current = true;

    setContent?.(newContent);
    queueAutoSave?.(newContent, title);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (previewContainerRef.current && savedPreviewScrollTopRef.current !== null) {
          previewContainerRef.current.scrollTop = savedPreviewScrollTopRef.current;
        }
        if (edScrollDOM && savedEditorScrollTopRef.current !== null) {
          edScrollDOM.scrollTop = savedEditorScrollTopRef.current;
        }
        setTimeout(() => {
          isLiveEditingInPreviewRef.current = false;
          savedPreviewScrollTopRef.current = null;
          savedEditorScrollTopRef.current = null;
        }, 120);
      });
    });
  }, [setContent, queueAutoSave, title, editorRef]);

  return {
    isSyncScrollEnabled,
    setIsSyncScrollEnabled,
    previewContainerRef,
    handleEditorScroll,
    handlePreviewScroll,
    handleToggleTaskWithScrollLock,
    handlePreviewContentUpdate,
  };
}
