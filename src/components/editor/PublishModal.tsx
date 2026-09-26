import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Copy, 
  Check, 
  ExternalLink, 
  Lock, 
  X, 
  ShieldAlert, 
  CloudOff, 
  Loader2,
  Trash2
} from 'lucide-react';
import { 
  publishDocument, 
  unpublishDocument, 
  getDocumentPublishStatus, 
  generateSlug, 
  PublishedRecord 
} from '../../services/publishService';
import { isSupabaseConfigured } from '../../lib/supabase';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  docId: string;
  title: string;
  content: string;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  docId,
  title,
  content,
}) => {
  const [publishedRecord, setPublishedRecord] = useState<PublishedRecord | null>(null);
  const [customSlug, setCustomSlug] = useState('');
  const [enablePassword, setEnablePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hasCloud = isSupabaseConfigured();

  // Load publication status on mount/open
  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    setErrorMsg(null);

    getDocumentPublishStatus(docId)
      .then((record) => {
        if (record && record.is_public) {
          setPublishedRecord(record);
          setCustomSlug(record.slug);
          setEnablePassword(Boolean(record.password_hash));
        } else {
          setPublishedRecord(null);
          setCustomSlug(generateSlug(title));
        }
      })
      .catch((err) => {
        console.warn('Failed to load publish status:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isOpen, docId, title]);

  if (!isOpen) return null;

  const publicUrl = customSlug
    ? `${window.location.origin}/p/${customSlug}`
    : `${window.location.origin}/p/...`;

  const handleCopyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await publishDocument(docId, title, content, {
      slug: customSlug,
      password: enablePassword ? password : '',
    });

    setIsSubmitting(false);

    if (res.success) {
      setPublishedRecord({
        id: '',
        document_id: docId,
        user_id: '',
        slug: res.slug,
        is_public: true,
        password_hash: enablePassword ? 'hash' : null,
        view_count: publishedRecord?.view_count || 0,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } else {
      setErrorMsg(res.error || 'Failed to publish document');
    }
  };

  const handleUnpublish = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    const success = await unpublishDocument(docId);
    setIsSubmitting(false);

    if (success) {
      setPublishedRecord(null);
    } else {
      setErrorMsg('Failed to unpublish document.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150 text-neutral-800 dark:text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-950 dark:text-white">
                Publish to Web
              </h2>
              <p className="text-xs text-neutral-500">
                Share a clean, fast read-only page with anyone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-neutral-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span>Checking publication status...</span>
          </div>
        ) : !hasCloud ? (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
            <CloudOff className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="space-y-1">
              <div className="font-semibold">Cloud Sync Not Configured</div>
              <p className="leading-relaxed opacity-90">
                Publishing documents to a public URL requires an active Supabase project. You can still export to HTML or PDF from the Export menu!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Status Pill */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    publishedRecord?.is_public ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'
                  }`}
                />
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {publishedRecord?.is_public ? 'Live on the Web' : 'Draft (Private)'}
                </span>
              </div>
              {publishedRecord?.is_public && (
                <span className="text-[11px] font-mono text-neutral-400">
                  {publishedRecord.view_count || 0} views
                </span>
              )}
            </div>

            {/* Public Link Preview */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block">
                Public Web Link
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 font-mono text-xs truncate">
                  {publicUrl}
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs hover:opacity-90 active:scale-95 transition-all shrink-0"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Custom Slug */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block">
                Custom URL Slug
              </label>
              <input
                type="text"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                placeholder="my-article-slug"
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Password Protection Option */}
            <div className="p-3.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    Password Protection
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enablePassword}
                  onChange={(e) => setEnablePassword(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer accent-blue-600"
                />
              </div>

              {enablePassword && (
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secret passphrase for viewers..."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        {hasCloud && (
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
            {publishedRecord?.is_public ? (
              <>
                <button
                  type="button"
                  onClick={handleUnpublish}
                  disabled={isSubmitting}
                  className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Unpublish</span>
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Page</span>
                  </a>

                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Update Live Page</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-end gap-2 w-full">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <Globe className="w-3.5 h-3.5" />
                  <span>Publish to Web</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
