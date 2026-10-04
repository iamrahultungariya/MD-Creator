import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  X, 
  Tag, 
  Clock, 
  Plus, 
  Trash2, 
  Calendar, 
  FileX, 
  ListTree, 
  BarChart2, 
  Info, 
  BookOpen, 
  HardDrive
} from 'lucide-react';
import { DocumentMetadata } from '../../db';

export interface HeadingItem {
  id: string;
  level: number;
  text: string;
  lineIndex: number;
}

interface DocumentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: DocumentMetadata | null;
  content?: string;
  onUpdateTags: (tags: string[]) => void;
  wordCount: number;
  charCount: number;
  lineCount: number;
  onSelectHeading?: (heading: HeadingItem) => void;
  onDeleteDocument?: () => void;
  onClearContent?: () => void;
  initialTab?: 'outline' | 'stats' | 'info';
}

export const DocumentDrawer: React.FC<DocumentDrawerProps> = ({
  isOpen,
  onClose,
  metadata,
  content = '',
  onUpdateTags,
  wordCount,
  charCount,
  lineCount,
  onSelectHeading,
  onDeleteDocument,
  onClearContent,
  initialTab = 'outline',
}) => {
  const [activeTab, setActiveTab] = useState<'outline' | 'stats' | 'info'>(initialTab);
  const [newTag, setNewTag] = useState('');

  // Sync activeTab when initialTab changes
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const tags = metadata?.tags || [];
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const speakingTimeMinutes = Math.max(1, Math.ceil(wordCount / 130));

  // Parse all headings from markdown for Outline Tab
  const headings = useMemo(() => {
    const list: HeadingItem[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim().replace(/[*_`~]/g, '');
        list.push({
          id: `heading-${index}-${level}`,
          level,
          text,
          lineIndex: index,
        });
      }
    });

    return list;
  }, [content]);

  // Readability Score (Flesch Reading Ease approximation)
  const readabilityScore = useMemo(() => {
    if (wordCount < 10) return { score: 100, label: 'Very Easy' };
    const sentences = Math.max(1, content.split(/[.!?]+/).filter(Boolean).length);
    const avgWordsPerSentence = wordCount / sentences;
    // Approximated score
    const score = Math.max(0, Math.min(100, Math.round(206.835 - 1.015 * avgWordsPerSentence - 30)));
    let label = 'Standard';
    if (score >= 80) label = 'Very Easy';
    else if (score >= 60) label = 'Standard';
    else if (score >= 40) label = 'Technical';
    else label = 'Academic';
    return { score, label };
  }, [wordCount, content]);

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onUpdateTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateTags(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="absolute inset-y-0 right-0 max-w-sm w-full bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col z-10 select-none font-sans"
          >
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-50/50 dark:bg-neutral-950/40">
              <div>
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                  Document Sidebar
                </h3>
                <p className="text-[11px] text-neutral-500 truncate max-w-[220px]">
                  {metadata?.title || 'untitled.md'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3 Tabs Strip */}
            <div className="flex items-center px-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 gap-1 py-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('outline')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'outline'
                    ? 'bg-brand-600 text-white shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <ListTree className="w-3.5 h-3.5" />
                <span>Outline</span>
                {headings.length > 0 && (
                  <span className={`text-[10px] font-mono px-1 rounded-md ${
                    activeTab === 'outline' ? 'bg-brand-700 text-brand-100' : 'bg-neutral-200 dark:bg-neutral-800'
                  }`}>
                    {headings.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('stats')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'stats'
                    ? 'bg-brand-600 text-white shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Stats</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'info'
                    ? 'bg-brand-600 text-white shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>Info</span>
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* TAB 1: OUTLINE */}
              {activeTab === 'outline' && (
                <div className="space-y-2">
                  {headings.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
                        <BookOpen className="w-5 h-5 text-neutral-400" />
                      </div>
                      <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
                        No Headings Found
                      </p>
                      <p className="text-[11px] text-neutral-500 leading-relaxed max-w-xs">
                        Add # Heading 1 or ## Heading 2 in your document to automatically generate a table of contents outline.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {headings.map((h) => {
                        const indentPx = (h.level - 1) * 12;
                        return (
                          <button
                            key={h.id}
                            type="button"
                            onClick={() => {
                              onSelectHeading?.(h);
                              onClose();
                            }}
                            className="w-full text-left p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/80 flex items-center justify-between group transition-colors cursor-pointer"
                            style={{ paddingLeft: `${Math.max(8, 8 + indentPx)}px` }}
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <span className="text-[10px] font-mono text-neutral-400 group-hover:text-brand-500 shrink-0">
                                H{h.level}
                              </span>
                              <span className="text-xs text-neutral-700 dark:text-neutral-200 font-medium truncate group-hover:text-brand-600 dark:group-hover:text-brand-400">
                                {h.text}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              L{h.lineIndex + 1}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: STATS & READABILITY */}
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  {/* Grid of Telemetry */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-center">
                      <span className="text-lg font-black text-neutral-900 dark:text-white block">{wordCount}</span>
                      <span className="text-[10px] text-neutral-500 uppercase font-semibold">Words</span>
                    </div>
                    <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-center">
                      <span className="text-lg font-black text-neutral-900 dark:text-white block">{charCount}</span>
                      <span className="text-[10px] text-neutral-500 uppercase font-semibold">Chars</span>
                    </div>
                    <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-center">
                      <span className="text-lg font-black text-neutral-900 dark:text-white block">{lineCount}</span>
                      <span className="text-[10px] text-neutral-500 uppercase font-semibold">Lines</span>
                    </div>
                  </div>

                  {/* Reading / Speaking Time & Readability */}
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-brand-500" />
                        <span className="text-neutral-600 dark:text-neutral-300 font-medium">Silent Reading Time</span>
                      </div>
                      <span className="font-bold text-neutral-900 dark:text-white">~{readingTimeMinutes} min</span>
                    </div>

                    <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-500" />
                        <span className="text-neutral-600 dark:text-neutral-300 font-medium">Speaking / Speech Time</span>
                      </div>
                      <span className="font-bold text-neutral-900 dark:text-white">~{speakingTimeMinutes} min</span>
                    </div>

                    <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-neutral-600 dark:text-neutral-300 font-medium">Readability Grade</span>
                      </div>
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {readabilityScore.label} ({readabilityScore.score}/100)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: INFO & TAGS */}
              {activeTab === 'info' && (
                <div className="space-y-6">
                  {/* Document Tags */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Document Tags</span>
                      </h4>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                        >
                          <span>#{t}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(t)}
                            className="hover:text-red-500 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <form onSubmit={handleAddTag} className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add tag (e.g. notes, blog)..."
                        className="flex-1 px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-hidden focus:border-brand-500 text-neutral-900 dark:text-neutral-100"
                      />
                      <button
                        type="submit"
                        disabled={!newTag.trim()}
                        className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold disabled:opacity-40 cursor-pointer transition-colors shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </section>

                  {/* Metadata Timestamps */}
                  <section className="space-y-2 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Created</span>
                      </span>
                      <span className="font-mono text-neutral-700 dark:text-neutral-300">
                        {metadata?.createdAt ? new Date(metadata.createdAt).toLocaleDateString() : 'Today'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Last Updated</span>
                      </span>
                      <span className="font-mono text-neutral-700 dark:text-neutral-300">
                        {metadata?.updatedAt ? new Date(metadata.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>File Size</span>
                      </span>
                      <span className="font-mono text-neutral-700 dark:text-neutral-300">
                        ~{Math.max(1, Math.round(content.length / 1024))} KB
                      </span>
                    </div>
                  </section>

                  {/* Danger Zone Actions */}
                  <section className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                    {onClearContent && (
                      <button
                        type="button"
                        onClick={() => {
                          onClearContent();
                          onClose();
                        }}
                        className="w-full py-2 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileX className="w-3.5 h-3.5" />
                        <span>Clear Editor Content</span>
                      </button>
                    )}

                    {onDeleteDocument && (
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteDocument();
                          onClose();
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Document</span>
                      </button>
                    )}
                  </section>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
