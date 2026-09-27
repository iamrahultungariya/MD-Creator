-- ==============================================================================
-- MD WRITER: Beta-to-v1.0 Pro Access Transition, Tester Rewards & Analytics
-- ==============================================================================
-- Execution Schedule:
-- 1. Run Section 1 & 2 immediately in production database.
-- 2. Run Section 3 exactly 1 day before v1.0 Launch (Cutoff Moment: e.g. Oct 14 23:59:59 UTC).
-- 3. Run Section 4 on v1.0 Launch Day to automatically grant Pro through Dec 31, 2026.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Ensure `beta_tester` Column Exists on `public.profiles`
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS beta_tester BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.profiles.beta_tester IS 
'Flags accounts created during the public beta phase prior to commercial v1.0 launch cutoff.';

-- ------------------------------------------------------------------------------
-- 2. Permanent Beta Tester Audit & Analytics Table (Preserves Metrics Post-2027)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.beta_tester_audit (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    beta_tester_since TIMESTAMPTZ DEFAULT NOW(),
    coupon_applied_date TIMESTAMPTZ,
    pro_extended_until TIMESTAMPTZ DEFAULT '2026-12-31 23:59:59+00',
    converted_to_paid BOOLEAN DEFAULT FALSE,
    converted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.beta_tester_audit ENABLE ROW LEVEL SECURITY;

-- Admins can view audit telemetry; users can view their own record
DROP POLICY IF EXISTS "Admins can view beta tester audit records" ON public.beta_tester_audit;
CREATE POLICY "Admins can view beta tester audit records"
    ON public.beta_tester_audit
    FOR SELECT
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'admin')
        OR auth.uid() = user_id
    );

COMMENT ON TABLE public.beta_tester_audit IS 
'Permanent business telemetry tracking early beta adopters and post-2026 conversion rates.';

-- ------------------------------------------------------------------------------
-- 3. CUTOFF PROCEDURE: Mark All Pre-Launch Users as Beta Testers
-- (To be executed 1 calendar day before v1.0 launch)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.execute_beta_tester_cutoff(p_cutoff_timestamp TIMESTAMPTZ DEFAULT NOW())
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tagged_count INTEGER := 0;
BEGIN
    -- Only authorized admins can execute cutoff
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Admin role required.');
    END IF;

    UPDATE public.profiles
    SET beta_tester = TRUE
    WHERE created_at <= p_cutoff_timestamp;

    GET DIAGNOSTICS v_tagged_count = ROW_COUNT;

    RETURN jsonb_build_object(
        'success', true,
        'tagged_beta_testers', v_tagged_count,
        'cutoff_timestamp', p_cutoff_timestamp
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 4. LAUNCH DAY REWARD: Automatically Apply Pro Extension Through Dec 31, 2026
-- (Executed once on v1.0 Launch Day — Zero manual coupon codes needed by users)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_launch_beta_reward()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated_count INTEGER := 0;
    v_expiry TIMESTAMPTZ := '2026-12-31 23:59:59+00';
BEGIN
    -- Only authorized admins can trigger the global launch distribution
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Admin role required.');
    END IF;

    -- 1. Extend Pro access for all verified beta testers
    UPDATE public.profiles
    SET subscription_tier = 'pro',
        pro_expires_at = v_expiry
    WHERE beta_tester = TRUE;

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;

    -- 2. Populate permanent audit table for conversion tracking
    INSERT INTO public.beta_tester_audit (user_id, email, beta_tester_since, coupon_applied_date, pro_extended_until)
    SELECT 
        p.id, 
        p.email, 
        p.created_at, 
        NOW(), 
        v_expiry
    FROM public.profiles p
    WHERE p.beta_tester = TRUE
    ON CONFLICT (user_id) DO UPDATE SET
        coupon_applied_date = NOW(),
        pro_extended_until = v_expiry;

    RETURN jsonb_build_object(
        'success', true,
        'pro_granted_count', v_updated_count,
        'pro_expires_at', v_expiry
    );
END;
$$;

-- Grant execution to authenticated users with internal admin check
GRANT EXECUTE ON FUNCTION public.execute_beta_tester_cutoff(TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_launch_beta_reward() TO authenticated;
