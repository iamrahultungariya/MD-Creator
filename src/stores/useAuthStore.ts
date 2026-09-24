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

export const PROMO_FREE_PRO_UNTIL = '2026-12-31T23:59:59.999Z';

export const isHolidayFreeProActive = (): boolean => {
  return new Date() <= new Date(PROMO_FREE_PRO_UNTIL);
};

export const isLifetimeProEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return clean === 'tungariyarahul08@gmail.com';
};

export const isUserPro = (user?: UserProfile | null): boolean => {
  // Free Pro campaign for everyone through December 31, 2026!
  if (isHolidayFreeProActive()) return true;
  if (!user) return false;
  if (isLifetimeProEmail(user.email)) return true;
  return user.subscriptionTier === 'pro' || user.subscriptionTier === 'team';
};

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
    // 1. Check local demo user first
    const savedDemo = localStorage.getItem(DEMO_USER_STORAGE_KEY);
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        if (isLifetimeProEmail(parsed.email) || isHolidayFreeProActive()) {
          parsed.subscriptionTier = 'pro';
          parsed.proExpiresAt = isLifetimeProEmail(parsed.email) ? null : PROMO_FREE_PRO_UNTIL;
        }
        set({ user: parsed, isLoading: false });
        return;
      } catch (e) {
        localStorage.removeItem(DEMO_USER_STORAGE_KEY);
      }
    }

    // 2. If Supabase configured, check active session
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
          } catch (e) {
            // ignore
          }

          set({
            user: {
              id: u.id,
              email: u.email || '',
              displayName: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Writer',
              avatarUrl: u.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              isDemoUser: false,
              subscriptionTier: tier,
              proExpiresAt: proExpiresAt
            },
            isLoading: false
          });

          // Run background cloud sync on app start
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

    // If Supabase is configured
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
          avatarUrl: data.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          isDemoUser: false,
          subscriptionTier: tier,
          proExpiresAt: proExpiresAt
        };
        set({ user: profile, isLoading: false });

        // Pull latest cloud documents on sign in
        syncAllDocuments().catch(console.warn);
        return { success: true };
      }
    }

    // Fallback if Supabase not configured: verify against local accounts registry
    const rawAccounts = localStorage.getItem(LOCAL_USERS_STORAGE_KEY);
    const localAccounts: Array<{ email: string; name: string }> = rawAccounts ? JSON.parse(rawAccounts) : [];
    const found = localAccounts.find(acc => acc.email === cleanEmail);
    const isPromo = isHolidayFreeProActive();

    const demoUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      displayName: found ? found.name : cleanEmail.split('@')[0] || 'Rahul Mehta',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isDemoUser: true,
      subscriptionTier: (isFounder || isPromo) ? 'pro' : 'free',
      proExpiresAt: isFounder ? null : isPromo ? PROMO_FREE_PRO_UNTIL : null
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

    if (isSupabaseConfigured() && supabase) {
      // 1. Perform Supabase auth registration (duplicate email handled natively)
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: name || cleanEmail.split('@')[0],
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
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

      // If Supabase has email confirmation enabled, identities array is empty when user already exists
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
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          isDemoUser: false,
          subscriptionTier: (isFounder || isPromo) ? 'pro' : 'free',
          proExpiresAt: isFounder ? null : isPromo ? PROMO_FREE_PRO_UNTIL : null
        };
        set({ user: profile, isLoading: false });

        // Sync documents immediately on signup
        syncAllDocuments().catch(console.warn);
        return { success: true };
      }
    }

    // Fallback demo signup: check local registered accounts
    const rawAccounts = localStorage.getItem(LOCAL_USERS_STORAGE_KEY);
    const localAccounts: Array<{ email: string; name: string }> = rawAccounts ? JSON.parse(rawAccounts) : [];
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
      displayName: name || cleanEmail.split('@')[0] || 'Rahul Mehta',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isDemoUser: true,
      subscriptionTier: (isFounder || isPromo) ? 'pro' : 'free',
      proExpiresAt: isFounder ? null : isPromo ? PROMO_FREE_PRO_UNTIL : null
    };
    localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
    set({ user: demoUser, isLoading: false });
    return { success: true };
  },

  demoSignIn: (name = 'Rahul Mehta', email = 'rahul.mehta@example.com') => {
    const isFounder = isLifetimeProEmail(email);
    const isPromo = isHolidayFreeProActive();
    const demoUser: UserProfile = {
      id: 'usr_rahul_mehta_demo',
      email,
      displayName: name,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isDemoUser: true,
      subscriptionTier: (isFounder || isPromo) ? 'pro' : 'free',
      proExpiresAt: isFounder ? null : isPromo ? PROMO_FREE_PRO_UNTIL : null
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
  }
}));
