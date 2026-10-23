import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Lock, 
  Eye, 
  Edit3, 
  Sparkles,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { publishBundle, PublishOptions } from '../../services/publishService';
import { DocumentMetadata } from '../../db';
import { isSupabaseConfigured } from '../../lib/supabase';
import { QuickAuthModal } from '../auth/QuickAuthModal';
import { useAuthStore } from '../../stores/useAuthStore';

interface BulkShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDocIds: Set<string>;
  documents: DocumentMetadata[];
}

export const BulkShareModal: React.FC<BulkShareModalProps> = ({
  isOpen,
  onClose,
  selectedDocIds,
  documents,
}) => {
  const selectedDocs = documents.filter((d) => selectedDocIds.has(d.id));
  const user = useAuthStore((s) => s.user);

  const [bundleTitle, setBundleTitle] = useState(
    selectedDocs.length > 0 ? `Collection of ${selectedDocs.length} Notes` : 'Document Bundle'
  );
  const [permissionMode, setPermissionMode] = useState<'view' | 'edit'>('view');
  const [enablePassword, setEnablePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (!publishedUrl) return;
    navigator.clipboard.writeText(publishedUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePublish = async () => {
    if (!user?.id) {
      setIsAuthOpen(true);
      return;
    }

    if (!isSupabaseConfigured()) {
      setErrorMsg('Cloud database is not configured. Please connect Supabase.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const docIds = Array.from(selectedDocIds);
    const options: PublishOptions = {
      permissionMode,
      password: enablePassword && password.trim() ? password.trim() : undefined,
    };

    const res = await publishBundle(docIds, bundleTitle, options);
    setIsSubmitting(false);

    if (res.success) {
      setPublishedUrl(res.url);
    } else {
      setErrorMsg(res.error || 'Failed to publish bundle.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md font-sans select-none animate-in fade-in duration-150">
        <div
          className="relative w-full max-w-xl bg-white dark:bg-[#121118] border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden font-sans text-neutral-900 dark:text-neutral-100 flex flex-col max-h-[90vh]"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Rainbow Sheen */}
          <div className="h-1.5 w-full bg-gradient-to-r from-brand-500 via-purple-500 to-indigo-500 shrink-0" />

          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-500/20 shadow-2xs">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <span>Bulk Share Bundle</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 font-bold">
                    {selectedDocs.length} files
                  </span>
                </h2>
                <p className="text-[11px] text-neutral-400">Share multiple markdown files under one clean link</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* If Already Published */}
            {publishedUrl ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                  <div>
                    <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      Bundle Published Successfully!
                    </h3>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      Anyone with this link can view {permissionMode === 'edit' ? 'and propose edits to' : ''} your shared documents.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Shareable Bundle Link
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={publishedUrl}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 font-mono text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <a
                      href={publishedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                      title="Open shared bundle in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Selected Files List Preview */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Documents in this Bundle:
                  </span>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {selectedDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate pr-2">
                          {doc.title}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                          {doc.wordCount} words
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Bundle Title Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Bundle Name / Collection Title
                  </label>
                  <input
                    type="text"
                    value={bundleTitle}
                    onChange={(e) => setBundleTitle(e.target.value)}
                    placeholder="e.g. Project Specs & Blueprints"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-sans text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                {/* Permission Mode Selector (View-Only vs View-Edit) */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <span>Sharing Permission Mode</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPermissionMode('view')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        permissionMode === 'view'
                          ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 ring-1 ring-brand-500/30'
                          : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
                        <Eye className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                        <span>View Only</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-normal">
                        Recipients can read and download Markdown, but cannot submit modifications.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPermissionMode('edit')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        permissionMode === 'edit'
                          ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-500/30'
                          : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
                        <Edit3 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>View & Edit</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-normal">
                        Recipients can edit and submit changes. A snapshot of your original version is automatically preserved!
                      </p>
                    </button>
                  </div>
                </div>

                {/* Password Protection Option */}
                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      <Lock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Require Passphrase for Bundle</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={enablePassword}
                      onChange={(e) => setEnablePassword(e.target.checked)}
                      className="rounded border-neutral-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                    />
                  </div>

                  {enablePassword && (
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Set access passphrase..."
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                  )}
                </div>

                {/* Selected Files Preview List */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>Included Documents ({selectedDocs.length}):</span>
                  </div>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {selectedDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate pr-2">
                          {doc.title}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                          {doc.wordCount} words
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-neutral-50/70 dark:bg-neutral-900/60 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-neutral-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Free instant multi-document sharing</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-medium cursor-pointer transition-colors"
              >
                {publishedUrl ? 'Close' : 'Cancel'}
              </button>

              {!publishedUrl && (
                <button
                  type="button"
                  disabled={isSubmitting || selectedDocs.length === 0}
                  onClick={handlePublish}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Create Bundle Link</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Auth Modal if not signed in */}
      <QuickAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
          handlePublish();
        }}
      />
    </>
  );
};
