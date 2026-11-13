import React, { useState, useMemo } from 'react';
import { Navbar } from '../components/home/Navbar';
import { Footer } from '../components/home/Footer';
import { CHANGELOG_RELEASES, ChangelogItem } from '../data/changelogData';
import { APP_VERSION_LABEL } from '../config/version';

type FilterType = 'all' | 'added' | 'performance' | 'changed';

export const ChangelogPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items within releases
  const filteredReleases = useMemo(() => {
    return CHANGELOG_RELEASES.map((release) => {
      const query = searchQuery.trim().toLowerCase();

      // Check if release itself matches query
      const matchesReleaseHeader =
        release.title.toLowerCase().includes(query) ||
        release.summary.toLowerCase().includes(query) ||
        release.version.includes(query);

      const items = release.items.filter((item) => {
        // Filter by category
        if (selectedFilter !== 'all') {
          if (selectedFilter === 'features' as any) {
            if (item.type !== 'added') return false;
          } else if (item.type !== selectedFilter) {
            return false;
          }
        }

        // Filter by text query
        if (!query) return true;
        return (
          matchesReleaseHeader ||
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          (item.badge && item.badge.toLowerCase().includes(query))
        );
      });

      return {
        ...release,
        items,
        hasMatches: items.length > 0 || (matchesReleaseHeader && selectedFilter === 'all'),
      };
    }).filter((r) => r.hasMatches);
  }, [selectedFilter, searchQuery]);

  const scrollToRelease = (version: string) => {
    const el = document.getElementById(`release-${version}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getItemTypeBadge = (type: ChangelogItem['type']) => {
    switch (type) {
      case 'added':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
            New
          </span>
        );
      case 'performance':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80">
            Speed
          </span>
        );
      case 'changed':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80">
            Improved
          </span>
        );
      case 'removed':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80">
            Simplified
          </span>
        );
      case 'fixed':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80">
            Fixed
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans selection:bg-brand-500/20">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
        {/* Page Header */}
        <header className="space-y-4 border-b border-neutral-200/80 dark:border-neutral-800 pb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            <span>Explore</span>
            <span>/</span>
            <span className="text-neutral-700 dark:text-neutral-300 font-semibold">Changelog</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
              Release Notes &amp; Updates
            </h1>

            <div className="inline-flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300">
                Current: <strong className="font-semibold text-neutral-900 dark:text-white">{APP_VERSION_LABEL}</strong>
              </span>
            </div>
          </div>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
            A chronological record of new writing features, speed improvements, and workspace enhancements across MD Writer.
          </p>

          {/* Quick Version Anchor Jump Links */}
          <div className="pt-2 flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-mono text-neutral-400 mr-1">Jump to:</span>
            {CHANGELOG_RELEASES.map((r) => (
              <button
                key={r.version}
                type="button"
                onClick={() => scrollToRelease(r.version)}
                className="px-2.5 py-1 rounded-md text-xs font-mono text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors cursor-pointer active:translate-y-[1px]"
              >
                {r.versionLabel}
              </button>
            ))}
          </div>
        </header>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-xl p-2 shadow-2xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {(
              [
                { id: 'all', label: 'All Updates' },
                { id: 'added', label: 'New Features' },
                { id: 'performance', label: 'Speed & Polish' },
                { id: 'changed', label: 'Improvements' },
              ] as const
            ).map((tab) => {
              const isSelected = selectedFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-2xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search release notes..."
              className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/80 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Releases Timeline */}
        <div className="space-y-12">
          {filteredReleases.length === 0 ? (
            <div className="py-16 text-center space-y-2 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                No matching release items found
              </p>
              <p className="text-xs text-neutral-400">
                Try searching for a different term or resetting the category filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedFilter('all');
                  setSearchQuery('');
                }}
                className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredReleases.map((release) => (
              <article
                key={release.version}
                id={`release-${release.version}`}
                className="scroll-mt-24 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-6 sm:p-8 space-y-6 shadow-2xs transition-colors duration-150"
              >
                {/* Release Header */}
                <header className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80 text-neutral-900 dark:text-neutral-100">
                        {release.versionLabel}
                      </span>
                      {release.tag === 'Latest' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                          Latest Release
                        </span>
                      )}
                      {release.tag === 'Major' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-950">
                          Major Release
                        </span>
                      )}
                    </div>

                    <time
                      dateTime={release.date}
                      className="text-xs font-mono text-neutral-500 dark:text-neutral-400"
                    >
                      {release.date}
                    </time>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
                    {release.title}
                  </h2>

                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {release.summary}
                  </p>
                </header>

                {/* Key Metrics Strip (If provided) */}
                {release.metrics && release.metrics.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 pb-1">
                    {release.metrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-800 space-y-0.5"
                      >
                        <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-medium truncate">
                          {metric.label}
                        </div>
                        <div className="text-xs sm:text-sm font-mono font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {metric.value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Grouped Change Items */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-semibold px-1">
                    Changes in this release ({release.items.length})
                  </div>

                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80 border-t border-neutral-100 dark:border-neutral-800/80">
                    {release.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="py-3.5 first:pt-3 last:pb-1 flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-4"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getItemTypeBadge(item.type)}
                            <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                              {item.title}
                            </h3>
                          </div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed pt-0.5">
                            {item.description}
                          </p>
                        </div>

                        {item.badge && (
                          <span className="self-start sm:self-center shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/70 dark:border-neutral-700/70">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
