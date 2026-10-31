import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Laptop, 
  Cloud, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  ArrowRightLeft, 
  Sparkles,
  FileText,
  ShieldCheck,
  AlertCircle,
  Database
} from 'lucide-react';
import { syncAllDocuments, isSupabaseConfigured } from '../../lib/supabase';
import { db } from '../../db';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  onSyncComplete,
}) => {
  const [syncPhase, setSyncPhase] = useState<'idle' | 'connecting' | 'transferring' | 'complete' | 'error'>('idle');
  const [pulledCount, setPulledCount] = useState(0);
  const [pushedCount, setPushedCount] = useState(0);
  const [localDocCount, setLocalDocCount] = useState(0);
  const [syncedDocTitles, setSyncedDocTitles] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState('Ready to sync');
  const [isCloudConfigured, setIsCloudConfigured] = useState(true);

  const handleStartSync = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setIsCloudConfigured(false);
      setSyncPhase('error');
      setStatusMessage('Cloud vault is not configured. Please connect Supabase in Settings.');
      return;
    }

    setIsCloudConfigured(true);
    setSyncPhase('connecting');
    setStatusMessage('Connecting to secure cloud server...');

    try {
      // Query local document count for status display
      const totalLocal = await db.documents.filter((d) => !d.isDeleted).count();
      setLocalDocCount(totalLocal);

      // Brief transition for smooth visual feedback
      await new Promise((r) => setTimeout(r, 400));
      setSyncPhase('transferring');
      setStatusMessage('Reconciling documents & revisions...');

      // Execute bi-directional sync
      const res = await syncAllDocuments(true);
      setPulledCount(res.pulled);
      setPushedCount(res.pushed);

      // Fetch recent active documents to display in synced overview
      const recentDocs = await db.documents
        .filter((d) => !d.isDeleted)
        .reverse()
        .limit(6)
        .toArray();

      setSyncedDocTitles(recentDocs.map((d) => d.title || 'Untitled Document'));

      await new Promise((r) => setTimeout(r, 500));
      setSyncPhase('complete');
      setStatusMessage(
        res.pulled > 0 || res.pushed > 0
          ? `Successfully synchronized ${res.pulled} incoming & ${res.pushed} outgoing changes.`
          : 'All documents are already up-to-date across devices.'
      );
      onSyncComplete?.();
    } catch (err: any) {
      setSyncPhase('error');
      setStatusMessage(err?.message || 'Sync encountered an error. Check network connection.');
    }
  }, [onSyncComplete]);

  useEffect(() => {
    if (isOpen) {
      setIsCloudConfigured(isSupabaseConfigured());
      handleStartSync();
    }
  }, [isOpen, handleStartSync]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden font-sans text-neutral-900 dark:text-neutral-100"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent Strip */}
        <div className="h-1 w-full bg-gradient-to-r from-brand-600 via-indigo-500 to-emerald-500" />

        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-200 dark:border-brand-800/60 shadow-2xs">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Cloud Vault Sync
                </h2>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-semibold border ${
                  syncPhase === 'error'
                    ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-800/60'
                    : syncPhase === 'complete'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 border-brand-200 dark:border-brand-800/60'
                }`}>
                  {syncPhase === 'complete' ? 'IN SYNC' : syncPhase === 'error' ? 'OFFLINE' : 'SYNCING'}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Keep notes consistent across all your devices
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Column Node Architecture */}
        <div className="p-6 bg-neutral-50/50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800">
          <div className="grid grid-cols-3 items-center gap-3">
            {/* Node 1: Local Device */}
            <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 flex items-center justify-center mb-2 shadow-2xs">
                <Laptop className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">This Device</span>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                {localDocCount > 0 ? `${localDocCount} notes` : 'IndexedDB'}
              </span>
            </div>

            {/* Node 2: Center Sync Engine */}
            <div className="flex flex-col items-center justify-center text-center px-1">
              <div className="relative mb-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
                  syncPhase === 'complete'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
                    : syncPhase === 'error'
                    ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400'
                    : 'bg-brand-50 dark:bg-brand-950/40 border-brand-300 dark:border-brand-700 text-brand-600 dark:text-brand-400'
                }`}>
                  {syncPhase === 'complete' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : syncPhase === 'error' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : syncPhase === 'transferring' || syncPhase === 'connecting' ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <ArrowRightLeft className="w-5 h-5" />
                  )}
                </div>
              </div>
              <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 truncate max-w-full">
                {syncPhase === 'transferring' ? 'Syncing...' : syncPhase === 'complete' ? 'Completed' : 'Sync Engine'}
              </span>
              <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 mt-0.5">
                {pulledCount > 0 || pushedCount > 0 ? `↓${pulledCount} · ↑${pushedCount}` : 'Delta check'}
              </span>
            </div>

            {/* Node 3: Cloud Vault */}
            <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 shadow-2xs border border-indigo-100 dark:border-indigo-900/50">
                <Database className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Cloud Vault</span>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                {isCloudConfigured ? 'Supabase' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Progress Bar & Status Text */}
          <div className="mt-4 pt-4 border-t border-neutral-200/60 dark:border-neutral-800 space-y-2">
            <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${
                  syncPhase === 'complete'
                    ? 'bg-emerald-500'
                    : syncPhase === 'error'
                    ? 'bg-red-500'
                    : 'bg-brand-600'
                }`}
                initial={{ width: '0%' }}
                animate={{
                  width:
                    syncPhase === 'connecting'
                      ? '35%'
                      : syncPhase === 'transferring'
                      ? '75%'
                      : syncPhase === 'complete' || syncPhase === 'error'
                      ? '100%'
                      : '0%',
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <p className="text-neutral-700 dark:text-neutral-300 font-medium flex items-center gap-1.5 truncate">
                {syncPhase === 'complete' && <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                <span className="truncate">{statusMessage}</span>
              </p>
              <span className="text-[11px] text-neutral-400 shrink-0 font-mono">
                {syncPhase === 'complete' ? '100%' : syncPhase === 'transferring' ? '75%' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Live Synchronized Workspace Files */}
        <div className="p-5 space-y-2.5 font-sans">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-neutral-400" />
              <span>Workspace Documents</span>
            </span>
            <span className="text-[11px] font-mono text-neutral-400">
              {pulledCount > 0 || pushedCount > 0 ? `↓ ${pulledCount} pulled • ↑ ${pushedCount} pushed` : 'Up to date'}
            </span>
          </div>

          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {syncedDocTitles.length > 0 ? (
              syncedDocTitles.map((title, i) => (
                <div
                  key={i}
                  className="px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">{title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60 shrink-0">
                    Synced
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-neutral-400">
                {syncPhase === 'connecting' || syncPhase === 'transferring'
                  ? 'Connecting to document store...'
                  : 'No active documents found in local vault.'}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-neutral-50/80 dark:bg-neutral-900/80 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between font-sans">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>End-to-end encrypted transfer</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartSync}
              disabled={syncPhase === 'transferring' || syncPhase === 'connecting'}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${syncPhase === 'transferring' ? 'animate-spin' : ''}`} />
              <span>Sync Again</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
