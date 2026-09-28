-- ===================================================================================
-- MIGRATION 1: Published Documents Security & Server-Side Password Hashing
-- Version: 20260928000001
-- ===================================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create separate table or columns for sensitive password hashes and rate-limit tracking
CREATE TABLE IF NOT EXISTS public.published_document_secrets (
    published_id TEXT PRIMARY KEY REFERENCES public.published_documents(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    failed_attempts INTEGER DEFAULT 0 NOT NULL,
    locked_until TIMESTAMPTZ DEFAULT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on secrets - strict denial to public
ALTER TABLE public.published_document_secrets ENABLE ROW LEVEL SECURITY;

-- Only document owner or service_role can interact with secrets
DROP POLICY IF EXISTS "Owner can manage document secrets" ON public.published_document_secrets;
CREATE POLICY "Owner can manage document secrets"
    ON public.published_document_secrets
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.published_documents p
            WHERE p.id = published_document_secrets.published_id
            AND p.user_id = (select auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.published_documents p
            WHERE p.id = published_document_secrets.published_id
            AND p.user_id = (select auth.uid())
        )
    );

-- 2. Drop legacy public SELECT policies that allowed direct table scraping or hash leakage
DROP POLICY IF EXISTS "Public can view published documents" ON public.published_documents;
DROP POLICY IF EXISTS "Allow public view published docs" ON public.published_documents;
DROP POLICY IF EXISTS "Anyone can read published document contents" ON public.document_contents;
DROP POLICY IF EXISTS "Public can read published contents" ON public.document_contents;
DROP POLICY IF EXISTS "Owner can select own published documents" ON public.published_documents;
DROP POLICY IF EXISTS "Owner can manage own published documents" ON public.published_documents;

-- Enforce that public users MUST go through RPC get_published_document
CREATE POLICY "Owner can manage own published documents"
    ON public.published_documents
    FOR ALL
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- 3. Stored Procedure: set_publish_password (Owner only)
CREATE OR REPLACE FUNCTION public.set_publish_password(
    p_published_id TEXT,
    p_password TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_user_id UUID;
    v_hashed TEXT;
BEGIN
    -- Verify owner
    SELECT user_id INTO v_user_id
    FROM public.published_documents
    WHERE id = p_published_id;

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Document not found');
    END IF;

    IF auth.uid() IS NULL OR auth.uid() <> v_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;

    IF p_password IS NULL OR length(trim(p_password)) = 0 THEN
        -- Clear password protection
        DELETE FROM public.published_document_secrets WHERE published_id = p_published_id;
        UPDATE public.published_documents 
        SET password_hash = NULL, updated_at = now() 
        WHERE id = p_published_id;
        RETURN jsonb_build_object('success', true, 'is_protected', false);
    END IF;

    -- Hash password securely inside Postgres
    v_hashed := crypt(trim(p_password), gen_salt('bf', 8));

    INSERT INTO public.published_document_secrets (published_id, password_hash, failed_attempts, locked_until, updated_at)
    VALUES (p_published_id, v_hashed, 0, NULL, now())
    ON CONFLICT (published_id) DO UPDATE SET
        password_hash = v_hashed,
        failed_attempts = 0,
        locked_until = NULL,
        updated_at = now();

    -- Also flag parent record for indexing without leaking hash
    UPDATE public.published_documents 
    SET password_hash = 'PROTECTED', updated_at = now() 
    WHERE id = p_published_id;

    RETURN jsonb_build_object('success', true, 'is_protected', true);
END;
$$;

-- 4. Stored Procedure: get_published_document (Public endpoint with rate limiting)
CREATE OR REPLACE FUNCTION public.get_published_document(
    p_slug TEXT,
    p_password TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_pub RECORD;
    v_secret RECORD;
    v_doc RECORD;
    v_content RECORD;
BEGIN
    -- 1. Find document by slug
    SELECT id, document_id, user_id, slug, is_public, view_count, published_at, updated_at
    INTO v_pub
    FROM public.published_documents
    WHERE slug = lower(trim(p_slug)) AND is_public = true
    LIMIT 1;

    IF v_pub.id IS NULL THEN
        RETURN jsonb_build_object('status', 'not_found');
    END IF;

    -- 2. Check if password protected
    SELECT password_hash, failed_attempts, locked_until
    INTO v_secret
    FROM public.published_document_secrets
    WHERE published_id = v_pub.id;

    IF v_secret.password_hash IS NOT NULL THEN
        -- Check lock / throttle (10 minute lockout after 5 failed attempts)
        IF v_secret.locked_until IS NOT NULL AND v_secret.locked_until > now() THEN
            RETURN jsonb_build_object('status', 'rate_limited');
        END IF;

        IF p_password IS NULL OR length(trim(p_password)) = 0 THEN
            RETURN jsonb_build_object('status', 'password_required');
        END IF;

        -- Verify bcrypt hash
        IF v_secret.password_hash <> crypt(trim(p_password), v_secret.password_hash) THEN
            -- Increment failure count
            IF v_secret.failed_attempts + 1 >= 5 THEN
                UPDATE public.published_document_secrets
                SET failed_attempts = v_secret.failed_attempts + 1,
                    locked_until = now() + INTERVAL '10 minutes',
                    updated_at = now()
                WHERE published_id = v_pub.id;
                RETURN jsonb_build_object('status', 'rate_limited');
            ELSE
                UPDATE public.published_document_secrets
                SET failed_attempts = v_secret.failed_attempts + 1,
                    updated_at = now()
                WHERE published_id = v_pub.id;
                RETURN jsonb_build_object('status', 'wrong_password');
            END IF;
        END IF;

        -- Password succeeded, reset failed attempts
        UPDATE public.published_document_secrets
        SET failed_attempts = 0, locked_until = NULL, updated_at = now()
        WHERE published_id = v_pub.id;
    END IF;

    -- 3. Fetch title and content
    SELECT title INTO v_doc FROM public.documents WHERE id = v_pub.document_id;
    SELECT content INTO v_content FROM public.document_contents WHERE id = v_pub.document_id;

    -- 4. Atomically increment view count
    UPDATE public.published_documents
    SET view_count = coalesce(view_count, 0) + 1
    WHERE id = v_pub.id;

    RETURN jsonb_build_object(
        'status', 'ok',
        'document', jsonb_build_object(
            'slug', v_pub.slug,
            'title', coalesce(v_doc.title, 'Published Document'),
            'content', coalesce(v_content.content, ''),
            'published_at', v_pub.published_at,
            'updated_at', v_pub.updated_at,
            'view_count', coalesce(v_pub.view_count, 0) + 1,
            'is_password_protected', (v_secret.password_hash IS NOT NULL),
            'allow_copy_markdown', true,
            'show_reading_stats', true,
            'theme', 'default'
        )
    );
END;
$$;

-- Grant execution to public and authenticated users
GRANT EXECUTE ON FUNCTION public.get_published_document(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_publish_password(TEXT, TEXT) TO authenticated;
