import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  CreditCard, 
  Gift, 
  ArrowRight, 
  CheckCircle2, 
  Loader2,
  Lock
} from 'lucide-react';
import { useCheckoutModalStore } from '../../stores/useCheckoutModalStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { 
  SUBSCRIPTION_PLANS, 
  reserveEarlyBirdSpot, 
  redeemPromoCode 
} from '../../services/paymentService';

export const CheckoutModal: React.FC = () => {
  const { isOpen, closeCheckout, selectedPlanId, setSelectedPlanId } = useCheckoutModalStore();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'reserve' | 'promo'>('reserve');
  const [email, setEmail] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync user email when opened
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user?.email, isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCheckout();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCheckout]);

  if (!isOpen) return null;

  const currentPlan = SUBSCRIPTION_PLANS[selectedPlanId] || SUBSCRIPTION_PLANS.lifetime;

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await reserveEarlyBirdSpot(email, selectedPlanId);
      if (res.success) {
        setReservationSuccess(res.message);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Something went wrong. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRedeemPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await redeemPromoCode(promoCode);
      if (res.success) {
        setPromoSuccess(res.message);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Failed to validate promo code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto font-sans">
      <div 
        className="fixed inset-0" 
        onClick={closeCheckout} 
      />

      <div 
        className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col text-neutral-900 dark:text-neutral-100 overflow-hidden z-10"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 sm:px-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-950 dark:text-white leading-tight">
                MD Writer Studio Upgrade
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Early-bird reservations &amp; invite code redemption
              </p>
            </div>
          </div>

          <button
            onClick={closeCheckout}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Plan Selector Pills */}
          <div className="grid grid-cols-2 gap-2.5 p-1 bg-neutral-100 dark:bg-neutral-950 rounded-xl border border-neutral-200/80 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => {
                setSelectedPlanId('lifetime');
                setReservationSuccess(null);
                setErrorMessage(null);
              }}
              className={`p-3 rounded-lg text-left transition-all cursor-pointer relative ${
                selectedPlanId === 'lifetime'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs uppercase tracking-wider font-mono">Lifetime</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold">
                  $49
                </span>
              </div>
              <div className="text-xs opacity-80 font-normal">Early-Bird Deal</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedPlanId('pro_monthly');
                setReservationSuccess(null);
                setErrorMessage(null);
              }}
              className={`p-3 rounded-lg text-left transition-all cursor-pointer relative ${
                selectedPlanId === 'pro_monthly'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs uppercase tracking-wider font-mono">Pro Studio</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold">
                  $8/mo
                </span>
              </div>
              <div className="text-xs opacity-80 font-normal">Monthly Plan</div>
            </button>
          </div>

          {/* Selected Plan Details Card */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <h3 className="font-bold text-sm text-neutral-950 dark:text-white">
                  {currentPlan.name}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {currentPlan.tagline}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-neutral-950 dark:text-white font-mono">
                  ${currentPlan.priceUSD}
                </span>
                <div className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                  {currentPlan.intervalText}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-800 text-xs">
              {currentPlan.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                  <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mode Switcher: Early-Bird Reservation vs Promo Code */}
          <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab('reserve');
                setErrorMessage(null);
              }}
              className={`pb-2.5 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'reserve'
                  ? 'border-neutral-950 dark:border-white text-neutral-950 dark:text-white font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Reserve Early-Bird Spot</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('promo');
                setErrorMessage(null);
              }}
              className={`pb-2.5 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'promo'
                  ? 'border-neutral-950 dark:border-white text-neutral-950 dark:text-white font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Redeem Promo / Invite Code</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <span className="font-semibold">Notice:</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Tab 1: Early-Bird Reservation */}
          {activeTab === 'reserve' && (
            <div className="space-y-4">
              {reservationSuccess ? (
                <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-neutral-950 dark:text-white">
                    Early-Bird Spot Confirmed!
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-md mx-auto">
                    {reservationSuccess}
                  </p>
                  <button
                    type="button"
                    onClick={closeCheckout}
                    className="px-4 py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-xs transition-opacity hover:opacity-90 cursor-pointer"
                  >
                    Continue Writing
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReserve} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="writer@example.com"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    />
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                      No payment is charged today. We lock in your early-bird pricing and send your activation link when live checkout opens.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:translate-y-[1px] disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Reserving Spot...</span>
                      </>
                    ) : (
                      <>
                        <span>Lock In ${currentPlan.priceUSD} Early-Bird Rate</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Tab 2: Promo / Invite Code */}
          {activeTab === 'promo' && (
            <div className="space-y-4">
              {promoSuccess ? (
                <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-neutral-950 dark:text-white">
                    Pro Studio Activated!
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-md mx-auto">
                    {promoSuccess}
                  </p>
                  <button
                    type="button"
                    onClick={closeCheckout}
                    className="px-4 py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-xs transition-opacity hover:opacity-90 cursor-pointer"
                  >
                    Open Studio
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRedeemPromo} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Invite or Promo Code
                    </label>
                    <input
                      type="text"
                      required
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="e.g. EARLYBIRD, PRO2026, VIP"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs sm:text-sm font-mono text-neutral-950 dark:text-white uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    />
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                      Beta testers and early contributors can apply their invitation code for instant Pro activation.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:translate-y-[1px] disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Validating Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Activate Pro Tier</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Payment Infrastructure Disclaimer */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/70 dark:border-neutral-800/80 flex items-start gap-2.5 text-[11px] text-neutral-500 dark:text-neutral-400">
            <Lock className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                Payment Infrastructure Architecture:
              </span>{' '}
              Automated card checkout via Stripe and Razorpay is currently staged for launch. Reserving your spot locks in early-bird pricing with zero price inflation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
