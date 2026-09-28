import { supabase } from '../lib/supabase';

/**
 * Admin authorization utility.
 * Verifies admin role against Supabase database (has_role RPC or user_roles table),
 * with fast-path for the project owner and local dev bypass.
 */
export async function isCurrentUserAdmin(userId?: string | null): Promise<boolean> {
  // 1. Check local dev bypass key
  if (typeof window !== 'undefined' && localStorage.getItem('md_writer_admin_dev_bypass') === 'true') {
    return true;
  }

  if (!supabase) return false;

  try {
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

    // 3. Check has_role RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc('has_role', {
      p_user_id: activeUserId,
      p_role: 'admin',
    });

    if (!rpcError && rpcData === true) {
      return true;
    }

    // 4. Check user_roles table for role = 'admin'
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', activeUserId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!error && data !== null) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
