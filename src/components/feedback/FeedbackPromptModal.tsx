import React, { useState } from 'react';
import { X, Send, ChevronDown, ChevronUp, Sparkles, BarChart2, Star, Check } from 'lucide-react';
import { ModalPortal } from '../common/ModalPortal';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../lib/supabase';

export interface FeedbackPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ExperienceRating = 'excellent' | 'good' | 'okay' | 'not_great' | 'poor';

interface QuestionAccordionProps {
  icon: React.ReactNode;
  title: string;
  options: string[];
  selectedOption: string | null;
  onSelect: (option: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const QuestionAccordion: React.FC<QuestionAccordionProps> = ({
  icon,
  title,
  options,
  selectedOption,
  onSelect,
  isOpen,
  onToggle
}) => {
  return (
    <div className="border border-neutral-200/90 dark:border-neutral-800 rounded-2xl overflow-hidden transition-colors bg-white/70 dark:bg-neutral-900/50">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <span className="text-blue-500 dark:text-blue-400 flex-shrink-0">{icon}</span>
          <span className="truncate">{title}</span>
          {selectedOption && (
            <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800 truncate max-w-[140px]">
              {selectedOption}
            </span>
          )}
        </div>
        <span className="text-neutral-400 dark:text-neutral-500 flex-shrink-0">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {isOpen && (
        <div className="px-4 pb-3.5 pt-1.5 border-t border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/80">
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => {
              const isSelected = selectedOption === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onSelect(isSelected ? '' : opt)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-all text-left font-medium ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/20'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const FeedbackPromptModal: React.FC<FeedbackPromptModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const user = useAuthStore((s) => s.user);

  // Form states
  const [experience, setExperience] = useState<ExperienceRating>('excellent');
  const [likedMost, setLikedMost] = useState<string | null>(null);
  const [canImprove, setCanImprove] = useState<string | null>(null);
  const [nextFeature, setNextFeature] = useState<string | null>(null);
  const [guestEmail, setGuestEmail] = useState('');
  const [freeText, setFreeText] = useState('');

  // Accordion open states
  const [openSection, setOpenSection] = useState<'liked' | 'improve' | 'next' | null>(null);

  // Status and submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleSection = (section: 'liked' | 'improve' | 'next') => {
    setOpenSection((current) => (current === section ? null : section));
  };

  const validateEmail = (emailStr: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate email for guest users
    const effectiveEmail = user?.email || guestEmail.trim();
    if (!user && (!effectiveEmail || !validateEmail(effectiveEmail))) {
      setErrorMessage('Please provide a valid email address so we can follow up.');
      return;
    }

    setIsSubmitting(true);

    const sentimentMap: Record<ExperienceRating, 'good' | 'neutral' | 'bad'> = {
      excellent: 'good',
      good: 'good',
      okay: 'neutral',
      not_great: 'bad',
      poor: 'bad'
    };

    const priorityMap: Record<ExperienceRating, 'normal' | 'high'> = {
      excellent: 'normal',
      good: 'normal',
      okay: 'normal',
      not_great: 'high',
      poor: 'high'
    };

    const feedbackPayload = {
      id: crypto.randomUUID(),
      user_id: user?.id || null,
      user_email: effectiveEmail,
      user_name: user?.displayName || null,
      category: 'feature',
      sentiment: sentimentMap[experience],
      subject: 'In-App Discovery Feedback',
      message:
        freeText.trim() ||
        `Experience: ${experience}. Liked: ${likedMost || 'None specified'}. Can improve: ${
          canImprove || 'None specified'
        }. Next feature: ${nextFeature || 'None specified'}.`,
      priority: priorityMap[experience],
      status: 'new',
      system_info: {
        experience,
        liked_most: likedMost || null,
        can_improve: canImprove || null,
        next_feature: nextFeature || null,
        is_guest: !user,
        dwell_seconds: 30,
        app_version: '2.3.0',
        platform: typeof navigator !== 'undefined' ? navigator.platform : 'Unknown'
      }
    };

    try {
      if (supabase) {
        const { error } = await supabase.from('feedbacks').insert([feedbackPayload]);
        if (error) {
          console.warn('Feedback submission notice:', error.message);
        }
      }
    } catch (err: any) {
      console.warn('Feedback network notice:', err?.message || 'Offline submission');
    } finally {
      setIsSubmitting(false);
      onSuccess();
    }
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-modal-title"
          className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 z-20 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Column: Mascot Illustration (Matching uploaded Image 1 & 2) */}
          <div className="relative md:w-5/12 bg-gradient-to-b from-blue-50/70 via-indigo-50/40 to-white dark:from-neutral-800/60 dark:via-neutral-900/40 dark:to-neutral-900 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-neutral-200/80 dark:border-neutral-800 select-none">
            {/* Visual accent bubbles */}
            <div className="absolute top-6 left-6 w-16 h-16 rounded-full bg-blue-200/40 dark:bg-blue-600/10 blur-xl pointer-events-none" />
            <div className="absolute bottom-10 right-6 w-20 h-20 rounded-full bg-indigo-200/40 dark:bg-indigo-600/10 blur-xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <img
                src="/FeedBackCharater/Smiling Cartoon Boy Giving Thumbs-Up.png"
                alt="Smiling cartoon writer with thumbs up"
                className="w-44 h-44 sm:w-52 sm:h-52 object-contain drop-shadow-xl"
                loading="eager"
              />
              <div className="mt-3 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium">
                Your voice shapes MD Writer
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Feedback Form */}
          <div className="flex-1 p-6 sm:p-7 overflow-y-auto max-h-[calc(90vh-1rem)] md:max-h-[90vh]">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Header */}
              <div>
                <h3
                  id="feedback-modal-title"
                  className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100"
                >
                  Share Your Feedback
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                  We would love to hear your thoughts! It helps us make the app even better.
                </p>
              </div>

              {/* Section 1: How was your experience? */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 block mb-2.5">
                  How was your experience?
                </label>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {[
                    { key: 'excellent', label: 'Excellent', emoji: '😃' },
                    { key: 'good', label: 'Good', emoji: '🙂' },
                    { key: 'okay', label: 'Okay', emoji: '😐' },
                    { key: 'not_great', label: 'Not Great', emoji: '🙁' },
                    { key: 'poor', label: 'Poor', emoji: '😠' }
                  ].map((item) => {
                    const isSelected = experience === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setExperience(item.key as ExperienceRating)}
                        className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-sm'
                            : 'border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/80'
                        }`}
                      >
                        <span className="text-xl sm:text-2xl" role="img" aria-label={item.label}>
                          {item.emoji}
                        </span>
                        <span className="text-[10px] sm:text-xs font-medium mt-1 truncate max-w-full">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: A few quick questions */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 block mb-2">
                  A few quick questions
                </label>
                <div className="space-y-2">
                  <QuestionAccordion
                    icon={<Sparkles className="w-4 h-4 text-amber-500" />}
                    title="What did you like the most?"
                    options={[
                      'Clean typography',
                      'Fast performance',
                      'Mimo AI Assistant',
                      'Distraction-free mode',
                      'KaTeX Math preview',
                      'Document privacy'
                    ]}
                    selectedOption={likedMost}
                    onSelect={setLikedMost}
                    isOpen={openSection === 'liked'}
                    onToggle={() => toggleSection('liked')}
                  />

                  <QuestionAccordion
                    icon={<BarChart2 className="w-4 h-4 text-blue-500" />}
                    title="What can be improved?"
                    options={[
                      'Offline cloud sync',
                      'Mobile editing',
                      'Custom themes',
                      'PDF export polish',
                      'Table editor',
                      'Keyboard shortcuts'
                    ]}
                    selectedOption={canImprove}
                    onSelect={setCanImprove}
                    isOpen={openSection === 'improve'}
                    onToggle={() => toggleSection('improve')}
                  />

                  <QuestionAccordion
                    icon={<Star className="w-4 h-4 text-purple-500" />}
                    title="Any feature you would like to see next?"
                    options={[
                      'Cloud backup',
                      'Multilingual / RTL',
                      'Vim mode polish',
                      'Folder hierarchy',
                      'Code block tabs',
                      'Built-in spell check'
                    ]}
                    selectedOption={nextFeature}
                    onSelect={setNextFeature}
                    isOpen={openSection === 'next'}
                    onToggle={() => toggleSection('next')}
                  />
                </div>
              </div>

              {/* Section 3: Email input / Logged-in badge */}
              <div>
                {user ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-100/80 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 text-xs text-neutral-600 dark:text-neutral-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span className="truncate">
                      Signed in as: <strong className="font-medium text-neutral-800 dark:text-neutral-200">{user.email}</strong>
                    </span>
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="feedback-guest-email"
                      className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1"
                    >
                      Your Email <span className="text-red-500 font-normal">*</span>
                    </label>
                    <input
                      id="feedback-guest-email"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Section 4: Anything else? (optional) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="feedback-freetext"
                    className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100"
                  >
                    Anything else? (optional)
                  </label>
                  <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 tabular-nums">
                    {freeText.length} / 500
                  </span>
                </div>
                <textarea
                  id="feedback-freetext"
                  rows={3}
                  maxLength={500}
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  placeholder="Share your thoughts, suggestions, or ideas..."
                  className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-800/30 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-neutral-900 transition-all resize-none"
                />
              </div>

              {/* Error message if any */}
              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs">
                  {errorMessage}
                </div>
              )}

              {/* Footer actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs sm:text-sm font-medium rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
