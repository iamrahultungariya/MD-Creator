import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Upload, 
  FileText, 
  Trash2, 
  LayoutTemplate,
  Trash,
  FolderTree,
  Copy,
  X,
  Loader2
} from 'lucide-react';
import { Navbar } from '../components/home/Navbar';
import { Footer } from '../components/home/Footer';
import { DocumentGridCard } from '../components/documents/DocumentGridCard';
import { DocumentListItem } from '../components/documents/DocumentListItem';
import { DocumentsFilterToolbar } from '../components/documents/DocumentsFilterToolbar';
import { 
  useDocuments, 
  useCreateDocument, 
  useDeleteDocument, 
  useTogglePin,
  useTrashCount,
  useRestoreDocument,
  useEmptyTrash,
  useDuplicateDocument,
  useAllDocumentTags
} from '../hooks/useDocuments';
import { saveDocument } from '../db';
import { useConfirm } from '../stores/useConfirmStore';

const TemplatesModal = React.lazy(() =>
  import('../components/home/TemplatesModal').then((m) => ({ default: m.TemplatesModal }))
);
const LocalFolderDrawer = React.lazy(() =>
  import('../components/editor/LocalFolderDrawer').then((m) => ({ default: m.LocalFolderDrawer }))
);

export const DocumentsPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'active' | 'trash'>('active');
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isLocalFolderOpen, setIsLocalFolderOpen] = useState(false);
  const [hoveredDocId, setHoveredDocId] = useState<string | null>(null);
  const [cloneToast, setCloneToast] = useState<{ title: string; id: string } | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const confirm = useConfirm();

  const { data: documents = [], isLoading } = useDocuments(search, activeTag, currentTab === 'trash');
  const { data: trashCount = 0 } = useTrashCount();
  const createDocMutation = useCreateDocument();
  const deleteDocMutation = useDeleteDocument();
  const restoreDocMutation = useRestoreDocument();
  const emptyTrashMutation = useEmptyTrash();
  const duplicateDocMutation = useDuplicateDocument();
  const togglePinMutation = useTogglePin();
  const { data: allTags = ['All'] } = useAllDocumentTags();

  // Auto-dismiss clone notification toast
  useEffect(() => {
    if (cloneToast) {
      const timer = setTimeout(() => setCloneToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [cloneToast]);

  const handleCreateNew = async () => {
    if (isCreatingNew) return;
    setIsCreatingNew(true);
    try {
      const id = await createDocMutation.mutateAsync({
        title: 'Untitled Document.md',
        content: '# Untitled Document\n\nStart writing with Markdown...'
      });
      navigate(`/editor/${id}`);
    } catch (err) {
      console.error('Failed to create new document', err);
    } finally {
      setIsCreatingNew(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = (event.target?.result as string) || '';
      const title = file.name.endsWith('.md') ? file.name : `${file.name}.md`;
      const id = `doc_${Date.now()}_import`;
      await saveDocument(id, title, content, ['Imported']);
      navigate(`/editor/${id}`);
    };
    reader.readAsText(file);
  };

  const handleSelectLocalFile = async (
    _fileHandle: FileSystemFileHandle,
    fileName: string,
    content: string
  ) => {
    const id = `doc_local_${Date.now()}`;
    await saveDocument(id, fileName, content, ['Local Vault']);
    setIsLocalFolderOpen(false);
    navigate(`/editor/${id}`);
  };

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const doc = documents.find((d) => d.id === id);
      const newId = await duplicateDocMutation.mutateAsync(id);
      if (newId) {
        const copyTitle = doc ? `${doc.title} (Copy)` : 'Document (Copy)';
        setCloneToast({ title: copyTitle, id: newId });
      }
    } catch (err) {
      console.error('Failed to duplicate doc', err);
    }
  };

  const handleRestore = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    restoreDocMutation.mutate(id);
  };

  const handleEmptyTrash = async () => {
    if (trashCount === 0) return;
    const confirmed = await confirm({
      title: 'Empty Recycle Bin',
      message: (
        <span>
          Are you sure you want to permanently purge all <strong>{trashCount}</strong> deleted documents?
        </span>
      ),
      description: 'This action cannot be undone. All documents and revisions in trash will be permanently wiped.',
      confirmText: 'Empty Trash Forever',
      cancelText: 'Cancel',
      variant: 'danger',
      icon: 'trash'
    });
    if (confirmed) {
      emptyTrashMutation.mutate();
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (currentTab === 'active') {
      const confirmed = await confirm({
        title: 'Move to Trash',
        message: (
          <span>
            Move <strong className="text-neutral-900 dark:text-white">"{title}"</strong> to the Recycle Bin?
          </span>
        ),
        description: 'You can restore this document at any time from the Recycle Bin tab.',
        confirmText: 'Move to Trash',
        cancelText: 'Keep Document',
        variant: 'danger',
        icon: 'trash'
      });
      if (confirmed) {
        deleteDocMutation.mutate({ id, permanent: false });
      }
    } else {
      const confirmed = await confirm({
        title: 'Permanently Delete',
        message: (
          <span>
            Permanently delete <strong className="text-neutral-900 dark:text-white">"{title}"</strong>?
          </span>
        ),
        description: 'This document and its cached revisions will be erased forever.',
        confirmText: 'Delete Forever',
        cancelText: 'Keep in Trash',
        variant: 'danger',
        icon: 'trash'
      });
      if (confirmed) {
        deleteDocMutation.mutate({ id, permanent: true });
      }
    }
  };

  const handleTogglePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    togglePinMutation.mutate(id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      <Navbar 
        onOpenUpdates={() => navigate('/updates')} 
        onOpenTemplates={() => setIsTemplatesOpen(true)} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Workspace Header with Clean Telemetry */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-950 dark:text-white tracking-[-0.03em]">
                Documents Vault
              </h1>
              <span className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">
                · {documents.length} notes
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              IndexedDB local storage · 0ms typing latency · 100% private
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setIsTemplatesOpen(true)}
              className="justify-center px-3.5 py-2 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-neutral-400" />
              <span>Blueprints</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="justify-center px-3.5 py-2 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-neutral-400" />
              <span>Import .md</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".md,.markdown,.txt"
              className="hidden"
            />

            <button
              onClick={() => setIsLocalFolderOpen(true)}
              className="justify-center px-3.5 py-2 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Open local folder as note vault"
            >
              <FolderTree className="w-3.5 h-3.5 text-neutral-400" />
              <span>Local Folder</span>
            </button>

            <button
              onClick={handleCreateNew}
              disabled={isCreatingNew}
              className="justify-center px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-950 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-75"
            >
              {isCreatingNew ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Note</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Minimal Segmented Tab Controller (All Documents vs Recycle Bin) */}
        <div className="flex items-center gap-1 mb-6 p-1 bg-neutral-100/70 dark:bg-neutral-900/80 rounded-xl w-fit border border-neutral-200/60 dark:border-neutral-800/80 text-xs font-medium">
          <button
            onClick={() => { setCurrentTab('active'); setActiveTag('All'); }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              currentTab === 'active'
                ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-2xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>All Documents</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-mono">
              {documents.length}
            </span>
          </button>

          <button
            onClick={() => { setCurrentTab('trash'); setActiveTag('All'); }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              currentTab === 'trash'
                ? 'bg-white dark:bg-neutral-800 text-red-600 dark:text-red-400 shadow-2xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Recycle Bin</span>
            {trashCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-mono font-bold">
                {trashCount}
              </span>
            )}
          </button>
        </div>

        {/* Trash Banner when viewing Recycle Bin */}
        {currentTab === 'trash' && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-red-900 dark:text-red-300">Recycle Bin</h4>
                <p className="text-[11px] text-red-700/80 dark:text-red-400/80">
                  Documents in the trash can be restored anytime or permanently deleted.
                </p>
              </div>
            </div>
            {trashCount > 0 && (
              <button
                onClick={handleEmptyTrash}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-auto"
              >
                <Trash className="w-3.5 h-3.5" />
                <span>Empty Trash ({trashCount})</span>
              </button>
            )}
          </div>
        )}

        {/* Filter Toolbar */}
        <DocumentsFilterToolbar
          search={search}
          setSearch={setSearch}
          allTags={allTags}
          activeTag={activeTag}
          setActiveTag={setActiveTag}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Documents Content */}
        <div className="min-h-[420px]">
          {isLoading && !documents.length ? (
            <div className="py-20 text-center text-xs text-neutral-400">Loading documents...</div>
          ) : documents.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl p-8">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mb-4">
              {currentTab === 'trash' ? <Trash2 className="w-6 h-6 text-neutral-400" /> : <FileText className="w-6 h-6" />}
            </div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white mb-1">
              {currentTab === 'trash' ? 'Recycle Bin is empty' : 'No documents found'}
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mb-6">
              {currentTab === 'trash'
                ? 'Deleted documents will be kept here before being permanently removed.'
                : 'Create your first markdown document or import an existing .md file from your computer.'}
            </p>
            {currentTab === 'active' && (
              <button
                onClick={handleCreateNew}
                disabled={isCreatingNew}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-75"
              >
                {isCreatingNew ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Create Document</span>
                  </>
                )}
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View with Scoped Layout IDs and Spring Physics */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                layout="position"
                layoutId={`grid-${doc.id}`}
                transition={{
                  type: 'spring',
                  stiffness: 220,
                  damping: 24,
                  mass: 0.8
                }}
                className="h-full"
              >
                <DocumentGridCard
                  doc={doc}
                  currentTab={currentTab}
                  isHovered={hoveredDocId === doc.id}
                  isAnyHovered={Boolean(hoveredDocId)}
                  onMouseEnter={() => setHoveredDocId(doc.id)}
                  onMouseLeave={() => setHoveredDocId(null)}
                  onOpen={(id) => navigate(`/editor/${id}`)}
                  onDuplicate={handleDuplicate}
                  onTogglePin={handleTogglePin}
                  onDelete={handleDelete}
                  onRestore={handleRestore}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          /* List View with Scoped Layout IDs and Vertical Spring Motion */
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800">
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                layout="position"
                layoutId={`list-${doc.id}`}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 26,
                  mass: 0.7
                }}
              >
                <DocumentListItem
                  doc={doc}
                  currentTab={currentTab}
                  isHovered={hoveredDocId === doc.id}
                  isAnyHovered={Boolean(hoveredDocId)}
                  onMouseEnter={() => setHoveredDocId(doc.id)}
                  onMouseLeave={() => setHoveredDocId(null)}
                  onOpen={(id) => navigate(`/editor/${id}`)}
                  onDuplicate={handleDuplicate}
                  onTogglePin={handleTogglePin}
                  onDelete={handleDelete}
                  onRestore={handleRestore}
                />
              </motion.div>
            ))}
          </div>
        )}
        </div>

      </main>

      <Footer onOpenUpdates={() => navigate('/updates')} />

      {/* Duplicate In-Place Notification Toast */}
      <AnimatePresence>
        {cloneToast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-6 right-6 z-50 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-neutral-800 dark:border-neutral-200 text-xs"
          >
            <Copy className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span className="truncate max-w-xs">
              Document duplicated as <strong>"{cloneToast.title}"</strong>
            </span>
            <button
              onClick={() => navigate(`/editor/${cloneToast.id}`)}
              className="ml-1 px-2.5 py-1 rounded-lg bg-white/20 dark:bg-black/10 hover:bg-white/30 dark:hover:bg-black/20 font-bold transition-colors cursor-pointer shrink-0"
            >
              Open in Editor
            </button>
            <button
              onClick={() => setCloneToast(null)}
              className="p-1 hover:opacity-75 transition-opacity cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Markdown Templates Library Modal */}
      {isTemplatesOpen && (
        <React.Suspense fallback={null}>
          <TemplatesModal
            isOpen={isTemplatesOpen}
            onClose={() => setIsTemplatesOpen(false)}
          />
        </React.Suspense>
      )}

      {/* Local Folder / Vault Drawer */}
      {isLocalFolderOpen && (
        <React.Suspense fallback={null}>
          <LocalFolderDrawer
            isOpen={isLocalFolderOpen}
            onClose={() => setIsLocalFolderOpen(false)}
            onSelectFile={handleSelectLocalFile}
          />
        </React.Suspense>
      )}
    </div>
  );
};
