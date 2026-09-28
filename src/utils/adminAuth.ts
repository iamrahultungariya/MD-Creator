import { supabase } from '../lib/supabase';

/**
 * Admin authorization utility.
 * Verifies admin role directly against Supabase database (user_roles table or has_role RPC).
 * Zero admin emails or credentials are hardcoded or read from frontend environment variables.
 */
export async function isCurrentUserAdmin(userId?: string | null): Promise<boolean> {
  if (!supabase) return false;

  try {
    let targetUserId = userId;
    if (!targetUserId) {
      const { data: { session } } = await supabase.auth.getSession();
      targetUserId = session?.user?.id ?? null;
    }

    if (!targetUserId) return false;

    // Check user_roles table for role = 'admin'
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', targetUserId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!error && data !== null) {
      return true;
    }

    // Secondary check: has_role RPC
    const { data: rpcData } = await supabase.rpc('has_role', {
      p_user_id: targetUserId,
      p_role: 'admin',
    });

    return Boolean(rpcData);
  } catch {
    return false;
  }
}
