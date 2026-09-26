import React, { Suspense } from 'react';
import { DocumentMetadata } from '../../../db';
import { MarkdownTemplate } from '../../../data/templates';
import { HeadingItem } from '../../../components/editor/DocumentOutlineDrawer';

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
const DocumentOutlineDrawer = React.lazy(() =>
  import('../../../components/editor/DocumentOutlineDrawer').then((m) => ({ default: m.DocumentOutlineDrawer }))
);
const ProductUpdatesModal = React.lazy(() =>
  import('../../../components/home/ProductUpdatesModal').then((m) => ({ default: m.ProductUpdatesModal }))
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
  isUpdatesOpen: boolean;
  onCloseUpdates: () => void;
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
  isUpdatesOpen,
  onCloseUpdates,
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
}) => {
  return (
    <Suspense fallback={null}>
      {isDrawerOpen && (
        <DocumentDrawer
          isOpen={isDrawerOpen}
          onClose={onCloseDrawer}
          metadata={docMetadata}
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

      {isOutlineOpen && (
        <DocumentOutlineDrawer
          isOpen={isOutlineOpen}
          onClose={onCloseOutline}
          content={content}
          onSelectHeading={onSelectHeading}
        />
      )}

      {isUpdatesOpen && (
        <ProductUpdatesModal
          isOpen={isUpdatesOpen}
          onClose={onCloseUpdates}
        />
      )}

      {isTemplatesOpen && (
        <TemplatesModal
          isOpen={isTemplatesOpen}
          onClose={onCloseTemplates}
          onSelectTemplate={onSelectTemplate}
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
    </Suspense>
  );
});

EditorModalsContainer.displayName = 'EditorModalsContainer';
