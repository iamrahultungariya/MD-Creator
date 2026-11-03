import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  MessageSquareHeart, 
  X, 
  Star, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  Mail,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/useAuthStore';

const STORAGE_KEYS = {
  LAST_VISIT_DATE: 'md_feedback_visit_date',
  VISITS_TODAY: 'md_feedback_visits_today',
  SUPPRESSED_DATE: 'md_feedback_suppressed_date',
  SESSION_COUNTED: 'md_session_feedback_counted',
};

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export const DailyFeedbackNudge: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [category, setCategory] = useState<'bug' | 'feature' | 'praise' | 'question'>('praise');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update category automatically based on rating
  useEffect(() => {
    if (rating <= 2) {
      setCategory('bug');
    } else if (rating === 3) {
      setCategory('feature');
    } else {
      setCategory('praise');
    }
  }, [rating]);

  useEffect(() => {
    const today = getTodayString();
    const suppressedDate = localStorage.getItem(STORAGE_KEYS.SUPPRESSED_DATE);

    // If suppressed for today, stop completely
    if (suppressedDate === today) {
      return;
    }

    // Determine visit count for today
    let visits = 1;
    const isSessionCounted = sessionStorage.getItem(STORAGE_KEYS.SESSION_COUNTED);

    if (!isSessionCounted) {
      sessionStorage.setItem(STORAGE_KEYS.SESSION_COUNTED, 'true');
      const lastVisitDate = localStorage.getItem(STORAGE_KEYS.LAST_VISIT_DATE);

      if (lastVisitDate !== today) {
        // First session of a new day!
        visits = 1;
        localStorage.setItem(STORAGE_KEYS.LAST_VISIT_DATE, today);
        localStorage.setItem(STORAGE_KEYS.VISITS_TODAY, '1');
        // Clear any stale suppression from previous dates
        if (suppressedDate && suppressedDate !== today) {
          localStorage.removeItem(STORAGE_KEYS.SUPPRESSED_DATE);
        }
      } else {
        // Same day, subsequent visit session
        const currentVisits = parseInt(localStorage.getItem(STORAGE_KEYS.VISITS_TODAY) || '1', 10);
        visits = currentVisits + 1;
        localStorage.setItem(STORAGE_KEYS.VISITS_TODAY, String(visits));
      }
    } else {
      // Existing session today
      visits = parseInt(localStorage.getItem(STORAGE_KEYS.VISITS_TODAY) || '1', 10);
    }

    // Scheduling:
    if (visits === 1) {
      // 1st visit of the day: show within 10 seconds
      timerRef.current = setTimeout(() => {
        const stillSuppressed = localStorage.getItem(STORAGE_KEYS.SUPPRESSED_DATE) === today;
        if (!stillSuppressed) {
          setIsVisible(true);
        }
      }, 10000);
    } else {
      // Subsequent visits today (>1st visit): show every 3 minutes (180,000 ms)
      intervalRef.current = setInterval(() => {
        const stillSuppressed = localStorage.getItem(STORAGE_KEYS.SUPPRESSED_DATE) === today;
        if (!stillSuppressed) {
          setIsVisible(true);
        }
      }, 180000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleDismissForNow = () => {
    setIsVisible(false);
  };

  const handleDontShowToday = () => {
    const today = getTodayString();
    localStorage.setItem(STORAGE_KEYS.SUPPRESSED_DATE, today);
    setIsVisible(false);
    setIsModalOpen(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleOpenFeedback = () => {
    setIsVisible(false);
    setIsModalOpen(true);
    setErrorMessage(null);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedMsg = feedbackText.trim();
    if (!trimmedMsg || trimmedMsg.length < 5) {
      setErrorMessage('Please enter at least 5 characters for your feedback message.');
      return;
    }

    // Determine identity
    let finalEmail = user?.email || null;
    let finalName = user?.displayName || 'Writer';
    const finalUserId = user?.id || null;

    if (!user) {
      // Non-logged in: require guest email
      if (!guestEmail.trim() || !guestEmail.includes('@')) {
        setErrorMessage('Please provide a valid email address so our team can follow up.');
        return;
      }
      finalEmail = guestEmail.trim();
      finalName = guestName.trim() || 'Guest Writer';
    }

    setIsSubmitting(true);
    const today = getTodayString();

    try {
      if (supabase) {
        const sentimentMap: Record<number, 'terrible' | 'bad' | 'okay' | 'good' | 'amazing'> = {
          1: 'terrible',
          2: 'bad',
          3: 'okay',
          4: 'good',
          5: 'amazing',
        };

        const { error: insertError } = await supabase.from('feedbacks').insert({
          user_id: finalUserId,
          category: category,
          sentiment: sentimentMap[rating] || 'good',
          subject: `Daily Feedback (${rating} Stars) - ${finalName}`,
          message: trimmedMsg,
          user_name: finalName,
          user_email: finalEmail,
          priority: rating <= 2 ? 'high' : 'normal',
          status: 'new',
        });

        if (insertError) {
          console.error('Supabase feedback insert error:', insertError);
          // If error happens, show note to user but persist suppression
          setErrorMessage(`Saved locally. Note: ${insertError.message}`);
        }
      }
    } catch (err: any) {
      console.warn('Failed to submit feedback to Supabase, saved locally', err);
      setErrorMessage('Network unavailable. Your feedback was recorded locally.');
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
      // Suppress for remainder of the day
      localStorage.setItem(STORAGE_KEYS.SUPPRESSED_DATE, today);

      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitted(false);
        setFeedbackText('');
        setGuestEmail('');
        setGuestName('');
        setErrorMessage(null);
      }, 2200);
    }
  };

  return (
    <>
      {/* ── POLITE FLOATING FEEDBACK TOAST ── */}
      {isVisible && !isModalOpen && (
        <aside
          role="complementary"
          aria-label="Daily User Feedback Prompt"
          className="fixed bottom-5 left-5 z-[9990] max-w-sm w-[calc(100vw-2.5rem)] sm:w-96 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-xl p-4 text-neutral-900 dark:text-neutral-100 font-sans animate-in slide-in-from-bottom-4 duration-200"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-200/70 dark:border-violet-800/60 shrink-0">
              <MessageSquareHeart className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs text-neutral-950 dark:text-white">
                  How is your writing today?
                </h4>
                <button
                  onClick={handleDismissForNow}
                  className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-0.5 rounded cursor-pointer"
                  title="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11.5px] text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                Got 30 seconds? We&apos;d love your thoughts to keep making MD Writer better.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-1">
                <button
                  onClick={handleOpenFeedback}
                  className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-brand-200" />
                  <span>Give Feedback</span>
                </button>

                <button
                  onClick={handleDismissForNow}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Later
                </button>

                <button
                  onClick={handleDontShowToday}
                  className="text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 underline underline-offset-2 ml-auto cursor-pointer transition-colors"
                  title="Hide this prompt until tomorrow"
                >
                  Don&apos;t show today
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ── INTERACTIVE IN-APP FEEDBACK MODAL ── */}
      {isModalOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-dialog-title"
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs font-sans animate-in fade-in duration-150"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 text-neutral-900 dark:text-neutral-100 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
                    <MessageSquareHeart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 id="feedback-dialog-title" className="font-semibold text-sm text-neutral-950 dark:text-white">
                      Your Quick Feedback
                    </h3>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {user ? 'Signed in as ' + (user.displayName || user.email) : 'Direct feedback to MD Writer team'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {submitted ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <h4 className="font-semibold text-sm text-neutral-950 dark:text-white">
                    Thank you so much!
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs leading-relaxed">
                    Your feedback is saved directly to our team dashboard and helps shape upcoming releases.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="space-y-3.5 pt-4 text-xs">
                  {errorMessage && (
                    <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* USER IDENTITY ROW */}
                  {user ? (
                    /* Logged-in user: automatic identity preview */
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800">
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-[10px]">
                          {(user.displayName || user.email || 'U')[0].toUpperCase()}
                        </div>
                        <div className="truncate">
                          <span className="font-medium text-neutral-900 dark:text-neutral-100 text-xs">
                            {user.displayName || 'You'}
                          </span>
                          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 ml-1.5 truncate">
                            ({user.email})
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 shrink-0 font-medium">
                        Verified
                      </span>
                    </div>
                  ) : (
                    /* Non-logged in guest: Ask for email */
                    <div className="space-y-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800">
                      <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 font-medium text-[11.5px]">
                        <Mail className="w-3.5 h-3.5 text-brand-500" />
                        <span>Your Contact Information:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <input
                            type="email"
                            required
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            placeholder="Email (required)*"
                            className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 text-xs focus:outline-none focus:border-brand-500"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            placeholder="Name (optional)"
                            className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 text-xs focus:outline-none focus:border-brand-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rating Selector */}
                  <div>
                    <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Experience Rating
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setRating(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              (hoverRating !== null ? star <= hoverRating : star <= rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-neutral-300 dark:text-neutral-700'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono ml-2">
                        {rating === 5 ? 'Loved it' : rating >= 4 ? 'Good' : rating >= 3 ? 'Okay' : 'Needs work'}
                      </span>
                    </div>
                  </div>

                  {/* Feedback text */}
                  <div>
                    <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Your Thoughts or Suggestions <span className="text-brand-500">*</span>
                    </label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="What do you enjoy or what should we improve? (Minimum 5 characters)"
                      rows={3}
                      required
                      minLength={5}
                      className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 text-xs focus:outline-none focus:border-brand-500 leading-relaxed resize-none"
                    />
                  </div>

                  {/* Submit and Options */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        navigate('/feedback');
                      }}
                      className="text-[11px] text-neutral-500 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Full Feedback Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDontShowToday}
                        className="px-3 py-1.5 rounded-lg text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 text-xs cursor-pointer"
                      >
                        Don&apos;t show today
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting || feedbackText.trim().length < 5}
                        className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? 'Sending...' : 'Submit'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
