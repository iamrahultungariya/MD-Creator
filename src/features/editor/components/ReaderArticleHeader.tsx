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
    <header className="pt-8 sm:pt-14 pb-6 mb-8 border-b border-current/15 select-text">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs opacity-60 font-medium mb-3">
        <span>{readingStats.readingTime}</span>
        <span>•</span>
        <span>{readingStats.words.toLocaleString()} words</span>
        <span>•</span>
        <span>Markdown Article</span>
      </div>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
        {title ? title.replace(/\.md$/i, '') : 'Untitled Document'}
      </h1>
    </header>
  );
};
