-- ===================================================================================
-- MIGRATION: Community Feedbacks Table, RLS Policies & Admin Panel Realtime Setup
-- Version: 20261104000000
-- Run this script directly in the Supabase SQL Editor.
-- ===================================================================================

-- 1. Create feedbacks table if it does not exist
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN ('bug', 'feature', 'praise', 'question')),
    sentiment TEXT NOT NULL CHECK (sentiment IN ('terrible', 'bad', 'okay', 'good', 'amazing')),
    subject TEXT NOT NULL CHECK (char_length(subject) >= 2 AND char_length(subject) <= 300),
    message TEXT NOT NULL CHECK (char_length(message) >= 5 AND char_length(message) <= 5000),
    user_name TEXT,
    user_email TEXT,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    willingness_to_pay TEXT,
    paid_feature_request TEXT,
    system_info JSONB,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'resolved', 'archived')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_feedbacks_status_created
    ON public.feedbacks (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feedbacks_category_priority
    ON public.feedbacks (category, priority);

CREATE INDEX IF NOT EXISTS idx_feedbacks_user_email
    ON public.feedbacks (user_email);

-- 3. Explicit Grants (CRITICAL for non-logged-in guest submissions)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.feedbacks TO anon, authenticated, service_role;

-- 4. Enable Row Level Security
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- 5. Helper Function: is_admin() safe fallback
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Check if user is in user_roles table with role 'admin'
  IF EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;

  -- 2. Check if auth.users raw_app_meta_data contains role 'admin'
  IF (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR (auth.jwt() ->> 'role') = 'service_role' THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- 6. Row Level Security (RLS) Policies

-- Policy A: Anyone (Guest/Anon or Logged-in) can INSERT feedback
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedbacks;
DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.feedbacks;
CREATE POLICY "Anyone can submit feedback"
    ON public.feedbacks
    FOR INSERT
    TO public
    WITH CHECK (status = 'new');

-- Policy B: Authenticated users can view their own submitted feedbacks
DROP POLICY IF EXISTS "Users can view own feedbacks" ON public.feedbacks;
CREATE POLICY "Users can view own feedbacks"
    ON public.feedbacks
    FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- Policy C: Admins can view ALL feedbacks
DROP POLICY IF EXISTS "Admins can view all feedbacks" ON public.feedbacks;
CREATE POLICY "Admins can view all feedbacks"
    ON public.feedbacks
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Policy D: Admins can update status, priority, or admin notes
DROP POLICY IF EXISTS "Admins can update feedbacks" ON public.feedbacks;
CREATE POLICY "Admins can update feedbacks"
    ON public.feedbacks
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Policy E: Admins can delete spam or obsolete feedbacks
DROP POLICY IF EXISTS "Admins can delete feedbacks" ON public.feedbacks;
CREATE POLICY "Admins can delete feedbacks"
    ON public.feedbacks
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 7. Realtime Broadcast Support
ALTER TABLE public.feedbacks REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'feedbacks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.feedbacks;
  END IF;
END $$;
