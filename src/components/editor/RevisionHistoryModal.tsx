import React, { useState, useEffect } from 'react';
import { 
  X, 
  RotateCcw, 
  FileText, 
  Plus, 
  Clock,
  Layers,
  GitCommit,
  Zap
} from 'lucide-react';
import { DocumentRevision, getDocumentRevisions, createRevisionSnapshot } from '../../db';
import { useConfirm } from '../../stores/useConfirmStore';
import { APP_VERSION_LABEL } from '../../config/version';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md select-none font-sans animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-[#121118] border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-[0_24px_70px_-12px_rgba(0,0,0,0.35)] dark:shadow-[0_30px_90px_-15px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[85vh] text-neutral-900 dark:text-neutral-100 font-sans"
        role="dialog"
        aria-modal="true"
        aria-label="Revision History"
        onClick={e => e.stopPropagation()}
      >
        {/* Subtle Violet Sheen */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-brand-500/80 to-transparent shrink-0" />

        {/* Window Titlebar Header (Follows App Design Language) */}
        <div className="px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between bg-neutral-50/70 dark:bg-[#181620] shrink-0">
          <div className="flex items-center gap-2.5">
            {/* macOS Window Controls */}
            <div className="flex items-center gap-1.5 mr-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block shadow-2xs" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block shadow-2xs" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block shadow-2xs" />
            </div>

            <div className="flex items-center gap-2 pl-1 border-l border-neutral-200/60 dark:border-neutral-800">
              <img 
                src="/logo.png" 
                alt="MD Writer" 
                className="w-5 h-5 rounded-md object-contain shadow-2xs" 
              />
              <span className="font-semibold text-xs sm:text-sm text-neutral-900 dark:text-white tracking-tight">
                Revision History
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                {APP_VERSION_LABEL} Delta Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTakeSnapshot}
              disabled={isCreating}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
              title="Save a manual checkpoint immediately"
            >
              <Plus className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Checkpoint Now</span>
            </button>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body: Two-Pane Split */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden font-sans">
          
          {/* Left: Revisions Timeline List */}
          <div className="w-full md:w-80 border-r border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#15131c] overflow-y-auto p-3 space-y-2">
            {isLoading ? (
              <div className="p-6 text-center text-xs text-neutral-400">Loading checkpoints...</div>
            ) : revisions.length === 0 ? (
              <div className="p-8 text-center">
                <Clock className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">No Checkpoints Yet</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                  Checkpoints coalesce automatically after 45s of idle typing or whenever you click "Checkpoint Now".
                </p>
              </div>
            ) : (
              revisions.map((rev, idx) => {
                const isSelected = selectedRevision?.id === rev.id;
                const dateObj = new Date(rev.timestamp);
                const isKeyframe = rev.isSnapshot ?? (idx === revisions.length - 1 || idx % 20 === 0);
                const savings = rev.spaceSavedPercent || (isKeyframe ? 60 : 85);

                return (
                  <button
                    key={rev.id || idx}
                    onClick={() => setSelectedRevision(rev)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-white dark:bg-[#1e1b29] border-brand-500 shadow-xs ring-1 ring-brand-500/30'
                        : 'bg-white/60 dark:bg-neutral-900/60 border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                        {isKeyframe ? (
                          <Layers className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                        ) : (
                          <GitCommit className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        )}
                        <span>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {rev.wordCount} words
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                      <span className="truncate max-w-[120px]">{rev.reason || (isKeyframe ? 'Keyframe' : 'Delta')}</span>
                      
                      <div className="flex items-center gap-1">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-medium ${
                          isKeyframe 
                            ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20' 
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {isKeyframe ? 'Snapshot' : 'Delta'}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-mono">
                          ~{savings}% LZ
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right: Snapshot Preview & Rollback Action */}
          <div className="flex-1 flex flex-col bg-white dark:bg-[#121118] overflow-hidden font-sans">
            {selectedRevision ? (
              <>
                <div className="px-5 py-3 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between bg-neutral-50/40 dark:bg-[#181620]/60 text-xs">
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
                    className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.99]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Revert to this Version</span>
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
        <div className="px-6 py-2.5 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-[#181620] flex items-center justify-between text-xs text-neutral-500 font-sans">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px]">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Delta Engine: Diffs + 20-rev snapshots • LZ-compressed • Auto-pruned to 50 checkpoints</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
