-- ==============================================================================
-- MD WRITER: Pro Feature Activation, Coupon System & Waitlist Migration
-- Run this in your Supabase SQL Editor: New Query -> Run
-- ==============================================================================

-- 1. Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Update profiles table to ensure subscription_tier and pro_expires_at exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name = 'subscription_tier'
    ) THEN
        ALTER TABLE public.profiles 
            ADD COLUMN subscription_tier TEXT DEFAULT 'free' 
            CHECK (subscription_tier IN ('free', 'pro', 'team'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name = 'pro_expires_at'
    ) THEN
        ALTER TABLE public.profiles 
            ADD COLUMN pro_expires_at TIMESTAMPTZ DEFAULT NULL;
    END IF;
END $$;

-- 3. Create coupon_redemptions table
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_code TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'unused' CHECK (status IN ('unused', 'redeemed', 'expired')),
    redeemed_at TIMESTAMPTZ DEFAULT NULL,
    redeemed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupon_redemptions(coupon_code);
CREATE INDEX IF NOT EXISTS idx_coupons_user_id ON public.coupon_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON public.coupon_redemptions(status);
CREATE INDEX IF NOT EXISTS idx_profiles_sub_tier ON public.profiles(subscription_tier);

-- 5. Enable Row-Level Security (RLS)
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- 6. Clean up old policies if they exist
DROP POLICY IF EXISTS "Users can view own coupons" ON public.coupon_redemptions;
DROP POLICY IF EXISTS "Users can create own waitlist coupon" ON public.coupon_redemptions;
DROP POLICY IF EXISTS "Admin full access on coupons" ON public.coupon_redemptions;

-- 7. Policy: Users can view their own coupon redemptions
CREATE POLICY "Users can view own coupons"
ON public.coupon_redemptions
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR redeemed_by_user_id = auth.uid()
);

-- 8. Policy: Users can only read their own coupons (Creation is handled server-side via join_waitlist)
DROP POLICY IF EXISTS "Users can create own waitlist coupon" ON public.coupon_redemptions;
REVOKE INSERT ON public.coupon_redemptions FROM authenticated, anon, public;

-- 9. Policy: Admin access via has_role function
CREATE POLICY "Admin full access on coupons"
ON public.coupon_redemptions
FOR ALL
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
    public.has_role(auth.uid(), 'admin')
);

GRANT SELECT ON public.coupon_redemptions TO authenticated;

-- ==============================================================================
-- 10. ATOMIC STORED PROCEDURE: Redeem Coupon
-- Implements row locking (FOR UPDATE) to prevent double-spending race conditions.
-- Reward logic:
--   - 'monthly': +1 month Pro free
--   - 'annual':  +2 months Pro free (+ 20% annual discount applied at checkout)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.redeem_coupon(
    p_coupon_code TEXT,
    p_plan TEXT DEFAULT 'monthly'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_coupon RECORD;
    v_current_expires TIMESTAMPTZ;
    v_new_expires TIMESTAMPTZ;
    v_duration INTERVAL;
    v_clean_code TEXT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'You must be logged in to redeem a coupon.');
    END IF;

    v_clean_code := UPPER(TRIM(p_coupon_code));

    -- Lock the coupon row atomically
    SELECT * INTO v_coupon
    FROM public.coupon_redemptions
    WHERE coupon_code = v_clean_code
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid coupon code.');
    END IF;

    -- Verify status is 'unused'
    IF v_coupon.status != 'unused' THEN
        RETURN jsonb_build_object('success', false, 'error', 'This coupon code has already been redeemed or is no longer valid.');
    END IF;

    -- Verify not expired
    IF v_coupon.expires_at < now() THEN
        -- One-way status update to expired
        UPDATE public.coupon_redemptions
        SET status = 'expired'
        WHERE id = v_coupon.id;

        RETURN jsonb_build_object('success', false, 'error', 'This coupon code has expired.');
    END IF;

    -- Determine reward duration
    IF LOWER(p_plan) = 'annual' THEN
        v_duration := INTERVAL '2 months';
    ELSE
        v_duration := INTERVAL '1 month';
    END IF;

    -- Retrieve current profile pro expiration
    SELECT pro_expires_at INTO v_current_expires
    FROM public.profiles
    WHERE id = v_user_id;

    -- Calculate new expiration date
    IF v_current_expires IS NOT NULL AND v_current_expires > now() THEN
        v_new_expires := v_current_expires + v_duration;
    ELSE
        v_new_expires := now() + v_duration;
    END IF;

    -- Atomically update coupon status to redeemed
    UPDATE public.coupon_redemptions
    SET 
        status = 'redeemed',
        redeemed_at = now(),
        redeemed_by_user_id = v_user_id
    WHERE id = v_coupon.id;

    -- Update user profile to Pro
    UPDATE public.profiles
    SET 
        subscription_tier = 'pro',
        pro_expires_at = v_new_expires,
        updated_at = now()
    WHERE id = v_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'coupon_code', v_clean_code,
        'reward_plan', p_plan,
        'pro_expires_at', v_new_expires,
        'message', 'Congratulations! Pro access has been activated successfully.'
    );
END;
$$;

-- ==============================================================================
-- 11. HELPER STORED PROCEDURE: Check Waitlist Status For User
-- Allows the frontend to check whether a user has joined the wishlist/coupon
-- and retrieves their active coupon code in a single fast query.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.check_user_waitlist_status(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_coupon RECORD;
BEGIN
    -- Check coupon_redemptions
    SELECT * INTO v_coupon
    FROM public.coupon_redemptions
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 1;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'has_joined', true,
            'coupon_code', v_coupon.coupon_code,
            'status', v_coupon.status,
            'expires_at', v_coupon.expires_at,
            'created_at', v_coupon.created_at
        );
    END IF;

    -- Fallback: check legacy waitlist table by user's email
    IF EXISTS (
        SELECT 1 FROM public.waitlist w
        JOIN auth.users u ON u.email = w.email
        WHERE u.id = p_user_id
    ) THEN
        RETURN jsonb_build_object(
            'has_joined', true,
            'coupon_code', NULL,
            'status', 'registered',
            'expires_at', NULL,
            'created_at', now()
        );
    END IF;

    RETURN jsonb_build_object('has_joined', false);
END;
$$;

-- ==============================================================================
-- 12. HELPER STORED PROCEDURE: Get Remaining Seats
-- Returns the number of Earlybird VIP seats remaining out of 100 limit.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_waitlist_seats_remaining()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_coupons_count INTEGER := 0;
    v_waitlist_count INTEGER := 0;
    v_actual_claimed INTEGER := 0;
BEGIN
    SELECT COUNT(*) INTO v_coupons_count FROM public.coupon_redemptions;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'waitlist') THEN
        SELECT COUNT(*) INTO v_waitlist_count FROM public.waitlist;
    END IF;

    v_actual_claimed := GREATEST(v_coupons_count, v_waitlist_count);
    RETURN GREATEST(0, 100 - v_actual_claimed);
END;
$$;

-- ==============================================================================
-- 13. ADMIN PROCEDURE: Activate User Pro Manually
-- Usage: SELECT public.activate_user_pro('user@example.com', 6);
-- Activates Pro for the specified number of months directly from SQL.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.activate_user_pro(
    p_email TEXT,
    p_months INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_current_expires TIMESTAMPTZ;
    v_new_expires TIMESTAMPTZ;
BEGIN
    -- Find user by email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE LOWER(email) = LOWER(TRIM(p_email));

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found with email: ' || p_email);
    END IF;

    -- Calculate expiration
    SELECT pro_expires_at INTO v_current_expires
    FROM public.profiles
    WHERE id = v_user_id;

    IF v_current_expires IS NOT NULL AND v_current_expires > now() THEN
        v_new_expires := v_current_expires + (p_months || ' months')::INTERVAL;
    ELSE
        v_new_expires := now() + (p_months || ' months')::INTERVAL;
    END IF;

    -- Update profile
    UPDATE public.profiles
    SET 
        subscription_tier = 'pro',
        pro_expires_at = v_new_expires,
        updated_at = now()
    WHERE id = v_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'email', p_email,
        'subscription_tier', 'pro',
        'pro_expires_at', v_new_expires,
        'months_added', p_months
    );
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.redeem_coupon(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_waitlist_status(UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.check_user_waitlist_status(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_waitlist_seats_remaining() TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.activate_user_pro(TEXT, INTEGER) FROM public, anon, authenticated;

COMMENT ON TABLE public.coupon_redemptions IS 'Stores one-time use Earlybird coupons bound to users with atomic redemption';
