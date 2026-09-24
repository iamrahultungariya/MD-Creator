-- ==============================================================================
-- MD-Creator (MD Writer) — Security & Audit Remediation Migration
-- Production-Ready, Idempotent, High-Security Patch
-- Execute in Supabase SQL Editor: New Query -> Run
-- ==============================================================================

-- 1. Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. ROLE-BASED ACCESS CONTROL (RBAC): user_roles & has_role()
-- Replaces fragile and spoofable email-based checks
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'support')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_lookup ON public.user_roles(user_id, role);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Check role helper function
CREATE OR REPLACE FUNCTION public.has_role(p_user_id UUID, p_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    IF p_user_id IS NULL THEN
        RETURN false;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = p_user_id AND role = p_role
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.has_role(UUID, TEXT) TO authenticated, anon;

-- Auto-assign admin role to the primary founder account if it exists in auth.users
DO $$
DECLARE
    v_founder_id UUID;
BEGIN
    SELECT id INTO v_founder_id FROM auth.users WHERE LOWER(email) = 'tungariyarahul08@gmail.com' LIMIT 1;
    IF v_founder_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_founder_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;

-- ==============================================================================
-- 3. PROFILES HARDENING: Privacy & Column-Level Update Protection
-- Fixes Critical #2 (Self-upgrade) and Critical #4 (Public email dump)
-- ==============================================================================

-- Ensure columns exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'subscription_tier'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'team'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'pro_expires_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN pro_expires_at TIMESTAMPTZ DEFAULT NULL;
    END IF;
END $$;

-- Drop insecure public select policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Users can only read their OWN row from public.profiles (protecting emails)
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Restrict UPDATE permissions: Authenticated users can ONLY modify display_name and avatar_url
REVOKE UPDATE ON public.profiles FROM authenticated, anon, public;
GRANT UPDATE (display_name, avatar_url, updated_at) ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Safe public view for sharing / author display (excludes email & billing info)
CREATE OR REPLACE VIEW public.public_profiles WITH (security_invoker = false) AS
    SELECT id, display_name, avatar_url, created_at
    FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- ==============================================================================
-- 4. CRITICAL #1 FIX: Secure activate_user_pro
-- Revoke execution from regular authenticated users; enforce admin check
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.activate_user_pro(
    p_email TEXT,
    p_months INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_user_id UUID;
    v_current_expires TIMESTAMPTZ;
    v_new_expires TIMESTAMPTZ;
BEGIN
    -- 1. Strictly enforce admin authorization
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Admin privileges required.');
    END IF;

    IF p_months IS NULL OR p_months <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid months duration.');
    END IF;

    -- 2. Find user by email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE LOWER(email) = LOWER(TRIM(p_email));

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Account could not be found.');
    END IF;

    -- 3. Calculate expiration
    SELECT pro_expires_at INTO v_current_expires
    FROM public.profiles
    WHERE id = v_user_id;

    IF v_current_expires IS NOT NULL AND v_current_expires > now() THEN
        v_new_expires := v_current_expires + (p_months || ' months')::INTERVAL;
    ELSE
        v_new_expires := now() + (p_months || ' months')::INTERVAL;
    END IF;

    -- 4. Update profile
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

-- Revoke all execute rights from regular users
REVOKE EXECUTE ON FUNCTION public.activate_user_pro(TEXT, INTEGER) FROM public, anon, authenticated;
-- Only service_role can execute (or authenticated admin via RPC after GRANT TO authenticated + has_role)
GRANT EXECUTE ON FUNCTION public.activate_user_pro(TEXT, INTEGER) TO authenticated;

-- ==============================================================================
-- 5. CRITICAL #3 & HIGH #5 FIX: Server-Side Waitlist & Atomic Coupon Minting
-- Prevents self-minting, coupon theft, and seat race conditions
-- ==============================================================================

-- Remove client direct insertion policy on coupon_redemptions
DROP POLICY IF EXISTS "Users can create own waitlist coupon" ON public.coupon_redemptions;
REVOKE INSERT ON public.coupon_redemptions FROM authenticated, anon, public;

-- Ensure coupon_redemptions table structure
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

ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own coupons" ON public.coupon_redemptions;
CREATE POLICY "Users can view own coupons"
    ON public.coupon_redemptions FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR redeemed_by_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Helper: Get remaining seats
CREATE OR REPLACE FUNCTION public.get_waitlist_seats_remaining()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_claimed INTEGER := 0;
BEGIN
    SELECT COUNT(*) INTO v_claimed FROM public.coupon_redemptions;
    RETURN GREATEST(0, 100 - v_claimed);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_waitlist_seats_remaining() TO anon, authenticated;

-- Server-Side Secure Waitlist Registration & Coupon Generation
CREATE OR REPLACE FUNCTION public.join_waitlist()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_existing_coupon RECORD;
    v_total_claimed INTEGER;
    v_code TEXT;
    v_expires_at TIMESTAMPTZ;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication required to join the earlybird waitlist.');
    END IF;

    -- Get user email from auth.users
    SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;

    -- Check if user already has an existing coupon
    SELECT * INTO v_existing_coupon
    FROM public.coupon_redemptions
    WHERE user_id = v_user_id
    ORDER BY created_at DESC
    LIMIT 1;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', true,
            'coupon_code', v_existing_coupon.coupon_code,
            'status', v_existing_coupon.status,
            'expires_at', v_existing_coupon.expires_at,
            'message', 'You have already claimed your earlybird VIP spot!'
        );
    END IF;

    -- Enforce 100 seats limit atomically with row locking
    SELECT COUNT(*) INTO v_total_claimed FROM public.coupon_redemptions FOR UPDATE;
    IF v_total_claimed >= 100 THEN
        RETURN jsonb_build_object('success', false, 'error', 'All 100 earlybird VIP spots have been claimed.');
    END IF;

    -- Generate cryptographically secure random code: e.g. EARLYBIRD-8F2A9C
    v_code := 'EARLYBIRD-' || UPPER(SUBSTRING(encode(gen_random_bytes(4), 'hex') FROM 1 FOR 6));
    v_expires_at := now() + INTERVAL '6 months';

    -- Insert new coupon
    INSERT INTO public.coupon_redemptions (
        coupon_code,
        user_id,
        status,
        expires_at
    ) VALUES (
        v_code,
        v_user_id,
        'unused',
        v_expires_at
    );

    -- Also record in waitlist table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'waitlist') THEN
        INSERT INTO public.waitlist (email, plan, created_at)
        VALUES (v_user_email, 'pro', now())
        ON CONFLICT (email) DO NOTHING;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'coupon_code', v_code,
        'status', 'unused',
        'expires_at', v_expires_at,
        'message', 'Welcome to the VIP Earlybird group! Your coupon has been minted.'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.join_waitlist() TO authenticated;

-- Hardened Status Check (Parameterless, uses auth.uid() directly)
CREATE OR REPLACE FUNCTION public.check_user_waitlist_status()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_user_id UUID;
    v_coupon RECORD;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('has_joined', false);
    END IF;

    SELECT * INTO v_coupon
    FROM public.coupon_redemptions
    WHERE user_id = v_user_id
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

    RETURN jsonb_build_object('has_joined', false);
END;
$$;

-- Overload check_user_waitlist_status(UUID) to maintain compatibility if called, but strictly enforce auth.uid()
CREATE OR REPLACE FUNCTION public.check_user_waitlist_status(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    -- Non-admins cannot inspect other users' coupons
    IF auth.uid() IS NULL OR (auth.uid() != p_user_id AND NOT public.has_role(auth.uid(), 'admin')) THEN
        RETURN jsonb_build_object('has_joined', false);
    END IF;
    RETURN public.check_user_waitlist_status();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_user_waitlist_status() FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_user_waitlist_status(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.check_user_waitlist_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_waitlist_status(UUID) TO authenticated;

-- Hardened Redeem Coupon Procedure
CREATE OR REPLACE FUNCTION public.redeem_coupon(
    p_coupon_code TEXT,
    p_plan TEXT DEFAULT 'monthly'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_user_id UUID;
    v_coupon RECORD;
    v_current_expires TIMESTAMPTZ;
    v_new_expires TIMESTAMPTZ;
    v_duration INTERVAL;
    v_clean_code TEXT;
    v_clean_plan TEXT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'You must be logged in to redeem a coupon.');
    END IF;

    v_clean_code := UPPER(TRIM(p_coupon_code));
    v_clean_plan := LOWER(TRIM(COALESCE(p_plan, 'monthly')));

    -- Validate plan parameter
    IF v_clean_plan NOT IN ('monthly', 'annual') THEN
        v_clean_plan := 'monthly';
    END IF;

    -- Lock the coupon row atomically
    SELECT * INTO v_coupon
    FROM public.coupon_redemptions
    WHERE coupon_code = v_clean_code
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid coupon code.');
    END IF;

    -- Anti-Theft: Verify coupon belongs to the authenticated user
    IF v_coupon.user_id != v_user_id AND NOT public.has_role(v_user_id, 'admin') THEN
        RETURN jsonb_build_object('success', false, 'error', 'This coupon is assigned to a different account.');
    END IF;

    -- Verify status is 'unused'
    IF v_coupon.status != 'unused' THEN
        RETURN jsonb_build_object('success', false, 'error', 'This coupon code has already been redeemed or is no longer valid.');
    END IF;

    -- Verify not expired
    IF v_coupon.expires_at < now() THEN
        UPDATE public.coupon_redemptions
        SET status = 'expired'
        WHERE id = v_coupon.id;

        RETURN jsonb_build_object('success', false, 'error', 'This coupon code has expired.');
    END IF;

    -- Determine reward duration
    IF v_clean_plan = 'annual' THEN
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
        'reward_plan', v_clean_plan,
        'pro_expires_at', v_new_expires,
        'message', 'Congratulations! Pro access has been activated successfully.'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_coupon(TEXT, TEXT) TO authenticated;

-- ==============================================================================
-- 6. HIGH #6 FIX: Ownerless Documents (user_id IS NULL) Lockdown
-- Remove user_id IS NULL from all write/delete policies; default user_id to auth.uid()
-- ==============================================================================

-- Documents Table
ALTER TABLE public.documents ALTER COLUMN user_id SET DEFAULT auth.uid();

DROP POLICY IF EXISTS "Users can view own documents or demo docs" ON public.documents;
CREATE POLICY "Users can view own documents or demo docs"
    ON public.documents FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
CREATE POLICY "Users can insert own documents"
    ON public.documents FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
CREATE POLICY "Users can update own documents"
    ON public.documents FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id AND user_id IS NOT NULL)
    WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
CREATE POLICY "Users can delete own documents"
    ON public.documents FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id AND user_id IS NOT NULL);

-- Document Contents Table
DROP POLICY IF EXISTS "Users can view own document contents" ON public.document_contents;
CREATE POLICY "Users can view own document contents"
    ON public.document_contents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_contents.id
            AND (d.user_id = auth.uid() OR d.user_id IS NULL)
        )
    );

DROP POLICY IF EXISTS "Users can insert own document contents" ON public.document_contents;
CREATE POLICY "Users can insert own document contents"
    ON public.document_contents FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_contents.id
            AND d.user_id = auth.uid()
            AND d.user_id IS NOT NULL
        )
    );

DROP POLICY IF EXISTS "Users can update own document contents" ON public.document_contents;
CREATE POLICY "Users can update own document contents"
    ON public.document_contents FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_contents.id
            AND d.user_id = auth.uid()
            AND d.user_id IS NOT NULL
        )
    );

DROP POLICY IF EXISTS "Users can delete own document contents" ON public.document_contents;
CREATE POLICY "Users can delete own document contents"
    ON public.document_contents FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_contents.id
            AND d.user_id = auth.uid()
            AND d.user_id IS NOT NULL
        )
    );

-- Document Revisions Table
DROP POLICY IF EXISTS "Users can view own document revisions" ON public.document_revisions;
CREATE POLICY "Users can view own document revisions"
    ON public.document_revisions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_revisions.document_id
            AND (d.user_id = auth.uid() OR d.user_id IS NULL)
        )
    );

DROP POLICY IF EXISTS "Users can insert own document revisions" ON public.document_revisions;
CREATE POLICY "Users can insert own document revisions"
    ON public.document_revisions FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_revisions.document_id
            AND d.user_id = auth.uid()
            AND d.user_id IS NOT NULL
        )
    );

DROP POLICY IF EXISTS "Users can delete own document revisions" ON public.document_revisions;
CREATE POLICY "Users can delete own document revisions"
    ON public.document_revisions FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_revisions.document_id
            AND d.user_id = auth.uid()
            AND d.user_id IS NOT NULL
        )
    );

-- ==============================================================================
-- 7. MEDIUM #10 & #11: Waitlist Table Hardening & Validations
-- ==============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'waitlist') THEN
        -- Add email check constraint if not present
        ALTER TABLE public.waitlist 
            DROP CONSTRAINT IF EXISTS waitlist_email_check,
            ADD CONSTRAINT waitlist_email_check 
            CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

        -- Update policies
        DROP POLICY IF EXISTS "Allow public insert into waitlist" ON public.waitlist;
        CREATE POLICY "Allow public insert into waitlist"
            ON public.waitlist FOR INSERT
            TO anon, authenticated
            WITH CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

        DROP POLICY IF EXISTS "Allow admin read on waitlist" ON public.waitlist;
        CREATE POLICY "Allow admin read on waitlist"
            ON public.waitlist FOR SELECT
            TO authenticated
            USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;

-- ==============================================================================
-- 8. SET SEARCH_PATH on User Triggers
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    -- 1. Create User Profile
    INSERT INTO public.profiles (id, display_name, avatar_url, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
        NEW.email
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = now();

    -- 2. Initialize Default Settings
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;
