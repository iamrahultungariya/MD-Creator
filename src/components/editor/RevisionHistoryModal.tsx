import React, { useState, useEffect } from 'react';
import { 
  X, 
  History, 
  RotateCcw, 
  FileText, 
  Plus, 
  Clock 
} from 'lucide-react';
import { DocumentRevision, getDocumentRevisions, createRevisionSnapshot } from '../../db';
import { useConfirm } from '../../stores/useConfirmStore';

interface RevisionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
  currentContent: string;
  onRestoreRevision: (content: string) => void;
}

export const RevisionHistoryModal: React.FC<RevisionHistoryModalProps> = ({
  isOpen,
  onClose,
  documentId,
  documentTitle,
  currentContent,
  onRestoreRevision
}) => {
  const confirm = useConfirm();
  const [revisions, setRevisions] = useState<DocumentRevision[]>([]);
  const [selectedRevision, setSelectedRevision] = useState<DocumentRevision | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const loadRevisions = async () => {
    setIsLoading(true);
    try {
      const list = await getDocumentRevisions(documentId);
      setRevisions(list);
      if (list.length > 0) {
        setSelectedRevision(list[0]);
      } else {
        setSelectedRevision(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRevisions();
    }
  }, [isOpen, documentId]);

  if (!isOpen) return null;

  const handleTakeSnapshot = async () => {
    if (!currentContent.trim()) return;
    setIsCreating(true);
    try {
      await createRevisionSnapshot(documentId, documentTitle, currentContent, 'Manual Checkpoint');
      await loadRevisions();
    } finally {
      setIsCreating(false);
    }
  };

  const handleRestore = async (rev: DocumentRevision) => {
    const isConfirmed = await confirm({
      title: 'Rollback to Revision?',
      message: `Are you sure you want to revert to the checkpoint from ${new Date(rev.timestamp).toLocaleTimeString()}? Any unsaved edits since will be replaced.`,
      description: 'Your current content will automatically be archived as a safety checkpoint before reverting.',
      confirmText: 'Yes, Rollback Content',
      cancelText: 'Cancel',
      variant: 'warning'
    });

    if (isConfirmed) {
      // Create safety snapshot of current content first
      await createRevisionSnapshot(documentId, documentTitle, currentContent, 'Pre-Rollback Backup');
      onRestoreRevision(rev.content);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/90 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] font-sans"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/50 dark:border-amber-900/40 shadow-2xs">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-neutral-950 dark:text-white">
                  Local Revision History
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold border border-neutral-200/60 dark:border-neutral-700/60">
                  IndexedDB Offline Engine
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-sm sm:max-w-md">
                Automatic checkpoints for "{documentTitle}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTakeSnapshot}
              disabled={isCreating}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Save an instant snapshot checkpoint"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Snapshot Now</span>
            </button>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body: Two-Pane Split */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden font-sans">
          
          {/* Left: Revisions Timeline List */}
          <div className="w-full md:w-80 border-r border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 overflow-y-auto p-3 space-y-2">
            {isLoading ? (
              <div className="p-6 text-center text-xs text-neutral-400">Loading revisions...</div>
            ) : revisions.length === 0 ? (
              <div className="p-8 text-center">
                <Clock className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">No Checkpoints Yet</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                  Revisions are captured automatically after 30s of typing inactivity or via "Snapshot Now".
                </p>
              </div>
            ) : (
              revisions.map((rev) => {
                const isSelected = selectedRevision?.id === rev.id;
                const dateObj = new Date(rev.timestamp);

                return (
                  <button
                    key={rev.id}
                    onClick={() => setSelectedRevision(rev)}
                    className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-white dark:bg-neutral-800 border-brand-500 shadow-2xs'
                        : 'bg-white/60 dark:bg-neutral-900/60 border-neutral-200/60 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {rev.wordCount} words
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                      <span>{dateObj.toLocaleDateString()}</span>
                      <span className="px-1.5 py-0.2 rounded-md text-[9px] bg-neutral-100 dark:bg-neutral-800 font-mono">
                        {rev.reason || 'Auto'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right: Snapshot Preview & Rollback Action */}
          <div className="flex-1 flex flex-col bg-white dark:bg-neutral-900 overflow-hidden font-sans">
            {selectedRevision ? (
              <>
                <div className="px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/40 dark:bg-neutral-900/40 text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      Checkpoint Content Preview
                    </span>
                    <span className="text-neutral-400">•</span>
                    <span className="text-neutral-500 font-mono">
                      {new Date(selectedRevision.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRestore(selectedRevision)}
                    className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Rollback to this Version</span>
                  </button>
                </div>

                <div className="flex-1 p-5 overflow-y-auto font-mono text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed select-text bg-neutral-50/20 dark:bg-neutral-950/20">
                  {selectedRevision.content}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-neutral-400 text-xs">
                Select a checkpoint on the left to inspect content and rollback.
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 flex items-center justify-between text-xs text-neutral-500 font-sans">
          <span>Zero cloud egress • Stored 100% locally in your browser's Dexie IndexedDB.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
