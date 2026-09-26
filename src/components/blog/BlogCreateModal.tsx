import React from 'react';
import { X, PenTool } from 'lucide-react';
import { BlogCategory } from '../../data/blogArticles';

interface BlogCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formError: string;
  newTitle: string;
  setNewTitle: (val: string) => void;
  newAuthorName: string;
  setNewAuthorName: (val: string) => void;
  newAuthorRole: string;
  setNewAuthorRole: (val: string) => void;
  newCategory: BlogCategory;
  setNewCategory: (val: BlogCategory) => void;
  newExcerpt: string;
  setNewExcerpt: (val: string) => void;
  newContent: string;
  setNewContent: (val: string) => void;
}

export const BlogCreateModal: React.FC<BlogCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formError,
  newTitle,
  setNewTitle,
  newAuthorName,
  setNewAuthorName,
  newAuthorRole,
  setNewAuthorRole,
  newCategory,
  setNewCategory,
  newExcerpt,
  setNewExcerpt,
  newContent,
  setNewContent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:px-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            <h3 className="text-base font-bold text-neutral-950 dark:text-white">
              Publish a Story to MD Writer Blog
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900">
              {formError}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Article Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Building a High-Performance Markdown Pipeline"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
            />
          </div>

          {/* Author Info & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Author Name
              </label>
              <input
                type="text"
                placeholder="Your Name"
                value={newAuthorName}
                onChange={(e) => setNewAuthorName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Author Role
              </label>
              <input
                type="text"
                placeholder="e.g. Software Engineer"
                value={newAuthorRole}
                onChange={(e) => setNewAuthorRole(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as BlogCategory)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
              >
                <option value="Engineering">Engineering</option>
                <option value="Productivity">Productivity</option>
                <option value="Guides">Guides</option>
                <option value="Architecture">Architecture</option>
                <option value="Design">Design</option>
              </select>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Summary / Excerpt
            </label>
            <textarea
              rows={2}
              placeholder="A concise 1-2 sentence description of your article..."
              value={newExcerpt}
              onChange={(e) => setNewExcerpt(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all resize-none"
            />
          </div>

          {/* Markdown Content */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Markdown Content *
            </label>
            <textarea
              rows={8}
              required
              placeholder={`# Write your story in Markdown...\n\nUse headings, **bold**, lists, or \`code blocks\`.\n\nAll formatting will render seamlessly!`}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 font-mono text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer shadow-xs"
            >
              Publish Article
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
