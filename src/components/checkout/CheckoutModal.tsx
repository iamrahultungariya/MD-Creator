import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useCheckoutModalStore } from '../../stores/useCheckoutModalStore';
import { useAuthStore } from '../../stores/useAuthStore';
import {
  SUBSCRIPTION_PLANS,
  reserveEarlyBirdSpot,
  redeemPromoCode,
} from '../../services/paymentService';

export const CheckoutModal: React.FC = () => {
  const { isOpen, closeCheckout, selectedPlanId, entryPlanGroup, setSelectedPlanId } =
    useCheckoutModalStore();
  const { user } = useAuthStore();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [email, setEmail] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync user email and reset transient state when dialog opens
  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage(null);
    setReservationSuccess(null);
    setPromoSuccess(null);
    setShowPromoInput(false);
    if (user?.email) {
      setEmail((prev) => prev || user.email);
    }
  }, [isOpen, user?.email]);

  // Sync native <dialog> showModal() / close() with Zustand store
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Safari fallback for light-dismiss when closedby="any" is unsupported
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;

    const isOutside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };

    let pressedOutside = false;
    const onPointerDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (pressedOutside && isOutside(e)) {
        dialog.close();
      }
      pressedOutside = false;
    };

    dialog.addEventListener('pointerdown', onPointerDown);
    dialog.addEventListener('pointerup', onPointerUp);
    return () => {
      dialog.removeEventListener('pointerdown', onPointerDown);
      dialog.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  const handleDialogClose = () => {
    const dialog = dialogRef.current;
    if (dialog) {
      dialog.returnValue = '';
    }
    if (isOpen) {
      closeCheckout();
    }
  };

  const currentPlan = SUBSCRIPTION_PLANS[selectedPlanId] || SUBSCRIPTION_PLANS.lifetime;
  const priceDisplay =
    currentPlan.id === 'pro_annual' ? '$6' : `$${currentPlan.priceUSD}`;
  const priceUnit =
    currentPlan.id === 'lifetime' ? 'one-time' : '/mo';

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await reserveEarlyBirdSpot(email, currentPlan.id);
      if (res.success) {
        setReservationSuccess(res.message);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Could not save your reservation. Please verify your connection and retry.');
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
      setErrorMessage('Failed to validate invite code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'any' } as any)}
      aria-labelledby="checkout-dialog-title"
      onClose={handleDialogClose}
      className="m-auto w-[calc(100%-1.5rem)] max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-0 text-neutral-900 dark:text-neutral-100 shadow-2xl font-sans"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4">
        <div>
          <h2
            id="checkout-dialog-title"
            className="text-sm font-semibold tracking-tight text-neutral-950 dark:text-white"
          >
            {currentPlan.name}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {currentPlan.tagline}
          </p>
        </div>

        <button
          type="button"
          onClick={closeCheckout}
          aria-label="Close checkout"
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-5">
        {/* Locked Plan Summary Row (No Lifetime ↔ Pro switcher) */}
        <div className="pb-5 border-b border-neutral-200 dark:border-neutral-800 space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold tracking-tight text-neutral-950 dark:text-white tabular-nums">
                {priceDisplay}
              </span>
              <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                {priceUnit}
              </span>
            </div>

            {entryPlanGroup === 'pro' && (
              <div
                role="group"
                aria-label="Pro Studio billing interval"
                className="inline-flex items-center p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900"
              >
                <button
                  type="button"
                  aria-pressed={selectedPlanId === 'pro_annual'}
                  onClick={() => {
                    setSelectedPlanId('pro_annual');
                    setReservationSuccess(null);
                    setErrorMessage(null);
                  }}
                  className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    selectedPlanId === 'pro_annual'
                      ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-2xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                  }`}
                >
                  Yearly -25%
                </button>
                <button
                  type="button"
                  aria-pressed={selectedPlanId === 'pro_monthly'}
                  onClick={() => {
                    setSelectedPlanId('pro_monthly');
                    setReservationSuccess(null);
                    setErrorMessage(null);
                  }}
                  className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    selectedPlanId === 'pro_monthly'
                      ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-2xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                  }`}
                >
                  Monthly
                </button>
              </div>
            )}
          </div>

          <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            {currentPlan.intervalText}
          </div>

          <ul className="space-y-1 pt-1 text-xs text-neutral-600 dark:text-neutral-400">
            {currentPlan.features.slice(0, 3).map((feat, idx) => (
              <li key={idx} className="leading-snug">
                · {feat}
              </li>
            ))}
          </ul>
        </div>

        {/* Inline Error Notice */}
        {errorMessage && (
          <div className="px-3 py-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
            {errorMessage}
          </div>
        )}

        {/* Confirmation States */}
        {promoSuccess ? (
          <div className="py-3 space-y-3">
            <div className="text-sm font-semibold text-neutral-950 dark:text-white">
              Pro Studio Activated
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {promoSuccess}
            </p>
            <button
              type="button"
              onClick={closeCheckout}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Continue to Studio
            </button>
          </div>
        ) : reservationSuccess ? (
          <div className="py-3 space-y-3">
            <div className="text-sm font-semibold text-neutral-950 dark:text-white">
              Early-Bird Rate Locked
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {reservationSuccess}
            </p>
            <button
              type="button"
              onClick={closeCheckout}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : !showPromoInput ? (
          /* Primary Reservation Flow */
          <form onSubmit={handleReserve} className="space-y-4">
            <div>
              <label
                htmlFor="checkout-email-input"
                className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                Email for activation link
              </label>
              <input
                id="checkout-email-input"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs sm:text-sm text-neutral-950 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer active:translate-y-[1px] disabled:opacity-60"
            >
              {isSubmitting
                ? 'Locking in rate...'
                : currentPlan.id === 'lifetime'
                ? 'Reserve Lifetime Rate ($49)'
                : currentPlan.id === 'pro_annual'
                ? 'Lock In Pro Rate ($6/mo)'
                : 'Lock In Pro Rate ($8/mo)'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setShowPromoInput(true);
                  setErrorMessage(null);
                }}
                className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white underline underline-offset-4 cursor-pointer transition-colors"
              >
                Have an invite or promo code?
              </button>
            </div>
          </form>
        ) : (
          /* Secondary Inline Promo Redemption */
          <form onSubmit={handleRedeemPromo} className="space-y-4">
            <div>
              <label
                htmlFor="checkout-promo-input"
                className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                Invite or promo code
              </label>
              <input
                id="checkout-promo-input"
                type="text"
                required
                autoFocus
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="EARLYBIRD"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs sm:text-sm font-mono uppercase tracking-wider text-neutral-950 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 font-semibold text-xs sm:text-sm transition-colors cursor-pointer active:translate-y-[1px] disabled:opacity-60"
            >
              {isSubmitting ? 'Validating...' : 'Apply Code'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setShowPromoInput(false);
                  setErrorMessage(null);
                }}
                className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white underline underline-offset-4 cursor-pointer transition-colors"
              >
                Back to early-bird reservation
              </button>
            </div>
          </form>
        )}

        {/* Quiet Gateway Staging Footnote */}
        <p className="pt-3 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
          Stripe and Razorpay checkout are staged for launch. Reserving locks your rate with zero charge today.
        </p>
      </div>
    </dialog>
  );
};
