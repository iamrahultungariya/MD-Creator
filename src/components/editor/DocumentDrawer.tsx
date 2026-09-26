import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Tag, Clock, Database, Plus, Trash2, Calendar, FileX } from 'lucide-react';
import { DocumentMetadata } from '../../db';

interface DocumentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: DocumentMetadata | null;
  onUpdateTags: (tags: string[]) => void;
  wordCount: number;
  charCount: number;
  lineCount: number;
  onDeleteDocument?: () => void;
  onClearContent?: () => void;
}

export const DocumentDrawer: React.FC<DocumentDrawerProps> = ({
  isOpen,
  onClose,
  metadata,
  onUpdateTags,
  wordCount,
  charCount,
  lineCount,
  onDeleteDocument,
  onClearContent
}) => {
  const [newTag, setNewTag] = useState('');
  const tags = metadata?.tags || [];
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onUpdateTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateTags(tags.filter(t => t !== tagToRemove));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="absolute inset-y-0 right-0 max-w-sm w-full bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col z-10"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                  Document Insights
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Writing Telemetry */}
              <section className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Writing Statistics
                </h4>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-center">
                    <span className="text-lg font-black text-neutral-900 dark:text-white block">{wordCount}</span>
                    <span className="text-[10px] text-neutral-500">Words</span>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-center">
                    <span className="text-lg font-black text-neutral-900 dark:text-white block">{charCount}</span>
                    <span className="text-[10px] text-neutral-500">Chars</span>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-center">
                    <span className="text-lg font-black text-neutral-900 dark:text-white block">{lineCount}</span>
                    <span className="text-[10px] text-neutral-500">Lines</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 text-xs text-neutral-600 dark:text-neutral-400">
                  <Clock className="w-4 h-4 text-neutral-400" />
                  <span>Estimated reading time: <strong>~{readingTimeMinutes} min</strong></span>
                </div>
              </section>

              {/* Tags Section */}
              <section className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Tags</span>
                  <span className="text-[10px] font-normal lowercase">{tags.length} tags</span>
                </h4>
                
                {/* Tag Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-500 transition-colors cursor-pointer ml-0.5"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Tag Input */}
                <form onSubmit={handleAddTag} className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag (e.g. Project)..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </form>
              </section>

              {/* Timestamps */}
              {metadata && (
                <div className="pt-2 text-[11px] text-neutral-400 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    <span>Created: {new Date(metadata.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>Last saved: {new Date(metadata.updatedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              )}

              {/* Danger Zone: Clear Content / Delete Document */}
              <section className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2.5">
                <h4 className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-wider">
                  Danger Zone
                </h4>
                <div className="space-y-2">
                  {onClearContent && (
                    <button
                      type="button"
                      onClick={onClearContent}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 text-xs font-medium flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FileX className="w-3.5 h-3.5 text-amber-500" />
                        <span>Clear Document Content</span>
                      </span>
                      <span className="text-[10px] text-neutral-400">Empty editor</span>
                    </button>
                  )}

                  {onDeleteDocument && (
                    <button
                      type="button"
                      onClick={onDeleteDocument}
                      className="w-full px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-medium flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Document</span>
                      </span>
                      <span className="text-[10px] text-red-400">Permanent</span>
                    </button>
                  )}
                </div>
              </section>

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
