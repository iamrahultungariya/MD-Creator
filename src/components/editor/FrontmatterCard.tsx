import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sliders, Calendar, User, Tag, ChevronDown } from 'lucide-react';

interface FrontmatterCardProps {
  rawYaml: string;
}

export const FrontmatterCard: React.FC<FrontmatterCardProps> = ({ rawYaml }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Simple key-value parser for YAML front matter
  const parseYaml = (yaml: string) => {
    const lines = yaml.split('\n');
    const result: Record<string, any> = {};
    for (const line of lines) {
      const match = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
      if (match) {
        const key = match[1].trim();
        let val: any = match[2].trim();
        // Strip quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        // Array parsing like ["a", "b"]
        if (val.startsWith('[') && val.endsWith(']')) {
          val = val
            .slice(1, -1)
            .split(',')
            .map((s: string) => s.trim().replace(/^['"]|['"]$/g, ''))
            .filter(Boolean);
        }
        result[key] = val;
      }
    }
    return result;
  };

  const data = parseYaml(rawYaml);
  const keys = Object.keys(data);
  if (keys.length === 0) return null;

  return (
    <div className="mb-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/60 overflow-hidden text-xs not-prose select-none transition-colors">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-2.5 flex items-center justify-between cursor-pointer bg-neutral-100/60 dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        <div className="flex items-center gap-2 font-bold text-neutral-700 dark:text-neutral-200">
          <Sliders className="w-3.5 h-3.5 text-blue-500" />
          <span>Metadata Front Matter</span>
          {data.title && (
            <span className="font-normal text-neutral-400 dark:text-neutral-500">• {data.title}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-neutral-400">
          <span className="text-[10px] font-mono">{keys.length} fields</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="frontmatter-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-neutral-100 dark:divide-neutral-800">
              <div className="space-y-2">
                {data.author && (
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                    <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="text-neutral-400">Author:</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{data.author}</span>
                  </div>
                )}
                {data.date && (
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="text-neutral-400">Date:</span>
                    <span className="font-mono text-neutral-900 dark:text-white">{String(data.date)}</span>
                  </div>
                )}
                {data.draft !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">Status:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      data.draft === 'true' || data.draft === true
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                    }`}>
                      {data.draft === 'true' || data.draft === true ? 'Draft' : 'Published'}
                    </span>
                  </div>
                )}
              </div>

              <div className="sm:pl-4 space-y-2 pt-2 sm:pt-0">
                {Array.isArray(data.tags) && data.tags.length > 0 && (
                  <div>
                    <div className="text-neutral-400 mb-1 flex items-center gap-1.5">
                      <Tag className="w-3 h-3" />
                      <span>Tags:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {data.tags.map((t: string, idx: number) => (
                        <span 
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40 text-[10.5px] font-medium font-mono"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
