import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Upload, 
  FileText, 
  Pin, 
  Trash2, 
  Clock, 
  LayoutGrid, 
  List,
  LayoutTemplate,
  Copy,
  RotateCcw,
  Trash
} from 'lucide-react';
import { Navbar } from '../components/home/Navbar';
import { Footer } from '../components/home/Footer';
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

export const DocumentsPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'active' | 'trash'>('active');
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
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

  const handleCreateNew = async () => {
    const id = await createDocMutation.mutateAsync({
      title: 'Untitled Document.md',
      content: '# Untitled Document\n\nStart writing with Markdown...'
    });
    navigate(`/editor/${id}`);
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

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const newId = await duplicateDocMutation.mutateAsync(id);
      if (newId) {
        navigate(`/editor/${newId}`);
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
        
        {/* Workspace Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-neutral-950 dark:text-white tracking-tight">
              Documents Library
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Browse, manage, and write your markdown notes and technical documents
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsTemplatesOpen(true)}
              className="flex-1 sm:flex-initial justify-center px-3.5 sm:px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LayoutTemplate className="w-4 h-4 text-emerald-500" />
              <span>Templates</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-initial justify-center px-3.5 sm:px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
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
              onClick={handleCreateNew}
              className="w-full sm:w-auto justify-center px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-950 text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Document</span>
            </button>
          </div>
        </div>

        {/* Workspace Tab Switcher (Active Docs vs Recycle Bin) */}
        <div className="flex items-center gap-6 mb-6 border-b border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => { setCurrentTab('active'); setActiveTag('All'); }}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              currentTab === 'active'
                ? 'border-neutral-900 text-neutral-950 dark:border-white dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>All Documents</span>
            {currentTab === 'active' && (
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono">
                {documents.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setCurrentTab('trash'); setActiveTag('All'); }}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              currentTab === 'trash'
                ? 'border-red-500 text-red-600 dark:border-red-400 dark:text-red-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Recycle Bin</span>
            {trashCount > 0 && (
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-mono font-bold">
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
        <div className="p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          
          {/* Search Bar */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, tag, or content..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
            />
          </div>

          {/* Tag Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTag === tag
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-2xs'
                    : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Grid / List Switcher */}
          <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 p-1 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-400 self-end sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded cursor-pointer ${viewMode === 'grid' ? 'text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-700' : ''}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded cursor-pointer ${viewMode === 'list' ? 'text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-700' : ''}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>

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
                className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Create Document</span>
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => {
                  if (currentTab === 'trash') {
                    handleRestore({ stopPropagation: () => {} } as any, doc.id);
                  } else {
                    navigate(`/editor/${doc.id}`);
                  }
                }}
                className={`group relative p-6 rounded-2xl bg-white dark:bg-neutral-900 border shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  currentTab === 'trash'
                    ? 'border-red-200/50 dark:border-red-950/50 opacity-80 hover:opacity-100'
                    : 'border-neutral-200/80 dark:border-neutral-800/80 hover:border-neutral-400 dark:hover:border-neutral-600'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                        currentTab === 'trash'
                          ? 'bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-sm text-neutral-950 dark:text-white truncate">
                        {doc.title}
                      </h3>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {currentTab === 'active' ? (
                        <>
                          <button
                            onClick={(e) => handleDuplicate(e, doc.id)}
                            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                            title="Duplicate / Clone document"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleTogglePin(e, doc.id)}
                            className={`p-1 rounded-md transition-colors cursor-pointer ${
                              doc.isPinned
                                ? 'text-amber-500'
                                : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                            }`}
                            title={doc.isPinned ? 'Unpin' : 'Pin to top'}
                          >
                            <Pin className={`w-3.5 h-3.5 ${doc.isPinned ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, doc.id, doc.title)}
                            className="p-1 rounded-md text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Move to Recycle Bin"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={(e) => handleRestore(e, doc.id)}
                            className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Restore document to library"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Restore</span>
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, doc.id, doc.title)}
                            className="p-1 rounded-md text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Permanently delete forever"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 2-3 Line Snippet Preview */}
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-3 leading-relaxed mb-4">
                    {doc.snippet || 'Start writing with Markdown...'}
                  </p>
                </div>

                <div>
                  {/* Tags */}
                  {doc.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {doc.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Card Footer Info */}
                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </span>
                    <span>{doc.wordCount} words</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => {
                  if (currentTab === 'trash') {
                    handleRestore({ stopPropagation: () => {} } as any, doc.id);
                  } else {
                    navigate(`/editor/${doc.id}`);
                  }
                }}
                className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    currentTab === 'trash'
                      ? 'bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                        {doc.title}
                      </span>
                      {doc.isPinned && currentTab === 'active' && (
                        <Pin className="w-3 h-3 text-amber-500 fill-current shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 truncate max-w-lg mt-0.5">
                      {doc.snippet}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-xs text-neutral-400">
                  <span className="hidden sm:inline">{doc.wordCount} words</span>
                  <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1">
                    {currentTab === 'active' ? (
                      <>
                        <button
                          onClick={(e) => handleDuplicate(e, doc.id)}
                          className="p-1.5 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                          title="Duplicate / Clone document"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleTogglePin(e, doc.id)}
                          className="p-1.5 hover:text-amber-500 transition-colors cursor-pointer"
                          title={doc.isPinned ? 'Unpin' : 'Pin to top'}
                        >
                          <Pin className={`w-4 h-4 ${doc.isPinned ? 'fill-current text-amber-500' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, doc.id, doc.title)}
                          className="p-1.5 hover:text-red-500 transition-colors cursor-pointer"
                          title="Move to Recycle Bin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => handleRestore(e, doc.id)}
                          className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Restore document"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, doc.id, doc.title)}
                          className="p-1.5 hover:text-red-500 transition-colors cursor-pointer"
                          title="Permanently delete forever"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>

      </main>

      <Footer onOpenUpdates={() => navigate('/updates')} />

      {/* Markdown Templates Library Modal */}
      {isTemplatesOpen && (
        <React.Suspense fallback={null}>
          <TemplatesModal
            isOpen={isTemplatesOpen}
            onClose={() => setIsTemplatesOpen(false)}
          />
        </React.Suspense>
      )}
    </div>
  );
};
