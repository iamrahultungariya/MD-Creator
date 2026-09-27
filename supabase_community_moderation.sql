-- ===================================================================================
-- MD WRITER - COMMUNITY MODERATION & EDITORIAL WORKFLOW MIGRATION
-- Version: v0.9.1
-- Generated: 2026-09-27
-- Instructions: Execute this SQL in your Supabase SQL Editor.
-- ===================================================================================

-- 1. Community Reviews Table
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

-- 2. Community Blog Articles Table
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

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_community_reviews_status_created 
    ON public.community_reviews (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_articles_status_created 
    ON public.blog_articles (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_articles_slug 
    ON public.blog_articles (slug);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.community_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;

-- 5. Community Reviews Security Policies
-- Public can read only approved reviews
CREATE POLICY "Public can view approved reviews" 
    ON public.community_reviews 
    FOR SELECT 
    USING (status = 'approved');

-- Anyone can submit a review, but it always starts in 'pending' status
CREATE POLICY "Anyone can submit a review with pending status" 
    ON public.community_reviews 
    FOR INSERT 
    WITH CHECK (status = 'pending');

-- 6. Blog Articles Security Policies
-- Public can read only published articles
CREATE POLICY "Public can view published articles" 
    ON public.blog_articles 
    FOR SELECT 
    USING (status = 'published');

-- Anyone can submit a story, but it always starts in 'pending' status
CREATE POLICY "Anyone can submit an article with pending status" 
    ON public.blog_articles 
    FOR INSERT 
    WITH CHECK (status = 'pending');

-- 7. Trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_community_reviews_updated_at ON public.community_reviews;
CREATE TRIGGER set_community_reviews_updated_at
    BEFORE UPDATE ON public.community_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_blog_articles_updated_at ON public.blog_articles;
CREATE TRIGGER set_blog_articles_updated_at
    BEFORE UPDATE ON public.blog_articles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Note on Admin Access:
-- Configure your admin email in your Supabase project settings or pass it via service_role / RPC.
-- On the client side, set VITE_ADMIN_EMAIL=your-email@domain.com in your .env file.
