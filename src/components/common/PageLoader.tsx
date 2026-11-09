import React from 'react';

export type PageLoaderVariant = 'editor' | 'documents' | 'home' | 'admin' | 'auth' | 'feedback' | 'default';

interface PageLoaderProps {
  variant?: PageLoaderVariant;
}

/**
 * Editorial document view skeleton (Editor, PublicDocumentPage)
 */
export const DocumentSkeleton: React.FC = () => (
  <div 
    className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans transition-colors"
    role="status"
    aria-label="Loading document..."
  >
    {/* Top Header Skeleton */}
    <header className="h-14 sm:h-15 border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 sm:px-6 flex items-center justify-between bg-white dark:bg-neutral-900">
      <div className="flex items-center gap-3">
        <div className="w-16 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 hidden sm:block" />
        <div className="w-40 h-5 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse hidden sm:block" />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-24 h-8 rounded-lg bg-neutral-200/70 dark:bg-neutral-800/70 animate-pulse" />
        <div className="w-16 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
      </div>
    </header>

    {/* Reading Canvas Skeleton */}
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-6">
      {/* Document Tag / Meta */}
      <div className="flex items-center gap-2">
        <div className="w-16 h-5 rounded-md bg-neutral-200/80 dark:bg-neutral-800/80 animate-pulse" />
        <div className="w-24 h-4 rounded bg-neutral-200/60 dark:bg-neutral-800/60 animate-pulse" />
      </div>

      {/* Document Title Heading */}
      <div className="space-y-2">
        <div className="w-4/5 h-9 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        <div className="w-1/2 h-5 rounded-md bg-neutral-200/70 dark:bg-neutral-800/70 animate-pulse" />
      </div>

      <div className="h-px w-full bg-neutral-200/60 dark:bg-neutral-800/60" />

      {/* Body Paragraphs */}
      <div className="space-y-3.5 pt-2">
        <div className="w-full h-4 rounded bg-neutral-200/80 dark:bg-neutral-800/80 animate-pulse" />
        <div className="w-[96%] h-4 rounded bg-neutral-200/80 dark:bg-neutral-800/80 animate-pulse" />
        <div className="w-[92%] h-4 rounded bg-neutral-200/70 dark:bg-neutral-800/70 animate-pulse" />
        <div className="w-[85%] h-4 rounded bg-neutral-200/60 dark:bg-neutral-800/60 animate-pulse" />
      </div>

      <div className="space-y-3.5 pt-4">
        <div className="w-[98%] h-4 rounded bg-neutral-200/80 dark:bg-neutral-800/80 animate-pulse" />
        <div className="w-[90%] h-4 rounded bg-neutral-200/70 dark:bg-neutral-800/70 animate-pulse" />
        <div className="w-[75%] h-4 rounded bg-neutral-200/60 dark:bg-neutral-800/60 animate-pulse" />
      </div>
    </main>
  </div>
);

/**
 * Grid & List content skeleton used inside DocumentsPage when querying Dexie
 */
export const DocumentsContentSkeleton: React.FC<{ viewMode?: 'grid' | 'list' }> = ({ viewMode = 'grid' }) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800 font-sans">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse shrink-0" />
              <div className="space-y-1.5 flex-1 max-w-xs">
                <div className="w-3/4 h-3.5 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                <div className="w-1/2 h-2.5 rounded bg-neutral-200/60 dark:bg-neutral-800/60 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-16 h-5 rounded-md bg-neutral-200/60 dark:bg-neutral-800/60 animate-pulse hidden sm:block" />
              <div className="w-20 h-3 rounded bg-neutral-200/60 dark:bg-neutral-800/60 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div 
          key={i} 
          className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between h-48 select-none"
        >
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="w-3/4 h-3.5 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                  <div className="w-1/3 h-2.5 rounded bg-neutral-200/60 dark:bg-neutral-800/60 animate-pulse" />
                </div>
              </div>
            </div>
            <div className="space-y-2 pt-1">
              <div className="w-full h-2.5 rounded bg-neutral-200/70 dark:bg-neutral-800/70 animate-pulse" />
              <div className="w-4/5 h-2.5 rounded bg-neutral-200/50 dark:bg-neutral-800/50 animate-pulse" />
            </div>
          </div>
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div className="w-16 h-4 rounded bg-neutral-200/60 dark:bg-neutral-800/60 animate-pulse" />
            <div className="w-20 h-4 rounded bg-neutral-200/60 dark:bg-neutral-800/60 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Full page skeleton for /documents route suspense
 */
export const DocumentsPageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans transition-colors">
    {/* Navbar Skeleton */}
    <header className="h-14 sm:h-16 border-b border-neutral-200/80 dark:border-neutral-800 px-4 sm:px-8 flex items-center justify-between bg-white dark:bg-neutral-900">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        <div className="w-24 h-4 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-neutral-200/70 dark:bg-neutral-800/70 animate-pulse" />
        <div className="w-28 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
      </div>
    </header>

    {/* Library Content */}
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      {/* Title & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="w-40 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          <div className="w-64 h-3.5 rounded bg-neutral-200/60 dark:bg-neutral-800/60 animate-pulse" />
        </div>
        <div className="w-32 h-9 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse shrink-0" />
      </div>

      {/* Toolbar Skeleton (Search & Tabs) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
        <div className="w-full sm:w-72 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="w-16 h-7 rounded-md bg-neutral-200/60 dark:bg-neutral-800/60 animate-pulse" />
          <div className="w-16 h-7 rounded-md bg-neutral-200/60 dark:bg-neutral-800/60 animate-pulse" />
          <div className="w-16 h-7 rounded-md bg-neutral-200/60 dark:bg-neutral-800/60 animate-pulse" />
        </div>
      </div>

      {/* Document Grid */}
      <DocumentsContentSkeleton viewMode="grid" />
    </main>
  </div>
);

/**
 * Full page skeleton for / route suspense
 */
export const HomePageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans">
    {/* Navbar Skeleton */}
    <header className="h-16 border-b border-neutral-200/80 dark:border-neutral-800/80 px-6 sm:px-12 flex items-center justify-between bg-white dark:bg-neutral-900">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        <div className="w-24 h-4 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-20 h-8 rounded-lg bg-neutral-200/70 dark:bg-neutral-800/70 animate-pulse" />
        <div className="w-24 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
      </div>
    </header>

    {/* Hero Section Skeleton */}
    <main className="max-w-5xl mx-auto px-6 py-20 text-center space-y-6">
      <div className="w-48 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse mx-auto" />
      <div className="w-3/4 max-w-xl h-12 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse mx-auto" />
      <div className="w-1/2 max-w-md h-5 rounded bg-neutral-200/70 dark:bg-neutral-800/70 animate-pulse mx-auto" />
      <div className="flex justify-center gap-3 pt-4">
        <div className="w-32 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        <div className="w-32 h-10 rounded-lg bg-neutral-200/70 dark:bg-neutral-800/70 animate-pulse" />
      </div>

      {/* Editor Live Preview Skeleton Box */}
      <div className="mt-12 h-80 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl overflow-hidden p-6 space-y-4 text-left">
        <div className="flex items-center gap-2 pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="w-3 h-3 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          <div className="w-32 h-3.5 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-6 pt-2">
          <div className="space-y-2.5">
            <div className="w-3/4 h-3.5 rounded bg-neutral-200/80 dark:bg-neutral-800/80 animate-pulse" />
            <div className="w-full h-3 rounded bg-neutral-200/60 dark:bg-neutral-800/60 animate-pulse" />
            <div className="w-5/6 h-3 rounded bg-neutral-200/60 dark:bg-neutral-800/60 animate-pulse" />
          </div>
          <div className="space-y-2.5 border-l border-neutral-100 dark:border-neutral-800 pl-6">
            <div className="w-2/3 h-4 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            <div className="w-full h-3 rounded bg-neutral-200/70 dark:bg-neutral-800/70 animate-pulse" />
            <div className="w-4/5 h-3 rounded bg-neutral-200/50 dark:bg-neutral-800/50 animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  </div>
);

/**
 * Admin Content Skeleton used inside AdminPage
 */
export const AdminContentSkeleton: React.FC = () => (
  <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    {/* 4 KPI Stat Cards Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-neutral-800 animate-pulse" />
            <div className="w-16 h-4 rounded-full bg-neutral-800 animate-pulse" />
          </div>
          <div className="w-16 h-8 rounded bg-neutral-800 animate-pulse" />
          <div className="w-28 h-3 rounded bg-neutral-800/70 animate-pulse" />
          <div className="w-36 h-2.5 rounded bg-neutral-800/50 animate-pulse" />
        </div>
      ))}
    </div>

    {/* Content Table Skeleton */}
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div className="w-36 h-5 rounded bg-neutral-800 animate-pulse" />
        <div className="w-24 h-7 rounded-lg bg-neutral-800 animate-pulse" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-lg bg-neutral-950/40 border border-neutral-800/80 flex items-center justify-between gap-4">
            <div className="space-y-2 flex-1 max-w-md">
              <div className="w-3/4 h-4 rounded bg-neutral-800 animate-pulse" />
              <div className="w-1/2 h-3 rounded bg-neutral-800/60 animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-7 rounded-lg bg-neutral-800 animate-pulse" />
              <div className="w-16 h-7 rounded-lg bg-neutral-800 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </main>
);

/**
 * Full page skeleton for /admin route suspense
 */
export const AdminPageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans flex flex-col">
    {/* Admin Top Header Skeleton */}
    <header className="h-16 border-b border-neutral-800 px-6 sm:px-8 flex items-center justify-between bg-neutral-900">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-neutral-800 animate-pulse" />
        <div className="w-32 h-4 rounded bg-neutral-800 animate-pulse" />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-20 h-7 rounded-lg bg-neutral-800 animate-pulse" />
        <div className="w-20 h-7 rounded-lg bg-neutral-800 animate-pulse" />
      </div>
    </header>
    <AdminContentSkeleton />
  </div>
);

/**
 * Full page skeleton for /auth route suspense
 */
export const AuthPageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4 font-sans">
    <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
      {/* Left Branding Side */}
      <div className="p-8 bg-neutral-100 dark:bg-neutral-800/60 flex flex-col justify-between space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-neutral-300 dark:bg-neutral-700 animate-pulse" />
          <div className="w-28 h-4 rounded bg-neutral-300 dark:bg-neutral-700 animate-pulse" />
        </div>
        <div className="space-y-3">
          <div className="w-3/4 h-6 rounded bg-neutral-300 dark:bg-neutral-700 animate-pulse" />
          <div className="w-full h-3.5 rounded bg-neutral-300/70 dark:bg-neutral-700/70 animate-pulse" />
        </div>
        <div className="w-48 h-3 rounded bg-neutral-300/60 dark:bg-neutral-700/60 animate-pulse" />
      </div>
      {/* Right Form Side */}
      <div className="p-8 space-y-5">
        <div className="w-32 h-5 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        <div className="space-y-3.5 pt-2">
          <div className="w-full h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          <div className="w-full h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          <div className="w-full h-10 rounded-lg bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Full page skeleton for /feedback route suspense
 */
export const FeedbackPageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans">
    <header className="h-16 border-b border-neutral-200/80 dark:border-neutral-800 px-6 sm:px-12 flex items-center justify-between bg-white dark:bg-neutral-900">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        <div className="w-24 h-4 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
      </div>
    </header>
    <main className="max-w-2xl mx-auto px-6 py-12 space-y-6">
      <div className="space-y-2 text-center">
        <div className="w-48 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse mx-auto" />
        <div className="w-72 h-4 rounded bg-neutral-200/60 dark:bg-neutral-800/60 animate-pulse mx-auto" />
      </div>
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
        <div className="h-28 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        <div className="w-full h-10 rounded-lg bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
      </div>
    </main>
  </div>
);

/**
 * Timeline checkpoints list skeleton for RevisionHistoryModal
 */
export const CheckpointsListSkeleton: React.FC = () => (
  <div className="space-y-2 p-1" role="status" aria-label="Loading checkpoints...">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="p-3 rounded-xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-800/50 space-y-2">
        <div className="flex items-center justify-between">
          <div className="w-24 h-3 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
          <div className="w-12 h-3 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
        </div>
        <div className="w-32 h-2.5 rounded bg-neutral-200/60 dark:bg-neutral-700/60 animate-pulse" />
      </div>
    ))}
  </div>
);

/**
 * Universal PageLoader router switch
 */
export const PageLoader: React.FC<PageLoaderProps> = ({ variant = 'editor' }) => {
  switch (variant) {
    case 'documents':
      return <DocumentsPageSkeleton />;
    case 'home':
      return <HomePageSkeleton />;
    case 'admin':
      return <AdminPageSkeleton />;
    case 'auth':
      return <AuthPageSkeleton />;
    case 'feedback':
      return <FeedbackPageSkeleton />;
    case 'editor':
    case 'default':
    default:
      return <DocumentSkeleton />;
  }
};
