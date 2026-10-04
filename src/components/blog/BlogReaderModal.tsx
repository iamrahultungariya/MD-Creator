import React from 'react';
import { X } from 'lucide-react';
import { Article } from '../../data/blogArticles';

interface BlogReaderModalProps {
  article: Article | null;
  onClose: () => void;
  MarkdownPreview: React.ComponentType<{ content: string }>;
}

export const BlogReaderModal: React.FC<BlogReaderModalProps> = ({
  article,
  onClose,
  MarkdownPreview,
}) => {
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
      </div>
    </div>
  );
};
