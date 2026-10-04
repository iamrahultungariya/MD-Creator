import React from 'react';

interface ReaderArticleHeaderProps {
  title?: string;
  readingStats: {
    words: number;
    readingTime: string;
  };
}

export const ReaderArticleHeader: React.FC<ReaderArticleHeaderProps> = ({
  title,
  readingStats,
}) => {
  return (
    <header className="pt-5 sm:pt-10 pb-4 sm:pb-6 mb-5 sm:mb-8 border-b border-current/15 select-text font-sans">
      <div className="flex flex-wrap items-center gap-2 text-xs font-sans font-medium mb-3 sm:mb-4">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-100/90 dark:bg-neutral-800/90 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80 shadow-2xs">
          {readingStats.readingTime}
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-100/90 dark:bg-neutral-800/90 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80 shadow-2xs">
          {readingStats.words.toLocaleString()} words
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-50/80 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200/70 dark:border-brand-800/60 shadow-2xs font-semibold">
          Article Mode
        </span>
      </div>
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight break-words font-sans">
        {title ? title.replace(/\.md$/i, '') : 'Untitled Document'}
      </h1>
    </header>
  );
};
