/**
 * MD Writer — Payment & Subscription Service Base
 * 
 * Provides an extensible architectural foundation for monetization:
 * 1. Early-Bird Reservation & Lead Capture (zero-cost, no Stripe/Razorpay needed yet)
 * 2. Promo / Beta Access Code redemption
 * 3. Plug-and-play adapter hooks for Stripe and Razorpay Checkout
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { setLocalProUnlocked, useAuthStore } from '../stores/useAuthStore';

export type SubscriptionPlanId = 'lifetime' | 'pro_monthly' | 'pro_annual';

export interface PlanConfig {
  id: SubscriptionPlanId;
  name: string;
  tagline: string;
  priceUSD: number;
  intervalText: string;
  badge?: string;
  features: string[];
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanId, PlanConfig> = {
  lifetime: {
    id: 'lifetime',
    name: 'Early-Bird Lifetime License',
    tagline: 'Permanent access with lifetime updates for craft-focused writers.',
    priceUSD: 49,
    intervalText: 'one-time payment • lifetime updates',
    badge: 'Limited Early-Bird ($49)',
    features: [
      'Lifetime license for all future v2.x and v3.x releases',
      'Encrypted multi-device cloud backup & sync',
      'Unlimited delta version snapshots & rollback',
      'Camera-ready publication PDF studio export [Beta]',
      'Clean Word DOCX conversion with equations [Beta]',
      'Zero subscription fees forever',
    ],
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro Studio (Monthly)',
    tagline: 'Continuous cross-device sync and managed AI quota for professionals.',
    priceUSD: 8,
    intervalText: 'per month • billed monthly',
    features: [
      'Encrypted cloud synchronization across all devices',
      'Managed Gemini 3.x AI quota without personal GCP key',
      'Delta revision history & visual diff viewer',
      'Password-protected public sharing links',
      'Priority email & Discord engineering support',
    ],
  },
  pro_annual: {
    id: 'pro_annual',
    name: 'Pro Studio (Annual)',
    tagline: 'Best value for year-round research and long-form writing.',
    priceUSD: 72, // $6/mo billed annually
    intervalText: '$6/month • $72 billed annually (save 25%)',
    badge: 'Save 25%',
    features: [
      'Everything in Pro Monthly',
      'Early access to new Mimo AI experimental capabilities',
      'Priority roadmap feature voting',
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

const VALID_PROMO_CODES = new Set([
  'EARLYBIRD',
  'PRO2026',
  'VIP',
  'FOUNDER',
  'LOCALFIRST',
  'MDSTUDIO',
]);

/**
 * Stores early-bird lead reservation.
 * Saves to localStorage immediately and persists to Supabase feedbacks/leads table if available.
 */
export async function reserveEarlyBirdSpot(
  email: string,
  planId: SubscriptionPlanId = 'lifetime'
): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  const reservation: EarlyBirdReservation = {
    email: cleanEmail,
    planId,
    timestamp: Date.now(),
    source: 'checkout_modal_reservation',
  };

  // 1. Cache reservation locally
  try {
    const existingRaw = localStorage.getItem('md_writer_early_bird_leads');
    const list: EarlyBirdReservation[] = existingRaw ? JSON.parse(existingRaw) : [];
    list.push(reservation);
    localStorage.setItem('md_writer_early_bird_leads', JSON.stringify(list));
  } catch (err) {
    console.warn('[paymentService] Failed to cache lead locally:', err);
  }

  // 2. Submit to Supabase feedbacks table (category: early_bird_reservation) so admin can see it
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('feedbacks').insert({
        rating: 5,
        category: 'other',
        message: `[EARLY-BIRD RESERVATION] Plan: ${planId} • Email: ${cleanEmail}`,
        email: cleanEmail,
        client_info: {
          planId,
          reservationTimestamp: reservation.timestamp,
          userAgent: navigator.userAgent,
        },
      });
    } catch (err) {
      console.warn('[paymentService] Could not sync reservation to Supabase:', err);
    }
  }

  return {
    success: true,
    message: `Spot reserved! Your early-bird rate for ${SUBSCRIPTION_PLANS[planId].name} is locked in. We will email your activation link as soon as payments open!`,
  };
}

/**
 * Validates and redeems a promotional or beta tester invite code.
 */
export async function redeemPromoCode(code: string): Promise<PromoRedemptionResult> {
  const clean = code.trim().toUpperCase();

  if (!clean) {
    return { success: false, message: 'Please enter an invite or promo code.' };
  }

  if (VALID_PROMO_CODES.has(clean)) {
    // Unlock Pro tier locally
    setLocalProUnlocked(true);

    // Refresh profile state in useAuthStore
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
      message: `Code "${clean}" applied successfully! Pro Studio features are now active on this browser.`,
    };
  }

  return {
    success: false,
    message: 'Invalid or expired invite code. Please check for typos or join the early-bird list.',
  };
}

/**
 * ─── FUTURE STRIPE ADAPTER (READY FOR ACTIVATION) ───
 * When you are ready to connect Stripe:
 * 1. Install '@stripe/stripe-js'
 * 2. Set VITE_STRIPE_PUBLISHABLE_KEY in .env
 * 3. Call your backend serverless endpoint (/api/create-checkout-session)
 */
export async function initiateStripeCheckout(
  _planId: SubscriptionPlanId,
  _customerEmail?: string
): Promise<{ success: boolean; message: string }> {
  // Currently in pre-launch / lead collection phase
  return {
    success: false,
    message: 'Card checkout via Stripe is opening soon. Reserve your spot above to lock in early-bird pricing!',
  };
}

/**
 * ─── FUTURE RAZORPAY ADAPTER (READY FOR ACTIVATION) ───
 * When you are ready to connect Razorpay:
 * 1. Add Razorpay checkout.js script
 * 2. Set VITE_RAZORPAY_KEY_ID in .env
 * 3. Initialize Razorpay options with order ID
 */
export async function initiateRazorpayCheckout(
  _planId: SubscriptionPlanId,
  _customerEmail?: string
): Promise<{ success: boolean; message: string }> {
  return {
    success: false,
    message: 'Razorpay checkout is opening soon. Please reserve your spot above to lock in early-bird pricing!',
  };
}
