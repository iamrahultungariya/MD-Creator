import { create } from 'zustand';
import { supabase, isSupabaseConfigured, syncAllDocuments } from '../lib/supabase';

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
 * All users receive full, unrestricted Pro capabilities free while MD Writer is in Beta.
 * Linked to product maturity (until v1.0 launch) rather than hardcoded client emails.
 */
export const IS_BETA = true;

/** ISO timestamp for reward window. Configured via env. */
export const PROMO_FREE_PRO_UNTIL: string =
  import.meta.env.VITE_FREE_PRO_UNTIL || '2026-12-31T23:59:59.999Z';

/** Returns true while the Beta Phase or promotional window is active. */
export const isHolidayFreeProActive = (): boolean =>
  IS_BETA || new Date() <= new Date(PROMO_FREE_PRO_UNTIL);

/**
 * Returns true if user has Pro privileges.
 * Derived solely from database subscription tier or active promotion.
 */
export const isUserPro = (user?: UserProfile | null): boolean => {
  if (IS_BETA) return true;
  if (!user) return false;
  return user.subscriptionTier === 'pro' || user.subscriptionTier === 'team';
};

// ─── Avatar helper ────────────────────────────────────────────────────────────
// Generates a deterministic initials avatar keyed by email.
const getAvatarUrl = (email: string): string =>
  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(email)}&backgroundColor=0a0a0a&textColor=ffffff`;

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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const u = session.user;
          const isPromo = isHolidayFreeProActive();
          let tier: 'free' | 'pro' | 'team' = isPromo ? 'pro' : 'free';
          let proExpiresAt: string | null = isPromo ? PROMO_FREE_PRO_UNTIL : null;

          // Fetch user profile from database
          const { data: prof } = await supabase
            .from('profiles')
            .select('subscription_tier, pro_expires_at, display_name, avatar_url')
            .eq('id', u.id)
            .maybeSingle();

          if (prof?.subscription_tier) {
            tier = prof.subscription_tier;
            proExpiresAt = prof.pro_expires_at || null;
          }

          const profile: UserProfile = {
            id: u.id,
            email: u.email || '',
            displayName:
              prof?.display_name ||
              u.user_metadata?.full_name ||
              u.email?.split('@')[0] ||
              'Writer',
            avatarUrl:
              prof?.avatar_url ||
              u.user_metadata?.avatar_url ||
              getAvatarUrl(u.email || 'writer'),
            subscriptionTier: tier,
            proExpiresAt,
          };
          set({ user: profile, isLoading: false });
          syncAllDocuments().catch(console.warn);
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
            prof?.avatar_url ||
            data.user.user_metadata?.avatar_url ||
            getAvatarUrl(cleanEmail),
          subscriptionTier: tier,
          proExpiresAt,
        };
        set({ user: profile, isLoading: false });
        syncAllDocuments().catch(console.warn);
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
        syncAllDocuments().catch(console.warn);
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
  },
}));
