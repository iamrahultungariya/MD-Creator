import React from 'react';
import { BookOpen, MessageSquare, Activity, ArrowRight } from 'lucide-react';
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
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-black text-white tracking-tight mb-1">
          Moderation &amp; Telemetry Command Center
        </h2>
        <p className="text-xs text-neutral-400">
          Live user activity metrics and pending editorial queues across MD Writer.
        </p>
      </div>

      {/* Active User Telemetry Banner */}
      <div 
        onClick={() => onNavigateTab('analytics')}
        className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-neutral-900 to-neutral-900 border border-emerald-500/30 hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                Live User Activity &amp; Feature Adoption Telemetry
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                New
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Track daily visitors, active writers (DAU), average writing duration, and most clicked features.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 shrink-0">
          <span>Open Telemetry Dashboard</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      <AdminStatsCards
        stats={stats}
        onNavigateTab={onNavigateTab}
        onOpenCreateBlog={onOpenCreateBlog}
      />

      {/* Quick Activity Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* Pending Articles Quick List */}
        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Pending Blog Submissions</h3>
            </div>
            <button
              onClick={() => onNavigateTab('blogs')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
            >
              View All ({stats.pendingBlogs}) →
            </button>
          </div>

          {articles.filter((a) => a.status === 'pending').slice(0, 3).length === 0 ? (
            <p className="text-xs text-neutral-500 py-4 text-center">
              ✨ No blog submissions waiting for review.
            </p>
          ) : (
            <div className="space-y-2.5">
              {articles
                .filter((a) => a.status === 'pending')
                .slice(0, 3)
                .map((art) => (
                  <div
                    key={art.id}
                    className="p-3.5 rounded-2xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{art.title}</h4>
                      <p className="text-[11px] text-neutral-400">
                        By {art.author.name} • {art.category}
                      </p>
                    </div>
                    <button
                      onClick={() => onApproveBlog(art.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold cursor-pointer shrink-0"
                    >
                      Approve
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Pending Reviews Quick List */}
        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-bold text-white">Pending User Reviews</h3>
            </div>
            <button
              onClick={() => onNavigateTab('reviews')}
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold cursor-pointer"
            >
              View All ({stats.pendingReviews}) →
            </button>
          </div>

          {reviews.filter((r) => r.status === 'pending').slice(0, 3).length === 0 ? (
            <p className="text-xs text-neutral-500 py-4 text-center">
              ✨ No pending reviews waiting for moderation.
            </p>
          ) : (
            <div className="space-y-2.5">
              {reviews
                .filter((r) => r.status === 'pending')
                .slice(0, 3)
                .map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-2xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">
                        {rev.name} ({rev.rating}★)
                      </h4>
                      <p className="text-[11px] text-neutral-400 line-clamp-1 italic">
                        "{rev.content}"
                      </p>
                    </div>
                    <button
                      onClick={() => onApproveReview(rev.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold cursor-pointer shrink-0"
                    >
                      Approve
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
