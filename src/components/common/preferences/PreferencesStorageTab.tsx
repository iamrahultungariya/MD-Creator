import React, { useState } from 'react';
import { Database, Download, CheckCircle2 } from 'lucide-react';
import { usePreferencesStore } from '../../../stores/usePreferencesStore';
import { db } from '../../../db';
import { StorageLimitRing } from '../StorageLimitRing';
import { APP_VERSION } from '../../../config/version';

interface PreferencesStorageTabProps {
  docCount: number;
}

export const PreferencesStorageTab: React.FC<PreferencesStorageTabProps> = ({ docCount }) => {
  const { resetPreferences } = usePreferencesStore();
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  // Handle Export All Documents Backup
  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      const allDocs = await db.documents.toArray();
      const exportData = {
        app: 'MD Writer',
        version: APP_VERSION,
        exportedAt: new Date().toISOString(),
        documentsCount: allDocs.length,
        documents: allDocs,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `md_writer_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export backup:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* 300 MB Workspace Storage Limit Ring Card */}
      <StorageLimitRing variant="card" />

      {/* Local Storage Card */}
      <div className="p-4 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#8257F5]" />
            <span className="font-semibold text-neutral-900 dark:text-white">
              Local Offline IndexedDB Vault
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md font-mono text-[11px] bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
            {docCount} Document{docCount !== 1 ? 's' : ''}
          </span>
        </div>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
          Your writing is stored 100% locally and privately on this device. No tracking, no external storage leaks.
        </p>

        <div className="pt-1.5 flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportAll}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 font-semibold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export Complete Backup (JSON)'}</span>
          </button>

          {exportSuccess && (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Downloaded!</span>
            </span>
          )}
        </div>
      </div>

      {/* Reset Defaults Card */}
      <div className="p-4 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 flex items-center justify-between text-xs">
        <div>
          <span className="font-semibold text-neutral-900 dark:text-white">Reset Editor Preferences</span>
          <p className="text-[10px] text-neutral-500">Restore typography, size, and line height to default settings</p>
        </div>
        {resetConfirm ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                resetPreferences();
                setResetConfirm(false);
              }}
              className="px-2.5 py-1 rounded-md bg-rose-600 text-white text-[11px] font-semibold hover:bg-rose-700 cursor-pointer"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setResetConfirm(false)}
              className="px-2 py-1 rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-white text-[11px] cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setResetConfirm(true)}
            className="px-3 py-1.5 rounded-md border border-neutral-200/80 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Reset Defaults
          </button>
        )}
      </div>
    </div>
  );
};
