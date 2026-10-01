import React from 'react';
import { FileText, Copy, Pin, Trash2, RotateCcw, Clock } from 'lucide-react';
import { DocumentMetadata } from '../../db';
import { formatRelativeTime } from '../../utils/dateUtils';
import { SpotlightCard } from '../common/SpotlightCard';

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
    <SpotlightCard
      isDimmed={isDimmed}
      spotlightRadius={300}
      spotlightBorderColor={
        doc.isPinned
          ? 'rgba(245, 158, 11, 0.55)'
          : undefined
      }
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={() => {
        if (currentTab === 'trash') {
          onRestore({ stopPropagation: () => {} } as any, doc.id);
        } else {
          onOpen(doc.id);
        }
      }}
      className={`p-6 bg-white/90 dark:bg-[#121217]/90 backdrop-blur-xl border cursor-pointer select-none active:scale-[0.99] ${
        isHovered
          ? 'shadow-2xl shadow-neutral-950/10 dark:shadow-black/60 -translate-y-1 border-neutral-300 dark:border-neutral-700 z-10'
          : currentTab === 'trash'
          ? 'border-red-200/50 dark:border-red-950/50 shadow-xs'
          : 'border-neutral-200/80 dark:border-neutral-800/80 shadow-xs hover:border-neutral-300/80 dark:hover:border-neutral-700/80'
      }`}
    >
      <div>
        {/* Card Header: Icon, Title & Reveal-on-Hover Action Dock */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
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
              <h3 className="font-bold text-sm text-neutral-950 dark:text-white truncate">
                {doc.title}
              </h3>
            </div>
          </div>

          {/* Right Header: Amber Pinned Badge (always visible when pinned) OR Action Dock (reveals on hover) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Glowing Amber Pin Badge when pinned and not hovered */}
            {doc.isPinned && currentTab === 'active' && !isHovered && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 shadow-2xs">
                <Pin className="w-2.5 h-2.5 fill-current" />
                <span>Pinned</span>
              </span>
            )}

            {/* Action Buttons: Reveal on hover with smooth fade & slide */}
            <div
              className={`flex items-center gap-1 transition-all duration-200 ${
                isHovered
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 translate-y-1 pointer-events-none'
              }`}
            >
              {currentTab === 'active' ? (
                <>
                  <button
                    onClick={(e) => onDuplicate(e, doc.id)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    title="Duplicate / Clone document"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => onTogglePin(e, doc.id)}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      doc.isPinned
                        ? 'text-amber-500 dark:text-amber-400 hover:bg-amber-500/10'
                        : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                    title={doc.isPinned ? 'Unpin from top' : 'Pin to top'}
                  >
                    <Pin className={`w-3.5 h-3.5 ${doc.isPinned ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => onDelete(e, doc.id, doc.title)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
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
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Permanently delete forever"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 2-3 Line Snippet Preview with relaxed typography */}
        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-3 leading-relaxed mb-4 font-normal">
          {doc.snippet || 'Start writing with Markdown...'}
        </p>
      </div>

      <div>
        {/* Monochromatic Tags Pills */}
        {doc.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {doc.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/60 dark:border-neutral-700/60"
              >
                #{tag}
              </span>
            ))}
            {doc.tags.length > 5 && (
              <span
                title={doc.tags.slice(5).map((t) => `#${t}`).join(', ')}
                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200/60 dark:border-brand-800/60 cursor-help"
              >
                +{doc.tags.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Card Footer: Relative Time Pill & Word Count */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3 h-3 text-neutral-400" />
            <span>{formatRelativeTime(doc.updatedAt)}</span>
          </span>
          <span className="font-mono">{doc.wordCount} words</span>
        </div>
      </div>
    </SpotlightCard>
  );
};
