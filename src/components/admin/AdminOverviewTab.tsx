import React, { useMemo } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { AdminStats, Article, UserReview, AdminTab } from '../../types/admin';
import { AdminStatsCards } from './AdminStatsCards';

interface AdminOverviewTabProps {
  stats: AdminStats;
  articles: Article[];
  reviews: UserReview[];
  onNavigateTab: (tab: AdminTab) => void;
  onOpenCreateBlog: () => void;
  onApproveBlog: (id: string) => void;
  onApproveReview: (id: string) => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  stats,
  articles,
  reviews,
  onNavigateTab,
  onOpenCreateBlog,
  onApproveBlog,
  onApproveReview,
}) => {
  const pendingArticles = useMemo(
    () => articles.filter((a) => a.status === 'pending').slice(0, 3),
    [articles]
  );
  const pendingReviews = useMemo(
    () => reviews.filter((r) => r.status === 'pending').slice(0, 3),
    [reviews]
  );

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-lg font-bold text-neutral-100 tracking-tight mb-0.5">
          Admin &amp; Moderation Overview
        </h2>
        <p className="text-xs text-neutral-400">
          Live user activity metrics and pending editorial queues across MD Writer.
        </p>
      </div>

      {/* Active User Telemetry Dock (Mimo Minimalist Style) */}
      <div 
        onClick={() => onNavigateTab('analytics')}
        className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div>
            <span className="font-medium text-neutral-200 tracking-tight group-hover:text-white transition-colors">
              Live User Activity &amp; Telemetry
            </span>
            <span className="text-neutral-600 mx-2 hidden sm:inline">•</span>
            <span className="text-neutral-400 text-[11px] hidden sm:inline">
              Anonymous cohorts, active writers (DAU), writing duration, and format exports.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 group-hover:text-neutral-200 shrink-0">
          <span>Open Telemetry</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      <AdminStatsCards
        stats={stats}
        onNavigateTab={onNavigateTab}
        onOpenCreateBlog={onOpenCreateBlog}
      />

      {/* Quick Activity Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
        
        {/* Pending Articles Quick List */}
        <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-neutral-200 tracking-tight">
              Pending Blog Submissions ({stats.pendingBlogs})
            </h3>
            <button
              onClick={() => onNavigateTab('blogs')}
              className="text-[11px] font-mono text-neutral-400 hover:text-neutral-200 cursor-pointer"
            >
              View all →
            </button>
          </div>

          {pendingArticles.length === 0 ? (
            <div className="py-6 text-center space-y-1.5 rounded-lg bg-neutral-950/60 border border-neutral-800/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
              <p className="text-xs font-medium text-neutral-300">All Clear: No Pending Submissions</p>
              <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                Articles submitted by community writers will appear here for editorial review.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingArticles.map((article) => (
                <div
                  key={article.id}
                  className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/70 hover:border-neutral-700/80 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {article.category}
                      </span>
                      <span className="text-[11px] text-neutral-500 font-mono">
                        {article.author.name}
                      </span>
                    </div>
                    <div className="font-medium text-neutral-200 truncate">
                      {article.title}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onApproveBlog(article.id)}
                      className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-emerald-950/80 text-neutral-200 hover:text-emerald-300 text-[11px] font-medium border border-neutral-700/70 transition-colors cursor-pointer"
                    >
                      Publish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Reviews Quick List */}
        <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-neutral-200 tracking-tight">
              Pending Reviews ({stats.pendingReviews})
            </h3>
            <button
              onClick={() => onNavigateTab('reviews')}
              className="text-[11px] font-mono text-neutral-400 hover:text-neutral-200 cursor-pointer"
            >
              View all →
            </button>
          </div>

          {pendingReviews.length === 0 ? (
            <div className="py-6 text-center space-y-1.5 rounded-lg bg-neutral-950/60 border border-neutral-800/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
              <p className="text-xs font-medium text-neutral-300">All Clear: No Pending Reviews</p>
              <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                All submitted community reviews have been reviewed and published.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/70 hover:border-neutral-700/80 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                      <span className="font-semibold text-neutral-200">{rev.name}</span>
                      <span className="text-neutral-500">•</span>
                      <span className="text-amber-400 font-mono text-[11px]">{'★'.repeat(rev.rating)}</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 line-clamp-1">
                      {rev.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onApproveReview(rev.id)}
                      className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-emerald-950/80 text-neutral-200 hover:text-emerald-300 text-[11px] font-medium border border-neutral-700/70 transition-colors cursor-pointer"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
