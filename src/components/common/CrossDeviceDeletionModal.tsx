import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle, Trash2, ArrowUpRight, FolderHeart } from 'lucide-react';
import {
  useCrossDeviceConflictStore,
  markTombstoneResolved,
  markDocLocalOnly,
  removeDocLocalOnly,
  type RemoteDeletionConflict,
} from '../../stores/useCrossDeviceConflictStore';
import { deleteDocument, getDocumentContent, db } from '../../db';
import { syncDocumentToSupabase, supabase } from '../../lib/supabase';

interface CrossDeviceDeletionModalProps {
  onToast?: (msg: string) => void;
}

function formatDate(ts: number): string {
  if (!ts) return 'Recently';
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const CrossDeviceDeletionModal: React.FC<CrossDeviceDeletionModalProps> = ({ onToast }) => {
  const { conflicts, isOpen, closeModal, removeConflict } = useCrossDeviceConflictStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-select all by default if selection is empty
  React.useEffect(() => {
    if (conflicts.length > 0) {
      setSelectedIds(new Set(conflicts.map((c) => c.id)));
    }
  }, [conflicts]);

  if (!isOpen || conflicts.length === 0) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(conflicts.map((c) => c.id)));
  const deselectAll = () => setSelectedIds(new Set());

  // Action 1: Sync Deletions (Permanently delete local copies to match cloud)
  const handleSyncDeletions = async () => {
    const targetIds = selectedIds.size > 0 ? Array.from(selectedIds) : conflicts.map((c) => c.id);
    setIsProcessing(true);
    try {
      for (const id of targetIds) {
        const conflict = conflicts.find((c) => c.id === id);
        if (conflict) {
          await deleteDocument(id, true);
          markTombstoneResolved(id, conflict.deletedAt);
          removeDocLocalOnly(id);
          removeConflict(id);
        }
      }
      onToast?.(`Removed ${targetIds.length} file${targetIds.length !== 1 ? 's' : ''} to match other devices.`);
    } catch (err) {
      console.warn('[CrossDeviceDeletionModal] Deletion error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Action 2: Keep Local Only (Retain file on this device, unlink from cloud)
  const handleKeepLocal = async () => {
    const targetIds = selectedIds.size > 0 ? Array.from(selectedIds) : conflicts.map((c) => c.id);
    setIsProcessing(true);
    try {
      for (const id of targetIds) {
        const conflict = conflicts.find((c) => c.id === id);
        if (conflict) {
          await db.documents.update(id, { cloudSynced: false });
          markDocLocalOnly(id);
          markTombstoneResolved(id, conflict.deletedAt);
          removeConflict(id);
        }
      }
      onToast?.(`Kept ${targetIds.length} document${targetIds.length !== 1 ? 's' : ''} locally on this device.`);
    } catch (err) {
      console.warn('[CrossDeviceDeletionModal] Keep local error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Action 3: Revive to Cloud (Restore document and re-upload with active sync)
  const handleReviveDocument = async (conflict: RemoteDeletionConflict) => {
    setIsProcessing(true);
    try {
      const doc = await db.documents.get(conflict.id);
      const content = await getDocumentContent(conflict.id);

      if (doc) {
        // 1. Clear deletion marker in Supabase
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await supabase
              .from('documents')
              .update({
                is_deleted: false,
                deleted_at: null,
                updated_at: new Date().toISOString(),
              })
              .eq('id', conflict.id)
              .eq('user_id', session.user.id);
          }
        }

        // 2. Push content back to cloud
        await syncDocumentToSupabase(doc, content);

        // 3. Update local Dexie status
        await db.documents.update(conflict.id, {
          isDeleted: false,
          deletedAt: undefined,
          cloudSynced: true,
          updatedAt: Date.now(),
        });

        markTombstoneResolved(conflict.id, conflict.deletedAt);
        removeDocLocalOnly(conflict.id);
        removeConflict(conflict.id);

        onToast?.(`Restored "${conflict.title}" to cloud across devices.`);
      }
    } catch (err) {
      console.warn('[CrossDeviceDeletionModal] Revive error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/90 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cross-device-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="cross-device-modal-title" className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
                Remote Deletions Detected
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                {conflicts.length} document{conflicts.length !== 1 ? 's were' : ' was'} deleted on another device
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content explanation */}
        <div className="px-5 pt-3.5 pb-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed border-b border-neutral-100 dark:border-neutral-800/50">
          These documents still exist on this device. Choose whether to remove them to match your other devices, keep them as offline-only files, or restore them back to the cloud.
        </div>

        {/* List of Conflicting Files */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          <div className="flex items-center justify-between text-[11px] text-neutral-500 px-1 mb-1">
            <span>
              {selectedIds.size} of {conflicts.length} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
              >
                Select all
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={deselectAll}
                className="hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
              >
                Deselect
              </button>
            </div>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
            {conflicts.map((item) => {
              const isChecked = selectedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border transition-all text-xs flex items-center justify-between gap-3 ${
                    isChecked
                      ? 'border-neutral-300 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800/50'
                      : 'border-neutral-200/70 dark:border-neutral-800/60 bg-white dark:bg-neutral-900/40 opacity-75'
                  }`}
                >
                  <label className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelect(item.id)}
                      className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0 cursor-pointer shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                        Deleted: {formatDate(item.deletedAt)}
                      </div>
                    </div>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleReviveDocument(item)}
                    disabled={isProcessing}
                    title="Restore file and push back to cloud"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 hover:text-brand-600 dark:hover:text-brand-400 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <ArrowUpRight className="w-3 h-3" />
                    <span>Restore</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-neutral-950/30 flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleKeepLocal}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <FolderHeart className="w-3.5 h-3.5 text-neutral-500" />
            <span>Keep Local Only</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-3 py-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 text-xs font-semibold cursor-pointer"
            >
              Decide Later
            </button>
            <button
              type="button"
              onClick={handleSyncDeletions}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 font-semibold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500 dark:text-rose-600" />
              <span>Sync Deletions ({selectedIds.size || conflicts.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
