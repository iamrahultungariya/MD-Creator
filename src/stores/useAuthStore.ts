import { create } from 'zustand';
import { supabase, isSupabaseConfigured, syncAllDocuments, pullLatestCloudChanges } from '../lib/supabase';
import { queryClient } from '../lib/queryClient';
import { getDefaultAvatar } from '../components/auth/avatarPresets';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  subscriptionTier?: 'free' | 'pro' | 'team';
  proExpiresAt?: string | null;
}

// ─── Environment-driven configuration ────────────────────────────────────────

/**
 * Beta Phase Flag:
 * Set to false for standard production tiering.
 * Specific features in beta (PDF Studio, Word DOCX) carry their own [Beta] indicators.
 */
export const IS_BETA = false;

/** Optional promotional window expiry (ISO 8601). Configured via env if needed. */
export const PROMO_FREE_PRO_UNTIL: string | null =
  import.meta.env.VITE_FREE_PRO_UNTIL || null;

/** Returns true if an active global promotional reward window is configured. */
export const isHolidayFreeProActive = (): boolean =>
  Boolean(PROMO_FREE_PRO_UNTIL && new Date() <= new Date(PROMO_FREE_PRO_UNTIL));

/**
 * Helper to check local pro activation (e.g. promo code or early-bird reservation unlock).
 */
export const isLocalProUnlocked = (): boolean => {
  try {
    return localStorage.getItem('md_writer_pro_tier_unlocked') === 'true';
  } catch {
    return false;
  }
};

/**
 * Grants or revokes local Pro capabilities.
 */
export const setLocalProUnlocked = (unlocked: boolean): void => {
  try {
    if (unlocked) {
      localStorage.setItem('md_writer_pro_tier_unlocked', 'true');
    } else {
      localStorage.removeItem('md_writer_pro_tier_unlocked');
    }
  } catch {
    // Ignore localStorage write errors
  }
};

/**
 * Returns true if user has Pro privileges.
 * Derived from database subscription tier, active promotion, or local promo unlock.
 */
export const isUserPro = (user?: UserProfile | null): boolean => {
  if (isHolidayFreeProActive() || isLocalProUnlocked()) return true;
  if (!user) return false;
  return user.subscriptionTier === 'pro' || user.subscriptionTier === 'team';
};

// ─── Avatar helper ────────────────────────────────────────────────────────────
// Defaults to locally saved character avatar, or bespoke default avatar
const getAvatarUrl = (_email: string): string => {
  try {
    const custom = localStorage.getItem('md_writer_custom_avatar');
    if (custom) return custom;
  } catch {
    // Ignore localStorage error
  }
  return getDefaultAvatar();
};

// ─── Store types ──────────────────────────────────────────────────────────────
interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

let authSubscription: { unsubscribe: () => void } | null = null;

async function buildUserProfile(u: any): Promise<UserProfile> {
  const isPromo = isHolidayFreeProActive() || isLocalProUnlocked();
  let tier: 'free' | 'pro' | 'team' = isPromo ? 'pro' : 'free';
  let proExpiresAt: string | null = isHolidayFreeProActive() ? PROMO_FREE_PRO_UNTIL : null;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: prof } = await supabase
        .from('profiles')
        .select('subscription_tier, pro_expires_at, display_name, avatar_url')
        .eq('id', u.id)
        .maybeSingle();

      if (prof?.subscription_tier) {
        tier = prof.subscription_tier;
        proExpiresAt = prof.pro_expires_at || null;
      }

      return {
        id: u.id,
        email: u.email || '',
        displayName:
          prof?.display_name ||
          u.user_metadata?.full_name ||
          u.email?.split('@')[0] ||
          'Writer',
        avatarUrl:
          localStorage.getItem('md_writer_custom_avatar') ||
          prof?.avatar_url ||
          u.user_metadata?.avatar_url ||
          getAvatarUrl(u.email || 'writer'),
        subscriptionTier: tier,
        proExpiresAt,
      };
    } catch {}
  }

  return {
    id: u.id,
    email: u.email || '',
    displayName:
      u.user_metadata?.full_name ||
      u.email?.split('@')[0] ||
      'Writer',
    avatarUrl:
      localStorage.getItem('md_writer_custom_avatar') ||
      u.user_metadata?.avatar_url ||
      getAvatarUrl(u.email || 'writer'),
    subscriptionTier: tier,
    proExpiresAt,
  };
}

// ─── Store implementation ─────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,

  refreshProfile: async () => {
    const currentUser = get().user;
    if (!currentUser || !isSupabaseConfigured() || !supabase) return;
    try {
      const isPromo = isHolidayFreeProActive();
      const { data: prof } = await supabase
        .from('profiles')
        .select('subscription_tier, pro_expires_at')
        .eq('id', currentUser.id)
        .maybeSingle();

      const tier = prof?.subscription_tier || (isPromo ? 'pro' : 'free');
      const proExpiresAt = prof?.pro_expires_at || (isPromo ? PROMO_FREE_PRO_UNTIL : null);

      set({
        user: {
          ...currentUser,
          subscriptionTier: tier,
          proExpiresAt,
        }
      });
    } catch (e) {
      console.warn('Failed to refresh profile:', e);
    }
  },

  checkAuth: async () => {
    // If Supabase is configured, check for an active server session
    if (isSupabaseConfigured() && supabase) {
      // 1. Establish persistent onAuthStateChange subscription if not already active
      if (!authSubscription) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            if (session?.user) {
              const profile = await buildUserProfile(session.user);
              set({ user: profile, isLoading: false, error: null });
              pullLatestCloudChanges(false).catch(() => {});
            }
          } else if (event === 'SIGNED_OUT') {
            set({ user: null, isLoading: false, error: null });
            queryClient.clear();
          }
        });
        authSubscription = subscription;
      }

      // 2. Initial session restoration
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await buildUserProfile(session.user);
          set({ user: profile, isLoading: false });
          syncAllDocuments(true).catch(console.warn);
          return;
        }
      } catch (err) {
        console.warn('Session restoration failed:', err);
      }
    }

    set({ user: null, isLoading: false });
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    const cleanEmail = email.trim().toLowerCase();

    // ── Supabase real auth ────────────────────────────────────────────────
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        const friendlyError =
          error.message.includes('Invalid login credentials')
            ? 'Incorrect email or password. Please verify your credentials and try again.'
            : error.message;
        set({ error: friendlyError, isLoading: false });
        return { success: false, error: friendlyError };
      }

      if (data.user) {
        const isPromo = isHolidayFreeProActive();
        let tier: 'free' | 'pro' | 'team' = isPromo ? 'pro' : 'free';
        let proExpiresAt: string | null = isPromo ? PROMO_FREE_PRO_UNTIL : null;

        // Fetch user profile from database
        const { data: prof } = await supabase
          .from('profiles')
          .select('subscription_tier, pro_expires_at, display_name, avatar_url')
          .eq('id', data.user.id)
          .maybeSingle();

        if (prof?.subscription_tier) {
          tier = prof.subscription_tier;
          proExpiresAt = prof.pro_expires_at || null;
        }

        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          displayName:
            prof?.display_name ||
            data.user.user_metadata?.full_name ||
            cleanEmail.split('@')[0],
          avatarUrl:
            localStorage.getItem('md_writer_custom_avatar') ||
            prof?.avatar_url ||
            data.user.user_metadata?.avatar_url ||
            getAvatarUrl(cleanEmail),
          subscriptionTier: tier,
          proExpiresAt,
        };
        set({ user: profile, isLoading: false });
        syncAllDocuments(true).catch(console.warn);
        return { success: true };
      }
    }

    const err = 'Cloud authentication service is currently unavailable. Please verify your internet connection.';
    set({ error: err, isLoading: false });
    return { success: false, error: err };
  },

  signUp: async (email: string, password: string, name?: string) => {
    set({ isLoading: true, error: null });
    const cleanEmail = email.trim().toLowerCase();
    const isPromo = isHolidayFreeProActive();
    const avatarUrl = getAvatarUrl(cleanEmail);

    // ── Supabase real auth ────────────────────────────────────────────────
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: name || cleanEmail.split('@')[0],
            avatar_url: avatarUrl,
          }
        }
      });

      if (error) {
        const errorMsg = error.message.toLowerCase().includes('already registered')
          ? 'An account with this email address already exists. Please sign in instead.'
          : error.message;
        set({ error: errorMsg, isLoading: false });
        return { success: false, error: errorMsg };
      }

      if (data.user?.identities && data.user.identities.length === 0) {
        const msg = 'An account with this email address already exists. Please sign in instead.';
        set({ error: msg, isLoading: false });
        return { success: false, error: msg };
      }

      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          displayName: name || cleanEmail.split('@')[0],
          avatarUrl,
          subscriptionTier: isPromo ? 'pro' : 'free',
          proExpiresAt: isPromo ? PROMO_FREE_PRO_UNTIL : null,
        };
        set({ user: profile, isLoading: false });
        syncAllDocuments(true).catch(console.warn);
        return { success: true };
      }
    }

    const err = 'Cloud authentication service is currently unavailable. Please verify your internet connection.';
    set({ error: err, isLoading: false });
    return { success: false, error: err };
  },

  signOut: async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut().catch(console.warn);
    }
    set({ user: null, isLoading: false, error: null });
    queryClient.clear();
  },
}));
