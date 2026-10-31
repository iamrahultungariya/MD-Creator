import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface DocumentPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const DocumentPagination: React.FC<DocumentPaginationProps> = React.memo(({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [6, 12, 24],
  className = '',
}) => {
  // If no items exist, omit pagination completely
  if (totalCount === 0 || totalPages <= 1 && totalCount <= pageSizeOptions[0]) {
    return null;
  }

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  // Generate pagination page items with smart ellipsis
  const pageItems = useMemo<(number | 'ellipsis')[]>(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const items: (number | 'ellipsis')[] = [];

    // Always include page 1
    items.push(1);

    if (currentPage <= 4) {
      // Near start: 1 2 3 4 5 ... N
      for (let i = 2; i <= 5; i++) {
        items.push(i);
      }
      items.push('ellipsis');
      items.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      // Near end: 1 ... N-4 N-3 N-2 N-1 N
      items.push('ellipsis');
      for (let i = totalPages - 4; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // In middle: 1 ... P-1 P P+1 ... N
      items.push('ellipsis');
      items.push(currentPage - 1);
      items.push(currentPage);
      items.push(currentPage + 1);
      items.push('ellipsis');
      items.push(totalPages);
    }

    return items;
  }, [currentPage, totalPages]);

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <nav
      aria-label="Documents pagination"
      className={`mt-8 pt-5 border-t border-neutral-200/80 dark:border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs ${className}`}
    >
      {/* Records Count & Range */}
      <div className="text-neutral-500 dark:text-neutral-400 font-medium">
        Showing <span className="font-semibold text-neutral-900 dark:text-white">{startRecord}</span>
        –<span className="font-semibold text-neutral-900 dark:text-white">{endRecord}</span> of{' '}
        <span className="font-semibold text-neutral-900 dark:text-white">{totalCount}</span> documents
      </div>

      {/* Center: Numeric Page Navigation */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className="p-1.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {pageItems.map((item, idx) => {
            if (item === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-7 h-7 flex items-center justify-center text-neutral-400 dark:text-neutral-500 select-none text-xs"
                >
                  •••
                </span>
              );
            }

            const isActive = item === currentPage;
            return (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-xs font-bold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className="p-1.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Page Size Selector */}
      <div className="flex items-center gap-2">
        <span className="text-neutral-400 dark:text-neutral-500 text-[11px]">Per page:</span>
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-0.5 rounded-lg border border-neutral-200/60 dark:border-neutral-800/80">
          {pageSizeOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onPageSizeChange(opt)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                pageSize === opt
                  ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-2xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
});

DocumentPagination.displayName = 'DocumentPagination';
