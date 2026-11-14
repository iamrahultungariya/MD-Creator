import React, { useState } from 'react';
import { X, Check, RotateCcw, ExternalLink } from 'lucide-react';
import { Article } from '../../data/blogArticles';

interface BlogReaderModalProps {
  article: Article | null;
  onClose: () => void;
  MarkdownPreview: React.ComponentType<{ content: string }>;
  onApprove?: (articleId: string) => Promise<void>;
  onReject?: (articleId: string) => Promise<void>;
  onUnpublish?: (articleId: string) => Promise<void>;
}

export const BlogReaderModal: React.FC<BlogReaderModalProps> = ({
  article,
  onClose,
  MarkdownPreview,
  onApprove,
  onReject,
  onUnpublish,
}) => {
  const [isActionPending, setIsActionPending] = useState(false);

  if (!article) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/80 backdrop-blur-xs animate-in fade-in duration-150 font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/90 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:px-8 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-50/50 dark:bg-neutral-950/40">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-md bg-brand-500/10 border border-brand-500/20">
              {article.category}
            </span>
            <span className="text-xs text-neutral-400">•</span>
            <span className="text-xs text-neutral-400">{article.readTime}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white mb-4 leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center gap-3 pb-6 border-b border-neutral-100 dark:border-neutral-800">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-neutral-200 dark:ring-neutral-700"
              />
              <div>
                <div className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                  {article.author.name}
                </div>
                <div className="text-[11px] text-neutral-500">
                  {article.author.role} • {article.date}
                </div>
              </div>
            </div>
          </div>

          {/* Rendered Markdown Body */}
          <div className="prose prose-neutral dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed">
            <React.Suspense fallback={<div className="py-10 text-center text-xs text-neutral-400">Rendering article...</div>}>
              <MarkdownPreview content={article.content} />
            </React.Suspense>
          </div>
        </div>

        {/* Modal Footer Editorial Action Toolbar */}
        <div className="p-4 sm:px-8 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-neutral-50/70 dark:bg-neutral-950/70 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 font-mono">
              Status: <strong className="text-neutral-800 dark:text-neutral-200 capitalize">{article.status || 'draft'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {article.status !== 'published' && onApprove && (
              <button
                type="button"
                disabled={isActionPending}
                onClick={async () => {
                  setIsActionPending(true);
                  try {
                    await onApprove(article.id);
                    onClose();
                  } finally {
                    setIsActionPending(false);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isActionPending ? 'Publishing...' : 'Approve & Publish Live'}</span>
              </button>
            )}

            {article.status === 'pending' && onReject && (
              <button
                type="button"
                disabled={isActionPending}
                onClick={async () => {
                  setIsActionPending(true);
                  try {
                    await onReject(article.id);
                    onClose();
                  } finally {
                    setIsActionPending(false);
                  }
                }}
                className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-rose-950/70 text-rose-300 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-700/60 disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            )}

            {article.status === 'published' && (
              <>
                {onUnpublish && (
                  <button
                    type="button"
                    disabled={isActionPending}
                    onClick={async () => {
                      setIsActionPending(true);
                      try {
                        await onUnpublish(article.id);
                        onClose();
                      } finally {
                        setIsActionPending(false);
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-amber-300 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-700/60 disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Unpublish</span>
                  </button>
                )}
                <a
                  href={`/blog/${article.slug || article.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-medium text-xs flex items-center gap-1.5 transition-colors border border-neutral-700/60"
                >
                  <span>View Public Page</span>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                </a>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
