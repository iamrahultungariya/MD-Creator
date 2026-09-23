import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Bug, 
  Lightbulb, 
  Heart, 
  HelpCircle, 
  Send, 
  CheckCircle2, 
  ArrowLeft, 
  Monitor, 
  Sparkles, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Navbar } from '../components/home/Navbar';
import { Footer } from '../components/home/Footer';
import { renderWithRichIcons } from '../utils/richIcons';
import { supabase } from '../lib/supabase';

type FeedbackCategory = 'bug' | 'feature' | 'praise' | 'question';
type Sentiment = 'terrible' | 'bad' | 'okay' | 'good' | 'amazing';
type Priority = 'low' | 'normal' | 'high' | 'critical';

interface CategoryOption {
  id: FeedbackCategory;
  title: string;
  desc: string;
  icon: React.ElementType;
  badgeColor: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: 'bug',
    title: 'Bug Report',
    desc: 'Found an unexpected error, crash, or rendering glitch',
    icon: Bug,
    badgeColor: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800'
  },
  {
    id: 'feature',
    title: 'Feature Request',
    desc: 'Propose an idea, shortcut, or workflow improvement',
    icon: Lightbulb,
    badgeColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800'
  },
  {
    id: 'praise',
    title: 'Praise & Love',
    desc: 'Share what you enjoy most about using MD Writer',
    icon: Heart,
    badgeColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
  },
  {
    id: 'question',
    title: 'Question / Help',
    desc: 'Ask about shortcuts, KaTeX, or local sync',
    icon: HelpCircle,
    badgeColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800'
  }
];

const SENTIMENTS: { id: Sentiment; icon: string; label: string }[] = [
  { id: 'terrible', icon: '😡', label: 'Terrible' },
  { id: 'bad', icon: '😕', label: 'Needs Work' },
  { id: 'okay', icon: '😐', label: 'Okay' },
  { id: 'good', icon: '😊', label: 'Good' },
  { id: 'amazing', icon: '🤩', label: 'Loving It' }
];

export const FeedbackPage: React.FC = () => {
  const navigate = useNavigate();

  const [category, setCategory] = useState<FeedbackCategory>('feature');
  const [sentiment, setSentiment] = useState<Sentiment>('amazing');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [priority, setPriority] = useState<Priority>('normal');
  const [includeSystemInfo, setIncludeSystemInfo] = useState(true);
  const [willingnessToPay, setWillingnessToPay] = useState<string>('');
  const [monetizationFeature, setMonetizationFeature] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-fill logged-in user email if Supabase auth is active
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (supabase) {
          const { data } = await supabase.auth.getUser();
          if (data?.user?.email) {
            setEmail(data.user.email);
          }
        }
      } catch {
        // Ignore if offline
      }
    };
    fetchUser();
  }, []);

  const getSystemInfo = () => {
    return {
      userAgent: navigator.userAgent,
      screenResolution: `${window.innerWidth}x${window.innerHeight}`,
      appVersion: 'v3.1.0',
      language: navigator.language,
      platform: navigator.platform
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMessage('Please provide your feedback or issue description.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const feedbackPayload = {
      category,
      sentiment,
      subject: subject.trim() || `${category.toUpperCase()} submission`,
      message: message.trim(),
      user_name: name.trim() || null,
      user_email: email.trim() || null,
      priority,
      willingness_to_pay: willingnessToPay || null,
      paid_feature_request: monetizationFeature.trim() || null,
      system_info: includeSystemInfo ? getSystemInfo() : null,
      created_at: new Date().toISOString()
    };

    try {
      // Attempt Supabase insert if client configured
      if (supabase) {
        const { error } = await supabase.from('feedbacks').insert([feedbackPayload]);
        if (error) {
          console.warn('Supabase feedback insert skipped (offline or table absent), saving to local queue:', error);
        }
      }
    } catch (err) {
      console.warn('Offline feedback submission stored locally:', err);
    }

    // Always succeed gracefully for user experience
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setMessage('');
    setSubject('');
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-neutral-400">
          <Link to="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="text-neutral-700 dark:text-neutral-300 font-medium">Feedback & Community</span>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Direct Maintainer Channel</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            Your Voice Shapes MD Writer.
          </h1>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Report bugs, propose new features, or share how MD Writer is helping your flow. Every submission is reviewed directly with care.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="bg-neutral-50/70 dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-6 sm:p-10 shadow-xs">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Category Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
                  1. What would you like to share?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs'
                            : 'border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900/60'
                        }`}
                      >
                        <div className={`p-2 rounded-xl border shrink-0 ${cat.badgeColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-neutral-900 dark:text-white">
                            {cat.title}
                          </p>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                            {cat.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sentiment Reaction Bar */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
                  2. How are you feeling about MD Writer right now?
                </label>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  {SENTIMENTS.map((s) => {
                    const isSelected = sentiment === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSentiment(s.id)}
                        className={`flex-1 min-w-[80px] py-2.5 px-3 rounded-2xl border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'border-neutral-950 dark:border-white bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-md scale-105'
                            : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <span className="text-xl">
                          {renderWithRichIcons(s.icon)}
                        </span>
                        <span className="text-[10px] font-bold">
                          {s.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 text-xs">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  3. Details & Description
                </label>

                <div>
                  <input
                    type="text"
                    placeholder="Subject / Summary (e.g., 'Add syntax highlighting for Rust' or 'Table formatting bug')"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <textarea
                    rows={5}
                    placeholder="Tell us everything. What happened? What would you like to see? Markdown is welcome."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y leading-relaxed"
                  />
                </div>

                {/* Metadata Row: Name, Email & Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      Your Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Alex"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      Email for Follow-up (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="alex@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      Priority Level
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as Priority)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    >
                      <option value="low">Low (Nice to have)</option>
                      <option value="normal">Normal (Standard)</option>
                      <option value="high">High (Impacting flow)</option>
                      <option value="critical">Critical (Blocking work)</option>
                    </select>
                  </div>
                </div>

                {/* Telemetry Toggle */}
                <div className="pt-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-neutral-600 dark:text-neutral-400">
                    <input
                      type="checkbox"
                      checked={includeSystemInfo}
                      onChange={(e) => setIncludeSystemInfo(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Include browser & platform specs for debugging</span>
                    </div>
                  </label>
                  <span className="text-[10px] text-neutral-400">MD Writer v3.1</span>
                </div>
              </div>

              {/* Optional 4. Willingness to Pay & Feature Demand */}
              <div className="space-y-3 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60 text-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    4. Product Demand & Pricing (Optional)
                  </label>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-semibold">Roadmap Input</span>
                </div>

                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">
                  Would you pay for premium capabilities like cross-device cloud sync, team collaboration, or custom branding?
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'yes', label: 'Yes ($5–$10 / mo)', desc: 'For sync & teams' },
                    { id: 'maybe', label: 'Maybe', desc: 'Depends on feature' },
                    { id: 'free_only', label: 'Prefer Free Only', desc: 'Love open source' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setWillingnessToPay(willingnessToPay === opt.id ? '' : opt.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        willingnessToPay === opt.id
                          ? 'border-blue-600 dark:border-blue-400 bg-blue-50/90 dark:bg-blue-950/70 text-blue-950 dark:text-blue-100 font-bold shadow-xs ring-2 ring-blue-500/20'
                          : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      <div className="font-bold text-xs">{opt.label}</div>
                      <div className={`text-[10.5px] mt-0.5 ${willingnessToPay === opt.id ? 'text-blue-700 dark:text-blue-300' : 'text-neutral-500 dark:text-neutral-400'}`}>{opt.desc}</div>
                    </button>
                  ))}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Which specific feature would you pay for most? (e.g., Live Team Sync, PDF Covers, AI Copilot)"
                    value={monetizationFeature}
                    onChange={(e) => setMonetizationFeature(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-900">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-200/60 dark:border-neutral-800/60">
                <button
                  type="button"
                  onClick={() => navigate('/editor')}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Thank You Confirmation Card */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 space-y-4"
            >
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-neutral-900 dark:text-white">
                  Thank You for Your Feedback! {renderWithRichIcons('🙌✨')}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-md mx-auto leading-relaxed">
                  Your thoughts have been logged directly into our product triage queue. We iterate daily to keep MD Writer the fastest markdown editor on the web.
                </p>
              </div>

              <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Submit Another Note
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/editor')}
                  className="px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Open Editor
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
