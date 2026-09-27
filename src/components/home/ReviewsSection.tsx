import React, { useState, useEffect } from 'react';
import { Star, MessageSquarePlus, CheckCircle, Send, Sparkles, Pencil, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

import { ReviewSubmissionModal } from './ReviewSubmissionModal';
import {
  UserReview,
  getStoredReviews,
  saveStoredReviews,
  getUserSubmittedReview,
  saveUserSubmittedReview,
} from '../../services/reviewsStorage';

export type { UserReview };
export {
  REVIEWS_STORAGE_KEY,
  USER_REVIEW_KEY,
  getStoredReviews,
  saveStoredReviews,
  getUserSubmittedReview,
  saveUserSubmittedReview,
} from '../../services/reviewsStorage';

export const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<UserReview[]>(() => getStoredReviews());
  const [myReview, setMyReview] = useState<UserReview | null>(() => getUserSubmittedReview());
  const [isEditingInline, setIsEditingInline] = useState(false);

  // Modal State for subsequent reviews
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Inline Form State
  const [inlineName, setInlineName] = useState('');
  const [inlineRole, setInlineRole] = useState('');
  const [inlineRating, setInlineRating] = useState(5);
  const [inlineHoverRating, setInlineHoverRating] = useState<number | null>(null);
  const [inlineReviewText, setInlineReviewText] = useState('');
  const [inlineSubmitting, setInlineSubmitting] = useState(false);
  const [inlineSuccess, setInlineSuccess] = useState(false);

  // Sync reviews to storage
  useEffect(() => {
    saveStoredReviews(reviews);
  }, [reviews]);

  // When myReview exists, populate the editing inputs
  useEffect(() => {
    if (myReview) {
      setInlineName(myReview.name);
      setInlineRole(myReview.role);
      setInlineRating(myReview.rating);
      setInlineReviewText(myReview.content);

      setAuthorName(myReview.name);
      setAuthorRole(myReview.role);
      setRating(myReview.rating);
      setReviewText(myReview.content);
    }
  }, [myReview]);

  // Approved reviews for the community feed
  const approvedReviews = reviews.filter((r) => r.status === 'approved');
  const displayedReviews = approvedReviews.slice(0, 5);

  const averageRating = approvedReviews.length > 0
    ? (approvedReviews.reduce((acc, r) => acc + r.rating, 0) / approvedReviews.length).toFixed(1)
    : '5.0';

  // Handle Review Submission / Update (Single review per user)
  const submitReviewItem = async (
    name: string,
    role: string,
    starRating: number,
    text: string
  ): Promise<UserReview> => {
    const reviewId = myReview?.id || `rev_${Date.now()}`;
    const initialSubmittedAt = myReview?.submittedAt || new Date().toISOString();
    const updatedReview: UserReview = {
      id: reviewId,
      name: name.trim(),
      role: role.trim() || 'Verified Writer',
      rating: starRating,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      content: text.trim(),
      verified: true,
      status: 'approved',
      submittedAt: initialSubmittedAt,
    };

    // Replace existing if editing, or prepend if new
    const updatedList = [
      updatedReview,
      ...reviews.filter((r) => r.id !== reviewId),
    ];
    setReviews(updatedList);
    saveStoredReviews(updatedList);

    setMyReview(updatedReview);
    saveUserSubmittedReview(updatedReview);
    setIsEditingInline(false);

    // Sync to Supabase
    try {
      if (supabase) {
        await supabase.from('community_reviews').upsert([
          {
            id: updatedReview.id,
            name: updatedReview.name,
            role: updatedReview.role,
            rating: updatedReview.rating,
            content: updatedReview.content,
            verified: true,
            status: 'approved',
          },
        ]);
      }
    } catch {
      // Local fallback
    }

    return updatedReview;
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !reviewText.trim()) return;

    setIsSubmitting(true);
    await submitReviewItem(authorName, authorRole, rating, reviewText);
    setIsSubmitting(false);
    setSubmitSuccess(true);

    setTimeout(() => {
      setSubmitSuccess(false);
      setIsModalOpen(false);
    }, 1500);
  };

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineName.trim() || !inlineReviewText.trim()) return;

    setInlineSubmitting(true);
    await submitReviewItem(inlineName, inlineRole, inlineRating, inlineReviewText);
    setInlineSubmitting(false);
    setInlineSuccess(true);

    setTimeout(() => {
      setInlineSuccess(false);
    }, 2000);
  };

  const openModalForReview = () => {
    if (myReview) {
      setAuthorName(myReview.name);
      setAuthorRole(myReview.role);
      setRating(myReview.rating);
      setReviewText(myReview.content);
    }
    setIsModalOpen(true);
  };

  // 45-Minute Review Edit Window Limitation
  const reviewSubmittedTimestamp = myReview?.submittedAt
    ? new Date(myReview.submittedAt).getTime()
    : myReview?.date
    ? new Date(myReview.date).getTime()
    : Date.now();
  const elapsedMinutes = (Date.now() - reviewSubmittedTimestamp) / (60 * 1000);
  const isEditLocked = Boolean(myReview && elapsedMinutes > 45);
  const remainingMinutes = Math.max(0, Math.ceil(45 - elapsedMinutes));

  return (
    <section className="py-20 sm:py-24 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-black/20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-semibold mb-3 border border-neutral-200 dark:border-neutral-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Community Feedback &amp; Reviews</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-white tracking-tight">
              Feedback from writers &amp; creators.
            </h2>
            {approvedReviews.length > 0 ? (
              <div className="flex items-center gap-3 mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(Number(averageRating))
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-neutral-300 dark:text-neutral-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-neutral-900 dark:text-white">{averageRating} / 5.0</span>
                <span>•</span>
                <span>Top {displayedReviews.length} Community Reviews</span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200/60 dark:border-blue-900/60">
                  Beta 0.9.1
                </span>
                <span>Early Community Feedback • Share your experience with our team</span>
              </div>
            )}
          </div>

          {/* Action button in header when reviews exist */}
          {approvedReviews.length > 0 && (
            <div>
              {myReview ? (
                isEditLocked ? (
                  <div className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs font-medium flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-700">
                    <Lock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Review Locked</span>
                  </div>
                ) : (
                  <button
                    onClick={openModalForReview}
                    className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 font-bold text-xs transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit Your Review ({remainingMinutes}m left)</span>
                  </button>
                )
              ) : (
                <button
                  onClick={openModalForReview}
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 font-bold text-xs transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>Write a Review</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Display */}
        {approvedReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedReviews.map((rev, idx) => {
              const isMine = myReview?.id === rev.id;
              return (
                <div
                  key={rev.id}
                  className={`p-6 rounded-2xl bg-white dark:bg-neutral-900 border shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                    isMine
                      ? 'border-neutral-900 dark:border-white ring-1 ring-neutral-900 dark:ring-white'
                      : 'border-neutral-200/90 dark:border-neutral-800'
                  } ${idx === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}
                >
                  <div>
                    {/* Star Rating & Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-neutral-300 dark:text-neutral-700'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        {isMine && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold">
                            Your Review
                          </span>
                        )}
                        {rev.verified && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Review Quote */}
                    <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal">
                      &ldquo;{rev.content}&rdquo;
                    </p>
                  </div>

                  {/* Author Info */}
                  <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-neutral-900 dark:text-white">
                        {rev.name}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {rev.role}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {rev.date}
                      </span>
                      {isMine && !isEditLocked && (
                        <button
                          onClick={openModalForReview}
                          className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                          title={`Edit your review (${remainingMinutes}m remaining)`}
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* When approvedReviews === 0: Either show User's submitted review or the interactive form */
          <div className="max-w-2xl mx-auto rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 sm:p-10 shadow-xl shadow-neutral-950/5">
            {myReview && !isEditingInline ? (
              /* Already Submitted: Display user review card with Edit button */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Your Beta Feedback</span>
                  </div>
                  {isEditLocked ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs font-medium border border-neutral-200 dark:border-neutral-700">
                      <Lock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Review Locked (45m window closed)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        Editable for {remainingMinutes}m
                      </span>
                      <button
                        onClick={() => setIsEditingInline(true)}
                        className="px-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit Review</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < myReview.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-neutral-300 dark:text-neutral-700'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-xs font-bold text-neutral-600 dark:text-neutral-300">
                      {myReview.rating}.0 / 5.0
                    </span>
                  </div>

                  <p className="text-sm sm:text-base text-neutral-800 dark:text-neutral-200 leading-relaxed font-normal italic">
                    &ldquo;{myReview.content}&rdquo;
                  </p>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                    <div>
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {myReview.name}
                      </span>
                      <span className="mx-1.5">•</span>
                      <span>{myReview.role}</span>
                    </div>
                    <span className="font-mono text-[10px] text-neutral-400">
                      {myReview.date}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Review Form */
              <form onSubmit={handleInlineSubmit} className="space-y-5">
                {/* Beta Badge & Headline */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Beta 0.9.1 • Community Feedback</span>
                  </div>
                  <h3 className="text-2xl font-black text-neutral-950 dark:text-white tracking-tight">
                    {myReview ? 'Edit Your Review' : 'Help Shape MD Writer'}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                    Tell us how MD Writer fits your workflow. Your feedback directly shapes our development during Beta.
                  </p>
                </div>

                {/* Rating Select */}
                <div className="flex flex-col items-center justify-center pt-2">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setInlineRating(star)}
                        onMouseEnter={() => setInlineHoverRating(star)}
                        onMouseLeave={() => setInlineHoverRating(null)}
                        className="p-1 cursor-pointer transition-transform hover:scale-125"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            (inlineHoverRating !== null ? star <= inlineHoverRating : star <= inlineRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-neutral-300 dark:text-neutral-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 mt-1">
                    {inlineRating} out of 5 stars
                  </span>
                </div>

                {/* Name & Role Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={inlineName}
                      onChange={(e) => setInlineName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      Your Role or Occupation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Staff Technical Writer, ML Engineer"
                      value={inlineRole}
                      onChange={(e) => setInlineRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
                    />
                  </div>
                </div>

                {/* Review Text Area */}
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                    Your Review &amp; Experience *
                  </label>
                  <textarea
                    rows={4}
                    required
                    minLength={10}
                    placeholder="What do you enjoy most about using MD Writer? What features would you like to see next?"
                    value={inlineReviewText}
                    onChange={(e) => setInlineReviewText(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white resize-y"
                  />
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1">
                    <span>Minimum 10 characters</span>
                    {inlineSuccess && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        ✓ Saved successfully
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {myReview && isEditingInline && (
                    <button
                      type="button"
                      onClick={() => setIsEditingInline(false)}
                      className="px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={inlineSubmitting}
                    className="flex-1 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 text-xs sm:text-sm font-bold transition-all shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {inlineSubmitting
                        ? 'Saving...'
                        : myReview
                        ? 'Update Review'
                        : 'Submit Review'}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>

      {/* Review Submission / Editing Modal */}
      <ReviewSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        isSubmitting={isSubmitting}
        submitSuccess={submitSuccess}
        isEditing={!!myReview}
        authorName={authorName}
        setAuthorName={setAuthorName}
        authorRole={authorRole}
        setAuthorRole={setAuthorRole}
        rating={rating}
        setRating={setRating}
        reviewText={reviewText}
        setReviewText={setReviewText}
      />
    </section>
  );
};
