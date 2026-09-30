import React from 'react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import { FileText, Copy, Pin, Trash2, RotateCcw, Clock } from 'lucide-react';
import { DocumentMetadata } from '../../db';
import { formatRelativeTime } from '../../utils/dateUtils';

interface DocumentListItemProps {
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

export const DocumentListItem: React.FC<DocumentListItemProps> = ({
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

  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const surfaceBackground = useMotionTemplate`
    radial-gradient(
      280px circle at ${mouseX}px ${mouseY}px,
      var(--spotlight-surface, rgba(59, 130, 246, 0.06)),
      transparent 75%
    )
  `;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={() => {
        if (currentTab === 'trash') {
          onRestore({ stopPropagation: () => {} } as any, doc.id);
        } else {
          onOpen(doc.id);
        }
      }}
      className={`group relative overflow-hidden p-4 flex items-center justify-between transition-all duration-200 cursor-pointer select-none active:scale-[0.995] ${
        isDimmed ? 'opacity-55' : 'opacity-100'
      } ${
        isHovered
          ? 'bg-neutral-100/70 dark:bg-neutral-800/60 shadow-xs'
          : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
      }`}
    >
      {/* Dynamic Mouse-Following Subtle Row Spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
        style={{
          background: surfaceBackground,
        }}
      />

      <div className="relative z-10 flex items-center gap-3.5 min-w-0 pr-4 flex-1">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
            isHovered ? 'scale-105' : ''
          } ${
            currentTab === 'trash'
              ? 'bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400'
              : isHovered
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
          }`}
        >
          <FileText className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-neutral-900 dark:text-white truncate">
              {doc.title}
            </span>
            {doc.isPinned && currentTab === 'active' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 shrink-0">
                <Pin className="w-2.5 h-2.5 fill-current" />
                <span>Pinned</span>
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-lg mt-0.5">
            {doc.snippet || 'Start writing with Markdown...'}
          </p>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-4 shrink-0 text-xs text-neutral-400">
        <span className="hidden sm:inline font-mono">{doc.wordCount} words</span>
        <span className="hidden md:flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
          <Clock className="w-3 h-3" />
          <span>{formatRelativeTime(doc.updatedAt)}</span>
        </span>

        {/* Action Buttons: Reveal on hover */}
        <div
          className={`flex items-center gap-1 transition-all duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-0 group-hover:opacity-100'
          }`}
        >
          {currentTab === 'active' ? (
            <>
              <button
                onClick={(e) => onDuplicate(e, doc.id)}
                className="p-1.5 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 rounded-lg transition-colors cursor-pointer text-neutral-400"
                title="Duplicate / Clone document"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => onTogglePin(e, doc.id)}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  doc.isPinned
                    ? 'text-amber-500 dark:text-amber-400 hover:bg-amber-500/10'
                    : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60'
                }`}
                title={doc.isPinned ? 'Unpin' : 'Pin to top'}
              >
                <Pin className={`w-4 h-4 ${doc.isPinned ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={(e) => onDelete(e, doc.id, doc.title)}
                className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
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
                className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
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
