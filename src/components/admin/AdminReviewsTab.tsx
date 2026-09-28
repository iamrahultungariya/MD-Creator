import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, 
  Search, 
  Check, 
  X, 
  Trash2, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  Clock,
  RotateCcw
} from 'lucide-react';
import { UserReview } from '../../services/reviewsStorage';

interface AdminReviewsTabProps {
  reviews: UserReview[];
  onApprove: (reviewId: string) => Promise<void>;
  onReject: (reviewId: string) => Promise<void>;
  onDelete: (reviewId: string) => Promise<void>;
  onToggleVerified?: (reviewId: string, currentVerified: boolean) => Promise<void>;
}

export const AdminReviewsTab: React.FC<AdminReviewsTabProps> = ({
  reviews,
  onApprove,
  onReject,
  onDelete,
  onToggleVerified,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;
  const rejectedCount = reviews.filter((r) => r.status === 'rejected').length;

  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      const matchesStatus = statusFilter === 'all' || rev.status === statusFilter;
      const matchesRating = ratingFilter === 'all' || rev.rating === ratingFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        rev.name.toLowerCase().includes(query) ||
        rev.role.toLowerCase().includes(query) ||
        rev.content.toLowerCase().includes(query);

      return matchesStatus && matchesRating && matchesSearch;
    });
  }, [reviews, statusFilter, ratingFilter, searchQuery]);

  const handleAction = async (action: () => Promise<void>, id: string) => {
    try {
      setProcessingId(id);
      await action();
    } finally {
      setProcessingId(null);
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
            placeholder="Search reviews by name, role, or text..."
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

        {/* Right: Star Rating Selector */}
        <div className="flex items-center gap-2">
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-hidden focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Star Ratings</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
            <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
            <option value="3">⭐⭐⭐ (3 Stars)</option>
            <option value="2">⭐⭐ (2 Stars)</option>
            <option value="1">⭐ (1 Star)</option>
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
          All Reviews ({reviews.length})
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 ${
            statusFilter === 'pending'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
              : 'bg-neutral-900 text-amber-400 hover:text-amber-300 border border-neutral-800'
          }`}
        >
          <span>Pending Review ({pendingCount})</span>
          {pendingCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
          )}
        </button>

        <button
          onClick={() => setStatusFilter('approved')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors shrink-0 ${
            statusFilter === 'approved'
              ? 'bg-emerald-500 text-neutral-950 font-bold shadow-xs'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          Approved Live ({approvedCount})
        </button>

        <button
          onClick={() => setStatusFilter('rejected')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors shrink-0 ${
            statusFilter === 'rejected'
              ? 'bg-rose-500 text-white font-bold shadow-xs'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          Rejected ({rejectedCount})
        </button>
      </div>

      {/* Reviews Feed */}
      {filteredReviews.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-neutral-900 border border-neutral-800 text-neutral-400">
          <MessageSquare className="w-10 h-10 mx-auto text-neutral-600 mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No reviews found</h3>
          <p className="text-xs text-neutral-500">
            {statusFilter === 'pending'
              ? 'No pending reviews waiting for moderation.'
              : 'No reviews match your current filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((rev) => {
            const isBusy = processingId === rev.id;
            const isPending = rev.status === 'pending';
            const isApproved = rev.status === 'approved';
            const isRejected = rev.status === 'rejected';

            return (
              <div
                key={rev.id}
                className={`p-5 rounded-3xl border flex flex-col justify-between transition-all ${
                  isPending
                    ? 'bg-neutral-900/90 border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div>
                  {/* Top Row: User Avatar & Status */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-neutral-800 border border-neutral-700 text-neutral-200 flex items-center justify-center font-bold text-sm uppercase">
                        {rev.name.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-white truncate max-w-[150px]">
                            {rev.name}
                          </h4>
                          {rev.verified && (
                            <span title="Verified Writer">
                              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-400">{rev.role}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isPending && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                      {isApproved && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Live
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rating Stars & Date */}
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-neutral-700'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-[11px] font-bold text-neutral-400">
                        {rev.rating}.0
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-500">{rev.date}</span>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs text-neutral-300 leading-relaxed mb-4 italic">
                    "{rev.content}"
                  </p>
                </div>

                {/* Bottom Actions Row */}
                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Approve button */}
                    {!isApproved && (
                      <button
                        onClick={() => handleAction(() => onApprove(rev.id), rev.id)}
                        disabled={isBusy}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                        title="Approve review to show on homepage"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isBusy ? 'Saving...' : 'Approve'}</span>
                      </button>
                    )}

                    {/* Reject button */}
                    {isPending && (
                      <button
                        onClick={() => handleAction(() => onReject(rev.id), rev.id)}
                        disabled={isBusy}
                        className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-rose-950/60 text-neutral-300 hover:text-rose-300 font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer border border-neutral-700/60 disabled:opacity-50"
                        title="Reject review"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}

                    {/* Revert to Pending */}
                    {isApproved && (
                      <button
                        onClick={() => handleAction(() => onReject(rev.id), rev.id)}
                        disabled={isBusy}
                        className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-amber-300 font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer border border-neutral-700/60 disabled:opacity-50"
                        title="Unpublish review from homepage"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Unpublish</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Toggle Verified Writer */}
                    {onToggleVerified && (
                      <button
                        onClick={() => onToggleVerified(rev.id, Boolean(rev.verified))}
                        className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                          rev.verified
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white border-neutral-700/60'
                        }`}
                        title={rev.verified ? 'Verified Writer (Click to unverify)' : 'Mark as Verified Writer'}
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => handleAction(() => onDelete(rev.id), rev.id)}
                      disabled={isBusy}
                      className="p-1.5 rounded-xl bg-neutral-800 hover:bg-rose-950/80 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer border border-neutral-700/60 disabled:opacity-50"
                      title="Delete review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
