/**
 * MD Writer — Payment & Subscription Service Base
 *
 * Provides a clean, gateway-ready foundation for monetization:
 * 1. Early-Bird Reservation & Lead Capture (persisted locally + via Supabase RPC)
 * 2. Promo / Invite Code redemption (server-validated when signed in, local fallback offline)
 * 3. Typed adapter hooks for future Stripe and Razorpay Checkout activation
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { setLocalProUnlocked, useAuthStore } from '../stores/useAuthStore';

export type SubscriptionPlanId = 'lifetime' | 'pro_monthly' | 'pro_annual';
export type PaymentGatewayId = 'early_bird' | 'stripe' | 'razorpay';

export interface PlanConfig {
  id: SubscriptionPlanId;
  name: string;
  shortName: string;
  tagline: string;
  priceUSD: number;
  amountCentsUSD: number;
  amountPaiseINR: number;
  billingInterval: 'one_time' | 'monthly' | 'annual';
  intervalText: string;
  badge?: string;
  features: string[];
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanId, PlanConfig> = {
  lifetime: {
    id: 'lifetime',
    name: 'Early-Bird Lifetime',
    shortName: 'Lifetime License',
    tagline: 'Permanent Studio Pro access with lifetime updates.',
    priceUSD: 49,
    amountCentsUSD: 4900,
    amountPaiseINR: 410000,
    billingInterval: 'one_time',
    intervalText: 'one-time payment · lifetime updates',
    badge: 'Early-Bird Deal',
    features: [
      'Lifetime license for all v2.x and v3.x releases',
      'Encrypted multi-device cloud backup & sync',
      'Unlimited delta snapshots & rollback history',
      'Camera-ready Vector PDF & Word DOCX export',
    ],
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro Studio',
    shortName: 'Pro Monthly',
    tagline: 'Continuous cross-device sync and managed AI quota.',
    priceUSD: 8,
    amountCentsUSD: 800,
    amountPaiseINR: 69900,
    billingInterval: 'monthly',
    intervalText: 'per month · billed monthly',
    features: [
      'Encrypted cloud sync across all devices',
      'Managed Gemini 3.x AI quota without personal key',
      'Delta revision history & password-protected sharing',
      'Priority email & engineering support',
    ],
  },
  pro_annual: {
    id: 'pro_annual',
    name: 'Pro Studio',
    shortName: 'Pro Annual',
    tagline: 'Continuous cross-device sync and managed AI quota.',
    priceUSD: 72, // $6/mo billed annually
    amountCentsUSD: 7200,
    amountPaiseINR: 599900,
    billingInterval: 'annual',
    intervalText: '$6/month · $72 billed annually',
    badge: 'Save 25%',
    features: [
      'Encrypted cloud sync across all devices',
      'Managed Gemini 3.x AI quota without personal key',
      'Delta revision history & password-protected sharing',
      'Early access to experimental Mimo AI workflows',
    ],
  },
};

export interface EarlyBirdReservation {
  email: string;
  planId: SubscriptionPlanId;
  timestamp: number;
  source: string;
}

export interface PromoRedemptionResult {
  success: boolean;
  message: string;
  grantedTier?: 'pro';
}

export interface GatewayCheckoutResult {
  success: boolean;
  status: 'staged' | 'redirect' | 'error';
  message: string;
}

const VALID_PROMO_CODES = new Set([
  'EARLYBIRD',
  'PRO2026',
  'VIP',
  'FOUNDER',
  'LOCALFIRST',
  'MDSTUDIO',
]);

/**
 * Stores early-bird lead reservation locally and via Supabase `reserve_early_bird_spot` RPC.
 */
export async function reserveEarlyBirdSpot(
  email: string,
  planId: SubscriptionPlanId = 'lifetime',
  preferredGateway: PaymentGatewayId = 'early_bird'
): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  const plan = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.lifetime;
  const reservation: EarlyBirdReservation = {
    email: cleanEmail,
    planId,
    timestamp: Date.now(),
    source: 'checkout_modal_reservation',
  };

  try {
    const existingRaw = localStorage.getItem('md_writer_early_bird_leads');
    const list: EarlyBirdReservation[] = existingRaw ? JSON.parse(existingRaw) : [];
    const deduped = list.filter((item) => !(item.email === cleanEmail && item.planId === planId));
    deduped.push(reservation);
    localStorage.setItem('md_writer_early_bird_leads', JSON.stringify(deduped));
  } catch {
    // Ignore localStorage unavailability in restricted environments
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.rpc('reserve_early_bird_spot', {
        p_email: cleanEmail,
        p_plan_id: planId,
        p_preferred_gateway: preferredGateway,
        p_client_info: {
          planId,
          reservationTimestamp: reservation.timestamp,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        },
      });
    } catch (err) {
      console.warn('[paymentService] Could not sync reservation to Supabase:', err);
    }
  }

  const rateLabel =
    plan.id === 'lifetime'
      ? `$${plan.priceUSD} one-time`
      : plan.id === 'pro_annual'
      ? '$6/month ($72/year)'
      : '$8/month';

  return {
    success: true,
    message: `Your ${plan.name} rate (${rateLabel}) is locked for ${cleanEmail}. We will send your activation link as soon as live checkout opens.`,
  };
}

/**
 * Validates and redeems an invite or promotional code.
 * Uses server-side `redeem_promo_code` RPC when signed in, falling back to local unlock for guests.
 */
export async function redeemPromoCode(code: string): Promise<PromoRedemptionResult> {
  const clean = code.trim().toUpperCase();

  if (!clean) {
    return { success: false, message: 'Please enter an invite or promo code.' };
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data, error } = await supabase.rpc('redeem_promo_code', { p_code: clean });
        if (!error && data && typeof data === 'object') {
          if ((data as any).success) {
            setLocalProUnlocked(true);
            await useAuthStore.getState().refreshProfile();
            return {
              success: true,
              grantedTier: 'pro',
              message:
                (data as any).message ||
                `Code "${clean}" applied. Pro Studio features are now active on your account.`,
            };
          }
          if ((data as any).error) {
            return { success: false, message: String((data as any).error) };
          }
        }
      }
    } catch (err) {
      console.warn('[paymentService] Promo RPC fallback:', err);
    }
  }

  if (VALID_PROMO_CODES.has(clean)) {
    setLocalProUnlocked(true);

    const user = useAuthStore.getState().user;
    if (user) {
      useAuthStore.setState({
        user: {
          ...user,
          subscriptionTier: 'pro',
        },
      });
    }

    return {
      success: true,
      grantedTier: 'pro',
      message: `Code "${clean}" applied. Pro Studio features are now active on this browser.`,
    };
  }

  return {
    success: false,
    message: 'Invalid or expired invite code. Please check for typos or reserve your early-bird spot.',
  };
}

/**
 * ─── FUTURE STRIPE ADAPTER (READY FOR ACTIVATION) ───
 * 1. Install '@stripe/stripe-js'
 * 2. Set VITE_STRIPE_PUBLISHABLE_KEY in .env
 * 3. Point to serverless /api/create-checkout-session creating a payment_orders row
 */
export async function initiateStripeCheckout(
  _planId: SubscriptionPlanId,
  _customerEmail?: string
): Promise<GatewayCheckoutResult> {
  return {
    success: false,
    status: 'staged',
    message: 'Stripe card checkout is staged for launch. Reserve above to lock in your rate today.',
  };
}

/**
 * ─── FUTURE RAZORPAY ADAPTER (READY FOR ACTIVATION) ───
 * 1. Load Razorpay checkout.js script
 * 2. Set VITE_RAZORPAY_KEY_ID in .env
 * 3. Create backend order via payment_orders and open Razorpay modal
 */
export async function initiateRazorpayCheckout(
  _planId: SubscriptionPlanId,
  _customerEmail?: string
): Promise<GatewayCheckoutResult> {
  return {
    success: false,
    status: 'staged',
    message: 'Razorpay UPI & card checkout is staged for launch. Reserve above to lock in your rate today.',
  };
}
