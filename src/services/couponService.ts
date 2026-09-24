import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface RegionalPricing {
  regionId: 'US' | 'IN' | 'SEA' | 'ROW';
  regionName: string;
  currencyCode: string;
  currencySymbol: string;
  monthlyPrice: number;
  annualPrice: number; // per month when billed annually
  annualBilledTotal: number;
  savingsPercent: number;
  note: string;
}

export const REGIONAL_PRICING_MAP: Record<string, RegionalPricing> = {
  US: {
    regionId: 'US',
    regionName: 'United States & Global',
    currencyCode: 'USD',
    currencySymbol: '$',
    monthlyPrice: 8,
    annualPrice: 6.4,
    annualBilledTotal: 76.8,
    savingsPercent: 20,
    note: 'Standard Global Tier'
  },
  IN: {
    regionId: 'IN',
    regionName: 'India (PPP Discount)',
    currencyCode: 'INR',
    currencySymbol: '₹',
    monthlyPrice: 299,
    annualPrice: 239,
    annualBilledTotal: 2868,
    savingsPercent: 20,
    note: '~55% PPP discount applied'
  },
  SEA: {
    regionId: 'SEA',
    regionName: 'SEA / LATAM / Africa',
    currencyCode: 'USD',
    currencySymbol: '$',
    monthlyPrice: 4,
    annualPrice: 3.2,
    annualBilledTotal: 38.4,
    savingsPercent: 20,
    note: '50% Regional PPP parity'
  },
  ROW: {
    regionId: 'ROW',
    regionName: 'Rest of World',
    currencyCode: 'USD',
    currencySymbol: '$',
    monthlyPrice: 8,
    annualPrice: 6.4,
    annualBilledTotal: 76.8,
    savingsPercent: 20,
    note: 'Standard Global Tier'
  }
};

/**
 * Fast client-side detection of region using browser Intl timezone with zero latency.
 */
export function detectUserRegion(): RegionalPricing {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Calcutta') || tz.includes('Kolkata') || tz.includes('India')) {
      return REGIONAL_PRICING_MAP.IN;
    }
    if (
      tz.includes('Jakarta') ||
      tz.includes('Bangkok') ||
      tz.includes('Manila') ||
      tz.includes('Saigon') ||
      tz.includes('Kuala_Lumpur') ||
      tz.includes('Sao_Paulo') ||
      tz.includes('Buenos_Aires') ||
      tz.includes('Lagos') ||
      tz.includes('Nairobi') ||
      tz.includes('Cairo')
    ) {
      return REGIONAL_PRICING_MAP.SEA;
    }
  } catch (e) {
    // fallback to US
  }
  return REGIONAL_PRICING_MAP.US;
}

export interface WaitlistStatus {
  hasJoined: boolean;
  couponCode?: string | null;
  status?: string;
  expiresAt?: string | null;
}

const LOCAL_STORAGE_KEY = 'mdwriter_waitlist_status_v2';

/**
 * Checks if the user has already joined the waitlist.
 * Queries Supabase DB on first load and caches in localStorage so the user never sees
 * the "join" button repeatedly.
 */
export async function checkUserWaitlistStatus(userId?: string | null, email?: string | null): Promise<WaitlistStatus> {
  // 1. Check local storage cache first for instant UI response
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as WaitlistStatus;
        if (parsed.hasJoined) return parsed;
      } catch (e) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }

  if (!userId || !isSupabaseConfigured() || !supabase) {
    // Fallback: check legacy email key
    if (typeof window !== 'undefined') {
      const legacyEmail = localStorage.getItem('mdwriter_waitlist_email');
      if (legacyEmail && email && legacyEmail.toLowerCase() === email.toLowerCase()) {
        const status: WaitlistStatus = { hasJoined: true, couponCode: null, status: 'registered' };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(status));
        return status;
      }
    }
    return { hasJoined: false };
  }

  try {
    // 2. Call the hardened Supabase RPC helper (uses auth session directly)
    const { data, error } = await supabase.rpc('check_user_waitlist_status');
    if (!error && data) {
      const result: WaitlistStatus = {
        hasJoined: Boolean(data.has_joined),
        couponCode: data.coupon_code || null,
        status: data.status,
        expiresAt: data.expires_at || null
      };

      if (typeof window !== 'undefined' && result.hasJoined) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(result));
      }
      return result;
    }

    // 3. Direct table query fallback: coupon_redemptions
    const { data: couponData } = await supabase
      .from('coupon_redemptions')
      .select('coupon_code, status, expires_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (couponData) {
      const result: WaitlistStatus = {
        hasJoined: true,
        couponCode: couponData.coupon_code,
        status: couponData.status,
        expiresAt: couponData.expires_at
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(result));
      }
      return result;
    }

    // 4. Check public.waitlist table by email if user has joined via waitlist form
    if (email) {
      const { data: waitlistRecord } = await supabase
        .from('waitlist')
        .select('email, plan')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (waitlistRecord) {
        const result: WaitlistStatus = {
          hasJoined: true,
          couponCode: null,
          status: 'registered'
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(result));
        }
        return result;
      }
    }
  } catch (err) {
    console.warn('[Waitlist] Failed to check status from DB:', err);
  }

  // Not joined in database - store false in localStorage so UI is deterministic
  const notJoinedResult: WaitlistStatus = { hasJoined: false };
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notJoinedResult));
  }
  return notJoinedResult;
}

/**
 * Returns the count of remaining VIP Earlybird seats out of 100 based on real database records.
 */
export async function getRemainingWaitlistSeats(): Promise<number> {
  const TOTAL_SEATS = 100;
  if (!isSupabaseConfigured() || !supabase) {
    if (typeof window !== 'undefined') {
      const localEmail = localStorage.getItem('mdwriter_waitlist_email');
      return localEmail ? 99 : 100;
    }
    return 100;
  }

  try {
    // 1. Query real exact count from public.waitlist table
    const { count: waitlistCount } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    // 2. Query real exact count from public.coupon_redemptions table
    const { count: couponCount } = await supabase
      .from('coupon_redemptions')
      .select('*', { count: 'exact', head: true });

    // Take the actual claimed count from real DB records
    const actualClaimed = Math.max(waitlistCount ?? 0, couponCount ?? 0);
    return Math.max(0, TOTAL_SEATS - actualClaimed);
  } catch (e) {
    console.warn('[Waitlist] Failed to fetch real seats count from DB:', e);
    return 100;
  }
}

/**
 * Generates a unique coupon code in the format EARLYBIRD-XXXXX
 */
function generateCouponCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 5; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `EARLYBIRD-${rand}`;
}

/**
 * Registers an authenticated user for the Earlybird waitlist and issues a unique coupon code.
 */
export async function joinEarlybirdWaitlist(
  _userId: string,
  email: string
): Promise<{ success: boolean; couponCode?: string; error?: string }> {
  // 1. If Supabase is configured, use secure server-side atomic procedure
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.rpc('join_waitlist');

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data?.success) {
        return { success: false, error: data?.error || 'Failed to claim waitlist spot.' };
      }

      const assignedCode = data.coupon_code;
      const expiresAt = data.expires_at || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();

      const status: WaitlistStatus = {
        hasJoined: true,
        couponCode: assignedCode,
        status: data.status || 'unused',
        expiresAt
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(status));
        localStorage.setItem('mdwriter_waitlist_email', email);
      }

      return { success: true, couponCode: assignedCode };
    } catch (err: any) {
      console.warn('[Coupon] RPC error, falling back:', err);
    }
  }

  // 2. Offline simulation fallback
  const couponCode = generateCouponCode();
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 6);

  const status: WaitlistStatus = {
    hasJoined: true,
    couponCode,
    status: 'unused',
    expiresAt: expiresAt.toISOString()
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(status));
    localStorage.setItem('mdwriter_waitlist_email', email);
  }

  return { success: true, couponCode };
}

/**
 * Redeems a coupon code using the atomic stored procedure.
 */
export async function redeemCouponCode(
  couponCode: string,
  plan: 'monthly' | 'annual' = 'monthly'
): Promise<{ success: boolean; message?: string; error?: string; expiresAt?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    // Offline simulation
    return {
      success: true,
      message: `Pro activated! 1 free month granted offline.`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  try {
    const { data, error } = await supabase.rpc('redeem_coupon', {
      p_coupon_code: couponCode.trim().toUpperCase(),
      p_plan: plan
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data?.success) {
      return { success: false, error: data?.error || 'Failed to redeem coupon code.' };
    }

    // Invalidate local waitlist cache to reflect redeemed status
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          parsed.status = 'redeemed';
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
        } catch (e) {
          // ignore
        }
      }
    }

    return {
      success: true,
      message: data.message,
      expiresAt: data.pro_expires_at
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error while redeeming coupon.' };
  }
}
