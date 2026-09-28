-- ===================================================================================
-- MIGRATION 3: Document Isolation Hardening & Waitlist RLS Sanitation
-- Version: 20260928000003
-- ===================================================================================

-- 1. Multi-Tenant Document Isolation
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Documents: Owner Only
DROP POLICY IF EXISTS "Users can read own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can manage own documents" ON public.documents;
CREATE POLICY "Users can manage own documents"
    ON public.documents FOR ALL
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- Document Contents: Owner Only
DROP POLICY IF EXISTS "Users can read own contents" ON public.document_contents;
DROP POLICY IF EXISTS "Users can manage own contents" ON public.document_contents;
CREATE POLICY "Users can manage own contents"
    ON public.document_contents FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_contents.id
            AND d.user_id = (select auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_contents.id
            AND d.user_id = (select auth.uid())
        )
    );

-- Document Revisions: Owner Only
DROP POLICY IF EXISTS "Users can read own revisions" ON public.document_revisions;
DROP POLICY IF EXISTS "Users can manage own revisions" ON public.document_revisions;
CREATE POLICY "Users can manage own revisions"
    ON public.document_revisions FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_revisions.document_id
            AND d.user_id = (select auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_revisions.document_id
            AND d.user_id = (select auth.uid())
        )
    );

-- Profiles: Owner Read/Update
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = id)
    WITH CHECK ((select auth.uid()) = id);

-- User Settings: Owner Only
DROP POLICY IF EXISTS "Users can manage own settings" ON public.user_settings;
CREATE POLICY "Users can manage own settings"
    ON public.user_settings FOR ALL
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- PDF Custom Templates: Owner Only
DROP POLICY IF EXISTS "Users can manage own templates" ON public.pdf_templates;
CREATE POLICY "Users can manage own templates"
    ON public.pdf_templates FOR ALL
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- 2. Drop legacy waitlist table and all associated policies (Permanently Retired)
DROP TABLE IF EXISTS public.waitlist CASCADE;
