import React from 'react';
import { FileText, Copy, Pin, Trash2, RotateCcw } from 'lucide-react';
import { DocumentMetadata } from '../../db';

interface DocumentListItemProps {
  doc: DocumentMetadata;
  currentTab: 'active' | 'trash';
  onOpen: (id: string) => void;
  onDuplicate: (e: React.MouseEvent, id: string) => void;
  onTogglePin: (e: React.MouseEvent, id: string) => void;
  onDelete: (e: React.MouseEvent, id: string, title: string) => void;
  onRestore: (e: React.MouseEvent, id: string) => void;
}

export const DocumentListItem: React.FC<DocumentListItemProps> = ({
  doc,
  currentTab,
  onOpen,
  onDuplicate,
  onTogglePin,
  onDelete,
  onRestore,
}) => {
  return (
    <div
      onClick={() => {
        if (currentTab === 'trash') {
          onRestore({ stopPropagation: () => {} } as any, doc.id);
        } else {
          onOpen(doc.id);
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
                onClick={(e) => onDuplicate(e, doc.id)}
                className="p-1.5 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                title="Duplicate / Clone document"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => onTogglePin(e, doc.id)}
                className="p-1.5 hover:text-amber-500 transition-colors cursor-pointer"
                title={doc.isPinned ? 'Unpin' : 'Pin to top'}
              >
                <Pin className={`w-4 h-4 ${doc.isPinned ? 'fill-current text-amber-500' : ''}`} />
              </button>
              <button
                onClick={(e) => onDelete(e, doc.id, doc.title)}
                className="p-1.5 hover:text-red-500 transition-colors cursor-pointer"
                title="Move to Recycle Bin"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={(e) => onRestore(e, doc.id)}
                className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Restore document"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore</span>
              </button>
              <button
                onClick={(e) => onDelete(e, doc.id, doc.title)}
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
  );
};
