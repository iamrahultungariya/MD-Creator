import React, { Suspense } from 'react';
import { DocumentMetadata } from '../../../db';
import { MarkdownTemplate } from '../../../data/templates';
import { HeadingItem } from '../../../components/editor/DocumentDrawer';

// Lazy-loaded modal dialogs for zero-cost initial hydration
const DocumentDrawer = React.lazy(() =>
  import('../../../components/editor/DocumentDrawer').then((m) => ({ default: m.DocumentDrawer }))
);
const DocumentSwitcherModal = React.lazy(() =>
  import('../../../components/editor/DocumentSwitcherModal').then((m) => ({ default: m.DocumentSwitcherModal }))
);
const ExportPdfModal = React.lazy(() =>
  import('../../../features/pdf-export/components/ExportPdfModal').then((m) => ({ default: m.ExportPdfModal }))
);
const TableBuilderModal = React.lazy(() =>
  import('../../../components/editor/TableBuilderModal').then((m) => ({ default: m.TableBuilderModal }))
);
const TemplatesModal = React.lazy(() =>
  import('../../../components/home/TemplatesModal').then((m) => ({ default: m.TemplatesModal }))
);
const RevisionHistoryModal = React.lazy(() =>
  import('../../../components/editor/RevisionHistoryModal').then((m) => ({ default: m.RevisionHistoryModal }))
);
const KatexFormulaModal = React.lazy(() =>
  import('../../../components/editor/KatexFormulaModal').then((m) => ({ default: m.KatexFormulaModal }))
);
const ImageEmbedModal = React.lazy(() =>
  import('../../../components/editor/ImageEmbedModal').then((m) => ({ default: m.ImageEmbedModal }))
);
const ExportModal = React.lazy(() =>
  import('../../../components/editor/ExportModal').then((m) => ({ default: m.ExportModal }))
);
const PublishModal = React.lazy(() =>
  import('../../../components/editor/PublishModal').then((m) => ({ default: m.PublishModal }))
);
const LocalFolderDrawer = React.lazy(() =>
  import('../../../components/editor/LocalFolderDrawer').then((m) => ({ default: m.LocalFolderDrawer }))
);
const ClipStudioModal = React.lazy(() =>
  import('../../clip-studio/components/ClipStudioModal').then((m) => ({ default: m.ClipStudioModal }))
);
const SocialCardGeneratorModal = React.lazy(() =>
  import('../../../components/share/SocialCardGeneratorModal').then((m) => ({ default: m.SocialCardGeneratorModal }))
);

interface EditorModalsContainerProps {
  docId: string;
  title: string;
  content: string;
  docMetadata: DocumentMetadata | null;
  lineCount: number;
  wordCount: number;
  charCount: number;
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
  onUpdateTags: (tags: string[]) => Promise<void>;
  onDeleteCurrentDoc: () => Promise<void>;
  onClearContent: () => Promise<void>;
  isSwitcherOpen: boolean;
  onCloseSwitcher: () => void;
  isPdfStudioOpen: boolean;
  onClosePdfStudio: () => void;
  isTableBuilderOpen: boolean;
  onCloseTableBuilder: () => void;
  onInsertTable: (tableMarkdown: string) => void;
  isOutlineOpen: boolean;
  onCloseOutline: () => void;
  onSelectHeading: (heading: HeadingItem) => void;
  isTemplatesOpen: boolean;
  onCloseTemplates: () => void;
  onSelectTemplate: (template: MarkdownTemplate, action: 'insert' | 'replace') => void;
  isRevisionsOpen: boolean;
  onCloseRevisions: () => void;
  onRestoreRevision: (restoredContent: string) => void;
  isMathStudioOpen: boolean;
  onCloseMathStudio: () => void;
  onInsertFormula: (latexSnippet: string) => void;
  isImageModalOpen?: boolean;
  onCloseImageModal?: () => void;
  onInsertImage?: (markdownSnippet: string) => void;
  isExportModalOpen?: boolean;
  onCloseExportModal?: () => void;
  onOpenPdfStudioFromExport?: () => void;
  onExportMd?: () => void;
  onExportDocx?: () => void;
  onCopyMarkdown?: () => void;
  isPublishModalOpen?: boolean;
  onClosePublishModal?: () => void;
  isLocalFolderOpen?: boolean;
  onCloseLocalFolder?: () => void;
  onOpenLocalFolder?: () => void;
  onSelectLocalFile?: (fileHandle: FileSystemFileHandle, fileName: string, content: string) => void;
  isClipStudioOpen?: boolean;
  onCloseClipStudio?: () => void;
  isSocialCardOpen?: boolean;
  onCloseSocialCard?: () => void;
  onToast?: (message: string) => void;
}

export const EditorModalsContainer: React.FC<EditorModalsContainerProps> = React.memo(({
  docId,
  title,
  content,
  docMetadata,
  lineCount,
  wordCount,
  charCount,
  isDrawerOpen,
  onCloseDrawer,
  onUpdateTags,
  onDeleteCurrentDoc,
  onClearContent,
  isSwitcherOpen,
  onCloseSwitcher,
  isPdfStudioOpen,
  onClosePdfStudio,
  isTableBuilderOpen,
  onCloseTableBuilder,
  onInsertTable,
  isOutlineOpen,
  onCloseOutline,
  onSelectHeading,
  isTemplatesOpen,
  onCloseTemplates,
  onSelectTemplate,
  isRevisionsOpen,
  onCloseRevisions,
  onRestoreRevision,
  isMathStudioOpen,
  onCloseMathStudio,
  onInsertFormula,
  isImageModalOpen = false,
  onCloseImageModal,
  onInsertImage,
  isExportModalOpen = false,
  onCloseExportModal,
  onOpenPdfStudioFromExport,
  onExportMd,
  onExportDocx,
  onCopyMarkdown,
  isPublishModalOpen = false,
  onClosePublishModal,
  isLocalFolderOpen = false,
  onCloseLocalFolder,
  onOpenLocalFolder,
  onSelectLocalFile,
  isClipStudioOpen = false,
  onCloseClipStudio,
  isSocialCardOpen = false,
  onCloseSocialCard,
  onToast,
}) => {
  return (
    <Suspense fallback={null}>
      {(isDrawerOpen || isOutlineOpen) && (
        <DocumentDrawer
          isOpen={isDrawerOpen || isOutlineOpen}
          onClose={() => {
            if (isDrawerOpen) onCloseDrawer();
            if (isOutlineOpen) onCloseOutline();
          }}
          metadata={docMetadata}
          content={content}
          onSelectHeading={onSelectHeading}
          initialTab={isOutlineOpen ? 'outline' : 'stats'}
          onUpdateTags={onUpdateTags}
          wordCount={wordCount}
          charCount={charCount}
          lineCount={lineCount}
          onDeleteDocument={onDeleteCurrentDoc}
          onClearContent={onClearContent}
        />
      )}

      {isSwitcherOpen && (
        <DocumentSwitcherModal
          isOpen={isSwitcherOpen}
          onClose={onCloseSwitcher}
          currentDocId={docId}
          onOpenLocalFolder={onOpenLocalFolder}
        />
      )}

      {isPdfStudioOpen && (
        <ExportPdfModal
          isOpen={isPdfStudioOpen}
          onClose={onClosePdfStudio}
          documentTitle={title}
          documentContent={content}
        />
      )}

      {isExportModalOpen && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={onCloseExportModal || (() => {})}
          onOpenPdfStudio={() => {
            onCloseExportModal?.();
            onOpenPdfStudioFromExport?.();
          }}
          onExportMd={onExportMd || (() => {})}
          onExportDocx={onExportDocx || (() => {})}
          onCopyMarkdown={onCopyMarkdown || (() => {})}
          docTitle={title}
        />
      )}

      {isTableBuilderOpen && (
        <TableBuilderModal
          isOpen={isTableBuilderOpen}
          onClose={onCloseTableBuilder}
          onInsert={onInsertTable}
        />
      )}



      {isTemplatesOpen && (
        <TemplatesModal
          isOpen={isTemplatesOpen}
          onClose={onCloseTemplates}
          onSelectTemplate={onSelectTemplate}
          currentDocTitle={title}
          hasExistingContent={Boolean(content && content.trim().length > 0)}
        />
      )}

      {isRevisionsOpen && (
        <RevisionHistoryModal
          isOpen={isRevisionsOpen}
          onClose={onCloseRevisions}
          documentId={docId}
          documentTitle={title}
          currentContent={content}
          onRestoreRevision={onRestoreRevision}
        />
      )}

      {isMathStudioOpen && (
        <KatexFormulaModal
          isOpen={isMathStudioOpen}
          onClose={onCloseMathStudio}
          onInsertFormula={onInsertFormula}
        />
      )}

      {isImageModalOpen && (
        <ImageEmbedModal
          isOpen={isImageModalOpen}
          onClose={onCloseImageModal || (() => {})}
          onInsertImage={onInsertImage || (() => {})}
        />
      )}

      {isPublishModalOpen && (
        <PublishModal
          isOpen={isPublishModalOpen}
          onClose={onClosePublishModal || (() => {})}
          docId={docId}
          title={title}
          content={content}
        />
      )}

      {isLocalFolderOpen && (
        <LocalFolderDrawer
          isOpen={isLocalFolderOpen}
          onClose={onCloseLocalFolder || (() => {})}
          onSelectFile={onSelectLocalFile || (() => {})}
          activeFileName={title}
        />
      )}

      {isClipStudioOpen && (
        <ClipStudioModal
          isOpen={isClipStudioOpen}
          onClose={onCloseClipStudio || (() => {})}
          title={title}
          content={content}
        />
      )}

      {isSocialCardOpen && (
        <SocialCardGeneratorModal
          isOpen={isSocialCardOpen}
          onClose={onCloseSocialCard || (() => {})}
          title={title}
          content={content}
          onToast={onToast}
        />
      )}
    </Suspense>
  );
});

EditorModalsContainer.displayName = 'EditorModalsContainer';
