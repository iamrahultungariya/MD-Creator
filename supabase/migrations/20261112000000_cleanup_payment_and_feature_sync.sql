-- Cleanup unused legacy objects, harden security/RLS, and establish payment & feature sync base
-- Migration: 20261112000000_cleanup_payment_and_feature_sync

BEGIN;

-- ============================================================================
-- 1. Update handle_new_user() BEFORE dropping user_settings
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        ),
        NEW.email
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = now();

    RETURN NEW;
END;
$$;

-- ============================================================================
-- 2. Drop unused views, tables, and orphaned RPCs
-- ============================================================================
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

-- ============================================================================
-- 3. Harden & extend public.profiles (remove public email exposure + add billing cols)
-- ============================================================================
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS subscription_tier text NOT NULL DEFAULT 'free',
    ADD COLUMN IF NOT EXISTS plan_id text,
    ADD COLUMN IF NOT EXISTS pro_expires_at timestamptz,
    ADD COLUMN IF NOT EXISTS stripe_customer_id text,
    ADD COLUMN IF NOT EXISTS razorpay_customer_id text;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'profiles_subscription_tier_check'
          AND conrelid = 'public.profiles'::regclass
    ) THEN
        ALTER TABLE public.profiles
            ADD CONSTRAINT profiles_subscription_tier_check
            CHECK (subscription_tier IN ('free', 'pro', 'lifetime'));
    END IF;
END $$;

DROP POLICY IF EXISTS "Public profiles are readable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = id OR public.is_admin());

CREATE OR REPLACE FUNCTION public.protect_profile_billing_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    IF COALESCE(current_setting('app.bypass_billing_guard', true), '') = 'on'
       OR auth.role() = 'service_role'
       OR current_user IN ('postgres', 'supabase_admin', 'supabase_auth_admin', 'service_role') THEN
        RETURN NEW;
    END IF;

    IF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier
       OR NEW.plan_id IS DISTINCT FROM OLD.plan_id
       OR NEW.pro_expires_at IS DISTINCT FROM OLD.pro_expires_at
       OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
       OR NEW.razorpay_customer_id IS DISTINCT FROM OLD.razorpay_customer_id
       OR NEW.beta_tester IS DISTINCT FROM OLD.beta_tester THEN
        RAISE EXCEPTION 'Protected billing fields cannot be updated directly by client';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_protect_profile_billing_columns ON public.profiles;
CREATE TRIGGER tr_protect_profile_billing_columns
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_billing_columns();

-- ============================================================================
-- 4. Align document_revisions with client sync payload
-- ============================================================================
ALTER TABLE public.document_revisions
    ADD COLUMN IF NOT EXISTS change_summary text;

-- ============================================================================
-- 5. Early-bird reservations (replaces legacy feedbacks abuse)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.early_bird_reservations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    email text NOT NULL,
    plan_id text NOT NULL CHECK (plan_id IN ('lifetime', 'pro_monthly', 'pro_annual')),
    preferred_gateway text NOT NULL DEFAULT 'early_bird',
    amount_cents integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'notified', 'converted', 'cancelled')),
    client_info jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_early_bird_reservations_email_plan
    ON public.early_bird_reservations (lower(email), plan_id);

CREATE INDEX IF NOT EXISTS idx_early_bird_reservations_user_id
    ON public.early_bird_reservations (user_id);

ALTER TABLE public.early_bird_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own early bird reservations" ON public.early_bird_reservations;
CREATE POLICY "Users can view own early bird reservations"
    ON public.early_bird_reservations
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id OR public.is_admin());

CREATE OR REPLACE FUNCTION public.reserve_early_bird_spot(
    p_email text,
    p_plan_id text DEFAULT 'lifetime',
    p_preferred_gateway text DEFAULT 'early_bird',
    p_client_info jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_email text := lower(trim(COALESCE(p_email, '')));
    v_plan text := COALESCE(NULLIF(trim(p_plan_id), ''), 'lifetime');
    v_amount integer;
BEGIN
    IF v_email = '' OR v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid email address.');
    END IF;

    IF v_plan NOT IN ('lifetime', 'pro_monthly', 'pro_annual') THEN
        v_plan := 'lifetime';
    END IF;

    v_amount := CASE v_plan
        WHEN 'lifetime' THEN 4900
        WHEN 'pro_annual' THEN 7200
        ELSE 800
    END;

    INSERT INTO public.early_bird_reservations (
        user_id,
        email,
        plan_id,
        preferred_gateway,
        amount_cents,
        client_info
    )
    VALUES (
        auth.uid(),
        v_email,
        v_plan,
        COALESCE(NULLIF(trim(p_preferred_gateway), ''), 'early_bird'),
        v_amount,
        COALESCE(p_client_info, '{}'::jsonb)
    )
    ON CONFLICT ((lower(email)), plan_id) DO UPDATE SET
        user_id = COALESCE(public.early_bird_reservations.user_id, EXCLUDED.user_id),
        preferred_gateway = EXCLUDED.preferred_gateway,
        amount_cents = EXCLUDED.amount_cents,
        client_info = EXCLUDED.client_info;

    RETURN jsonb_build_object('success', true, 'plan_id', v_plan, 'email', v_email);
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_early_bird_spot(text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_early_bird_spot(text, text, text, jsonb) TO anon, authenticated, service_role;

-- ============================================================================
-- 6. Gateway-neutral payment_orders (ready for Stripe & Razorpay webhooks)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payment_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    gateway text NOT NULL CHECK (gateway IN ('stripe', 'razorpay')),
    plan_id text NOT NULL CHECK (plan_id IN ('lifetime', 'pro_monthly', 'pro_annual')),
    gateway_order_id text,
    gateway_payment_id text,
    amount_minor integer NOT NULL,
    currency text NOT NULL,
    status text NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'pending', 'paid', 'failed', 'refunded')),
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id
    ON public.payment_orders (user_id);

CREATE INDEX IF NOT EXISTS idx_payment_orders_gateway_order
    ON public.payment_orders (gateway, gateway_order_id);

DROP TRIGGER IF EXISTS set_payment_orders_updated_at ON public.payment_orders;
CREATE TRIGGER set_payment_orders_updated_at
    BEFORE UPDATE ON public.payment_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payment orders" ON public.payment_orders;
CREATE POLICY "Users can view own payment orders"
    ON public.payment_orders
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id OR public.is_admin());

-- ============================================================================
-- 7. Server-verified promo_redemptions & redeem_promo_code RPC
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.promo_redemptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code text NOT NULL,
    granted_tier text NOT NULL DEFAULT 'pro',
    pro_expires_at timestamptz,
    redeemed_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, code)
);

CREATE INDEX IF NOT EXISTS idx_promo_redemptions_user_id
    ON public.promo_redemptions (user_id);

ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own promo redemptions" ON public.promo_redemptions;
CREATE POLICY "Users can view own promo redemptions"
    ON public.promo_redemptions
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id OR public.is_admin());

CREATE OR REPLACE FUNCTION public.redeem_promo_code(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_code text := upper(trim(COALESCE(p_code, '')));
    v_expires_at timestamptz := now() + interval '90 days';
    v_existing_tier text;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication required.');
    END IF;

    IF v_code NOT IN ('EARLYBIRD', 'PRO2026', 'VIP', 'FOUNDER', 'LOCALFIRST', 'MDSTUDIO') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid or expired promo code. Please verify and try again.'
        );
    END IF;

    INSERT INTO public.promo_redemptions (user_id, code, granted_tier, pro_expires_at)
    VALUES (v_user_id, v_code, 'pro', v_expires_at)
    ON CONFLICT (user_id, code) DO NOTHING;

    SELECT subscription_tier INTO v_existing_tier
    FROM public.profiles
    WHERE id = v_user_id;

    PERFORM set_config('app.bypass_billing_guard', 'on', true);

    IF v_existing_tier IS DISTINCT FROM 'lifetime' THEN
        UPDATE public.profiles
        SET
            subscription_tier = 'pro',
            plan_id = 'promo_' || lower(v_code),
            pro_expires_at = GREATEST(COALESCE(pro_expires_at, now()), v_expires_at),
            updated_at = now()
        WHERE id = v_user_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'granted_tier', 'pro',
        'message', 'Code "' || v_code || '" applied. Pro Studio features are now active on your account.'
    );
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_promo_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_promo_code(text) TO authenticated, service_role;

-- ============================================================================
-- 8. Security hardening for admin RPCs & mutable search_path warnings
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = (SELECT auth.uid())
          AND role = 'admin'
    ) THEN
        RETURN TRUE;
    END IF;

    IF (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
       OR (auth.jwt() ->> 'role') = 'service_role' THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_approve_blog(p_article_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Forbidden: admin privileges required';
    END IF;

    UPDATE public.blog_articles
    SET status = 'published', updated_at = timezone('utc'::text, now())
    WHERE id = p_article_id;
    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reject_blog(p_article_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Forbidden: admin privileges required';
    END IF;

    UPDATE public.blog_articles
    SET status = 'rejected', updated_at = timezone('utc'::text, now())
    WHERE id = p_article_id;
    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_approve_review(p_review_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Forbidden: admin privileges required';
    END IF;

    UPDATE public.community_reviews
    SET status = 'approved', updated_at = timezone('utc'::text, now())
    WHERE id = p_review_id;
    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reject_review(p_review_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Forbidden: admin privileges required';
    END IF;

    UPDATE public.community_reviews
    SET status = 'rejected', updated_at = timezone('utc'::text, now())
    WHERE id = p_review_id;
    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_feedback_status(p_feedback_id uuid, p_status text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Forbidden: admin privileges required';
    END IF;

    UPDATE public.feedbacks
    SET status = p_status, updated_at = timezone('utc'::text, now())
    WHERE id = p_feedback_id;
    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.make_user_admin(target_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_user_id uuid;
BEGIN
    IF auth.role() <> 'service_role'
       AND current_user NOT IN ('postgres', 'supabase_admin') THEN
        RAISE EXCEPTION 'Forbidden: service_role privileges required';
    END IF;

    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower(target_email);
    IF v_user_id IS NULL THEN
        RETURN 'Error: User with email ' || target_email || ' not found in auth.users.';
    END IF;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN 'Success: ' || target_email || ' granted admin role.';
END;
$$;

CREATE OR REPLACE FUNCTION public.purge_expired_trash_documents(days_retention integer DEFAULT 30)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    purged_count integer;
BEGIN
    DELETE FROM public.documents
    WHERE is_deleted = true
      AND deleted_at < (now() - (days_retention || ' days')::interval);
    GET DIAGNOSTICS purged_count = ROW_COUNT;
    RETURN purged_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_daily_telemetry(
    p_date date,
    p_visitors integer DEFAULT 0,
    p_active_writers integer DEFAULT 0,
    p_session_seconds integer DEFAULT 0,
    p_feature text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.daily_analytics (
        date,
        visitors,
        active_writers,
        total_session_seconds,
        feature_usage,
        updated_at
    )
    VALUES (
        p_date,
        p_visitors,
        p_active_writers,
        p_session_seconds,
        CASE
            WHEN p_feature IS NOT NULL THEN jsonb_build_object(p_feature, 1)
            ELSE '{}'::jsonb
        END,
        timezone('utc'::text, now())
    )
    ON CONFLICT (date) DO UPDATE SET
        visitors = public.daily_analytics.visitors + EXCLUDED.visitors,
        active_writers = public.daily_analytics.active_writers + EXCLUDED.active_writers,
        total_session_seconds = public.daily_analytics.total_session_seconds + EXCLUDED.total_session_seconds,
        feature_usage = CASE
            WHEN p_feature IS NOT NULL THEN
                jsonb_set(
                    public.daily_analytics.feature_usage,
                    ARRAY[p_feature],
                    to_jsonb(COALESCE((public.daily_analytics.feature_usage->>p_feature)::int, 0) + 1),
                    true
                )
            ELSE public.daily_analytics.feature_usage
        END,
        updated_at = timezone('utc'::text, now());
END;
$$;

REVOKE ALL ON FUNCTION public.admin_approve_blog(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_reject_blog(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_approve_review(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_reject_review(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_update_feedback_status(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.make_user_admin(text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.admin_approve_blog(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_reject_blog(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_approve_review(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_reject_review(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_update_feedback_status(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.make_user_admin(text) TO service_role;

COMMIT;
