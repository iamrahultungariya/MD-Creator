import { create } from 'zustand';
import { supabase, isSupabaseConfigured, syncAllDocuments } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  isDemoUser?: boolean;
  subscriptionTier?: 'free' | 'pro' | 'team';
  proExpiresAt?: string | null;
}

// ─── Environment-driven configuration ────────────────────────────────────────
// All values are read from .env — no personal credentials in source code.

/**
 * Beta Phase Flag:
 * All users receive full, unrestricted Pro capabilities free while MD Writer is in Beta.
 * Linked to product maturity (until v1.0 launch) rather than fixed calendar dates.
 */
export const IS_BETA = true;

/** ISO timestamp for reward window. Configured via env. */
export const PROMO_FREE_PRO_UNTIL: string =
  import.meta.env.VITE_FREE_PRO_UNTIL || '2026-12-31T23:59:59.999Z';

/** Returns true while the Beta Phase or promotional window is active. */
export const isHolidayFreeProActive = (): boolean =>
  IS_BETA || new Date() <= new Date(PROMO_FREE_PRO_UNTIL);

/**
 * Returns true if the given email is in the comma-separated
 * VITE_LIFETIME_PRO_EMAILS environment variable.
 */
export const isLifetimeProEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const raw: string = import.meta.env.VITE_LIFETIME_PRO_EMAILS || '';
  if (!raw.trim()) return false;
  const allowed = raw
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
};

export const isUserPro = (user?: UserProfile | null): boolean => {
  if (IS_BETA) return true;
  if (!user) return false;
  if (isLifetimeProEmail(user.email)) return true;
  return user.subscriptionTier === 'pro' || user.subscriptionTier === 'team';
};

// ─── Avatar helper ────────────────────────────────────────────────────────────
// Generates a deterministic, personalized initials avatar keyed by email.
// Uses the DiceBear API — privacy-safe, no tracking, no Unsplash dependency.
const getAvatarUrl = (email: string): string =>
  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(email)}&backgroundColor=0a0a0a&textColor=ffffff`;

// ─── Store types ──────────────────────────────────────────────────────────────
interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  demoSignIn: (name?: string, email?: string) => void;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const DEMO_USER_STORAGE_KEY = 'md_writer_demo_user';
const LOCAL_USERS_STORAGE_KEY = 'md_writer_registered_accounts';

// ─── Store implementation ─────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,

  refreshProfile: async () => {
    const currentUser = get().user;
    if (!currentUser || currentUser.isDemoUser || !isSupabaseConfigured() || !supabase) return;
    try {
      const isFounder = isLifetimeProEmail(currentUser.email);
      const isPromo = isHolidayFreeProActive();
      const { data: prof } = await supabase
        .from('profiles')
        .select('subscription_tier, pro_expires_at')
        .eq('id', currentUser.id)
        .maybeSingle();
      if (prof || isFounder || isPromo) {
        set({
          user: {
            ...currentUser,
            subscriptionTier: (isFounder || isPromo) ? 'pro' : (prof?.subscription_tier || 'free'),
            proExpiresAt: isFounder ? null : isPromo ? PROMO_FREE_PRO_UNTIL : (prof?.pro_expires_at || null),
          }
        });
      }
    } catch (e) {
      console.warn('Failed to refresh profile:', e);
    }
  },

  checkAuth: async () => {
    // 1. Check for an existing local demo session first (instant restore)
    const savedDemo = localStorage.getItem(DEMO_USER_STORAGE_KEY);
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        // Always re-evaluate promo/founder status in case env vars changed
        if (isLifetimeProEmail(parsed.email) || isHolidayFreeProActive()) {
          parsed.subscriptionTier = 'pro';
          parsed.proExpiresAt = isLifetimeProEmail(parsed.email) ? null : PROMO_FREE_PRO_UNTIL;
        }
        set({ user: parsed, isLoading: false });
        return;
      } catch {
        localStorage.removeItem(DEMO_USER_STORAGE_KEY);
      }
    }

    // 2. If Supabase is configured, check for an active server session
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const u = session.user;
          const isFounder = isLifetimeProEmail(u.email);
          const isPromo = isHolidayFreeProActive();
          let tier: 'free' | 'pro' | 'team' = (isFounder || isPromo) ? 'pro' : 'free';
          let proExpiresAt: string | null = isFounder ? null : isPromo ? PROMO_FREE_PRO_UNTIL : null;

          try {
            const { data: prof } = await supabase
              .from('profiles')
              .select('subscription_tier, pro_expires_at')
              .eq('id', u.id)
              .maybeSingle();
            if (prof && !isFounder && !isPromo) {
              tier = prof.subscription_tier || 'free';
              proExpiresAt = prof.pro_expires_at || null;
            }
          } catch {
            // Silently ignore — tier defaults already applied above
          }

          set({
            user: {
              id: u.id,
              email: u.email || '',
              displayName: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Writer',
              avatarUrl: u.user_metadata?.avatar_url || getAvatarUrl(u.email || 'user'),
              isDemoUser: false,
              subscriptionTier: tier,
              proExpiresAt,
            },
            isLoading: false,
          });

          // Background cloud sync on app start
          syncAllDocuments().catch(console.warn);
          return;
        }
      } catch (err) {
        console.warn('Supabase getSession check failed:', err);
      }
    }

    set({ user: null, isLoading: false });
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    const cleanEmail = email.trim().toLowerCase();
    const isFounder = isLifetimeProEmail(cleanEmail);

    // ── Supabase real auth ────────────────────────────────────────────────
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error) {
        const friendlyMessage = error.message.toLowerCase().includes('invalid login credentials')
          ? 'Invalid email or password. Please verify your credentials or sign up.'
          : error.message;
        set({ error: friendlyMessage, isLoading: false });
        return { success: false, error: friendlyMessage };
      }

      if (data.user) {
        const isPromo = isHolidayFreeProActive();
        let tier: 'free' | 'pro' | 'team' = (isFounder || isPromo) ? 'pro' : 'free';
        let proExpiresAt: string | null = isFounder ? null : isPromo ? PROMO_FREE_PRO_UNTIL : null;
        try {
          const { data: prof } = await supabase
            .from('profiles')
            .select('subscription_tier, pro_expires_at')
            .eq('id', data.user.id)
            .maybeSingle();
          if (prof && !isFounder && !isPromo) {
            tier = prof.subscription_tier || 'free';
            proExpiresAt = prof.pro_expires_at || null;
          }
        } catch {
          // ignore
        }

        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          displayName: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
          avatarUrl: data.user.user_metadata?.avatar_url || getAvatarUrl(data.user.email || cleanEmail),
          isDemoUser: false,
          subscriptionTier: tier,
          proExpiresAt,
        };
        set({ user: profile, isLoading: false });
        syncAllDocuments().catch(console.warn);
        return { success: true };
      }
    }

    // ── Offline / demo fallback (no Supabase configured) ─────────────────
    // Accepts any email/password locally without server validation.
    const rawAccounts = localStorage.getItem(LOCAL_USERS_STORAGE_KEY);
    const localAccounts: Array<{ email: string; name: string }> = rawAccounts
      ? JSON.parse(rawAccounts)
      : [];
    const found = localAccounts.find(acc => acc.email === cleanEmail);
    const isPromo = isHolidayFreeProActive();

    const demoUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      displayName: found ? found.name : cleanEmail.split('@')[0] || 'Writer',
      avatarUrl: getAvatarUrl(cleanEmail),
      isDemoUser: true,
      subscriptionTier: (isFounder || isPromo) ? 'pro' : 'free',
      proExpiresAt: isFounder ? null : isPromo ? PROMO_FREE_PRO_UNTIL : null,
    };
    localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
    set({ user: demoUser, isLoading: false });
    return { success: true };
  },

  signUp: async (email: string, password: string, name?: string) => {
    set({ isLoading: true, error: null });
    const cleanEmail = email.trim().toLowerCase();
    const isFounder = isLifetimeProEmail(cleanEmail);
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

      // Empty identities = email already exists when email confirmation is on
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
          isDemoUser: false,
          subscriptionTier: (isFounder || isPromo) ? 'pro' : 'free',
          proExpiresAt: isFounder ? null : isPromo ? PROMO_FREE_PRO_UNTIL : null,
        };
        set({ user: profile, isLoading: false });
        syncAllDocuments().catch(console.warn);
        return { success: true };
      }
    }

    // ── Offline / demo fallback signup ────────────────────────────────────
    const rawAccounts = localStorage.getItem(LOCAL_USERS_STORAGE_KEY);
    const localAccounts: Array<{ email: string; name: string }> = rawAccounts
      ? JSON.parse(rawAccounts)
      : [];

    if (localAccounts.some(acc => acc.email === cleanEmail)) {
      const msg = 'An account with this email address already exists. Please sign in instead.';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }

    localAccounts.push({ email: cleanEmail, name: name || cleanEmail.split('@')[0] });
    localStorage.setItem(LOCAL_USERS_STORAGE_KEY, JSON.stringify(localAccounts));

    const demoUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      displayName: name || cleanEmail.split('@')[0] || 'Writer',
      avatarUrl,
      isDemoUser: true,
      subscriptionTier: (isFounder || isPromo) ? 'pro' : 'free',
      proExpiresAt: isFounder ? null : isPromo ? PROMO_FREE_PRO_UNTIL : null,
    };
    localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
    set({ user: demoUser, isLoading: false });
    return { success: true };
  },

  demoSignIn: (
    name = import.meta.env.VITE_DEMO_USER_NAME || 'Demo User',
    email = import.meta.env.VITE_DEMO_USER_EMAIL || 'demo@example.com',
  ) => {
    const isFounder = isLifetimeProEmail(email);
    const isPromo = isHolidayFreeProActive();
    const demoUser: UserProfile = {
      id: 'usr_demo',
      email,
      displayName: name,
      avatarUrl: getAvatarUrl(email),
      isDemoUser: true,
      subscriptionTier: (isFounder || isPromo) ? 'pro' : 'free',
      proExpiresAt: isFounder ? null : isPromo ? PROMO_FREE_PRO_UNTIL : null,
    };
    localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
    set({ user: demoUser, isLoading: false, error: null });
  },

  signOut: async () => {
    localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut().catch(console.warn);
    }
    set({ user: null, isLoading: false, error: null });
  },
}));
