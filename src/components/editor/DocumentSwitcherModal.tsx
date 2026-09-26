import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Plus, Pin, Clock, X, Upload, FolderTree } from 'lucide-react';
import { useDocuments, useCreateDocument } from '../../hooks/useDocuments';
import { saveDocument } from '../../db';

interface DocumentSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDocId: string;
  onOpenLocalFolder?: () => void;
}

export const DocumentSwitcherModal: React.FC<DocumentSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentDocId,
  onOpenLocalFolder,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { data: documents = [] } = useDocuments(search, 'All');
  const createDoc = useCreateDocument();

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSelectDoc = (id: string) => {
    onClose();
    navigate(`/editor/${id}`);
  };

  const handleCreateNew = async () => {
    const id = await createDoc.mutateAsync({
      title: 'Untitled Document.md',
      content: '# Untitled Document\n\nStart writing with Markdown...'
    });
    onClose();
    navigate(`/editor/${id}`);
  };

  // Import local .md file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = (event.target?.result as string) || '';
      const title = file.name.endsWith('.md') ? file.name : `${file.name}.md`;
      const id = `doc_${Date.now()}_import`;
      await saveDocument(id, title, content, ['Imported']);
      onClose();
      navigate(`/editor/${id}`);
    };
    reader.readAsText(file);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (documents.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + documents.length) % (documents.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (documents[selectedIndex]) {
        handleSelectDoc(documents[selectedIndex].id);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-3.5 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-2.5 bg-neutral-50/50 dark:bg-neutral-950/40">
          <Search className="w-4 h-4 text-neutral-400 ml-1" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search saved documents..."
            className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Shortcuts Bar */}
        <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
          <button
            onClick={handleCreateNew}
            className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-blue-500" />
            <span>New Document</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import .md</span>
          </button>

          {onOpenLocalFolder && (
            <button
              onClick={() => {
                onClose();
                onOpenLocalFolder();
              }}
              className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1.5 cursor-pointer"
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Local Vault</span>
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".md,.markdown,.txt"
            className="hidden"
          />
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {documents.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400">
              No documents found matching "{search}"
            </div>
          ) : (
            documents.map((doc, idx) => {
              const isSelected = idx === selectedIndex;
              const isCurrent = doc.id === currentDocId;
              return (
                <div
                  key={doc.id}
                  onClick={() => handleSelectDoc(doc.id)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isCurrent ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                    }`}>
                      <FileText className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs truncate">
                          {doc.title}
                        </span>
                        {doc.isPinned && (
                          <Pin className="w-3 h-3 text-amber-500 fill-current shrink-0" />
                        )}
                        {isCurrent && (
                          <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded font-medium">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                        {doc.snippet || 'Empty document'}
                      </p>
                    </div>
                  </div>

                  <div className="text-[10px] text-neutral-400 shrink-0 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </span>
                    <span>{doc.wordCount} words</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950/60 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-400 flex items-center justify-between">
          <span>Navigate with <strong>↑ ↓</strong> &bull; <strong>Enter</strong> to open</span>
          <span><strong>Esc</strong> to close</span>
        </div>

      </div>
    </div>
  );
};
