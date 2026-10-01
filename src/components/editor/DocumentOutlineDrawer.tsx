import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ListTree, X, Hash, ChevronRight, BookOpen } from 'lucide-react';

export interface HeadingItem {
  id: string;
  level: number;
  text: string;
  lineIndex: number;
}

interface DocumentOutlineDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onSelectHeading: (heading: HeadingItem) => void;
}

export const DocumentOutlineDrawer: React.FC<DocumentOutlineDrawerProps> = ({
  isOpen,
  onClose,
  content,
  onSelectHeading
}) => {
  // Parse all headings from markdown
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
          lineIndex: index
        });
      }
    });

    return list;
  }, [content]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
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
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="absolute inset-y-0 left-0 max-w-sm w-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col z-10 select-none"
          >
            {/* Header */}
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-900/50 shadow-inner">
                  <ListTree className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                    Document Outline
                    <span className="text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono px-1.5 py-0.2 rounded font-bold">
                      {headings.length}
                    </span>
                  </h3>
                  <p className="text-[10px] text-neutral-400">Click to jump directly to any section</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Headings List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {headings.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
                    <BookOpen className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div className="font-bold text-xs text-neutral-700 dark:text-neutral-300 mb-1">
                    No Headings Found
                  </div>
                  <p className="text-[11px] max-w-xs text-neutral-500">
                    Use <code className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-[10px]"># Heading</code> in your document to automatically generate a navigation outline.
                  </p>
                </div>
              ) : (
                headings.map((item) => {
                  const indentPx = (item.level - 1) * 14;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectHeading(item);
                        onClose();
                      }}
                      style={{ paddingLeft: `${indentPx + 10}px` }}
                      className="w-full pr-3 py-2 rounded-xl text-left hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0 ${
                          item.level === 1 
                            ? 'bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300' 
                            : item.level === 2
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                        }`}>
                          H{item.level}
                        </span>
                        <span className={`text-xs truncate ${item.level === 1 ? 'font-bold text-neutral-900 dark:text-white' : item.level === 2 ? 'font-medium text-neutral-800 dark:text-neutral-200' : 'text-neutral-600 dark:text-neutral-400'}`}>
                          {item.text}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 text-[10px]">
                        <span>Ln {item.lineIndex + 1}</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" />
                <span>GFM Section Jump</span>
              </span>
              <span>Hierarchy H1–H6</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
