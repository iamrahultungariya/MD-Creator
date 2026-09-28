import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface RegionalPricing {
  countryCode: string;
  countryName: string;
  currency: string;
  currencySymbol: string;
  monthlyPrice: number;
  annualPrice: number;
}

export const REGIONAL_PRICING_MAP: Record<string, RegionalPricing> = {
  IN: {
    countryCode: 'IN',
    countryName: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    monthlyPrice: 399,
    annualPrice: 299,
  },
  US: {
    countryCode: 'US',
    countryName: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    monthlyPrice: 9,
    annualPrice: 7,
  },
  GB: {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    currency: 'GBP',
    currencySymbol: '£',
    monthlyPrice: 8,
    annualPrice: 6,
  },
  EU: {
    countryCode: 'EU',
    countryName: 'European Union',
    currency: 'EUR',
    currencySymbol: '€',
    monthlyPrice: 9,
    annualPrice: 7,
  },
  CA: {
    countryCode: 'CA',
    countryName: 'Canada',
    currency: 'CAD',
    currencySymbol: 'CA$',
    monthlyPrice: 12,
    annualPrice: 9,
  },
  AU: {
    countryCode: 'AU',
    countryName: 'Australia',
    currency: 'AUD',
    currencySymbol: 'A$',
    monthlyPrice: 14,
    annualPrice: 10,
  },
};

/**
 * Detects user region via browser timezone heuristics.
 */
export function detectUserRegion(): RegionalPricing {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone.startsWith('Asia/Calcutta') || timeZone.startsWith('Asia/Kolkata')) {
      return REGIONAL_PRICING_MAP.IN;
    }
    if (timeZone.startsWith('Europe/London')) {
      return REGIONAL_PRICING_MAP.GB;
    }
    if (timeZone.startsWith('Europe/')) {
      return REGIONAL_PRICING_MAP.EU;
    }
    if (timeZone.startsWith('America/Toronto') || timeZone.startsWith('America/Vancouver')) {
      return REGIONAL_PRICING_MAP.CA;
    }
    if (timeZone.startsWith('Australia/')) {
      return REGIONAL_PRICING_MAP.AU;
    }
  } catch {
    // fallback to US
  }
  return REGIONAL_PRICING_MAP.US;
}

/**
 * Redeems a promotional coupon code using the atomic stored procedure.
 */
export async function redeemCouponCode(
  couponCode: string,
  plan: 'monthly' | 'annual' = 'monthly'
): Promise<{ success: boolean; message?: string; error?: string; expiresAt?: string }> {
  const normalised = couponCode.trim().toUpperCase();
  if (!normalised) {
    return { success: false, error: 'Please enter a coupon code.' };
  }
  if (!/^[A-Z0-9][A-Z0-9_-]{3,}$/.test(normalised)) {
    return { success: false, error: 'Invalid coupon code format. Check and try again.' };
  }

  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      error: 'Could not connect to the server. Cloud connection is required to redeem a coupon.',
    };
  }

  try {
    const { data, error } = await supabase.rpc('redeem_coupon', {
      p_coupon_code: normalised,
      p_plan: plan
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data?.success) {
      return { success: false, error: data?.error || 'Failed to redeem coupon code.' };
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
