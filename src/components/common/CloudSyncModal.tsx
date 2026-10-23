import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Laptop, 
  Server, 
  Cloud, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  ArrowRightLeft, 
  Sparkles,
  FileText,
  ShieldCheck,
  Zap
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
  const [syncedDocTitles, setSyncedDocTitles] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState('Ready to sync');
  const [isCloudConfigured, setIsCloudConfigured] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsCloudConfigured(isSupabaseConfigured());
      handleStartSync();
    }
  }, [isOpen]);

  const handleStartSync = async () => {
    if (!isCloudConfigured || !isSupabaseConfigured()) {
      setSyncPhase('error');
      setStatusMessage('Cloud vault is offline or unconfigured.');
      return;
    }

    setSyncPhase('connecting');
    setStatusMessage('Handshaking with secure cloud server...');

    try {
      // Step 1: Connecting phase delay for playful visual animation
      await new Promise((r) => setTimeout(r, 600));
      setSyncPhase('transferring');
      setStatusMessage('Exchanging changed files across your devices...');

      // Step 2: Trigger forced bi-directional sync
      const res = await syncAllDocuments(true);
      setPulledCount(res.pulled);
      setPushedCount(res.pushed);

      // Fetch sample of active documents to show in animated sync list
      const recentDocs = await db.documents
        .filter((d) => !d.isDeleted)
        .reverse()
        .limit(6)
        .toArray();

      setSyncedDocTitles(recentDocs.map((d) => d.title));

      await new Promise((r) => setTimeout(r, 800));
      setSyncPhase('complete');
      setStatusMessage(
        res.pulled > 0 || res.pushed > 0
          ? `Synced ${res.pulled} incoming & ${res.pushed} outgoing updates!`
          : 'All devices are 100% in sync!'
      );
      onSyncComplete?.();
    } catch (err: any) {
      setSyncPhase('error');
      setStatusMessage(err?.message || 'Sync failed. Please check network connection.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md font-sans select-none animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#131218] border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden font-sans text-neutral-900 dark:text-neutral-100"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-500 via-indigo-500 to-sky-400" />

        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-500/20 shadow-2xs">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <span>Multi-Device Cloud Sync</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                  LIVE
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">Keep notes consistent across all your screens</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Entertaining Interactive Animation Centerpiece */}
        <div className="p-6 bg-gradient-to-b from-neutral-50/70 to-white dark:from-[#181622] dark:to-[#131218] border-b border-neutral-100 dark:border-neutral-800/80 flex flex-col items-center">
          <div className="relative w-full max-w-sm h-36 flex items-center justify-between px-4">
            {/* User Computer (Left) */}
            <motion.div
              animate={{
                y: syncPhase === 'transferring' ? [0, -4, 0] : 0,
              }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-2 z-10"
            >
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/25 border border-white/20">
                <Laptop className="w-8 h-8" />
                {syncPhase === 'transferring' && (
                  <motion.span
                    animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white dark:border-neutral-900"
                  />
                )}
              </div>
              <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">This Device</span>
            </motion.div>

            {/* Connecting Data Highway (Center) */}
            <div className="flex-1 px-4 relative flex items-center justify-center">
              {/* Conduit Line */}
              <div className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full relative overflow-hidden">
                {(syncPhase === 'transferring' || syncPhase === 'connecting') && (
                  <motion.div
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.2,
                      ease: 'linear',
                    }}
                    className="w-1/2 h-full bg-gradient-to-r from-transparent via-brand-500 to-transparent"
                  />
                )}
              </div>

              {/* Flying Data Packets */}
              <AnimatePresence>
                {syncPhase === 'transferring' && (
                  <>
                    <motion.div
                      initial={{ x: -60, opacity: 0 }}
                      animate={{ x: 60, opacity: [0, 1, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                      className="absolute p-1 bg-brand-500 text-white rounded-md shadow-md text-[9px] font-mono flex items-center gap-1"
                    >
                      <Zap className="w-2.5 h-2.5 text-amber-300" />
                      <span>.md</span>
                    </motion.div>
                    <motion.div
                      initial={{ x: 60, opacity: 0 }}
                      animate={{ x: -60, opacity: [0, 1, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1.4, delay: 0.7, ease: 'easeInOut' }}
                      className="absolute -top-3 p-1 bg-indigo-500 text-white rounded-md shadow-md text-[9px] font-mono flex items-center gap-1"
                    >
                      <Cloud className="w-2.5 h-2.5 text-sky-200" />
                      <span>sync</span>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Center Status Pulse */}
              <div className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shadow-xs">
                {syncPhase === 'complete' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : syncPhase === 'transferring' || syncPhase === 'connecting' ? (
                  <RefreshCw className="w-3.5 h-3.5 text-brand-600 animate-spin" />
                ) : (
                  <ArrowRightLeft className="w-3.5 h-3.5 text-neutral-400" />
                )}
              </div>
            </div>

            {/* Cloud Server (Right) */}
            <motion.div
              animate={{
                y: syncPhase === 'transferring' ? [0, -4, 0] : 0,
              }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.2, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-2 z-10"
            >
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-white/20">
                <Server className="w-8 h-8" />
                {syncPhase === 'complete' && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-neutral-900 flex items-center justify-center text-white"
                  >
                    ✓
                  </motion.span>
                )}
              </div>
              <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">Cloud Vault</span>
            </motion.div>
          </div>

          {/* Status Headline */}
          <div className="mt-3 text-center space-y-1">
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-1.5">
              {syncPhase === 'complete' && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
              <span>{statusMessage}</span>
            </p>
            <p className="text-[11px] text-neutral-400">
              {syncPhase === 'complete'
                ? 'Your local IndexedDB and cloud database are synchronized.'
                : syncPhase === 'transferring'
                ? 'Checking timestamps, patches and delta revisions...'
                : 'Pinging cloud cluster...'}
            </p>
          </div>
        </div>

        {/* Live Synchronized Document List */}
        <div className="p-5 space-y-3 font-sans">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-neutral-400" />
              <span>Synced Files in Workspace</span>
            </span>
            <span className="text-[11px] font-mono text-neutral-400">
              {pulledCount > 0 || pushedCount > 0 ? `↓${pulledCount} pulled • ↑${pushedCount} pushed` : 'Up-to-date'}
            </span>
          </div>

          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {syncedDocTitles.length > 0 ? (
              syncedDocTitles.map((title, i) => (
                <div
                  key={i}
                  className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">{title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                    Synced
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-neutral-400">Scanning local library...</div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-3.5 bg-neutral-50/70 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between font-sans">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted cloud transit</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartSync}
              disabled={syncPhase === 'transferring' || syncPhase === 'connecting'}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${syncPhase === 'transferring' ? 'animate-spin' : ''}`} />
              <span>Sync Again</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
