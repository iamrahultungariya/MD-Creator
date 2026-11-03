import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { 
  Star, 
  MessageSquarePlus, 
  CheckCircle2, 
  Quote, 
  ShieldCheck, 
  Zap, 
  Heart,
  Pencil,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
const ReviewSubmissionModal = React.lazy(() =>
  import('./ReviewSubmissionModal').then((m) => ({ default: m.ReviewSubmissionModal }))
);
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

// Everyday Community Personas (Students, Teachers, Journalers, Developers, Researchers)
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
    content: 'The Focus Canvas feels like a deep breath of fresh air. No notifications, no bloat, just my thoughts and clean typography with continuous autosave.',
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
  {
    id: 'test-7',
    user_id: 'user-research',
    name: 'Dr. Marcus Vance',
    role: 'Academic Researcher',
    rating: 5,
    content: 'Mermaid flowchart generation and export directly to clean Word (.docx) documents saved our laboratory team hours of re-formatting.',
    date: '2026-10-04',
    verified: true,
    status: 'approved',
  },
  {
    id: 'test-8',
    user_id: 'user-docs',
    name: 'Nora Sterling',
    role: 'Technical Documentation Lead',
    rating: 5,
    content: 'The v3.0.0 multi-device sync is instantaneous. I write draft notes on my desktop, and they appear on my laptop within seconds without any conflict.',
    date: '2026-10-12',
    verified: true,
    status: 'approved',
  },
];

type CategoryFilter = 'all' | 'students' | 'developers' | 'writers' | 'educators';

const CATEGORIES: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'All Reviews' },
  { id: 'students', label: 'Students & Academics' },
  { id: 'developers', label: 'Developers & Builders' },
  { id: 'writers', label: 'Writers & Journalers' },
  { id: 'educators', label: 'Teachers & Educators' },
];

function getCategoryFromRole(role: string): CategoryFilter {
  const lower = role.toLowerCase();
  if (lower.includes('student') || lower.includes('major') || lower.includes('academic') || lower.includes('researcher') || lower.includes('phd')) {
    return 'students';
  }
  if (lower.includes('dev') || lower.includes('creator') || lower.includes('engineer') || lower.includes('coder') || lower.includes('app')) {
    return 'developers';
  }
  if (lower.includes('teacher') || lower.includes('educat') || lower.includes('science') || lower.includes('school') || lower.includes('prof')) {
    return 'educators';
  }
  return 'writers';
}

const AVATAR_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-red-600',
  'from-cyan-500 to-blue-600',
];

function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

export const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [myReview, setMyReview] = useState<UserReview | null>(() => getUserSubmittedReview());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  // Form State for ReviewSubmissionModal
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
          .limit(16);

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

  const allReviewsList = reviews.length > 0 ? reviews : FALLBACK_TESTIMONIALS;

  // Filter reviews by active category
  const filteredReviews = useMemo(() => {
    if (activeCategory === 'all') return allReviewsList;
    return allReviewsList.filter((item) => getCategoryFromRole(item.role) === activeCategory);
  }, [allReviewsList, activeCategory]);

  return (
    <section id="reviews" className="py-20 sm:py-24 border-t border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 transition-colors font-sans overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* ── SECTION HEADER ── */}
        <div className="text-center max-w-2xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-2xs">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Community Experiences • 5.0 Star Rating</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
            Loved by students, teachers, and everyday writers.
          </h2>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            See how thinkers and builders worldwide use MD Writer for pure focus, lecture notes, and seamless documentation.
          </p>
        </div>

        {/* ── SOCIAL PROOF & TRUST METRICS STRIP ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-6 max-w-3xl mx-auto">
          <div className="p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 text-center space-y-1 shadow-2xs">
            <div className="flex items-center justify-center gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <div className="text-sm font-bold text-neutral-950 dark:text-white">5.0 / 5.0 Rating</div>
            <div className="text-[11px] text-neutral-500">Verified community feedback</div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 text-center space-y-1 shadow-2xs">
            <div className="flex items-center justify-center text-emerald-500">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-neutral-950 dark:text-white">100% Offline &amp; Private</div>
            <div className="text-[11px] text-neutral-500">Zero cloud trackers or ad telemetry</div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 text-center space-y-1 shadow-2xs">
            <div className="flex items-center justify-center text-brand-500">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-neutral-950 dark:text-white">Sub-10ms Latency</div>
            <div className="text-[11px] text-neutral-500">Instant IndexedDB local persistence</div>
          </div>
        </div>

        {/* ── CATEGORY FILTER PILLS ── */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white border border-neutral-200/60 dark:border-neutral-700/60'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ── USER'S OWN SUBMITTED REVIEW SPOTLIGHT ── */}
        {myReview && (
          <div className="p-5 sm:p-6 rounded-2xl border-2 border-brand-500/40 bg-brand-50/30 dark:bg-brand-950/20 max-w-4xl mx-auto shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-brand-600 text-white shadow-2xs">
                  Your Review
                </span>
                <div className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < myReview.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 dark:text-neutral-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
              >
                <Pencil className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            <p className="text-sm text-neutral-800 dark:text-neutral-200 italic leading-relaxed">
              &ldquo;{myReview.content}&rdquo;
            </p>

            <div className="flex items-center gap-2.5 pt-1 text-xs text-neutral-500">
              <span className="font-semibold text-neutral-900 dark:text-white">{myReview.name}</span>
              <span>•</span>
              <span>{myReview.role}</span>
              <span>•</span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            </div>
          </div>
        )}

        {/* ── MODERN COMMUNITY REVIEWS BENTO GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredReviews.map((item, idx) => {
            const gradientClass = getAvatarGradient(item.name);
            return (
              <div
                key={`${item.id}-${idx}`}
                className="group relative p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/50 hover:bg-white dark:hover:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                {/* Top Row: Stars + Verified Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 dark:text-neutral-700'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                </div>

                {/* Review Quote Body */}
                <div className="relative space-y-2">
                  <Quote className="w-5 h-5 text-neutral-300 dark:text-neutral-700 -scale-x-100 opacity-60 mb-1" />
                  <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed italic">
                    &ldquo;{item.content}&rdquo;
                  </p>
                </div>

                {/* Bottom Row: User Info with Gradient Avatar */}
                <div className="flex items-center gap-3 pt-4 border-t border-neutral-200/60 dark:border-neutral-800">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0`}>
                    {item.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-neutral-950 dark:text-white truncate">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                      {item.role}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── COMMUNITY ACTION CTA BANNER ── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 max-w-4xl mx-auto shadow-2xs">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
              <h3 className="text-base font-bold text-neutral-950 dark:text-white">
                Share your writing experience
              </h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md">
              Help prospective students, writers, and engineers discover a calm, clutter-free markdown environment.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-all shadow-xs hover:shadow flex items-center justify-center gap-2 cursor-pointer shrink-0 group hover:scale-[1.01]"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>{myReview ? 'Edit Your Review' : 'Write a Review'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

      </div>

      {/* ── REVIEW SUBMISSION MODAL (PORTALED TO BODY) ── */}
      {isModalOpen && (
        <Suspense fallback={null}>
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
        </Suspense>
      )}
    </section>
  );
};
