import React, { useState, useEffect } from 'react';
import { Search, X, Pin, FileText, Check, AlertCircle } from 'lucide-react';
import { DocumentMetadata } from '../../../../db';
import { searchAvailableReferenceDocs } from '../../services/docPinningService';
import { useMimoStore } from '../../stores/useMimoStore';

export interface MimoDocPinSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentDocId: string;
}

const EMPTY_PINNED_DOCS: string[] = [];

export const MimoDocPinSelector: React.FC<MimoDocPinSelectorProps> = ({
  isOpen,
  onClose,
  currentDocId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [availableDocs, setAvailableDocs] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(false);

  const pinnedDocIds = useMimoStore((s) =>
    currentDocId && s.pinnedDocIdsByDoc ? s.pinnedDocIdsByDoc[currentDocId] || EMPTY_PINNED_DOCS : EMPTY_PINNED_DOCS
  );
  const pinDocument = useMimoStore((s) => s.pinDocument);
  const unpinDocument = useMimoStore((s) => s.unpinDocument);
  const touchMimoActivity = useMimoStore((s) => s.touchMimoActivity);

  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;

    const loadDocs = async () => {
      setLoading(true);
      const docs = await searchAvailableReferenceDocs(currentDocId, searchQuery);
      if (!isCancelled) {
        setAvailableDocs(docs);
        setLoading(false);
      }
    };

    const timer = setTimeout(loadDocs, 120);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, currentDocId, searchQuery]);

  if (!isOpen) return null;

  const handleTogglePin = (docId: string) => {
    touchMimoActivity();
    if (pinnedDocIds.includes(docId)) {
      unpinDocument(docId);
    } else {
      if (pinnedDocIds.length >= 3) {
        // Automatically drop oldest to keep max 3
        pinDocument(docId);
      } else {
        pinDocument(docId);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Pin className="w-4 h-4 rotate-45" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Pin Reference Notes
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Mimo will silently read facts and outlines from pinned notes (Max 3).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-3 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by title, tags, or content..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-transparent focus:border-emerald-500/50 focus:bg-white dark:focus:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none transition-all"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Pinned Status Pill Count */}
        <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950/30 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px]">
          <span className="text-neutral-500 dark:text-neutral-400">
            Currently Pinned:{' '}
            <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {pinnedDocIds.length} / 3
            </strong>
          </span>
          {pinnedDocIds.length >= 3 && (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium text-[10px]">
              <AlertCircle className="w-3 h-3" />
              Pinning another replaces oldest
            </span>
          )}
        </div>

        {/* Documents List */}
        <div className="p-2 overflow-y-auto space-y-1.5 flex-1 min-h-[160px] max-h-[360px]">
          {loading ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              Scanning local notes...
            </div>
          ) : availableDocs.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400 space-y-1">
              <FileText className="w-6 h-6 mx-auto opacity-40 text-neutral-400 mb-1" />
              <p>No matching notes found.</p>
              <p className="text-[10px]">Create or edit documents in your workspace first.</p>
            </div>
          ) : (
            availableDocs.map((doc) => {
              const isPinned = pinnedDocIds.includes(doc.id);
              return (
                <div
                  key={doc.id}
                  onClick={() => handleTogglePin(doc.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isPinned
                      ? 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                      : 'border-neutral-200/70 dark:border-neutral-800/80 bg-neutral-50/40 dark:bg-neutral-900/40 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className={`w-3.5 h-3.5 shrink-0 ${isPinned ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'}`} />
                      <span className="text-xs font-medium truncate text-neutral-900 dark:text-neutral-100">
                        {doc.title || 'Untitled Document'}
                      </span>
                    </div>

                    {doc.snippet && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate pl-5">
                        {doc.snippet.replace(/\n/g, ' ')}
                      </p>
                    )}

                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pl-5">
                        {doc.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pin Toggle Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePin(doc.id);
                    }}
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      isPinned
                        ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-neutral-950 shadow-2xs'
                        : 'border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    {isPinned ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Pinned</span>
                      </>
                    ) : (
                      <>
                        <Pin className="w-3 h-3 rotate-45 text-neutral-400" />
                        <span>Pin</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/40 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
