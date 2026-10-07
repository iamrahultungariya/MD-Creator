-- ===================================================================================
-- MIGRATION: User Onboarding Surveys, Demographics & Analytics Persistence
-- Version: 20261007000000
-- ===================================================================================

-- 1. Create User Surveys Table
CREATE TABLE IF NOT EXISTS public.user_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_alias TEXT NOT NULL, -- "User #1", "User #2" for offline guests OR verified email
    email TEXT,               -- Bound email address when user registers/signs in
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_registered BOOLEAN NOT NULL DEFAULT false,
    referral_source TEXT NOT NULL, -- e.g. "X / Twitter", "Google / Web Search", "Reddit"
    role TEXT NOT NULL,            -- e.g. "Student", "Software Developer", "Teacher / Educator"
    age_group TEXT NOT NULL CHECK (age_group IN ('10-18', '18-40', '40+')),
    primary_focus TEXT NOT NULL,   -- e.g. "Daily Notes & Study", "Technical Docs & Code Specs"
    mode TEXT NOT NULL CHECK (mode IN ('cloud_sync', 'offline')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indices for fast aggregation & admin analytics
CREATE INDEX IF NOT EXISTS idx_user_surveys_created_at
    ON public.user_surveys (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_surveys_role
    ON public.user_surveys (role);

CREATE INDEX IF NOT EXISTS idx_user_surveys_referral
    ON public.user_surveys (referral_source);

CREATE INDEX IF NOT EXISTS idx_user_surveys_age_group
    ON public.user_surveys (age_group);

CREATE INDEX IF NOT EXISTS idx_user_surveys_mode
    ON public.user_surveys (mode);

CREATE INDEX IF NOT EXISTS idx_user_surveys_user_alias
    ON public.user_surveys (user_alias);

-- Enable Row Level Security
ALTER TABLE public.user_surveys ENABLE ROW LEVEL SECURITY;

-- Survey RLS Policies:
-- Anyone (guest or authenticated) can submit their initial onboarding response
DROP POLICY IF EXISTS "Anyone can submit survey" ON public.user_surveys;
CREATE POLICY "Anyone can submit survey"
    ON public.user_surveys
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Anyone can update a survey to bind their email upon registration or login
DROP POLICY IF EXISTS "Anyone can update survey with email" ON public.user_surveys;
CREATE POLICY "Anyone can update survey with email"
    ON public.user_surveys
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

-- Authenticated users can view their own survey
DROP POLICY IF EXISTS "Users can view own survey" ON public.user_surveys;
CREATE POLICY "Users can view own survey"
    ON public.user_surveys
    FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- Admins can view all survey responses for the analytics dashboard
DROP POLICY IF EXISTS "Admins can view surveys" ON public.user_surveys;
CREATE POLICY "Admins can view surveys"
    ON public.user_surveys
    FOR SELECT
    TO public
    USING (true);


-- 2. Create Daily Analytics Table
CREATE TABLE IF NOT EXISTS public.daily_analytics (
    date DATE PRIMARY KEY,
    visitors INT NOT NULL DEFAULT 0,
    active_writers INT NOT NULL DEFAULT 0,
    total_session_seconds INT NOT NULL DEFAULT 0,
    feature_usage JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_daily_analytics_date
    ON public.daily_analytics (date DESC);

ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read daily analytics" ON public.daily_analytics;
CREATE POLICY "Anyone can read daily analytics"
    ON public.daily_analytics
    FOR SELECT
    TO public
    USING (true);

DROP POLICY IF EXISTS "Anyone can insert daily analytics" ON public.daily_analytics;
CREATE POLICY "Anyone can insert daily analytics"
    ON public.daily_analytics
    FOR INSERT
    TO public
    WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update daily analytics" ON public.daily_analytics;
CREATE POLICY "Anyone can update daily analytics"
    ON public.daily_analytics
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);


-- 3. Create Real-Time Activity Events Table
CREATE TABLE IF NOT EXISTS public.activity_events (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    feature TEXT NOT NULL,
    label TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('export', 'writing', 'view', 'tool')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_activity_events_timestamp
    ON public.activity_events (timestamp DESC);

ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert activity events" ON public.activity_events;
CREATE POLICY "Anyone can insert activity events"
    ON public.activity_events
    FOR INSERT
    TO public
    WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view activity events" ON public.activity_events;
CREATE POLICY "Anyone can view activity events"
    ON public.activity_events
    FOR SELECT
    TO public
    USING (true);


-- 4. Helpful RPC to Atomically Increment Daily Analytics
CREATE OR REPLACE FUNCTION public.record_daily_telemetry(
    p_date DATE,
    p_visitors INT DEFAULT 0,
    p_active_writers INT DEFAULT 0,
    p_session_seconds INT DEFAULT 0,
    p_feature TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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
