-- ===================================================================================
-- MIGRATION: Cross-Device Sync, Bulk Bundle Sharing & Safe View-Edit Snapshots
-- Version: 20261023000000
-- ===================================================================================

-- 1. EXTEND documents TABLE FOR ROBUST CROSS-DEVICE SYNC & PIN/TRASH STATE
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Indexes for fast sync queries
CREATE INDEX IF NOT EXISTS idx_documents_user_deleted ON public.documents(user_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_documents_user_pinned ON public.documents(user_id, is_pinned);

-- 2. EXTEND published_documents TABLE FOR VIEW-EDIT MODE & BUNDLE SHARING
ALTER TABLE public.published_documents ADD COLUMN IF NOT EXISTS permission_mode TEXT DEFAULT 'view' CHECK (permission_mode IN ('view', 'edit'));
ALTER TABLE public.published_documents ADD COLUMN IF NOT EXISTS bundle_slug TEXT DEFAULT NULL;

-- Indexes for bundle and slug lookups
CREATE INDEX IF NOT EXISTS idx_published_documents_bundle_slug ON public.published_documents(bundle_slug);
CREATE INDEX IF NOT EXISTS idx_published_documents_slug ON public.published_documents(slug);

-- 3. ENSURE document_revisions TABLE EXISTS FOR AUTOMATIC SAFETY SNAPSHOTS
CREATE TABLE IF NOT EXISTS public.document_revisions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    document_id TEXT REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    word_count INTEGER DEFAULT 0,
    change_summary TEXT DEFAULT 'Auto-save snapshot',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_revisions_doc_id ON public.document_revisions(document_id);
ALTER TABLE public.document_revisions ENABLE ROW LEVEL SECURITY;

-- Document owners can view and insert their own revisions
DROP POLICY IF EXISTS "Users can read own revisions" ON public.document_revisions;
CREATE POLICY "Users can read own revisions"
    ON public.document_revisions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_revisions.document_id
            AND d.user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can insert own revisions" ON public.document_revisions;
CREATE POLICY "Users can insert own revisions"
    ON public.document_revisions FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_revisions.document_id
            AND d.user_id = (select auth.uid())
        )
    );

-- 4. READ PERMISSIONS FOR PUBLIC PUBLISHED DOCUMENTS AND BUNDLES
-- Allow anonymous & authenticated visitors to read published document entries
DROP POLICY IF EXISTS "Public can view active published documents" ON public.published_documents;
CREATE POLICY "Public can view active published documents"
    ON public.published_documents FOR SELECT
    TO anon, authenticated
    USING (is_public = true);

-- Allow anonymous visitors to read titles of published documents
DROP POLICY IF EXISTS "Public can read published document titles" ON public.documents;
CREATE POLICY "Public can read published document titles"
    ON public.documents FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.published_documents p
            WHERE p.document_id = documents.id
            AND p.is_public = true
        )
    );

-- Allow anonymous visitors to read contents of published documents
DROP POLICY IF EXISTS "Public can read published document contents" ON public.document_contents;
CREATE POLICY "Public can read published document contents"
    ON public.document_contents FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.published_documents p
            WHERE p.document_id = document_contents.id
            AND p.is_public = true
        )
    );

-- 5. UPDATED RPC: get_published_document
-- Returns permission_mode, bundle_slug, and password status safely
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
    SELECT id, document_id, user_id, slug, is_public, permission_mode, bundle_slug, view_count, published_at, updated_at
    INTO v_pub
    FROM public.published_documents
    WHERE slug = lower(trim(p_slug)) AND is_public = true
    LIMIT 1;

    IF v_pub.id IS NULL THEN
        RETURN jsonb_build_object('status', 'not_found');
    END IF;

    -- 2. Check password protection
    SELECT password_hash, failed_attempts, locked_until
    INTO v_secret
    FROM public.published_document_secrets
    WHERE published_id = v_pub.id;

    IF v_secret.password_hash IS NOT NULL THEN
        IF v_secret.locked_until IS NOT NULL AND v_secret.locked_until > now() THEN
            RETURN jsonb_build_object('status', 'rate_limited');
        END IF;

        IF p_password IS NULL OR length(trim(p_password)) = 0 THEN
            RETURN jsonb_build_object('status', 'password_required');
        END IF;

        IF v_secret.password_hash <> crypt(trim(p_password), v_secret.password_hash) THEN
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
            'id', v_pub.id,
            'document_id', v_pub.document_id,
            'slug', v_pub.slug,
            'title', coalesce(v_doc.title, 'Published Document'),
            'content', coalesce(v_content.content, ''),
            'permission_mode', coalesce(v_pub.permission_mode, 'view'),
            'bundle_slug', v_pub.bundle_slug,
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

-- 6. NEW RPC: get_published_bundle
-- Returns all documents grouped within a multi-document bundle
CREATE OR REPLACE FUNCTION public.get_published_bundle(
    p_bundle_slug TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_clean_slug TEXT := lower(trim(p_bundle_slug));
    v_docs JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', p.document_id,
            'slug', p.slug,
            'title', coalesce(d.title, 'Document'),
            'content', coalesce(c.content, ''),
            'permission_mode', coalesce(p.permission_mode, 'view'),
            'word_count', coalesce(d.word_count, 0)
        )
    )
    INTO v_docs
    FROM public.published_documents p
    JOIN public.documents d ON d.id = p.document_id
    LEFT JOIN public.document_contents c ON c.id = p.document_id
    WHERE p.bundle_slug = v_clean_slug AND p.is_public = true;

    IF v_docs IS NULL OR jsonb_array_length(v_docs) = 0 THEN
        RETURN jsonb_build_object('status', 'not_found', 'bundle', NULL);
    END IF;

    RETURN jsonb_build_object(
        'status', 'ok',
        'bundle', jsonb_build_object(
            'bundle_slug', v_clean_slug,
            'title', 'Bundle: ' || v_clean_slug,
            'permission_mode', (v_docs->0->>'permission_mode'),
            'documents', v_docs,
            'published_at', now()
        )
    );
END;
$$;

-- 7. NEW RPC: submit_public_document_edit
-- STRICT SNAPSHOT SAFETY:
-- Automatically creates a historical revision snapshot in document_revisions BEFORE
-- applying any edits, ensuring the note owner can always revert changes.
CREATE OR REPLACE FUNCTION public.submit_public_document_edit(
    p_slug TEXT,
    p_new_content TEXT,
    p_summary TEXT DEFAULT 'Collaborative Edit via Shared Link'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_pub RECORD;
    v_old_content TEXT;
    v_doc RECORD;
    v_word_count INTEGER;
    v_size_bytes INTEGER;
    v_now TIMESTAMPTZ := now();
BEGIN
    -- 1. Validate published document and permission mode
    SELECT id, document_id, permission_mode, is_public
    INTO v_pub
    FROM public.published_documents
    WHERE slug = lower(trim(p_slug))
    LIMIT 1;

    IF v_pub.id IS NULL OR NOT v_pub.is_public THEN
        RETURN jsonb_build_object('success', false, 'error', 'Document not found or is unpublished.');
    END IF;

    IF v_pub.permission_mode <> 'edit' THEN
        RETURN jsonb_build_object('success', false, 'error', 'This document is view-only. Edits are not permitted.');
    END IF;

    -- 2. Fetch current content to preserve snapshot
    SELECT content INTO v_old_content
    FROM public.document_contents
    WHERE id = v_pub.document_id;

    SELECT title INTO v_doc
    FROM public.documents
    WHERE id = v_pub.document_id;

    -- 3. AUTOMATIC SNAPSHOT CREATION (Preserves original owner content)
    INSERT INTO public.document_revisions (
        id,
        document_id,
        content,
        word_count,
        change_summary,
        created_at
    )
    VALUES (
        gen_random_uuid()::text,
        v_pub.document_id,
        coalesce(v_old_content, ''),
        coalesce(array_length(regexp_split_to_array(trim(coalesce(v_old_content, '')), '\s+'), 1), 0),
        coalesce(p_summary, 'Auto-Snapshot (Before Shared Edit)'),
        v_now
    );

    -- 4. Calculate word count & byte size of new content
    v_word_count := coalesce(array_length(regexp_split_to_array(trim(p_new_content), '\s+'), 1), 0);
    v_size_bytes := octet_length(p_new_content);

    -- 5. Apply updated content
    INSERT INTO public.document_contents (id, content, updated_at)
    VALUES (v_pub.document_id, p_new_content, v_now)
    ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        updated_at = EXCLUDED.updated_at;

    -- 6. Update document metadata
    UPDATE public.documents
    SET word_count = v_word_count,
        size_bytes = v_size_bytes,
        updated_at = v_now
    WHERE id = v_pub.document_id;

    -- 7. Update published document timestamp
    UPDATE public.published_documents
    SET updated_at = v_now
    WHERE id = v_pub.id;

    RETURN jsonb_build_object(
        'success', true,
        'version_snapshot_created', true,
        'updated_at', v_now
    );
END;
$$;

-- 8. GRANT RPC EXECUTION PERMISSIONS
GRANT EXECUTE ON FUNCTION public.get_published_document(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_published_bundle(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_public_document_edit(TEXT, TEXT, TEXT) TO anon, authenticated;
