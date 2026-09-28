-- ===================================================================================
-- MIGRATION 5: Authoritative Backend Moderation & Admin Role Assignment
-- Version: 20260928000005
-- Run this in Supabase: SQL Editor -> New Query -> Paste & Run
-- ===================================================================================

-- 1. Grant Admin Role to Owner (tungariyarahul08@gmail.com)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'tungariyarahul08@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Helper Function: Grant Admin Role by Email (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.make_user_admin(target_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE LOWER(email) = LOWER(target_email);
    IF v_user_id IS NULL THEN
        RETURN 'Error: User with email ' || target_email || ' not found in auth.users.';
    END IF;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN 'Success: ' || target_email || ' granted admin role.';
END;
$$;

GRANT EXECUTE ON FUNCTION public.make_user_admin(TEXT) TO anon, authenticated;

-- 3. Community Blog Articles RLS Sanitation
ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;

-- Anyone (guests or logged-in users) can submit a blog article in 'pending' status
DROP POLICY IF EXISTS "Writers can submit articles" ON public.blog_articles;
DROP POLICY IF EXISTS "Anyone can submit articles" ON public.blog_articles;
CREATE POLICY "Anyone can submit articles" 
    ON public.blog_articles 
    FOR INSERT 
    WITH CHECK (
        (status = 'pending') OR 
        (status = 'published' AND public.is_admin())
    );

-- Public can read published articles
DROP POLICY IF EXISTS "Public can view published articles" ON public.blog_articles;
CREATE POLICY "Public can view published articles" 
    ON public.blog_articles 
    FOR SELECT 
    USING (status = 'published');

-- Submitters can view their own articles even if pending
DROP POLICY IF EXISTS "Submitters can view own articles" ON public.blog_articles;
CREATE POLICY "Submitters can view own articles" 
    ON public.blog_articles 
    FOR SELECT 
    USING ((select auth.uid()) = user_id);

-- Admins can view all articles
DROP POLICY IF EXISTS "Admins can view all articles" ON public.blog_articles;
CREATE POLICY "Admins can view all articles" 
    ON public.blog_articles 
    FOR SELECT 
    TO authenticated
    USING (public.is_admin());

-- Admins can update articles (approve/reject/edit)
DROP POLICY IF EXISTS "Admins can update articles" ON public.blog_articles;
CREATE POLICY "Admins can update articles" 
    ON public.blog_articles 
    FOR UPDATE 
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Admins can delete articles
DROP POLICY IF EXISTS "Admins can delete articles" ON public.blog_articles;
CREATE POLICY "Admins can delete articles" 
    ON public.blog_articles 
    FOR DELETE 
    TO authenticated
    USING (public.is_admin());

-- 4. Community Reviews RLS Sanitation
ALTER TABLE public.community_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a review with pending status
DROP POLICY IF EXISTS "Anyone can submit a review with pending status" ON public.community_reviews;
CREATE POLICY "Anyone can submit a review with pending status" 
    ON public.community_reviews 
    FOR INSERT 
    WITH CHECK (status = 'pending');

-- Public can read approved reviews
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.community_reviews;
CREATE POLICY "Public can view approved reviews" 
    ON public.community_reviews 
    FOR SELECT 
    USING (status = 'approved');

-- Submitters can view their own reviews
DROP POLICY IF EXISTS "Submitters can view own reviews" ON public.community_reviews;
CREATE POLICY "Submitters can view own reviews" 
    ON public.community_reviews 
    FOR SELECT 
    USING ((select auth.uid()) = user_id);

-- Admins can view all reviews
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.community_reviews;
CREATE POLICY "Admins can view all reviews" 
    ON public.community_reviews 
    FOR SELECT 
    TO authenticated
    USING (public.is_admin());

-- Admins can update reviews
DROP POLICY IF EXISTS "Admins can update reviews" ON public.community_reviews;
CREATE POLICY "Admins can update reviews" 
    ON public.community_reviews 
    FOR UPDATE 
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Admins can delete reviews
DROP POLICY IF EXISTS "Admins can delete reviews" ON public.community_reviews;
CREATE POLICY "Admins can delete reviews" 
    ON public.community_reviews 
    FOR DELETE 
    TO authenticated
    USING (public.is_admin());

-- 5. Feedbacks Table RLS Sanitation
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Anyone can submit feedback
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedbacks;
CREATE POLICY "Anyone can submit feedback"
    ON public.feedbacks
    FOR INSERT
    WITH CHECK (status = 'new');

-- Submitters can view own feedback
DROP POLICY IF EXISTS "Users can view own feedbacks" ON public.feedbacks;
CREATE POLICY "Users can view own feedbacks"
    ON public.feedbacks
    FOR SELECT
    USING ((select auth.uid()) = user_id);

-- Admins can view all feedbacks
DROP POLICY IF EXISTS "Admins can view all feedbacks" ON public.feedbacks;
CREATE POLICY "Admins can view all feedbacks" 
    ON public.feedbacks 
    FOR SELECT 
    TO authenticated
    USING (public.is_admin());

-- Admins can update feedbacks
DROP POLICY IF EXISTS "Admins can update feedbacks" ON public.feedbacks;
CREATE POLICY "Admins can update feedbacks" 
    ON public.feedbacks 
    FOR UPDATE 
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Admins can delete feedbacks
DROP POLICY IF EXISTS "Admins can delete feedbacks" ON public.feedbacks;
CREATE POLICY "Admins can delete feedbacks" 
    ON public.feedbacks 
    FOR DELETE 
    TO authenticated
    USING (public.is_admin());

-- 6. Direct Moderation RPC Functions (Instant 1-Click Operations)
CREATE OR REPLACE FUNCTION public.admin_approve_blog(p_article_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    UPDATE public.blog_articles
    SET status = 'published', updated_at = timezone('utc'::text, now())
    WHERE id = p_article_id;
    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reject_blog(p_article_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    UPDATE public.blog_articles
    SET status = 'rejected', updated_at = timezone('utc'::text, now())
    WHERE id = p_article_id;
    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_approve_review(p_review_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    UPDATE public.community_reviews
    SET status = 'approved', updated_at = timezone('utc'::text, now())
    WHERE id = p_review_id;
    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reject_review(p_review_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    UPDATE public.community_reviews
    SET status = 'rejected', updated_at = timezone('utc'::text, now())
    WHERE id = p_review_id;
    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_feedback_status(p_feedback_id UUID, p_status TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    UPDATE public.feedbacks
    SET status = p_status, updated_at = timezone('utc'::text, now())
    WHERE id = p_feedback_id;
    RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_approve_blog(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reject_blog(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_approve_review(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reject_review(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_feedback_status(UUID, TEXT) TO anon, authenticated;
