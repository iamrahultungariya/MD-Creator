-- ==============================================================================
-- MD-Creator (MD Writer) — Supabase Security Fix: public_profiles
-- Resolves Supabase Security Advisor Linter:
-- "View public.public_profiles is defined with the SECURITY DEFINER property"
--
-- Run this in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ==============================================================================

-- 1. Alter existing view to enforce security_invoker = true
-- This ensures queries respect Row-Level Security (RLS) policies of the querying caller.
ALTER VIEW IF EXISTS public.public_profiles SET (security_invoker = true);

-- 2. If the view does not exist yet or needs recreation, recreate with security_invoker = true
CREATE OR REPLACE VIEW public.public_profiles WITH (security_invoker = true) AS
    SELECT 
        id, 
        display_name, 
        avatar_url, 
        created_at
    FROM public.profiles;

-- 3. Re-grant read access to authenticated users and anonymous visitors
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- Verify the fix
COMMENT ON VIEW public.public_profiles IS 'Public author profile safe view with security_invoker = true to uphold RLS';
