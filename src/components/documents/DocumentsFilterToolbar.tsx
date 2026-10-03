import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, LayoutGrid, List } from 'lucide-react';

interface DocumentsFilterToolbarProps {
  search: string;
  setSearch: (value: string) => void;
  allTags: string[];
  activeTag: string;
  setActiveTag: (tag: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

export const DocumentsFilterToolbar: React.FC<DocumentsFilterToolbarProps> = ({
  search,
  setSearch,
  allTags,
  activeTag,
  setActiveTag,
  viewMode,
  setViewMode,
}) => {
  const [isMoreTagsOpen, setIsMoreTagsOpen] = useState(false);
  const moreTagsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global '/' keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close more tags popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreTagsRef.current && !moreTagsRef.current.contains(e.target as Node)) {
        setIsMoreTagsOpen(false);
      }
    };
    if (isMoreTagsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMoreTagsOpen]);

  return (
    <div className="p-2.5 sm:p-3 rounded-2xl bg-neutral-50/70 dark:bg-[#121217] border border-neutral-200/80 dark:border-neutral-800 mb-8 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
      {/* Search Bar with '/' Shortcut Hint */}
      <div className="relative w-full sm:w-80">
        <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          ref={searchInputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter notes by title or content..."
          className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-neutral-200/80 dark:border-neutral-700/80 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all"
        />
        {!search && (
          <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-400 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
            /
          </kbd>
        )}
      </div>

      {/* Tag Pills & View Switcher Row */}
      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
        {/* Tag Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-1 sm:flex-initial">
          {allTags.slice(0, 5).map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setActiveTag(tag);
                setIsMoreTagsOpen(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTag === tag
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-2xs font-bold'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {tag}
            </button>
          ))}

          {allTags.length > 5 && (
            <div className="relative shrink-0" ref={moreTagsRef}>
              <button
                type="button"
                onClick={() => setIsMoreTagsOpen((prev) => !prev)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                  allTags.slice(5).includes(activeTag)
                    ? 'bg-brand-600 text-white shadow-2xs'
                    : isMoreTagsOpen
                    ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white'
                    : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-800'
                }`}
                title="View more tags"
              >
                <span>
                  {allTags.slice(5).includes(activeTag)
                    ? `#${activeTag}`
                    : `+${allTags.length - 5} More`}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isMoreTagsOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Overflow Tags Dropdown */}
              {isMoreTagsOpen && (
                <div className="absolute right-0 sm:left-0 sm:right-auto top-full mt-1.5 z-40 w-52 max-h-60 overflow-y-auto p-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-800 mb-1">
                    More Tags ({allTags.length - 5})
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {allTags.slice(5).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setActiveTag(tag);
                          setIsMoreTagsOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                          activeTag === tag
                            ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold'
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <span className="truncate">#{tag}</span>
                        {activeTag === tag && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Grid / List Switcher */}
        <div className="flex items-center gap-0.5 bg-neutral-200/50 dark:bg-neutral-800/80 p-0.5 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60 text-neutral-400 shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1 rounded-md cursor-pointer transition-colors ${viewMode === 'grid' ? 'text-neutral-950 dark:text-white bg-white dark:bg-neutral-700 shadow-2xs' : 'hover:text-neutral-900 dark:hover:text-white'}`}
            title="Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1 rounded-md cursor-pointer transition-colors ${viewMode === 'list' ? 'text-neutral-950 dark:text-white bg-white dark:bg-neutral-700 shadow-2xs' : 'hover:text-neutral-900 dark:hover:text-white'}`}
            title="List View"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
