-- ─────────────────────────────────────────────────────────────────────────────
-- MD Writer — Production Security & Performance Migration (Updated)
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Atomic view counter RPC ─────────────────────────────────────────────
-- published_documents.id is TEXT (to support offline & UUID string IDs).
-- Parameter p_id MUST be TEXT to match the column type.

DROP FUNCTION IF EXISTS public.increment_view_count(UUID);
DROP FUNCTION IF EXISTS public.increment_view_count(TEXT);

CREATE OR REPLACE FUNCTION public.increment_view_count(p_id TEXT)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE published_documents
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = p_id;
$$;

-- Grant execute to anon and authenticated roles (public documents are viewable by all)
GRANT EXECUTE ON FUNCTION public.increment_view_count(TEXT) TO anon, authenticated;


-- ── 2. Per-user slug uniqueness ────────────────────────────────────────────
-- Slugs are scoped per (document_id, user_id) to avoid cross-user collisions.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'published_documents_slug_key'
    AND conrelid = 'published_documents'::regclass
  ) THEN
    ALTER TABLE published_documents DROP CONSTRAINT published_documents_slug_key;
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'published_documents_document_id_user_id_key'
    AND conrelid = 'published_documents'::regclass
  ) THEN
    ALTER TABLE published_documents
      ADD CONSTRAINT published_documents_document_id_user_id_key
      UNIQUE (document_id, user_id);
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_published_documents_slug
  ON published_documents (slug);


-- ── 3. Role-Based Access Control (user_roles & has_role) ────────────────────

CREATE TABLE IF NOT EXISTS public.user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_lookup ON public.user_roles(user_id, role);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;

CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(p_user_id UUID, p_role TEXT)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id AND role = p_role
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_role(UUID, TEXT) TO anon, authenticated;


-- ── 4. RLS hardening on waitlist table ────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.waitlist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  plan       TEXT DEFAULT 'pro',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Allow all read on waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Allow admin read on waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Users can read own waitlist entry" ON public.waitlist;
DROP POLICY IF EXISTS "Users can insert own waitlist entry" ON public.waitlist;
DROP POLICY IF EXISTS "Allow public insert into waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Admins can update waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Admins can delete waitlist entries" ON public.waitlist;

-- Admins can read all waitlist entries; users can read their own
CREATE POLICY "Allow read on waitlist"
  ON public.waitlist FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') = email
    OR public.has_role(auth.uid(), 'admin')
  );

-- Anyone can submit their email to the waitlist
CREATE POLICY "Allow insert into waitlist"
  ON public.waitlist FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );

CREATE POLICY "Admins can update waitlist"
  ON public.waitlist FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete waitlist entries"
  ON public.waitlist FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

GRANT INSERT ON public.waitlist TO anon, authenticated;
GRANT SELECT ON public.waitlist TO authenticated;


-- ── 5. RLS on published_documents ─────────────────────────────────────────

ALTER TABLE public.published_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public documents are readable by anyone" ON public.published_documents;
DROP POLICY IF EXISTS "Anyone can read active public published documents" ON public.published_documents;

CREATE POLICY "Public documents are readable by anyone"
  ON public.published_documents FOR SELECT
  USING (is_public = true);

DROP POLICY IF EXISTS "Owners can manage their published documents" ON public.published_documents;
DROP POLICY IF EXISTS "Authors can manage their published documents" ON public.published_documents;

CREATE POLICY "Owners can manage their published documents"
  ON public.published_documents FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
