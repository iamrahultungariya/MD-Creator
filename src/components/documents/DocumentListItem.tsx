import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import { FileText, Copy, Pin, Trash2, RotateCcw, Clock, MoreVertical } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const isDimmed = isAnyHovered && !isHovered;

  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  // Close mobile micro-popover on outside click
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

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

      <div className="relative z-10 flex items-center gap-3.5 min-w-0 pr-4 flex-1 font-sans">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
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
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 shrink-0 font-sans">
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

      <div className="relative z-10 flex items-center gap-4 shrink-0 text-xs text-neutral-400 font-sans" ref={mobileMenuRef}>
        <span className="hidden sm:inline font-sans font-medium">{doc.wordCount} words</span>
        <span className="hidden md:flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
          <Clock className="w-3 h-3" />
          <span>{formatRelativeTime(doc.updatedAt)}</span>
        </span>

        {/* Desktop Action Buttons: Reveal on hover */}
        <div
          className={`hidden sm:flex items-center gap-1 transition-all duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
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

        {/* Mobile Touch Action Button (3-dots MoreVertical trigger) */}
        <div className="relative sm:hidden">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMobileMenuOpen((prev) => !prev);
            }}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              isMobileMenuOpen
                ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white'
                : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="Document actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Mobile Micro-Popover Menu */}
          {isMobileMenuOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 z-50 min-w-[165px] p-1.5 rounded-xl bg-white/95 dark:bg-[#18181c]/95 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl animate-in fade-in zoom-in-95 duration-150 font-sans text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {currentTab === 'active' ? (
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMobileMenuOpen(false);
                      onTogglePin(e, doc.id);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      doc.isPinned
                        ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <Pin className={`w-3.5 h-3.5 ${doc.isPinned ? 'fill-current' : ''}`} />
                    <span>{doc.isPinned ? 'Unpin Note' : 'Pin to Top'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMobileMenuOpen(false);
                      onDuplicate(e, doc.id);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Duplicate Note</span>
                  </button>

                  <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMobileMenuOpen(false);
                      onDelete(e, doc.id, doc.title);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Move to Trash</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMobileMenuOpen(false);
                      onRestore(e, doc.id);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Note</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMobileMenuOpen(false);
                      onDelete(e, doc.id, doc.title);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Forever</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
