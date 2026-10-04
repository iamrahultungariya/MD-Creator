import React, { useEffect, useState } from 'react';
import { 
  X, 
  Database, 
  FileText, 
  History, 
  Image as ImageIcon, 
  Trash2, 
  Download, 
  CheckCircle2, 
  Zap, 
  ShieldCheck
} from 'lucide-react';
import { db, emptyTrash } from '../../db';
import { SOFT_LIMIT_MB, SOFT_LIMIT_BYTES } from './StorageLimitRing';

interface StorageDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStorageChanged?: () => void;
}

interface StorageBreakdown {
  activeCount: number;
  activeBytes: number;
  trashedCount: number;
  trashedBytes: number;
  revisionCount: number;
  revisionBytes: number;
  imageCount: number;
  imageBytes: number;
  totalBytes: number;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const StorageDetailsModal: React.FC<StorageDetailsModalProps> = ({
  isOpen,
  onClose,
  onStorageChanged
}) => {
  const [breakdown, setBreakdown] = useState<StorageBreakdown>({
    activeCount: 0,
    activeBytes: 0,
    trashedCount: 0,
    trashedBytes: 0,
    revisionCount: 0,
    revisionBytes: 0,
    imageCount: 0,
    imageBytes: 0,
    totalBytes: 0,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isPurgingTrash, setIsPurgingTrash] = useState(false);
  const [trashPurgedSuccess, setTrashPurgedSuccess] = useState(false);

  const fetchBreakdown = async () => {
    try {
      const allDocs = await db.documents.toArray();
      const activeDocs = allDocs.filter(d => !d.isDeleted);
      const trashedDocs = allDocs.filter(d => Boolean(d.isDeleted));

      let activeBytes = 0;
      for (const doc of activeDocs) {
        activeBytes += doc.sizeBytes || 0;
      }

      let trashedBytes = 0;
      for (const doc of trashedDocs) {
        trashedBytes += doc.sizeBytes || 0;
      }

      const allRevisions = await db.revisions.toArray();
      let revisionBytes = 0;
      for (const rev of allRevisions) {
        revisionBytes += new Blob([rev.content || '']).size;
      }

      const allImages = await db.images.toArray();
      let imageBytes = 0;
      for (const img of allImages) {
        imageBytes += img.sizeBytes || 0;
      }

      let totalBytes = activeBytes + trashedBytes + revisionBytes + imageBytes;
      if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        if (est.usage && est.usage > 0) {
          totalBytes = est.usage;
        }
      }

      setBreakdown({
        activeCount: activeDocs.length,
        activeBytes,
        trashedCount: trashedDocs.length,
        trashedBytes,
        revisionCount: allRevisions.length,
        revisionBytes,
        imageCount: allImages.length,
        imageBytes,
        totalBytes,
      });
    } catch (err) {
      console.error('Failed to load storage breakdown:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBreakdown();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const usedMb = Number((breakdown.totalBytes / (1024 * 1024)).toFixed(1));
  const percent = Math.min(100, Math.max(0.4, Number(((breakdown.totalBytes / SOFT_LIMIT_BYTES) * 100).toFixed(1))));

  // Circumference calculation for SVG ring gauge
  const radius = 34;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const gaugeColor =
    percent > 90 ? '#f43f5e' : percent > 75 ? '#f59e0b' : '#8257F5';

  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const allDocs = await db.documents.toArray();
      const allRevisions = await db.revisions.toArray();
      const exportData = {
        app: 'MD Writer',
        version: '0.9.3.0',
        exportedAt: new Date().toISOString(),
        documentsCount: allDocs.length,
        revisionsCount: allRevisions.length,
        documents: allDocs,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `md_writer_vault_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export vault backup:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleEmptyTrash = async () => {
    if (breakdown.trashedCount === 0) return;
    setIsPurgingTrash(true);
    try {
      await emptyTrash();
      setTrashPurgedSuccess(true);
      await fetchBreakdown();
      if (onStorageChanged) onStorageChanged();
      setTimeout(() => setTrashPurgedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to purge trash:', err);
    } finally {
      setIsPurgingTrash(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/90 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="storage-modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-500/20 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 id="storage-modal-title" className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
                Workspace Storage & Limit
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                In-app IndexedDB safeguards & live telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Main Ring Gauge Banner */}
          <div className="p-4 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 flex items-center gap-5">
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-neutral-200 dark:text-neutral-800"
                />
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  fill="transparent"
                  stroke={gaugeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-sm font-bold text-neutral-900 dark:text-white leading-none">
                  {percent < 1 ? '<1' : Math.round(percent)}%
                </span>
                <span className="text-[9px] text-neutral-400 font-medium mt-0.5">USED</span>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                  Current Consumption
                </span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                  {usedMb} MB / {SOFT_LIMIT_MB} MB
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-md h-2 overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all duration-500 ease-out"
                  style={{ width: `${percent}%`, backgroundColor: gaugeColor }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                <span>Safe capacity: 300 MB</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  0ms Typist Latency
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Items Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Active Documents */}
            <div className="p-3 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-1">
              <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <FileText className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  <span>Active Docs</span>
                </div>
                <span className="text-[11px] font-semibold text-neutral-900 dark:text-white">
                  {breakdown.activeCount}
                </span>
              </div>
              <div className="text-sm font-bold text-neutral-900 dark:text-white">
                {formatBytes(breakdown.activeBytes)}
              </div>
            </div>

            {/* Revisions Snapshots */}
            <div className="p-3 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-1">
              <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <History className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Revisions</span>
                </div>
                <span className="text-[11px] font-semibold text-neutral-900 dark:text-white">
                  {breakdown.revisionCount}
                </span>
              </div>
              <div className="text-sm font-bold text-neutral-900 dark:text-white">
                {formatBytes(breakdown.revisionBytes)}
              </div>
            </div>

            {/* Embedded Images */}
            <div className="p-3 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-1">
              <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span>Media Blobs</span>
                </div>
                <span className="text-[11px] font-semibold text-neutral-900 dark:text-white">
                  {breakdown.imageCount}
                </span>
              </div>
              <div className="text-sm font-bold text-neutral-900 dark:text-white">
                {formatBytes(breakdown.imageBytes)}
              </div>
            </div>

            {/* Recycle Bin / Trash */}
            <div className="p-3 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-1">
              <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Trash</span>
                </div>
                <span className="text-[11px] font-semibold text-neutral-900 dark:text-white">
                  {breakdown.trashedCount}
                </span>
              </div>
              <div className="text-sm font-bold text-neutral-900 dark:text-white">
                {formatBytes(breakdown.trashedBytes)}
              </div>
            </div>
          </div>

          {/* Educational Explainers */}
          <div className="p-3.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Why is there a 300 MB soft limit?</span>
            </div>

            <ul className="space-y-1.5 text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed list-disc list-inside">
              <li>
                <strong className="text-neutral-800 dark:text-neutral-200">100% Local & Private:</strong> All documents, images, and history snapshots are stored directly in your browser's IndexedDB. Nothing leaves your machine unless you publish.
              </li>
              <li>
                <strong className="text-neutral-800 dark:text-neutral-200">Zero Typing Lag (0ms):</strong> Keeping active working memory under 300 MB avoids browser garbage collection spikes, ensuring instantaneous search and keystroke autosaves.
              </li>
              <li>
                <strong className="text-neutral-800 dark:text-neutral-200">Soft Advisory Benchmark:</strong> Your hard drive has plenty of space; 300 MB is our recommended threshold for an ultra-snappy web app experience.
              </li>
            </ul>
          </div>

          {/* Action Row */}
          <div className="pt-1 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportBackup}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 font-semibold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExporting ? 'Exporting...' : 'Export Vault (.json)'}</span>
              </button>

              {breakdown.trashedCount > 0 && (
                <button
                  type="button"
                  onClick={handleEmptyTrash}
                  disabled={isPurgingTrash}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isPurgingTrash ? 'Purging...' : `Empty Trash (${breakdown.trashedCount})`}</span>
                </button>
              )}
            </div>

            {exportSuccess && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Vault backup downloaded!</span>
              </span>
            )}

            {trashPurgedSuccess && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Trash emptied!</span>
              </span>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/20 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
