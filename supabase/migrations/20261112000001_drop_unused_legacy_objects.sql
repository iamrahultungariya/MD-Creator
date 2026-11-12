-- Cleanup migration: drops unused legacy tables, view, dead RPCs, and public profile email exposure.
-- Note: Run this migration via Supabase Dashboard SQL Editor or `supabase db push`
-- (Interactive MCP confirmation auto-cancels destructive DROP statements).

DROP POLICY IF EXISTS "Public profiles are readable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = id OR public.is_admin());

DROP VIEW IF EXISTS public.public_profiles;

DROP TABLE IF EXISTS public.beta_tester_audit CASCADE;
DROP TABLE IF EXISTS public.mimo_user_usage CASCADE;
DROP TABLE IF EXISTS public.pdf_templates CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;

DROP FUNCTION IF EXISTS public.join_waitlist();
DROP FUNCTION IF EXISTS public.check_user_waitlist_status();
DROP FUNCTION IF EXISTS public.check_user_waitlist_status(uuid);
DROP FUNCTION IF EXISTS public.get_waitlist_seats_remaining();
DROP FUNCTION IF EXISTS public.check_and_consume_mimo_quota(text, numeric, boolean, bigint);
DROP FUNCTION IF EXISTS public.apply_launch_beta_reward();
DROP FUNCTION IF EXISTS public.execute_beta_tester_cutoff(timestamptz);
