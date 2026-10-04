import React, { useState, useEffect } from 'react';
import { Star, MessageSquarePlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ReviewSubmissionModal } from './ReviewSubmissionModal';
import {
  UserReview,
  getUserSubmittedReview,
  saveUserSubmittedReview,
} from '../../services/reviewsStorage';

export type { UserReview };
export {
  USER_REVIEW_KEY,
  getUserSubmittedReview,
  saveUserSubmittedReview,
} from '../../services/reviewsStorage';

// Relatable Everyday Personas (Students, Teachers, Journalers, Junior Devs)
const FALLBACK_TESTIMONIALS: UserReview[] = [
  {
    id: 'test-1',
    user_id: 'user-cs',
    name: 'Liam K.',
    role: 'Computer Science Student',
    rating: 5,
    content: 'I use it for every lecture. Being able to paste tables from spreadsheets directly into markdown without touching the mouse is an absolute lifesaver.',
    date: '2026-09-15',
    verified: true,
    status: 'approved',
  },
  {
    id: 'test-2',
    user_id: 'user-philosophy',
    name: 'Elena Rostova',
    role: 'Philosophy Major & Essayist',
    rating: 5,
    content: 'The Focus Canvas feels like a deep breath of fresh air. No notifications, no bloat, just my thoughts and clean typography with local autosave.',
    date: '2026-09-18',
    verified: true,
    status: 'approved',
  },
  {
    id: 'test-3',
    user_id: 'user-dev',
    name: 'David Park',
    role: 'Junior Frontend Dev',
    rating: 5,
    content: 'Everything runs locally in IndexedDB with 0ms typing latency. In an era where every simple note tool charges $15/month, MD Writer is refreshing.',
    date: '2026-09-22',
    verified: true,
    status: 'approved',
  },
  {
    id: 'test-4',
    user_id: 'user-journal',
    name: 'Maya Lin',
    role: 'Daily Journaler & Note-taker',
    rating: 5,
    content: 'Finally, a private local editor that doesn’t upload my personal daily reflections to random AI cloud servers. Completely private on my machine.',
    date: '2026-09-25',
    verified: true,
    status: 'approved',
  },
  {
    id: 'test-5',
    user_id: 'user-edu',
    name: 'Samir Patel',
    role: 'High School Science Teacher',
    rating: 5,
    content: 'Math formulas with KaTeX render instantly, and it works seamlessly on my laptop even when the school WiFi goes down during class.',
    date: '2026-09-28',
    verified: true,
    status: 'approved',
  },
  {
    id: 'test-6',
    user_id: 'user-indie',
    name: 'Chloe Bennett',
    role: 'Indie App Creator',
    rating: 5,
    content: 'The fastest tool I have used for drafting README files, project changelogs, and technical RFCs before pushing directly to Git.',
    date: '2026-09-30',
    verified: true,
    status: 'approved',
  },
];

export const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [myReview, setMyReview] = useState<UserReview | null>(() => getUserSubmittedReview());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [authorName, setAuthorName] = useState(myReview?.name || '');
  const [authorRole, setAuthorRole] = useState(myReview?.role || '');
  const [rating, setRating] = useState(myReview?.rating || 5);
  const [reviewText, setReviewText] = useState(myReview?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch approved reviews from Supabase
  useEffect(() => {
    async function loadApprovedReviews() {
      if (!supabase) {
        setReviews(FALLBACK_TESTIMONIALS);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('community_reviews')
          .select('*')
          .eq('status', 'approved')
          .order('date', { ascending: false })
          .limit(8);

        if (!error && data && data.length > 0) {
          setReviews(data as UserReview[]);
        } else {
          setReviews(FALLBACK_TESTIMONIALS);
        }
      } catch {
        setReviews(FALLBACK_TESTIMONIALS);
      }
    }
    loadApprovedReviews();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !reviewText.trim()) return;

    setIsSubmitting(true);
    try {
      const reviewPayload: UserReview = {
        id: myReview?.id || `rev-${Date.now()}`,
        user_id: myReview?.user_id || 'anonymous',
        name: authorName.trim(),
        role: authorRole.trim() || 'Markdown Writer',
        rating,
        content: reviewText.trim(),
        date: new Date().toISOString().split('T')[0],
        verified: true,
        status: 'approved',
      };

      if (supabase) {
        await supabase.from('community_reviews').upsert(reviewPayload);
      }

      saveUserSubmittedReview(reviewPayload);
      setMyReview(reviewPayload);
      setSubmitSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedReviews = reviews.length > 0 ? reviews : FALLBACK_TESTIMONIALS;
  // Double the array for seamless infinite marquee loop
  const marqueeItems = [...displayedReviews, ...displayedReviews];

  return (
    <section className="py-20 sm:py-24 border-t border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 transition-colors overflow-hidden font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
            <span>COMMUNITY TESTIMONIALS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-950 dark:text-white tracking-[-0.03em]">
            Loved by students, teachers, and everyday writers.
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            See why people make MD Writer their daily home for thinking and plain-text notes.
          </p>
        </div>

        {/* ── SMOOTH CONTINUOUS MARQUEE CAROUSEL ── */}
        <div className="relative w-full overflow-hidden">
          {/* Edge Blur Gradients */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-white dark:from-neutral-950 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-white dark:from-neutral-950 to-transparent z-10" />

          {/* Marquee Track with Hover Pause */}
          <div className="animate-marquee flex gap-5 py-3">
            {marqueeItems.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="w-[300px] sm:w-[350px] shrink-0 p-5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/60 flex flex-col justify-between space-y-4 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors text-left select-none font-sans"
              >
                {/* Rating Stars & Relatable Quote */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 dark:text-neutral-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed italic">
                    &ldquo;{item.content}&rdquo;
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/80">
                  <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-700 dark:text-neutral-200 shrink-0">
                    {item.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs text-neutral-950 dark:text-white truncate">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                      {item.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Write a Review Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200/80 dark:border-neutral-700 transition-colors cursor-pointer flex items-center gap-2 font-sans shadow-2xs"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>{myReview ? 'Edit Your Review' : 'Write a Review'}</span>
          </button>
        </div>

      </div>

      {/* Review Submission Modal */}
      <ReviewSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        authorName={authorName}
        setAuthorName={setAuthorName}
        authorRole={authorRole}
        setAuthorRole={setAuthorRole}
        rating={rating}
        setRating={setRating}
        reviewText={reviewText}
        setReviewText={setReviewText}
        isSubmitting={isSubmitting}
        submitSuccess={submitSuccess}
        onSubmit={handleSubmitReview}
        isEditing={Boolean(myReview)}
      />
    </section>
  );
};
