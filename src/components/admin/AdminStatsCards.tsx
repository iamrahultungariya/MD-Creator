import React from 'react';
import { ArrowRight } from 'lucide-react';
import { AdminStats, AdminTab } from '../../types/admin';

interface AdminStatsCardsProps {
  stats: AdminStats;
  onNavigateTab: (tab: AdminTab) => void;
  onOpenCreateBlog?: () => void;
}

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const diffSec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  const days = Math.floor(diffSec / 86400);
  return `${days}d ago`;
}

export const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({
  stats,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-4 font-sans">
      {/* KPI Cards Grid (Mimo Drawer Minimal Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Pending Blogs */}
        <div 
          onClick={() => onNavigateTab('blogs')}
          className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700 transition-colors cursor-pointer group text-left space-y-2"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-medium tracking-tight">Pending Blog Articles</span>
            {stats.pendingBlogs > 0 ? (
              <span className="flex items-center gap-1 text-[10px] font-mono text-amber-300 bg-amber-950/60 border border-amber-800/70 px-1.5 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Review</span>
              </span>
            ) : (
              <span className="text-[10px] font-mono text-neutral-500">All clear</span>
            )}
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight tabular-nums">
            {stats.pendingBlogs}
          </div>
          <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="font-mono">
              {stats.pendingBlogs > 0 && stats.oldestPendingBlogAt
                ? `Oldest: ${formatRelativeTime(stats.oldestPendingBlogAt)}`
                : 'Awaiting publish'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-200 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Card 2: Pending Reviews */}
        <div 
          onClick={() => onNavigateTab('reviews')}
          className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700 transition-colors cursor-pointer group text-left space-y-2"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-medium tracking-tight">Pending Reviews</span>
            {stats.pendingReviews > 0 ? (
              <span className="flex items-center gap-1 text-[10px] font-mono text-neutral-300 bg-neutral-800 border border-neutral-700 px-1.5 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                <span>Queue</span>
              </span>
            ) : (
              <span className="text-[10px] font-mono text-neutral-500">Moderated</span>
            )}
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight tabular-nums">
            {stats.pendingReviews}
          </div>
          <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="font-mono">
              {stats.pendingReviews > 0 && stats.oldestPendingReviewAt
                ? `Oldest: ${formatRelativeTime(stats.oldestPendingReviewAt)}`
                : 'Verified submissions'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-200 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Card 3: Feedback & Bugs */}
        <div 
          onClick={() => onNavigateTab('feedback')}
          className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700 transition-colors cursor-pointer group text-left space-y-2"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-medium tracking-tight">Feedback &amp; Inquiries</span>
            {stats.criticalFeedback > 0 ? (
              <span className="flex items-center gap-1 text-[10px] font-mono text-rose-300 bg-rose-950/60 border border-rose-800/70 px-1.5 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>{stats.criticalFeedback} Critical</span>
              </span>
            ) : stats.newFeedback > 0 ? (
              <span className="text-[10px] font-mono text-neutral-300 bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">
                {stats.newFeedback} new
              </span>
            ) : (
              <span className="text-[10px] font-mono text-neutral-500">Inbox zero</span>
            )}
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight tabular-nums">
            {stats.totalFeedback}
          </div>
          <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="font-mono">
              {stats.newFeedback} unread issues
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-200 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Card 4: Total Live Published */}
        <div 
          onClick={() => onNavigateTab('blogs')}
          className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700 transition-colors cursor-pointer group text-left space-y-2"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-medium tracking-tight">Live Published Articles</span>
            <span className="text-[10px] font-mono text-emerald-400">Active</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight tabular-nums">
            {stats.publishedBlogs}
          </div>
          <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="font-mono">
              {stats.totalBlogs} total submissions
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-200 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

      </div>
    </div>
  );
};
