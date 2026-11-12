import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import { SubscriptionPlanId } from './paymentService';

export const TRIAL_DURATION_DAYS = 14;
export const TRIAL_WARNING_DAYS = 3;

export interface TrialProfileCandidate {
  subscriptionTier?: string | null;
  planId?: string | null;
  proExpiresAt?: string | null;
  trialStartedAt?: string | null;
  subscription_tier?: string | null;
  plan_id?: string | null;
  pro_expires_at?: string | null;
  trial_started_at?: string | null;
}

export interface TrialStatus {
  status: 'none' | 'active' | 'warning' | 'expired';
  daysRemaining: number;
  shouldNotifyToday: boolean;
  shouldDeactivate: boolean;
  expiresAt?: string;
  trialStartedAt?: string;
}

export function calculateDaysRemaining(expiresAt: string | null | undefined, now = Date.now()): number {
  if (!expiresAt) return 0;
  const expiryTime = new Date(expiresAt).getTime();
  if (isNaN(expiryTime)) return 0;
  const diffMs = expiryTime - now;
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isTrialWarningNotifiedToday(
  dateStr = getTodayKey(),
  storageGetter: (k: string) => string | null = (k) => {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null;
    } catch {
      return null;
    }
  }
): boolean {
  const key = `md_writer_trial_warning_${dateStr}`;
  return Boolean(storageGetter(key));
}

export function markTrialWarningNotifiedToday(
  dateStr = getTodayKey(),
  storageSetter: (k: string, v: string) => void = (k, v) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(k, v);
      }
    } catch {}
  }
): void {
  const key = `md_writer_trial_warning_${dateStr}`;
  storageSetter(key, 'true');
}

export function computeTrialStatus(
  profile?: TrialProfileCandidate | null,
  now = Date.now(),
  notifiedChecker: () => boolean = () => isTrialWarningNotifiedToday()
): TrialStatus {
  if (!profile) {
    return {
      status: 'none',
      daysRemaining: 0,
      shouldNotifyToday: false,
      shouldDeactivate: false,
    };
  }

  const tier = profile.subscriptionTier || profile.subscription_tier;
  const plan = profile.planId || profile.plan_id;
  const proExpiresAt = profile.proExpiresAt || profile.pro_expires_at;
  const trialStartedAt = profile.trialStartedAt || profile.trial_started_at;

  if (tier !== 'pro' || plan === 'lifetime') {
    return {
      status: 'none',
      daysRemaining: 0,
      shouldNotifyToday: false,
      shouldDeactivate: false,
    };
  }

  // If user is pro with an expiration date
  if (!proExpiresAt) {
    return {
      status: 'active',
      daysRemaining: 999,
      shouldNotifyToday: false,
      shouldDeactivate: false,
    };
  }

  const days = calculateDaysRemaining(proExpiresAt, now);

  if (days <= 0) {
    return {
      status: 'expired',
      daysRemaining: 0,
      shouldNotifyToday: false,
      shouldDeactivate: true,
      expiresAt: proExpiresAt,
      trialStartedAt: trialStartedAt || undefined,
    };
  }

  if (days <= TRIAL_WARNING_DAYS) {
    const alreadyNotified = notifiedChecker();
    return {
      status: 'warning',
      daysRemaining: days,
      shouldNotifyToday: !alreadyNotified,
      shouldDeactivate: false,
      expiresAt: proExpiresAt,
      trialStartedAt: trialStartedAt || undefined,
    };
  }

  return {
    status: 'active',
    daysRemaining: days,
    shouldNotifyToday: false,
    shouldDeactivate: false,
    expiresAt: proExpiresAt,
    trialStartedAt: trialStartedAt || undefined,
  };
}

/**
 * Activates a 14-day free trial of Pro Studio for the user.
 * Sets subscription_tier = 'pro', plan_id, trial_started_at = now, pro_expires_at = now + 14 days.
 */
export async function activateProFreeTrial(
  email: string,
  planId: SubscriptionPlanId = 'pro_annual'
): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

  const trialPayload = {
    subscription_tier: 'pro' as const,
    plan_id: planId,
    trial_started_at: now.toISOString(),
    pro_expires_at: expiresAt.toISOString(),
  };

  // 1. Update localStorage cache for instant guest/local feedback
  try {
    localStorage.setItem('md_writer_pro_trial', JSON.stringify(trialPayload));
  } catch {}

  // 2. If authenticated and Supabase configured, persist to profiles
  const authStore = useAuthStore.getState();
  const userId = authStore.user?.id;

  if (userId && isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_tier: 'pro',
          plan_id: planId,
          pro_expires_at: trialPayload.pro_expires_at,
        })
        .eq('id', userId);

      if (error) {
        console.warn('[trialService] Could not update profile in Supabase:', error);
      } else {
        await authStore.refreshProfile();
      }
    } catch (err) {
      console.warn('[trialService] Failed to sync trial to Supabase:', err);
    }
  }

  return {
    success: true,
    message: `Your 14-day Pro Studio trial is now active until ${expiresAt.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })}. Enjoy full studio features!`,
  };
}

/**
 * Enforces trial deactivation if trial has expired (Day 15+).
 */
export async function enforceTrialLifecycle(): Promise<void> {
  const authStore = useAuthStore.getState();
  const user = authStore.user;

  const status = computeTrialStatus(user);
  if (status.shouldDeactivate && user?.id && isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('profiles')
        .update({
          subscription_tier: 'free',
          plan_id: 'free',
          pro_expires_at: null,
        })
        .eq('id', user.id);

      await authStore.refreshProfile();
    } catch (err) {
      console.warn('[trialService] Error deactivating expired trial:', err);
    }
  }
}
