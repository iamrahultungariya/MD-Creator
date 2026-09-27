import React, { useState } from 'react';
import { Star, CheckCircle, X } from 'lucide-react';

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  submitSuccess: boolean;
  isEditing: boolean;
  authorName: string;
  setAuthorName: (val: string) => void;
  authorRole: string;
  setAuthorRole: (val: string) => void;
  rating: number;
  setRating: (val: number) => void;
  reviewText: string;
  setReviewText: (val: string) => void;
}

export const ReviewSubmissionModal: React.FC<ReviewSubmissionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  submitSuccess,
  isEditing,
  authorName,
  setAuthorName,
  authorRole,
  setAuthorRole,
  rating,
  setRating,
  reviewText,
  setReviewText,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-neutral-900 dark:text-neutral-100 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {submitSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-neutral-950 dark:text-white">
              {isEditing ? 'Review Updated!' : 'Thank You for Your Review!'}
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
              Your feedback has been saved and updated on the community showcase.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <h3 className="text-lg font-black text-neutral-950 dark:text-white tracking-tight">
                {isEditing ? 'Edit Your Review' : 'Write a Review'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Share your experience with the MD Writer community.
              </p>
            </div>

            {/* Star Rating Select */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        (hoverRating !== null ? star <= hoverRating : star <= rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-neutral-300 dark:text-neutral-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
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
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                  Your Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Technical Writer"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                Your Review *
              </label>
              <textarea
                rows={4}
                required
                minLength={10}
                placeholder="Tell us what you love about MD Writer..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white resize-y"
              />
              <span className="text-[10px] text-neutral-400 block mt-1">Minimum 10 characters</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 text-xs font-bold transition-all shadow cursor-pointer disabled:opacity-50"
            >
              {isSubmitting
                ? 'Saving...'
                : isEditing
                ? 'Update Review'
                : 'Submit Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
