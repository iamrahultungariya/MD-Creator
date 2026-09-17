import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { ViewMode, CursorPosition } from '../features/editor/types';
import { useEditorModals } from '../features/editor/hooks/useEditorModals';
import { useEditorDocument } from '../features/editor/hooks/useEditorDocument';
import { useFocusSprint } from '../features/editor/hooks/useFocusSprint';
import { useSlashCommands } from '../features/editor/hooks/useSlashCommands';
import { EditorHeader } from '../features/editor/components/EditorHeader';
import { EditorWorkspace } from '../features/editor/components/EditorWorkspace';
import { EditorStatusBar } from '../features/editor/components/EditorStatusBar';
import { EditorModalsContainer } from '../features/editor/components/EditorModalsContainer';
import { HeadingItem } from '../components/editor/DocumentOutlineDrawer';
import { exportToDocx } from '../features/docx-export/services/docxExportService';
import { cleanAndNormalizeMarkdown } from '../utils/markdownSanitizer';
import { useDuplicateDocument } from '../hooks/useDocuments';

export const EditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const duplicateDocMutation = useDuplicateDocument();

  // View mode and feedback toasts
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [cursorPos, setCursorPos] = useState<CursorPosition>({ line: 1, col: 1 });
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [findMode, setFindMode] = useState<'find' | 'replace'>('find');

  const showToast = useCallback((msg: string, durationMs = 2500) => {
    setCopyToast(msg);
    setTimeout(() => setCopyToast(null), durationMs);
  }, []);

  // Modal visibility states
  const modals = useEditorModals();

  // Document persistence and sync hook
  const doc = useEditorDocument({
    routeDocId: id,
    onToast: showToast,
    textareaRef,
  });

  // Focus sprint timer hook
  const sprint = useFocusSprint({
    content: doc.content,
    onSprintComplete: (wordsWritten) => {
      showToast(`🎉 Focus Sprint Completed! You wrote ${wordsWritten} words!`, 4000);
    },
  });

  // Track cursor position and perform Typewriter vertical centering
  const updateCursorPosition = useCallback(() => {
    if (!textareaRef.current) return;
    const text = textareaRef.current.value.substring(0, textareaRef.current.selectionStart);
    const lines = text.split('\n');
    const currentLine = lines.length;
    setCursorPos({
      line: currentLine,
      col: lines[lines.length - 1].length + 1,
    });

    if (modals.isTypewriterMode) {
      const lineHeight = 24;
      const targetScroll =
        (currentLine - 1) * lineHeight - textareaRef.current.clientHeight / 2 + lineHeight;
      textareaRef.current.scrollTop = Math.max(0, targetScroll);
    }
  }, [modals.isTypewriterMode]);

  // Slash commands palette and shortcut injection hook
  const slash = useSlashCommands({
    content: doc.content,
    setContent: doc.setContent,
    executeSave: doc.executeSave,
    title: doc.title,
    textareaRef,
    updateCursorPosition,
    onOpenTableBuilder: () => modals.setIsTableBuilderOpen(true),
    onOpenTemplates: () => modals.setIsTemplatesOpen(true),
    onOpenMathStudio: () => modals.setIsMathStudioOpen(true),
    onOpenImageModal: () => modals.setIsImageModalOpen(true),
    onExportMd: doc.handleExportMd,
    onOpenPdfStudio: () => modals.setIsPdfStudioOpen(true),
    onOpenFind: () => {
      setFindMode('find');
      setIsFindOpen(true);
    },
    onOpenReplace: () => {
      setFindMode('replace');
      setIsFindOpen(true);
    },
  });

  const handleExportDocx = useCallback(async () => {
    try {
      showToast('Exporting to Word (.docx)...', 2000);
      await exportToDocx(doc.title || 'Untitled', doc.content);
      showToast('Word document (.docx) exported successfully!');
    } catch (err) {
      console.error('Failed to export docx', err);
      showToast('Export failed. Please try again.');
    }
  }, [doc.title, doc.content, showToast]);

  const handleDuplicateDoc = useCallback(async () => {
    try {
      const docId = doc.docMetadata?.id || id;
      if (!docId) {
        showToast('Please save the document first before duplicating.');
        return;
      }
      await doc.executeSave(doc.content, doc.title);
      const newId = await duplicateDocMutation.mutateAsync(docId);
      if (newId) {
        showToast('Document duplicated! Redirecting...');
        navigate(`/editor/${newId}`);
      }
    } catch (err) {
      console.error('Failed to duplicate document', err);
      showToast('Duplication failed.');
    }
  }, [doc, id, duplicateDocMutation, navigate, showToast]);

  const handleCleanFormat = useCallback(() => {
    const cleaned = cleanAndNormalizeMarkdown(doc.content);
    if (cleaned !== doc.content) {
      doc.setContent(cleaned);
      doc.executeSave(cleaned, doc.title);
      showToast('Markdown cleaned & normalized!');
    } else {
      showToast('Markdown is already clean.');
    }
  }, [doc, showToast]);

  // Insert formula snippet from KaTeX Studio at cursor
  const handleInsertFormulaAtCursor = useCallback(
    (latexSnippet: string) => {
      if (!textareaRef.current) {
        const next = doc.content + '\n\n' + latexSnippet + '\n';
        doc.setContent(next);
        doc.executeSave(next, doc.title);
        showToast('✨ Inserted KaTeX formula');
        return;
      }
      const cursor = textareaRef.current.selectionStart;
      const before = doc.content.substring(0, cursor);
      const after = doc.content.substring(cursor);
      const sepBefore = before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n';
      const sepAfter = after.startsWith('\n\n') ? '' : after.startsWith('\n') ? '\n' : '\n\n';
      const next = before + sepBefore + latexSnippet + sepAfter + after;
      doc.setContent(next);
      doc.executeSave(next, doc.title);
      showToast('✨ Inserted KaTeX formula');
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    },
    [doc, showToast]
  );

  // Insert image markdown snippet from Image Embed Studio at cursor
  const handleInsertImageAtCursor = useCallback(
    (imageSnippet: string) => {
      if (!textareaRef.current) {
        const next = doc.content + '\n\n' + imageSnippet.trim() + '\n';
        doc.setContent(next);
        doc.executeSave(next, doc.title);
        showToast('🖼️ Embedded image');
        return;
      }
      const cursor = textareaRef.current.selectionStart;
      const before = doc.content.substring(0, cursor);
      const after = doc.content.substring(cursor);
      const sepBefore = before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n';
      const sepAfter = after.startsWith('\n\n') ? '' : after.startsWith('\n') ? '\n' : '\n\n';
      const next = before + sepBefore + imageSnippet.trim() + sepAfter + after;
      doc.setContent(next);
      doc.executeSave(next, doc.title);
      showToast('🖼️ Embedded image');
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    },
    [doc, showToast]
  );

  // Content change handler combining slash trigger detection and debounced auto-save
  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      doc.setContent(val);
      updateCursorPosition();
      slash.checkSlashTrigger(val, e.target.selectionStart);
      doc.queueAutoSave(val, doc.title);
    },
    [doc, updateCursorPosition, slash]
  );

  // Jump to heading from Document Outline
  const handleSelectHeading = useCallback(
    (heading: HeadingItem) => {
      if (!textareaRef.current) return;
      const lineHeight = 24;
      textareaRef.current.scrollTop = Math.max(0, heading.lineIndex * lineHeight - 60);
      const lines = doc.content.split('\n');
      let charOffset = 0;
      for (let i = 0; i < heading.lineIndex; i++) {
        charOffset += lines[i].length + 1;
      }
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        charOffset,
        charOffset + (lines[heading.lineIndex]?.length || 0)
      );
      updateCursorPosition();
    },
    [doc.content, updateCursorPosition]
  );

  // Global Keyboard Shortcuts (Ctrl+O, Ctrl+S, Esc)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        modals.setIsSwitcherOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        doc.executeSave(doc.content, doc.title);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setFindMode('find');
        setIsFindOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setFindMode('replace');
        setIsFindOpen(true);
      }
      if (
        e.key === 'Escape' &&
        viewMode === 'zen' &&
        !slash.isSlashMenuOpen &&
        !modals.isSwitcherOpen &&
        !modals.isDrawerOpen &&
        !modals.isExportMenuOpen
      ) {
        setViewMode('split');
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [doc, viewMode, slash.isSlashMenuOpen, modals]);

  // Telemetry computations
  const stats = useMemo(() => {
    const lines = doc.content.split('\n').length;
    const words = doc.content.trim() ? doc.content.trim().split(/\s+/).length : 0;
    const chars = doc.content.length;
    const reading = Math.max(1, Math.ceil(words / 200));
    return { lines, words, chars, reading };
  }, [doc.content]);

  return (
    <div
      className={`h-[100dvh] min-h-[100dvh] flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors overflow-hidden ${
        viewMode === 'zen' ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {/* Toast Notification */}
      {copyToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 px-4 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2 duration-150 no-print">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{copyToast}</span>
        </div>
      )}

      {/* Top Header */}
      <EditorHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        title={doc.title}
        setTitle={doc.setTitle}
        content={doc.content}
        isSaved={doc.isSaved}
        isSaving={doc.isSaving}
        executeSave={doc.executeSave}
        docMetadata={doc.docMetadata}
        onOpenSwitcher={() => modals.setIsSwitcherOpen(true)}
        onOpenDrawer={() => modals.setIsDrawerOpen(true)}
        onOpenPdfStudio={() => modals.setIsPdfStudioOpen(true)}
        onOpenTableBuilder={() => modals.setIsTableBuilderOpen(true)}
        onOpenImageModal={() => modals.setIsImageModalOpen(true)}
        onOpenFxPopover={() => modals.setIsFxPopoverOpen(true)}
        onOpenOutline={() => modals.setIsOutlineOpen(true)}
        onOpenTemplates={() => modals.setIsTemplatesOpen(true)}
        onOpenRevisions={() => modals.setIsRevisionsOpen(true)}
        onOpenSprintPopover={() => modals.setIsSprintPopoverOpen((prev) => !prev)}
        onExportMd={doc.handleExportMd}
        onExportDocx={handleExportDocx}
        onDuplicateDoc={handleDuplicateDoc}
        onCleanFormat={handleCleanFormat}
        onCopyMarkdown={doc.handleCopyMarkdown}
        onClearContent={doc.handleClearContent}
        onDeleteCurrentDoc={doc.handleDeleteCurrentDoc}
        isToolsMenuOpen={modals.isToolsMenuOpen}
        setIsToolsMenuOpen={modals.setIsToolsMenuOpen}
        isExportMenuOpen={modals.isExportMenuOpen}
        setIsExportMenuOpen={modals.setIsExportMenuOpen}
      />

      {/* Main Workspace (Split View, Textarea, Markdown Preview, FX) */}
      <EditorWorkspace
        viewMode={viewMode}
        setViewMode={setViewMode}
        content={doc.content}
        lineCount={stats.lines}
        textareaRef={textareaRef}
        onContentChange={handleContentChange}
        onTextareaKeyDown={slash.handleTextareaKeyDown}
        onCursorEvent={updateCursorPosition}
        isSlashMenuOpen={slash.isSlashMenuOpen}
        setIsSlashMenuOpen={slash.setIsSlashMenuOpen}
        slashSelectedIndex={slash.slashSelectedIndex}
        slashQuery={slash.slashQuery}
        onInsertSnippet={slash.handleInsertSnippet}
        onToggleTask={doc.handleToggleTask}
        onOpenOutline={() => modals.setIsOutlineOpen(true)}
        onOpenTableBuilder={() => modals.setIsTableBuilderOpen(true)}
        onOpenTemplates={() => modals.setIsTemplatesOpen(true)}
        onOpenPdfStudio={() => modals.setIsPdfStudioOpen(true)}
        onOpenImageModal={() => modals.setIsImageModalOpen(true)}
        onExportMd={doc.handleExportMd}
        onCopyMarkdown={doc.handleCopyMarkdown}
        onOpenRevisions={() => modals.setIsRevisionsOpen(true)}
        onClearContent={doc.handleClearContent}
        isFindOpen={isFindOpen}
        setIsFindOpen={setIsFindOpen}
        findMode={findMode}
        title={doc.title}
        setContent={doc.setContent}
        executeSave={doc.executeSave}
      />

      {/* Telemetry Status Bar - Hidden on mobile (< md) to maximize writing area */}
      <div className="hidden md:block">
        <EditorStatusBar
          viewMode={viewMode}
          cursorPos={cursorPos}
          lineCount={stats.lines}
          wordCount={stats.words}
          charCount={stats.chars}
          readingTime={stats.reading}
          isTypewriterMode={modals.isTypewriterMode}
          onToggleTypewriter={() => {
            const next = !modals.isTypewriterMode;
            modals.setIsTypewriterMode(next);
            showToast(next ? 'Typewriter Mode Activated' : 'Typewriter Mode Off', 1500);
          }}
          isSprintActive={sprint.isSprintActive}
          sprintDuration={sprint.sprintDuration}
          sprintSecondsRemaining={sprint.sprintSecondsRemaining}
          sprintStartWordCount={sprint.sprintStartWordCount}
          formatSprintTime={sprint.formatSprintTime}
          isSprintPopoverOpen={modals.isSprintPopoverOpen}
          setIsSprintPopoverOpen={modals.setIsSprintPopoverOpen}
          onStartSprint={(mins) => {
            sprint.handleStartSprint(mins);
            modals.setIsSprintPopoverOpen(false);
          }}
          onPauseSprint={sprint.handlePauseSprint}
          onResetSprint={sprint.handleResetSprint}
          onOpenUpdates={() => modals.setIsUpdatesOpen(true)}
          onOpenSwitcher={() => modals.setIsSwitcherOpen(true)}
        />
      </div>

      {/* Lazily Mounted Heavy Modals & Drawers */}
      <EditorModalsContainer
        docId={doc.docId}
        title={doc.title}
        content={doc.content}
        docMetadata={doc.docMetadata}
        lineCount={stats.lines}
        wordCount={stats.words}
        charCount={stats.chars}
        isDrawerOpen={modals.isDrawerOpen}
        onCloseDrawer={() => modals.setIsDrawerOpen(false)}
        onUpdateTags={doc.handleUpdateTags}
        onDeleteCurrentDoc={doc.handleDeleteCurrentDoc}
        onClearContent={doc.handleClearContent}
        isSwitcherOpen={modals.isSwitcherOpen}
        onCloseSwitcher={() => modals.setIsSwitcherOpen(false)}
        isPdfStudioOpen={modals.isPdfStudioOpen}
        onClosePdfStudio={() => modals.setIsPdfStudioOpen(false)}
        isTableBuilderOpen={modals.isTableBuilderOpen}
        onCloseTableBuilder={() => modals.setIsTableBuilderOpen(false)}
        onInsertTable={doc.handleInsertTableFromModal}
        isFxPopoverOpen={modals.isFxPopoverOpen}
        onCloseFxPopover={() => modals.setIsFxPopoverOpen(false)}
        isOutlineOpen={modals.isOutlineOpen}
        onCloseOutline={() => modals.setIsOutlineOpen(false)}
        onSelectHeading={handleSelectHeading}
        isUpdatesOpen={modals.isUpdatesOpen}
        onCloseUpdates={() => modals.setIsUpdatesOpen(false)}
        isTemplatesOpen={modals.isTemplatesOpen}
        onCloseTemplates={() => modals.setIsTemplatesOpen(false)}
        onSelectTemplate={doc.handleSelectTemplate}
        isRevisionsOpen={modals.isRevisionsOpen}
        onCloseRevisions={() => modals.setIsRevisionsOpen(false)}
        onRestoreRevision={doc.handleRestoreRevision}
        isMathStudioOpen={modals.isMathStudioOpen}
        onCloseMathStudio={() => modals.setIsMathStudioOpen(false)}
        onInsertFormula={handleInsertFormulaAtCursor}
        isImageModalOpen={modals.isImageModalOpen}
        onCloseImageModal={() => modals.setIsImageModalOpen(false)}
        onInsertImage={handleInsertImageAtCursor}
      />
    </div>
  );
};
