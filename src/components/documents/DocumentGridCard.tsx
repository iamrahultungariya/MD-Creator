import React from 'react';
import { FileText, Copy, Pin, Trash2, RotateCcw, Clock } from 'lucide-react';
import { DocumentMetadata } from '../../db';

interface DocumentGridCardProps {
  doc: DocumentMetadata;
  currentTab: 'active' | 'trash';
  isHovered?: boolean;
  isAnyHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onOpen: (id: string) => void;
  onDuplicate: (e: React.MouseEvent, id: string) => void;
  onTogglePin: (e: React.MouseEvent, id: string) => void;
  onDelete: (e: React.MouseEvent, id: string, title: string) => void;
  onRestore: (e: React.MouseEvent, id: string) => void;
}

export const DocumentGridCard: React.FC<DocumentGridCardProps> = ({
  doc,
  currentTab,
  isHovered = false,
  isAnyHovered = false,
  onMouseEnter,
  onMouseLeave,
  onOpen,
  onDuplicate,
  onTogglePin,
  onDelete,
  onRestore,
}) => {
  const isDimmed = isAnyHovered && !isHovered;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={() => {
        if (currentTab === 'trash') {
          onRestore({ stopPropagation: () => {} } as any, doc.id);
        } else {
          onOpen(doc.id);
        }
      }}
      className={`group relative p-6 rounded-2xl bg-white dark:bg-neutral-900 border cursor-pointer flex flex-col justify-between transition-all duration-200 ${
        isDimmed ? 'opacity-55' : 'opacity-100'
      } ${
        isHovered
          ? 'ring-1 ring-blue-500/40 dark:ring-blue-400/40 shadow-xl shadow-blue-500/5 dark:shadow-blue-400/5 scale-[1.015] -translate-y-1 border-blue-400/60 dark:border-blue-500/60 z-10'
          : currentTab === 'trash'
          ? 'border-red-200/50 dark:border-red-950/50 shadow-xs'
          : 'border-neutral-200/80 dark:border-neutral-800/80 shadow-xs'
      }`}
    >
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform ${
              isHovered ? 'scale-105' : ''
            } ${
              currentTab === 'trash'
                ? 'bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400'
                : isHovered
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
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
                  onClick={(e) => onDuplicate(e, doc.id)}
                  className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  title="Duplicate / Clone document"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => onTogglePin(e, doc.id)}
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    doc.isPinned
                      ? 'text-amber-500 dark:text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.45)]'
                      : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                  title={doc.isPinned ? 'Unpin' : 'Pin to top'}
                >
                  <Pin className={`w-3.5 h-3.5 transition-transform ${doc.isPinned ? 'fill-current rotate-12 scale-110' : ''}`} />
                </button>
                <button
                  onClick={(e) => onDelete(e, doc.id, doc.title)}
                  className="p-1 rounded-md text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  title="Move to Recycle Bin"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={(e) => onRestore(e, doc.id)}
                  className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Restore document to library"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore</span>
                </button>
                <button
                  onClick={(e) => onDelete(e, doc.id, doc.title)}
                  className="p-1 rounded-md text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
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
  );
};
