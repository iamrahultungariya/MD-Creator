import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
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
  Cloud,
  CheckSquare,
  MoreHorizontal
} from 'lucide-react';
import { Navbar } from '../components/home/Navbar';
import { DocumentGridCard } from '../components/documents/DocumentGridCard';
import { DocumentListItem } from '../components/documents/DocumentListItem';
import { DocumentsFilterToolbar } from '../components/documents/DocumentsFilterToolbar';
import { BatchActionsBar } from '../components/documents/BatchActionsBar';
import { DocumentPagination } from '../components/documents/DocumentPagination';
import { 
  usePaginatedDocuments, 
  useDeleteDocument, 
  useTogglePin, 
  useTrashCount, 
  useActiveDocumentCount,
  useRestoreDocument, 
  useEmptyTrash, 
  useDuplicateDocument, 
  useAllDocumentTags 
} from '../hooks/useDocuments';
import { db, saveDocument, getDocumentContent, DocumentMetadata } from '../db';
import { useConfirm } from '../stores/useConfirmStore';
import { StorageLimitRing } from '../components/common/StorageLimitRing';
import { useAuthStore } from '../stores/useAuthStore';
import { useDocumentFilterStore } from '../stores/useDocumentFilterStore';

const CreateDocumentModal = React.lazy(() =>
  import('../components/document/CreateDocumentModal').then((m) => ({ default: m.CreateDocumentModal }))
);
const TemplatesModal = React.lazy(() =>
  import('../components/home/TemplatesModal').then((m) => ({ default: m.TemplatesModal }))
);
const LocalFolderDrawer = React.lazy(() =>
  import('../components/editor/LocalFolderDrawer').then((m) => ({ default: m.LocalFolderDrawer }))
);
const Footer = React.lazy(() =>
  import('../components/home/Footer').then((m) => ({ default: m.Footer }))
);
const BulkShareModal = React.lazy(() =>
  import('../components/share/BulkShareModal').then((m) => ({ default: m.BulkShareModal }))
);
const CloudSyncModal = React.lazy(() =>
  import('../components/common/CloudSyncModal').then((m) => ({ default: m.CloudSyncModal }))
);
const QuickAuthModal = React.lazy(() =>
  import('../components/auth/QuickAuthModal').then((m) => ({ default: m.QuickAuthModal }))
);

export const DocumentsPage: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    searchQuery: search,
    setSearchQuery: setSearch,
    activeTag,
    setActiveTag,
    viewMode,
    setViewMode,
    resetFilters,
  } = useDocumentFilterStore();
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isLocalFolderOpen, setIsLocalFolderOpen] = useState(false);
  const [cloneToast, setCloneToast] = useState<{ title: string; id: string } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBulkShareOpen, setIsBulkShareOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false);
  const moreActionsRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [shareDocuments, setShareDocuments] = useState<DocumentMetadata[]>([]);

  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const confirm = useConfirm();

  // Close more actions popover on outside click
  useEffect(() => {
    if (!isMoreActionsOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (moreActionsRef.current && !moreActionsRef.current.contains(e.target as Node)) {
        setIsMoreActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMoreActionsOpen]);

  // Synchronously reset page to 1 whenever filters change without extra render cycles
  const prevFiltersRef = useRef({ search, activeTag, currentTab });
  if (
    prevFiltersRef.current.search !== search ||
    prevFiltersRef.current.activeTag !== activeTag ||
    prevFiltersRef.current.currentTab !== currentTab
  ) {
    prevFiltersRef.current = { search, activeTag, currentTab };
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }

  const { data: paginatedData, isLoading } = usePaginatedDocuments({
    searchQuery: search,
    activeTag,
    showTrash: currentTab === 'trash',
    page: currentPage,
    pageSize,
  });

  const documents = paginatedData?.documents ?? [];
  const totalMatchedCount = paginatedData?.totalCount ?? 0;
  const totalPages = paginatedData?.totalPages ?? 1;
  const { data: activeCount = 0 } = useActiveDocumentCount();
  const { data: trashCount = 0 } = useTrashCount();
  const deleteDocMutation = useDeleteDocument();
  const restoreDocMutation = useRestoreDocument();
  const emptyTrashMutation = useEmptyTrash();
  const duplicateDocMutation = useDuplicateDocument();
  const togglePinMutation = useTogglePin();
  const { data: allTags = ['All'] } = useAllDocumentTags();

  // Keep a stable ref to documents to prevent breaking card memoization in callbacks
  const documentsRef = useRef<DocumentMetadata[]>(documents);
  documentsRef.current = documents;

  // Prefetch EditorPage chunk so document clicks open instantaneously (0ms lag)
  useEffect(() => {
    import('./EditorPage').catch(() => {});
  }, []);

  // Auto-dismiss clone notification toast
  useEffect(() => {
    if (cloneToast) {
      const timer = setTimeout(() => setCloneToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [cloneToast]);

  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
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

  const handleOpen = useCallback((id: string) => {
    navigate(`/editor/${id}`);
  }, [navigate]);

  const duplicateMutateAsync = duplicateDocMutation.mutateAsync;
  const handleDuplicate = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const doc = documentsRef.current.find((d) => d.id === id);
      const newId = await duplicateMutateAsync(id);
      if (newId) {
        const copyTitle = doc ? `${doc.title} (Copy)` : 'Document (Copy)';
        setCloneToast({ title: copyTitle, id: newId });
      }
    } catch (err) {
      console.error('Failed to duplicate doc', err);
    }
  }, [duplicateMutateAsync]);

  const restoreMutate = restoreDocMutation.mutate;
  const handleRestore = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    restoreMutate(id);
  }, [restoreMutate]);

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

  const deleteMutate = deleteDocMutation.mutate;
  const handleDelete = useCallback(async (e: React.MouseEvent, id: string, title: string) => {
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
        deleteMutate({ id, permanent: false });
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
        deleteMutate({ id, permanent: true });
      }
    }
  }, [currentTab, confirm, deleteMutate]);

  const togglePinMutate = togglePinMutation.mutate;
  const handleTogglePin = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    togglePinMutate(id);
  }, [togglePinMutate]);

  // Batch multi-select state
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);

  // Clear batch selection on tab change
  useEffect(() => {
    setSelectedDocIds(new Set());
    setIsBatchMode(false);
  }, [currentTab]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedDocIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setIsBatchMode(true);
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedDocIds(new Set(documentsRef.current.map((d) => d.id)));
  }, []);

  const handleDeselectAll = useCallback(() => {
    setSelectedDocIds(new Set());
  }, []);

  const handleExitBatchMode = useCallback(() => {
    setSelectedDocIds(new Set());
    setIsBatchMode(false);
  }, []);

  const handleBatchDelete = useCallback(async () => {
    const count = selectedDocIds.size;
    if (count === 0) return;

    const confirmed = await confirm({
      title: currentTab === 'trash' ? `Permanently Delete ${count} Document(s)?` : `Move ${count} Document(s) to Trash?`,
      message: currentTab === 'trash'
        ? `This will permanently remove ${count} document(s) from your device. This action cannot be undone.`
        : `Move ${count} selected document(s) to the Recycle Bin?`,
      confirmText: currentTab === 'trash' ? `Delete ${count} Permanently` : `Move ${count} to Trash`,
      cancelText: 'Cancel',
      variant: 'danger',
      icon: 'trash',
    });

    if (confirmed) {
      for (const id of selectedDocIds) {
        await deleteDocMutation.mutateAsync({ id, permanent: currentTab === 'trash' });
      }
      setSelectedDocIds(new Set());
      setIsBatchMode(false);
    }
  }, [selectedDocIds, currentTab, confirm, deleteDocMutation]);

  const handleBatchExport = useCallback(async () => {
    if (selectedDocIds.size === 0) return;
    const ids = Array.from(selectedDocIds);
    const selected = await db.documents.where('id').anyOf(ids).toArray();
    if (selected.length === 0) return;

    for (const doc of selected) {
      try {
        const content = await getDocumentContent(doc.id);
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.title.endsWith('.md') ? doc.title : `${doc.title}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        await new Promise((r) => setTimeout(r, 120));
      } catch (err) {
        console.error('Failed to export doc', doc.id, err);
      }
    }
  }, [selectedDocIds]);

  const handleOpenBulkShare = useCallback(async () => {
    if (selectedDocIds.size === 0) return;
    const items = await db.documents.where('id').anyOf(Array.from(selectedDocIds)).toArray();
    setShareDocuments(items);
    setIsBulkShareOpen(true);
  }, [selectedDocIds]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      <Navbar 
        onOpenTemplates={() => setIsTemplatesOpen(true)} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Workspace Header: Modern Linear/Raycast-grade layout */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white tracking-[-0.03em]">
                Documents Vault
              </h1>

              {/* Status & Telemetry Strip */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/70 dark:border-neutral-700/60 font-sans">
                  {currentTab === 'trash' ? `${trashCount} in trash` : `${activeCount} notes`}
                </span>

                <StorageLimitRing variant="badge" />

                {/* Cloud Backup Status Pill */}
                {user?.id ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-sans">
                    <Cloud className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Cloud Synced</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAuthOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800/60 cursor-pointer transition-colors shadow-2xs font-sans"
                    title="Your notes are currently saved only in this browser. Click to back up to cloud."
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Back Up</span>
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Local browser workspace &bull; Instant auto-saving</span>
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto justify-between sm:justify-end font-sans">
            {/* Multi-Select Toggle */}
            <button
              type="button"
              onClick={() => {
                if (isBatchMode) {
                  handleExitBatchMode();
                } else {
                  setIsBatchMode(true);
                }
              }}
              className={`justify-center px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                isBatchMode
                  ? 'bg-brand-500/15 border-brand-500/40 text-brand-600 dark:text-brand-400 font-bold ring-1 ring-brand-500/30'
                  : 'border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
              title="Toggle multi-select batch actions"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{isBatchMode ? 'Cancel' : 'Select'}</span>
            </button>

            {/* Quick Import .md */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="justify-center px-3 py-2 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Import .md, .markdown, or .txt file"
            >
              <Upload className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden xs:inline">Import</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".md,.markdown,.txt"
              className="hidden"
            />

            {/* Tools & Secondary Actions Dropdown */}
            <div className="relative" ref={moreActionsRef}>
              <button
                type="button"
                onClick={() => setIsMoreActionsOpen((prev) => !prev)}
                className={`justify-center px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                  isMoreActionsOpen
                    ? 'border-neutral-400 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white'
                    : 'border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}
                title="More vault tools"
              >
                <MoreHorizontal className="w-4 h-4 text-neutral-400" />
                <span className="hidden xs:inline">Tools</span>
              </button>

              {isMoreActionsOpen && (
                <div
                  className="absolute right-0 top-full mt-1.5 z-50 w-52 p-1.5 rounded-xl bg-white/95 dark:bg-[#18181c]/95 backdrop-blur-xl border border-neutral-200/90 dark:border-neutral-800 shadow-2xl animate-in fade-in zoom-in-95 duration-150 font-sans"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreActionsOpen(false);
                      setIsTemplatesOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <LayoutTemplate className="w-4 h-4 text-neutral-400" />
                    <span>Starter Blueprints</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreActionsOpen(false);
                      setIsLocalFolderOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <FolderTree className="w-4 h-4 text-neutral-400" />
                    <span>Open Local Folder</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreActionsOpen(false);
                      setIsSyncModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <Cloud className="w-4 h-4 text-brand-500" />
                    <span>Multi-Device Sync</span>
                  </button>
                </div>
              )}
            </div>

            {/* High-Contrast Hero Primary CTA Button */}
            <button
              type="button"
              onClick={handleCreateNew}
              className="justify-center px-4 py-2 rounded-lg bg-[#8257F5] hover:bg-[#7245e6] active:bg-[#6335e0] text-white text-xs font-bold shadow-xs hover:shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Note</span>
            </button>
          </div>
        </div>

        {/* Minimal Segmented Tab Controller (All Documents vs Recycle Bin) */}
        <div className="flex items-center gap-1 mb-6 p-1 bg-neutral-100/70 dark:bg-neutral-900/80 rounded-xl w-fit border border-neutral-200/60 dark:border-neutral-800/80 text-xs font-medium font-sans">
          <button
            onClick={() => { 
              setCurrentTab('active'); 
              setActiveTag('All'); 
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              currentTab === 'active'
                ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-2xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>All Documents</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-sans font-semibold">
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => { 
              setCurrentTab('trash'); 
              setActiveTag('All'); 
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              currentTab === 'trash'
                ? 'bg-white dark:bg-neutral-800 text-red-600 dark:text-red-400 shadow-2xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Recycle Bin</span>
            {trashCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-sans font-bold">
                {trashCount}
              </span>
            )}
          </button>
        </div>

        {/* Trash Banner when viewing Recycle Bin */}
        {currentTab === 'trash' && (
          <div className="mb-6 p-4 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
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
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-auto font-sans"
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
          onResetFilters={resetFilters}
        />

        {/* Documents Content */}
        <div className="min-h-[420px]">
          {isLoading && !documents.length ? (
            <div className="py-20 text-center text-xs text-neutral-400">Loading documents...</div>
          ) : documents.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl p-8">
            <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mb-4">
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
                className="px-5 py-2.5 rounded-lg bg-[#8257F5] hover:bg-[#7245e6] text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Document</span>
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View - High Performance Direct Render (Zero FLIP Layout Thrashing) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {documents.map((doc) => (
              <div key={doc.id} className="h-full">
                <DocumentGridCard
                  doc={doc}
                  currentTab={currentTab}
                  onOpen={handleOpen}
                  onDuplicate={handleDuplicate}
                  onTogglePin={handleTogglePin}
                  onDelete={handleDelete}
                  onRestore={handleRestore}
                  isSelectionMode={isBatchMode}
                  isSelected={selectedDocIds.has(doc.id)}
                  onToggleSelect={handleToggleSelect}
                />
              </div>
            ))}
          </div>
        ) : (
          /* List View - High Performance Direct Render (Zero FLIP Layout Thrashing) */
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800 font-sans">
            {documents.map((doc) => (
              <div key={doc.id}>
                <DocumentListItem
                  doc={doc}
                  currentTab={currentTab}
                  onOpen={handleOpen}
                  onDuplicate={handleDuplicate}
                  onTogglePin={handleTogglePin}
                  onDelete={handleDelete}
                  onRestore={handleRestore}
                  isSelectionMode={isBatchMode}
                  isSelected={selectedDocIds.has(doc.id)}
                  onToggleSelect={handleToggleSelect}
                />
              </div>
            ))}
          </div>
        )}
        </div>

        {/* P0: Document Pagination Controls */}
        {totalMatchedCount > 0 && (
          <DocumentPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalMatchedCount}
            pageSize={pageSize}
            onPageChange={(newPage) => {
              setCurrentPage(newPage);
              window.scrollTo({ top: 120, behavior: 'smooth' });
            }}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[6, 12, 24]}
          />
        )}

        {/* Floating Batch Actions Bar */}
        <AnimatePresence>
          {isBatchMode && (
            <BatchActionsBar
              selectedCount={selectedDocIds.size}
              totalCount={documents.length}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onBatchDelete={handleBatchDelete}
              onBatchExport={handleBatchExport}
              onBatchShare={handleOpenBulkShare}
              onExitMode={handleExitBatchMode}
            />
          )}
        </AnimatePresence>

      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>

      {/* Duplicate In-Place Notification Toast */}
      <AnimatePresence>
        {cloneToast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-6 right-6 z-50 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-neutral-800 dark:border-neutral-200 text-xs font-sans"
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

      {/* Create New Document / Note Modal */}
      {isCreateModalOpen && (
        <React.Suspense fallback={null}>
          <CreateDocumentModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            defaultFolderTag={activeTag !== 'All' ? activeTag : undefined}
          />
        </React.Suspense>
      )}

      {/* P5: Quick Auth Modal for Cloud Sync (Lazy loaded on demand) */}
      {isAuthOpen && (
        <React.Suspense fallback={null}>
          <QuickAuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
          />
        </React.Suspense>
      )}

      {/* Multi-Document Bulk Share Modal */}
      {isBulkShareOpen && (
        <React.Suspense fallback={null}>
          <BulkShareModal
            isOpen={isBulkShareOpen}
            onClose={() => setIsBulkShareOpen(false)}
            selectedDocIds={selectedDocIds}
            documents={shareDocuments.length > 0 ? shareDocuments : documents}
          />
        </React.Suspense>
      )}

      {/* Entertaining Interactive Cloud Sync Modal */}
      {isSyncModalOpen && (
        <React.Suspense fallback={null}>
          <CloudSyncModal
            isOpen={isSyncModalOpen}
            onClose={() => setIsSyncModalOpen(false)}
          />
        </React.Suspense>
      )}
    </div>
  );
};
