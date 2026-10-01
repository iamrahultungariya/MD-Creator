import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Cloud, 
  Users,
  Tag,
  AlertCircle,
  X
} from 'lucide-react';
import { Navbar } from '../components/home/Navbar';
import { Footer } from '../components/home/Footer';
import { useAuthStore, IS_BETA } from '../stores/useAuthStore';
import { PricingFaqSection } from '../components/pricing/PricingFaqSection';
import { 
  detectUserRegion, 
  RegionalPricing, 
  redeemCouponCode 
} from '../services/couponService';

export const PricingPage: React.FC = () => {
  const { user, refreshProfile } = useAuthStore();
  const navigate = useNavigate();

  // Regional & Currency State
  const [region] = useState<RegionalPricing>(detectUserRegion);
  const [isAnnual, setIsAnnual] = useState(true);

  // Toast Notification State for In-Progress Features
  const [toastInfo, setToastInfo] = useState<{
    title: string;
    desc?: string;
    type?: 'pro' | 'sales';
  } | null>(null);

  useEffect(() => {
    if (!toastInfo) return;
    const timer = setTimeout(() => setToastInfo(null), 4500);
    return () => clearTimeout(timer);
  }, [toastInfo]);

  // Coupon Redemption State
  const [redeemInput, setRedeemInput] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemFeedback, setRedeemFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleRedeemCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemInput.trim()) return;
    if (!user) {
      navigate('/auth?redirect=/pricing&intent=redeem');
      return;
    }

    setIsRedeeming(true);
    setRedeemFeedback(null);
    try {
      const res = await redeemCouponCode(redeemInput.trim(), isAnnual ? 'annual' : 'monthly');
      if (res.success) {
        setRedeemFeedback({
          success: true,
          message: res.message || 'Pro activated successfully!'
        });
        setRedeemInput('');
        await refreshProfile();
      } else {
        setRedeemFeedback({
          success: false,
          message: res.error || 'Failed to redeem coupon code.'
        });
      }
    } catch (err: any) {
      setRedeemFeedback({
        success: false,
        message: err?.message || 'Error processing redemption.'
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  // Pricing calculations
  const proMonthly = region.monthlyPrice;
  const proAnnual = region.annualPrice;
  const proDisplayPrice = isAnnual ? proAnnual : proMonthly;

  const teamMonthly = region.countryCode === 'IN' ? 799 : 19;
  const teamAnnual = region.countryCode === 'IN' ? 639 : 15.2;
  const teamDisplayPrice = isAnnual ? teamAnnual : teamMonthly;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Header Hero Section */}
        <section className="pt-14 pb-10 sm:pt-20 sm:pb-16 text-center max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/60 text-xs font-semibold text-brand-700 dark:text-brand-300 mb-5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Simple, Transparent &amp; Fair Regional Pricing</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-950 dark:text-white tracking-tight mb-4 sm:mb-5 leading-tight">
            Write for free forever.<br />Upgrade when you need cloud sync.
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8">
            No locked basic markdown features. Enjoy a fast offline-first editor with optional multi-device cloud superpowers.
          </p>

          {/* Beta Access Banner */}
          {IS_BETA && (
            <div className="mb-8 sm:mb-10 mx-auto max-w-2xl p-4 sm:p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/90 dark:border-neutral-800 text-left sm:text-center shadow-xs space-y-2">
              <div className="flex items-center justify-start sm:justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-[11px] font-bold tracking-wide">
                  <Sparkles className="w-3 h-3 text-emerald-400 dark:text-emerald-600" />
                  <span>Beta Phase Active</span>
                </span>
                <span className="text-xs font-bold text-neutral-950 dark:text-white">
                  All Pro Features Free For All Users
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl mx-auto">
                During the Beta period, all Pro capabilities — including multi-device cloud sync, Word (.docx) export, publication-grade PDF tooling, and slide decks — are completely free and unlocked for everyone.
              </p>
            </div>
          )}

          {/* Billing Cycle Toggle */}
          <div className="flex flex-col items-center justify-center gap-2 mb-8 sm:mb-10">
            <div className="inline-flex items-center p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-xs font-semibold select-none">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all cursor-pointer ${
                  !isAnnual
                    ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-2xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  isAnnual
                    ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-2xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* 3 Pricing Cards Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            
            {/* Starter Plan */}
            <div className="relative rounded-3xl p-5 sm:p-8 flex flex-col justify-between transition-all duration-200 bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">STARTER</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-white tracking-tight mb-2">
                  Starter Edition
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 min-h-[34px] leading-relaxed mb-6">
                  Ideal for solo writers, researchers, students, and offline privacy purists.
                </p>

                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-950 dark:text-white tracking-tight">
                    {region.currencySymbol}0
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                    forever free
                  </span>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">What's Included:</div>
                  {[
                    'Unlimited local Markdown documents',
                    'Instant offline-ready writing & fast auto-save',
                    'Live dual-pane split view + Zen mode',
                    'GFM formatting, tables & task lists',
                    'KaTeX LaTeX mathematical formula studio',
                    'Clean PDF & Raw Markdown export',
                    'Client-side WebP image compression',
                    'All core slash block commands (/)',
                    '100% private — data never leaves browser'
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate('/editor')}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-bold tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer bg-neutral-100 hover:bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-100 shadow-2xs"
              >
                <span>Open Writing Canvas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pro Plan */}
            <div className="relative rounded-3xl p-5 sm:p-8 flex flex-col justify-between transition-all duration-200 bg-white dark:bg-neutral-900 border-2 border-brand-600 dark:border-brand-500 shadow-xl lg:-translate-y-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] sm:text-[11px] font-bold px-3 sm:px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Free During Beta</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">PRO WRITER</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-white tracking-tight mb-2">
                  Pro Studio &amp; Sync
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 min-h-[34px] leading-relaxed mb-6">
                  Multi-device cloud backup, publication-grade PDF covers, and full blueprint templates.
                </p>

                {/* Regional Price Display */}
                <div className="flex items-baseline gap-1.5 mb-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-950 dark:text-white tracking-tight">
                    {region.currencySymbol}{proDisplayPrice}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                    {isAnnual ? '/ month (billed annually)' : '/ month'}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mb-6">
                  ✨ 100% Free for all users while app is in Beta
                </div>

                <div className="space-y-3 mb-8">
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Everything in Starter, plus:</div>
                  {[
                    'Multi-Device Secure Cloud Sync',
                    'Automatic background cloud backup',
                    'Publication-grade PDF Studio (Custom cover & TOC)',
                    'Full & unlimited blueprint template library',
                    'Local revision checkpoints & version rollback',
                    '1-Click password-protected web publishing',
                    'Advanced slash commands & power workflows',
                    'Early beta tester rewards upon v1.0 launch'
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                      <Check className="w-4 h-4 text-brand-500 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setToastInfo({
                    type: 'pro',
                    title: 'Pro Subscriptions in Implementation Phase',
                    desc: 'Checkout is currently in active development. All Pro features are completely unlocked and free during Beta.'
                  });
                }}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-bold tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-950 shadow-md hover:shadow-lg"
              >
                <span>{user ? 'Pro Unlocked • Free During Beta' : 'Get Started with Pro'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Team & Studio Plan */}
            <div className="relative rounded-3xl p-5 sm:p-8 flex flex-col justify-between transition-all duration-200 bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">TEAM &amp; STUDIO</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-white tracking-tight mb-2">
                  Team &amp; Studio
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 min-h-[34px] leading-relaxed mb-6">
                  For engineering teams, documentation squads, and collaborative studios.
                </p>

                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-950 dark:text-white tracking-tight">
                    {region.currencySymbol}{teamDisplayPrice}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                    {isAnnual ? '/ seat / month' : '/ seat / month'}
                  </span>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Everything in Pro, plus:</div>
                  {[
                    'Real-Time Multiplayer Collaboration',
                    'Shared team workspace & tag taxonomies',
                    'Role-based permissions (Admin, Editor, Viewer)',
                    'Centralized team license & billing',
                    'Shared team templates & style guides',
                    'SSO & SAML authentication integration',
                    'Dedicated 99.9% uptime SLA & account rep'
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setToastInfo({
                    type: 'sales',
                    title: 'Team & Studio Licensing in Development',
                    desc: 'Enterprise onboarding is currently being finalized. Reach out to @rahultungariya_ on X for early team access.'
                  });
                }}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-bold tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer bg-neutral-100 hover:bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200"
              >
                <span>Contact Sales</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* Live Coupon Redemption Box */}
        <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-16">
          <div className="p-6 sm:p-8 rounded-3xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/90 dark:border-neutral-800 shadow-sm text-center">
            <div className="w-10 h-10 rounded-2xl bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Tag className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-950 dark:text-white tracking-tight">
              Have a Promotional Coupon Code?
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-md mx-auto">
              Enter your promotional coupon code to apply partner discounts or extend your Pro studio privileges.
            </p>

            <form onSubmit={handleRedeemCouponSubmit} className="mt-5 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="text"
                value={redeemInput}
                onChange={(e) => setRedeemInput(e.target.value.toUpperCase())}
                placeholder="e.g. BETA-PRO-2026"
                className="flex-1 px-4 py-2.5 text-xs font-mono rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-brand-500 uppercase"
              />
              <button
                type="submit"
                disabled={isRedeeming || !redeemInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-950 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isRedeeming ? 'Validating...' : 'Apply Coupon'}
              </button>
            </form>

            {redeemFeedback && (
              <div
                className={`mt-4 p-3 rounded-xl text-xs flex items-center justify-center gap-2 max-w-md mx-auto ${
                  redeemFeedback.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {redeemFeedback.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{redeemFeedback.message}</span>
              </div>
            )}
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <PricingFaqSection />

        {/* Implementation Phase Toast Notification */}
        <AnimatePresence>
          {toastInfo && (
            <motion.aside
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              role="status"
              aria-live="polite"
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-auto bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border border-neutral-800 dark:border-neutral-200 rounded-2xl shadow-2xl p-3.5 sm:px-4 sm:py-3.5 flex items-start sm:items-center gap-3 backdrop-blur-md"
            >
              <div className="w-8 h-8 rounded-xl bg-white/10 dark:bg-neutral-100 flex items-center justify-center shrink-0">
                {toastInfo.type === 'sales' ? (
                  <Users className="w-4 h-4 text-brand-400 dark:text-brand-600" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                )}
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <p className="font-semibold text-xs text-white dark:text-neutral-950">
                  {toastInfo.title}
                </p>
                {toastInfo.desc && (
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-600 mt-0.5 leading-relaxed">
                    {toastInfo.desc}
                  </p>
                )}
              </div>

              <button
                onClick={() => setToastInfo(null)}
                aria-label="Dismiss notification"
                className="w-7 h-7 rounded-lg text-neutral-400 hover:text-white dark:hover:text-neutral-900 hover:bg-white/10 dark:hover:bg-neutral-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.aside>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};
