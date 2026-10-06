import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, LayoutGrid, List, Check } from 'lucide-react';

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
  const [tagFilterQuery, setTagFilterQuery] = useState('');
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
    if (!isMoreTagsOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (moreTagsRef.current && !moreTagsRef.current.contains(e.target as Node)) {
        setIsMoreTagsOpen(false);
        setTagFilterQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMoreTagsOpen]);

  // First 5 tags shown directly in pills
  const primaryTags = allTags.slice(0, 5);
  // Remaining overflow tags
  const overflowTags = allTags.slice(5);

  // Filtered overflow tags when user searches in the dropdown
  const filteredOverflowTags = useMemo(() => {
    if (!tagFilterQuery.trim()) return overflowTags;
    const q = tagFilterQuery.toLowerCase().trim().replace(/^#+/, '');
    return overflowTags.filter((t) => t.toLowerCase().includes(q));
  }, [overflowTags, tagFilterQuery]);

  const isOverflowTagActive = overflowTags.includes(activeTag);

  return (
    <div className="p-2.5 sm:p-3 rounded-xl bg-neutral-50/70 dark:bg-[#121217] border border-neutral-200/80 dark:border-neutral-800 mb-8 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between font-sans">
      {/* Search Bar with '/' Shortcut Hint */}
      <div className="relative w-full sm:w-80">
        <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          ref={searchInputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter notes by title or content..."
          className="w-full pl-9 pr-8 py-2 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-sans text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
        />
        {!search && (
          <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-sans font-semibold text-neutral-400 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
            /
          </kbd>
        )}
      </div>

      {/* Tag Pills & View Switcher Row */}
      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
        {/* Tag Pills & More Button Container: Non-overflowing wrapper so popover floats freely */}
        <div className="flex items-center gap-1.5 flex-1 sm:flex-initial min-w-0">
          {/* Scrollable first 5 primary tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none min-w-0">
            {primaryTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setActiveTag(tag);
                  setIsMoreTagsOpen(false);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer font-sans ${
                  activeTag === tag
                    ? 'bg-brand-600 text-white shadow-2xs font-bold border border-brand-600'
                    : 'bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* '+N More' Dropdown Container - OUTSIDE the overflow-x-auto element to prevent clipping */}
          {allTags.length > 5 && (
            <div className="relative shrink-0" ref={moreTagsRef}>
              <button
                type="button"
                onClick={() => setIsMoreTagsOpen((prev) => !prev)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 font-sans ${
                  isOverflowTagActive
                    ? 'bg-brand-600 text-white shadow-2xs border border-brand-600'
                    : isMoreTagsOpen
                    ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white border border-transparent'
                    : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-800'
                }`}
                title="View more workspace tags"
              >
                <span>
                  {isOverflowTagActive
                    ? `#${activeTag}`
                    : `+${overflowTags.length} More`}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isMoreTagsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Overflow Tags Dropdown (clean floating popover with vertical scrolling) */}
              {isMoreTagsOpen && (
                <div className="absolute right-0 sm:right-auto sm:left-0 top-full mt-2 z-50 w-60 max-h-72 p-1.5 rounded-xl bg-white dark:bg-[#18181c] border border-neutral-200/90 dark:border-neutral-800 shadow-2xl animate-in fade-in zoom-in-95 duration-150 font-sans flex flex-col">
                  {/* Dropdown Header */}
                  <div className="px-2.5 py-1.5 text-[11px] font-bold text-neutral-500 dark:text-neutral-400 border-b border-neutral-100 dark:border-neutral-800/80 mb-1.5 flex items-center justify-between shrink-0">
                    <span>More Tags</span>
                    <span className="font-mono text-[10px] bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-500">
                      {overflowTags.length} tags
                    </span>
                  </div>

                  {/* Filter Search Input for rapid tag lookup if > 6 overflow tags */}
                  {overflowTags.length > 6 && (
                    <div className="px-1.5 pb-1.5 shrink-0">
                      <input
                        type="text"
                        value={tagFilterQuery}
                        onChange={(e) => setTagFilterQuery(e.target.value)}
                        placeholder="Search tags..."
                        autoFocus
                        className="w-full px-2.5 py-1 rounded-md text-[11px] border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  )}

                  {/* Vertically Scrollable Tag List */}
                  <div className="overflow-y-auto max-h-52 space-y-0.5 pr-0.5 scrollbar-thin">
                    {filteredOverflowTags.length > 0 ? (
                      filteredOverflowTags.map((tag) => {
                        const isSelected = activeTag === tag;
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              setActiveTag(tag);
                              setIsMoreTagsOpen(false);
                              setTagFilterQuery('');
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold'
                                : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300'
                            }`}
                          >
                            <span className="truncate">#{tag}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="py-4 text-center text-[11px] text-neutral-400 italic">
                        No tags match "{tagFilterQuery}"
                      </div>
                    )}
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
            className={`p-1 rounded-md cursor-pointer transition-colors ${
              viewMode === 'grid'
                ? 'text-neutral-950 dark:text-white bg-white dark:bg-neutral-700 shadow-2xs'
                : 'hover:text-neutral-900 dark:hover:text-white'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1 rounded-md cursor-pointer transition-colors ${
              viewMode === 'list'
                ? 'text-neutral-950 dark:text-white bg-white dark:bg-neutral-700 shadow-2xs'
                : 'hover:text-neutral-900 dark:hover:text-white'
            }`}
            title="List View"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
