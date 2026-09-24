import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Cloud, 
  Users,
  Tag,
  Copy,
  Gift,
  AlertCircle
} from 'lucide-react';
import { Navbar } from '../components/home/Navbar';
import { Footer } from '../components/home/Footer';
import { CtaBanner } from '../components/home/CtaBanner';
import { useAuthStore, isHolidayFreeProActive } from '../stores/useAuthStore';
import { WaitlistSuccessModal } from '../components/common/WaitlistSuccessModal';
import { WaitlistAdminPanel } from '../components/pricing/WaitlistAdminPanel';
import { PricingComparisonTable } from '../components/pricing/PricingComparisonTable';
import { PricingFaqSection } from '../components/pricing/PricingFaqSection';
import { 
  detectUserRegion, 
  RegionalPricing, 
  checkUserWaitlistStatus, 
  joinEarlybirdWaitlist, 
  redeemCouponCode, 
  getRemainingWaitlistSeats, 
  WaitlistStatus 
} from '../services/couponService';
import { supabase } from '../lib/supabase';

export const PricingPage: React.FC = () => {
  const { user, refreshProfile } = useAuthStore();
  const navigate = useNavigate();

  // Regional & Currency State
  const [region] = useState<RegionalPricing>(detectUserRegion);
  const [isAnnual, setIsAnnual] = useState(true);

  // Earlybird Waitlist & Coupon State
  const [waitlistStatus, setWaitlistStatus] = useState<WaitlistStatus>({ hasJoined: false });
  const [remainingSeats, setRemainingSeats] = useState<number | null>(null);
  const [isSubmittingWaitlist, setIsSubmittingWaitlist] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastAssignedCode, setLastAssignedCode] = useState<string | null>(null);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  // Coupon Redemption State
  const [redeemInput, setRedeemInput] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemFeedback, setRedeemFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    let isMounted = true;
    async function checkAdmin() {
      try {
        if (supabase) {
          const { data } = await supabase.rpc('has_role', { p_user_id: user!.id, p_role: 'admin' });
          if (isMounted) {
            setIsAdmin(Boolean(data) || user!.email?.toLowerCase() === 'tungariyarahul08@gmail.com');
          }
        } else if (isMounted) {
          setIsAdmin(user!.email?.toLowerCase() === 'tungariyarahul08@gmail.com');
        }
      } catch {
        if (isMounted) {
          setIsAdmin(user!.email?.toLowerCase() === 'tungariyarahul08@gmail.com');
        }
      }
    }
    checkAdmin();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Check waitlist status and remaining seats on mount and when auth state changes
  useEffect(() => {
    checkUserWaitlistStatus(user?.id, user?.email).then((status) => {
      setWaitlistStatus(status);
      if (status.couponCode) {
        setLastAssignedCode(status.couponCode);
      }
    });

    getRemainingWaitlistSeats().then((seats) => {
      setRemainingSeats(seats);
    });
  }, [user?.id, user?.email]);

  const handleClaimWaitlistSpot = async () => {
    if (!user) {
      // Must be logged in to bind coupon to user_id
      navigate('/auth?redirect=/pricing&intent=waitlist');
      return;
    }

    setIsSubmittingWaitlist(true);
    try {
      const res = await joinEarlybirdWaitlist(user.id, user.email);
      if (res.success && res.couponCode) {
        setLastAssignedCode(res.couponCode);
        setWaitlistStatus({
          hasJoined: true,
          couponCode: res.couponCode,
          status: 'unused'
        });
        setRemainingSeats((prev) => (prev !== null ? Math.max(0, prev - 1) : 99));
        setIsSuccessModalOpen(true);
      }
    } catch (err) {
      console.warn('Failed to claim waitlist spot:', err);
    } finally {
      setIsSubmittingWaitlist(false);
    }
  };

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

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  // Pricing calculations
  const proMonthly = region.monthlyPrice;
  const proAnnual = region.annualPrice;
  const proDisplayPrice = isAnnual ? proAnnual : proMonthly;

  const teamMonthly = region.regionId === 'IN' ? 799 : 19;
  const teamAnnual = region.regionId === 'IN' ? 639 : 15.2;
  const teamDisplayPrice = isAnnual ? teamAnnual : teamMonthly;

  const seatsClaimedPercent = remainingSeats !== null 
    ? Math.min(100, Math.max(0, ((100 - remainingSeats) / 100) * 100))
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      <Navbar />

      <main className="flex-1">
        {/* Header Hero Section */}
        <section className="pt-16 pb-12 sm:pt-20 sm:pb-16 text-center max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-xs font-semibold text-blue-700 dark:text-blue-300 mb-5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Simple, Transparent &amp; Fair Regional Pricing</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-950 dark:text-white tracking-tight mb-5 leading-tight">
            Write for free forever.<br />Upgrade when you need cloud sync.
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-8">
            No locked basic markdown features. Enjoy a fast offline-first editor with optional multi-device cloud superpowers.
          </p>

          {/* 2026 Celebration Banner */}
          {isHolidayFreeProActive() && (
            <div className="mb-8 mx-auto max-w-2xl p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/30 dark:border-amber-500/20 text-center shadow-sm animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-bold text-amber-700 dark:text-amber-300 mb-1">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
                <span>2026 Launch Celebration: Pro Is 100% Free For All Users!</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Enjoy unlimited multi-device cloud sync, Word (.docx) export, and publication-grade PDF tooling with zero payment required through <strong>December 31, 2026</strong>.
              </p>
            </div>
          )}

          {/* Billing Cycle Toggle */}
          <div className="flex flex-col items-center justify-center gap-2 mb-10">
            <div className="inline-flex items-center p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-xs font-semibold select-none">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  !isAnnual
                    ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  isAnnual
                    ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-2xs'
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Starter Plan */}
            <div className="relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-200 bg-white dark:bg-neutral-900/90 border-2 border-neutral-950 dark:border-white shadow-xl lg:-translate-y-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-[11px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>100% Free Forever</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">STARTER</span>
                </div>

                <h3 className="text-2xl font-black text-neutral-950 dark:text-white tracking-tight mb-2">
                  Starter Edition
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 min-h-[34px] leading-relaxed mb-6">
                  Ideal for solo writers, researchers, students, and offline privacy purists.
                </p>

                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-4xl sm:text-5xl font-black text-neutral-950 dark:text-white tracking-tight">
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
                    'Dexie IndexedDB instant offline cache',
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
                className="w-full py-3 px-4 rounded-xl text-xs font-bold tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-950 shadow-md hover:shadow-lg"
              >
                <span>Start Writing Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pro Plan (Earlybird Waitlist with Coupon System) */}
            <div className="relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-200 bg-neutral-50/70 dark:bg-neutral-900/50 border-2 border-amber-300 dark:border-amber-700/80 shadow-md">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-neutral-950 text-[11px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                <Sparkles className="w-3 h-3 text-neutral-950" />
                <span>Earlybird VIP • Limited 100 Seats</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-300">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">PRO WRITER</span>
                </div>

                <h3 className="text-2xl font-black text-neutral-950 dark:text-white tracking-tight mb-2">
                  Pro Cloud &amp; Sync
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 min-h-[34px] leading-relaxed mb-6">
                  Multi-device cloud backup, publication-grade PDF covers, and full blueprint templates.
                </p>

                {/* Regional Price Display */}
                <div className="flex items-baseline gap-1.5 mb-3 pb-3 border-b border-neutral-200/60 dark:border-neutral-800">
                  <span className="text-4xl sm:text-5xl font-black text-neutral-950 dark:text-white tracking-tight">
                    {region.currencySymbol}{proDisplayPrice}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                    {isAnnual ? '/ month, billed annually' : '/ month'}
                  </span>
                </div>

                {/* Limited 100 Seats Telemetry */}
                <div className="mb-6 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-amber-900 dark:text-amber-200">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-amber-600" />
                      <span>Earlybird VIP Availability</span>
                    </span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                      {remainingSeats !== null ? `${remainingSeats} / 100 Seats Left` : 'Checking spots...'}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-amber-200/60 dark:bg-amber-900/40 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 dark:bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${seatsClaimedPercent}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-amber-700/80 dark:text-amber-400/80 flex items-center justify-between pt-0.5">
                    <span>Reward: 1 mo free (Monthly) or 2 mo free + 20% off (Annual)</span>
                    <span className="font-mono">
                      {remainingSeats !== null ? `${seatsClaimedPercent.toFixed(0)}% claimed` : '...'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Everything in Starter, plus:</div>
                  {[
                    'Multi-device Supabase Cloud Sync (MVP)',
                    'Automatic background cloud backup',
                    'Publication-grade PDF Studio (Custom cover & TOC)',
                    'Full & unlimited blueprint template library',
                    'Local revision checkpoints & version rollback',
                    '1-Click password-protected web publishing',
                    'Advanced slash commands & power workflows',
                    'Priority support & early access updates'
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                      <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Waitlist Status Card vs Join CTA */}
              <div className="pt-2">
                {waitlistStatus.hasJoined ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        <Check className="w-4 h-4" />
                        <span>VIP Earlybird Spot Confirmed!</span>
                      </div>
                      <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                        Active Pass
                      </span>
                    </div>

                    {waitlistStatus.couponCode && (
                      <div className="flex items-center justify-between bg-white dark:bg-neutral-900 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60">
                        <div>
                          <span className="text-[10px] text-neutral-400 block font-sans">YOUR COUPON CODE</span>
                          <span className="font-mono text-xs font-black text-neutral-900 dark:text-white">
                            {waitlistStatus.couponCode}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopyCoupon(waitlistStatus.couponCode!)}
                          className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs transition-colors cursor-pointer"
                          title="Copy Coupon"
                        >
                          {copiedCoupon ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}

                    <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 text-center">
                      Redeem below to activate your free Pro trial months.
                    </p>
                  </div>
                ) : user ? (
                  <button
                    onClick={handleClaimWaitlistSpot}
                    disabled={isSubmittingWaitlist || (remainingSeats !== null && remainingSeats <= 0)}
                    className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <Gift className="w-4 h-4" />
                    <span>{isSubmittingWaitlist ? 'Securing Spot...' : 'Claim 1 of 100 VIP Spots'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/auth?redirect=/pricing&intent=waitlist')}
                    className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
                  >
                    <span>Sign In to Claim Earlybird Spot</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Team & Studio Plan */}
            <div className="relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-200 bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">TEAM &amp; STUDIO</span>
                </div>

                <h3 className="text-2xl font-black text-neutral-950 dark:text-white tracking-tight mb-2">
                  Team &amp; Studio
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 min-h-[34px] leading-relaxed mb-6">
                  For engineering teams, documentation squads, and collaborative studios.
                </p>

                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-4xl sm:text-5xl font-black text-neutral-950 dark:text-white tracking-tight">
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
                onClick={() => navigate('/auth')}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer bg-neutral-100 hover:bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200"
              >
                <span>Contact Sales</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* Live Coupon Redemption Box */}
        <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-16">
          <div className="p-6 rounded-3xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/90 dark:border-neutral-800 shadow-sm text-center">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Tag className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-950 dark:text-white tracking-tight">
              Have an Earlybird Coupon Code?
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-md mx-auto">
              Enter your one-time code to immediately activate your Pro subscription trial (1 month free on Monthly, 2 months free on Annual).
            </p>

            <form onSubmit={handleRedeemCouponSubmit} className="mt-5 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="text"
                value={redeemInput}
                onChange={(e) => setRedeemInput(e.target.value.toUpperCase())}
                placeholder="e.g. EARLYBIRD-XXXXX"
                className="flex-1 px-4 py-2.5 text-xs font-mono rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-amber-500 uppercase"
              />
              <button
                type="submit"
                disabled={isRedeeming || !redeemInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-950 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isRedeeming ? 'Validating...' : 'Redeem Pro'}
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

        {/* Feature Comparison Matrix Table */}
        <PricingComparisonTable />

        {/* Admin Hub for tungariyarahul08@gmail.com */}
        {isAdmin && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <WaitlistAdminPanel />
          </section>
        )}

        {/* FAQ Accordion Section */}
        <PricingFaqSection />

        {/* CTA Banner */}
        <CtaBanner onOpenTemplates={() => navigate('/editor')} />
      </main>

      <WaitlistSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        email={user?.email || ''}
        couponCode={lastAssignedCode}
      />

      <Footer />
    </div>
  );
};
