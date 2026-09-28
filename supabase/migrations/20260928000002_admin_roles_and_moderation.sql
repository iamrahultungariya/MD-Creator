-- ===================================================================================
-- MIGRATION 2: Role-Based Access Control (RBAC) & Editorial Moderation
-- Version: 20260928000002
-- ===================================================================================

-- 1. User Roles Table (Source of Truth for Admin & Editorial Permissions)
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'editor', 'pro_writer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own assigned roles
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- 2. Authorization Helper Functions (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.has_role(p_user_id UUID, p_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, extensions
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = p_user_id AND role = p_role
    );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, extensions
AS $$
    SELECT public.has_role(auth.uid(), 'admin');
$$;

GRANT EXECUTE ON FUNCTION public.has_role(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- 3. Community Reviews Table
CREATE TABLE IF NOT EXISTS public.community_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Writer',
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL CHECK (char_length(content) >= 10 AND char_length(content) <= 1000),
    verified BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_community_reviews_status_created 
    ON public.community_reviews (status, created_at DESC);

ALTER TABLE public.community_reviews ENABLE ROW LEVEL SECURITY;

-- Public can read approved reviews
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.community_reviews;
CREATE POLICY "Public can view approved reviews" 
    ON public.community_reviews 
    FOR SELECT 
    USING (status = 'approved');

-- Admins can read all reviews (including pending and rejected)
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.community_reviews;
CREATE POLICY "Admins can view all reviews" 
    ON public.community_reviews 
    FOR SELECT 
    TO authenticated
    USING (public.is_admin());

-- Anyone can submit a review with status strictly 'pending'
DROP POLICY IF EXISTS "Anyone can submit a review with pending status" ON public.community_reviews;
CREATE POLICY "Anyone can submit a review with pending status" 
    ON public.community_reviews 
    FOR INSERT 
    WITH CHECK (status = 'pending');

-- Only Admins can update status or moderate reviews
DROP POLICY IF EXISTS "Admins can update reviews" ON public.community_reviews;
CREATE POLICY "Admins can update reviews" 
    ON public.community_reviews 
    FOR UPDATE 
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Only Admins can delete reviews
DROP POLICY IF EXISTS "Admins can delete reviews" ON public.community_reviews;
CREATE POLICY "Admins can delete reviews" 
    ON public.community_reviews 
    FOR DELETE 
    TO authenticated
    USING (public.is_admin());

-- 4. Community Blog Articles Table
CREATE TABLE IF NOT EXISTS public.blog_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 250),
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Engineering', 'Productivity', 'Guides', 'Architecture', 'Design')),
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL DEFAULT 'Contributor',
    author_avatar TEXT,
    read_time TEXT NOT NULL DEFAULT '3 min read',
    featured BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_blog_articles_status_created 
    ON public.blog_articles (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_articles_slug 
    ON public.blog_articles (slug);

ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;

-- Public can read published articles
DROP POLICY IF EXISTS "Public can view published articles" ON public.blog_articles;
CREATE POLICY "Public can view published articles" 
    ON public.blog_articles 
    FOR SELECT 
    USING (status = 'published');

-- Admins can view all articles (pending, published, rejected)
DROP POLICY IF EXISTS "Admins can view all articles" ON public.blog_articles;
CREATE POLICY "Admins can view all articles" 
    ON public.blog_articles 
    FOR SELECT 
    TO authenticated
    USING (public.is_admin());

-- Authenticated writers can submit articles (always pending unless admin)
DROP POLICY IF EXISTS "Writers can submit articles" ON public.blog_articles;
CREATE POLICY "Writers can submit articles" 
    ON public.blog_articles 
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        (status = 'pending') OR 
        (status = 'published' AND public.is_admin())
    );

-- Only Admins can moderate / update status
DROP POLICY IF EXISTS "Admins can update articles" ON public.blog_articles;
CREATE POLICY "Admins can update articles" 
    ON public.blog_articles 
    FOR UPDATE 
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Only Admins can delete articles
DROP POLICY IF EXISTS "Admins can delete articles" ON public.blog_articles;
CREATE POLICY "Admins can delete articles" 
    ON public.blog_articles 
    FOR DELETE 
    TO authenticated
    USING (public.is_admin());
