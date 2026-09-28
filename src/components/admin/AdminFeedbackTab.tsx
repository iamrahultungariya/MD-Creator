import React, { useState, useMemo } from 'react';
import { 
  Bug, 
  Lightbulb, 
  Heart, 
  HelpCircle, 
  Search, 
  Trash2, 
  Mail, 
  Monitor, 
  DollarSign, 
  CheckCircle2, 
  ChevronDown,
  ChevronUp,
  Archive
} from 'lucide-react';
import { FeedbackItem, FeedbackStatus, FeedbackCategory, FeedbackPriority } from '../../types/admin';

interface AdminFeedbackTabProps {
  feedbacks: FeedbackItem[];
  onUpdateStatus: (id: string, newStatus: FeedbackStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const AdminFeedbackTab: React.FC<AdminFeedbackTabProps> = ({
  feedbacks,
  onUpdateStatus,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | FeedbackStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | FeedbackCategory>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | FeedbackPriority>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const newCount = feedbacks.filter((f) => f.status === 'new').length;
  const inReviewCount = feedbacks.filter((f) => f.status === 'in_review').length;
  const resolvedCount = feedbacks.filter((f) => f.status === 'resolved').length;
  const archivedCount = feedbacks.filter((f) => f.status === 'archived').length;

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((fb) => {
      const matchesStatus = statusFilter === 'all' || fb.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || fb.category === categoryFilter;
      const matchesPriority = priorityFilter === 'all' || fb.priority === priorityFilter;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        fb.subject.toLowerCase().includes(query) ||
        fb.message.toLowerCase().includes(query) ||
        (fb.user_email && fb.user_email.toLowerCase().includes(query)) ||
        (fb.user_name && fb.user_name.toLowerCase().includes(query));

      return matchesStatus && matchesCategory && matchesPriority && matchesSearch;
    });
  }, [feedbacks, statusFilter, categoryFilter, priorityFilter, searchQuery]);

  const handleStatusChange = async (id: string, newStatus: FeedbackStatus) => {
    try {
      setProcessingId(id);
      await onUpdateStatus(id, newStatus);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setProcessingId(id);
      await onDelete(id);
    } finally {
      setProcessingId(null);
    }
  };

  const getCategoryConfig = (cat: FeedbackCategory) => {
    switch (cat) {
      case 'bug':
        return {
          icon: Bug,
          label: 'Bug Report',
          badge: 'bg-red-500/10 text-red-400 border-red-500/30'
        };
      case 'feature':
        return {
          icon: Lightbulb,
          label: 'Feature Request',
          badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
        };
      case 'praise':
        return {
          icon: Heart,
          label: 'Praise',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        };
      case 'question':
      default:
        return {
          icon: HelpCircle,
          label: 'Question',
          badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
        };
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'terrible': return '😡';
      case 'bad': return '😕';
      case 'okay': return '😐';
      case 'good': return '😊';
      case 'amazing': return '🤩';
      default: return '💬';
    }
  };

  const getPriorityBadge = (priority: FeedbackPriority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500 text-white font-bold animate-pulse';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border border-orange-500/40';
      case 'normal':
        return 'bg-neutral-800 text-neutral-300 border border-neutral-700';
      case 'low':
      default:
        return 'bg-neutral-900 text-neutral-400 border border-neutral-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-3xl bg-neutral-900 border border-neutral-800">
        
        {/* Left: Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search feedback by subject, email, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-amber-500/80 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Right: Category and Priority Selectors */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-3 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-hidden focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="bug">🐛 Bug Reports</option>
            <option value="feature">💡 Feature Ideas</option>
            <option value="praise">💖 Praise &amp; Love</option>
            <option value="question">❓ Questions &amp; Help</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="px-3 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-hidden focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="critical">🚨 Critical</option>
            <option value="high">⚠️ High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors shrink-0 ${
            statusFilter === 'all'
              ? 'bg-white text-neutral-950 shadow-xs'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          All Feedback ({feedbacks.length})
        </button>

        <button
          onClick={() => setStatusFilter('new')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 ${
            statusFilter === 'new'
              ? 'bg-rose-500 text-white font-bold shadow-xs'
              : 'bg-neutral-900 text-rose-400 hover:text-rose-300 border border-neutral-800'
          }`}
        >
          <span>New / Unread ({newCount})</span>
          {newCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping inline-block" />
          )}
        </button>

        <button
          onClick={() => setStatusFilter('in_review')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors shrink-0 ${
            statusFilter === 'in_review'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          In Review ({inReviewCount})
        </button>

        <button
          onClick={() => setStatusFilter('resolved')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors shrink-0 ${
            statusFilter === 'resolved'
              ? 'bg-emerald-500 text-neutral-950 font-bold shadow-xs'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          Resolved ({resolvedCount})
        </button>

        <button
          onClick={() => setStatusFilter('archived')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors shrink-0 ${
            statusFilter === 'archived'
              ? 'bg-neutral-700 text-white font-bold shadow-xs'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          Archived ({archivedCount})
        </button>
      </div>

      {/* Feedback Feed */}
      {filteredFeedbacks.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-neutral-900 border border-neutral-800 text-neutral-400">
          <Bug className="w-10 h-10 mx-auto text-neutral-600 mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No feedback entries found</h3>
          <p className="text-xs text-neutral-500">
            {statusFilter === 'new'
              ? 'All incoming bug reports and inquiries have been reviewed!'
              : 'No items match your active filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFeedbacks.map((fb) => {
            const catConfig = getCategoryConfig(fb.category);
            const CatIcon = catConfig.icon;
            const isExpanded = expandedId === fb.id;
            const isBusy = processingId === fb.id;

            return (
              <div
                key={fb.id}
                className={`p-5 rounded-3xl border transition-all ${
                  fb.status === 'new'
                    ? 'bg-neutral-900/90 border-rose-500/40 shadow-lg shadow-rose-500/5'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${catConfig.badge}`}>
                      <CatIcon className="w-3 h-3" />
                      <span>{catConfig.label}</span>
                    </span>

                    {/* Priority */}
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getPriorityBadge(fb.priority)}`}>
                      {fb.priority}
                    </span>

                    {/* Sentiment */}
                    <span className="text-base" title={`Sentiment: ${fb.sentiment}`}>
                      {getSentimentIcon(fb.sentiment)}
                    </span>

                    <span className="text-xs text-neutral-500">•</span>
                    <span className="text-xs text-neutral-400">
                      {new Date(fb.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-neutral-500">Status:</span>
                    <select
                      value={fb.status}
                      disabled={isBusy}
                      onChange={(e) => handleStatusChange(fb.id, e.target.value as FeedbackStatus)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-xl border cursor-pointer focus:outline-hidden ${
                        fb.status === 'new'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : fb.status === 'in_review'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : fb.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}
                    >
                      <option value="new">🔴 New</option>
                      <option value="in_review">🟡 In Review</option>
                      <option value="resolved">🟢 Resolved</option>
                      <option value="archived">⚪ Archived</option>
                    </select>
                  </div>
                </div>

                {/* Subject & Submitter */}
                <div className="mb-2">
                  <h3 className="text-base font-bold text-white mb-1">
                    {fb.subject}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                    <span>
                      From: <strong className="text-neutral-200">{fb.user_name || 'Anonymous User'}</strong>
                    </span>
                    {fb.user_email && (
                      <a
                        href={`mailto:${fb.user_email}?subject=Regarding your MD Writer feedback: ${encodeURIComponent(fb.subject)}`}
                        className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>{fb.user_email}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Message Body */}
                <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/70 p-3.5 rounded-2xl border border-neutral-800/80 mb-3 whitespace-pre-wrap">
                  {fb.message}
                </p>

                {/* Expandable Diagnostics & Monetization Telemetry */}
                {(fb.system_info || fb.willingness_to_pay || fb.paid_feature_request) && (
                  <div className="mb-3">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : fb.id)}
                      className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      <span>{isExpanded ? 'Hide Diagnostics & Survey' : 'View Client Device & Survey Info'}</span>
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs space-y-2 animate-in fade-in duration-100">
                        {fb.system_info && (
                          <div className="space-y-1">
                            <div className="font-semibold text-neutral-300 flex items-center gap-1.5 text-[11px]">
                              <Monitor className="w-3.5 h-3.5 text-blue-400" />
                              <span>Client Telemetry</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] text-neutral-400 font-mono bg-neutral-900/60 p-2 rounded-xl">
                              <div>OS / Platform: {fb.system_info.platform || 'Unknown'}</div>
                              <div>Resolution: {fb.system_info.screenResolution || 'Unknown'}</div>
                              <div>App Version: {fb.system_info.appVersion || 'Unknown'}</div>
                              <div>Language: {fb.system_info.language || 'Unknown'}</div>
                              <div className="col-span-full truncate">Browser: {fb.system_info.userAgent}</div>
                            </div>
                          </div>
                        )}

                        {(fb.willingness_to_pay || fb.paid_feature_request) && (
                          <div className="pt-2 border-t border-neutral-800 space-y-1">
                            <div className="font-semibold text-neutral-300 flex items-center gap-1.5 text-[11px]">
                              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Monetization &amp; Feature Survey</span>
                            </div>
                            {fb.willingness_to_pay && (
                              <div className="text-[11px] text-neutral-400">
                                Willingness to Pay: <strong className="text-emerald-400">{fb.willingness_to_pay}</strong>
                              </div>
                            )}
                            {fb.paid_feature_request && (
                              <div className="text-[11px] text-neutral-400">
                                Paid Feature Desired: <span className="text-neutral-200">{fb.paid_feature_request}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Row Actions */}
                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    {fb.status !== 'resolved' && (
                      <button
                        onClick={() => handleStatusChange(fb.id, 'resolved')}
                        disabled={isBusy}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-neutral-950 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer border border-emerald-500/30 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    )}
                    {fb.status !== 'archived' && fb.status === 'resolved' && (
                      <button
                        onClick={() => handleStatusChange(fb.id, 'archived')}
                        disabled={isBusy}
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-neutral-700 disabled:opacity-50"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>Archive</span>
                      </button>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(fb.id)}
                    disabled={isBusy}
                    className="p-1.5 rounded-xl bg-neutral-800 hover:bg-rose-950/80 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer border border-neutral-700/60 disabled:opacity-50"
                    title="Delete feedback entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
