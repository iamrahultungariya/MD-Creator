import React from 'react';
import { 
  BookOpen, 
  MessageSquare, 
  Bug, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { AdminStats, AdminTab } from '../../types/admin';

interface AdminStatsCardsProps {
  stats: AdminStats;
  onNavigateTab: (tab: AdminTab) => void;
  onOpenCreateBlog?: () => void;
}

export const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({
  stats,
  onNavigateTab,
  onOpenCreateBlog,
}) => {
  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Pending Blogs */}
        <div 
          onClick={() => onNavigateTab('blogs')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden ${
            stats.pendingBlogs > 0
              ? 'bg-gradient-to-br from-amber-500/10 via-neutral-900 to-neutral-900 border-amber-500/40 hover:border-amber-500/70 shadow-lg shadow-amber-500/5'
              : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            {stats.pendingBlogs > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-black animate-pulse">
                Action Required
              </span>
            ) : (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All Clear
              </span>
            )}
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight mb-1">
            {stats.pendingBlogs}
          </div>
          <div className="text-xs font-semibold text-neutral-300">
            Pending Blog Articles
          </div>
          <p className="text-[11px] text-neutral-400 mt-1 flex items-center justify-between">
            <span>Awaiting live publishing</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </p>
        </div>

        {/* Card 2: Pending Reviews */}
        <div 
          onClick={() => onNavigateTab('reviews')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden ${
            stats.pendingReviews > 0
              ? 'bg-gradient-to-br from-blue-500/10 via-neutral-900 to-neutral-900 border-blue-500/40 hover:border-blue-500/70 shadow-lg shadow-blue-500/5'
              : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            {stats.pendingReviews > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-black">
                {stats.pendingReviews} New
              </span>
            ) : (
              <span className="text-xs text-neutral-500">Moderated</span>
            )}
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight mb-1">
            {stats.pendingReviews}
          </div>
          <div className="text-xs font-semibold text-neutral-300">
            Pending Reviews
          </div>
          <p className="text-[11px] text-neutral-400 mt-1 flex items-center justify-between">
            <span>Awaiting homepage feature</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </p>
        </div>

        {/* Card 3: Feedback & Bugs */}
        <div 
          onClick={() => onNavigateTab('feedback')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden ${
            stats.newFeedback > 0
              ? 'bg-gradient-to-br from-rose-500/10 via-neutral-900 to-neutral-900 border-rose-500/40 hover:border-rose-500/70 shadow-lg shadow-rose-500/5'
              : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Bug className="w-5 h-5" />
            </div>
            {stats.criticalFeedback > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white flex items-center gap-1 animate-pulse">
                <AlertTriangle className="w-3 h-3" /> {stats.criticalFeedback} Critical
              </span>
            ) : stats.newFeedback > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {stats.newFeedback} Unread
              </span>
            ) : (
              <span className="text-xs text-neutral-500">Clean</span>
            )}
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight mb-1">
            {stats.totalFeedback}
          </div>
          <div className="text-xs font-semibold text-neutral-300">
            User Feedback &amp; Bugs
          </div>
          <p className="text-[11px] text-neutral-400 mt-1 flex items-center justify-between">
            <span>{stats.newFeedback} needing attention</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
          </p>
        </div>

        {/* Card 4: Total Live Content */}
        <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Active Live
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight mb-1">
            {stats.publishedBlogs + stats.approvedReviews}
          </div>
          <div className="text-xs font-semibold text-neutral-300">
            Live Website Items
          </div>
          <p className="text-[11px] text-neutral-400 mt-1 flex items-center justify-between">
            <span>{stats.publishedBlogs} blogs • {stats.approvedReviews} reviews</span>
          </p>
        </div>

      </div>

      {/* Quick Moderation Banner if items pending */}
      {(stats.pendingBlogs > 0 || stats.pendingReviews > 0) && (
        <div className="p-4 rounded-2xl bg-neutral-900/90 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-300">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Community writers have submitted <strong>{stats.pendingBlogs} blog article(s)</strong> and <strong>{stats.pendingReviews} review(s)</strong> waiting for your approval.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {stats.pendingBlogs > 0 && (
              <button
                onClick={() => onNavigateTab('blogs')}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>Approve Blogs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {stats.pendingReviews > 0 && (
              <button
                onClick={() => onNavigateTab('reviews')}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer border border-neutral-700"
              >
                <span>Moderate Reviews</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {onOpenCreateBlog && (
              <button
                onClick={onOpenCreateBlog}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer border border-neutral-700"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>New Blog</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
