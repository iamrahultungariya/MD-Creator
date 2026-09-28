-- ===================================================================================
-- MIGRATION 4: Community Feedback, Bug Reports & Inquiries
-- Version: 20260928000004
-- ===================================================================================

-- 1. Create Community Feedbacks Table
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

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_feedbacks_status_created
    ON public.feedbacks (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feedbacks_category_priority
    ON public.feedbacks (category, priority);

-- Enable Row Level Security
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policies
-- Anyone (authenticated or guest/anon) can submit feedback with initial status 'new'
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedbacks;
CREATE POLICY "Anyone can submit feedback"
    ON public.feedbacks
    FOR INSERT
    WITH CHECK (status = 'new');

-- Authenticated submitters can view their own submitted feedbacks
DROP POLICY IF EXISTS "Users can view own feedbacks" ON public.feedbacks;
CREATE POLICY "Users can view own feedbacks"
    ON public.feedbacks
    FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- Only Admins can view all feedbacks
DROP POLICY IF EXISTS "Admins can view all feedbacks" ON public.feedbacks;
CREATE POLICY "Admins can view all feedbacks"
    ON public.feedbacks
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Only Admins can update status, priority, or admin notes
DROP POLICY IF EXISTS "Admins can update feedbacks" ON public.feedbacks;
CREATE POLICY "Admins can update feedbacks"
    ON public.feedbacks
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Only Admins can delete feedbacks
DROP POLICY IF EXISTS "Admins can delete feedbacks" ON public.feedbacks;
CREATE POLICY "Admins can delete feedbacks"
    ON public.feedbacks
    FOR DELETE
    TO authenticated
    USING (public.is_admin());
