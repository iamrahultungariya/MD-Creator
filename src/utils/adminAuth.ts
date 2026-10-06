import { supabase } from '../lib/supabase';

let cachedAdminStatus: { userId: string; isAdmin: boolean; timestamp: number } | null = null;

/**
 * Admin authorization utility.
 * Verifies admin role against Supabase database (has_role RPC or user_roles table),
 * with fast-path for the project owner, local dev bypass, and 1.5s timeout protection.
 */
export async function isCurrentUserAdmin(userId?: string | null): Promise<boolean> {
  // 1. Check local dev bypass key
  if (typeof window !== 'undefined' && localStorage.getItem('md_writer_admin_dev_bypass') === 'true') {
    return true;
  }

  if (!supabase) return false;

  try {
    // 1.5s timeout wrapper so dormant Supabase never blocks editor initialization
    const checkPromise = (async (): Promise<boolean> => {
      const { data: { session } } = await supabase.auth.getSession();
      const activeUserId = userId || session?.user?.id;
      const userEmail = session?.user?.email?.toLowerCase();

      // 2. Owner fast-path
      if (
        userEmail === 'tungariyarahul08@gmail.com' ||
        activeUserId === 'a2016098-c81c-4981-ad2b-b50667d24bf5'
      ) {
        return true;
      }

      if (!activeUserId) return false;

      // Check cache (valid for 5 minutes)
      if (
        cachedAdminStatus &&
        cachedAdminStatus.userId === activeUserId &&
        Date.now() - cachedAdminStatus.timestamp < 300000
      ) {
        return cachedAdminStatus.isAdmin;
      }

      // 3. Check has_role RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc('has_role', {
        p_user_id: activeUserId,
        p_role: 'admin',
      });

      if (!rpcError && rpcData === true) {
        cachedAdminStatus = { userId: activeUserId, isAdmin: true, timestamp: Date.now() };
        return true;
      }

      // 4. Check user_roles table for role = 'admin'
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', activeUserId)
        .eq('role', 'admin')
        .maybeSingle();

      const isAdmin = !error && data !== null;
      cachedAdminStatus = { userId: activeUserId, isAdmin, timestamp: Date.now() };
      return isAdmin;
    })();

    const timeoutPromise = new Promise<boolean>((resolve) =>
      setTimeout(() => resolve(false), 1500)
    );

    return await Promise.race([checkPromise, timeoutPromise]);
  } catch {
    return false;
  }
}
