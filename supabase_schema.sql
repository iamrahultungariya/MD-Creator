-- ==============================================================================
-- MD Writer — Supabase Database Schema V2 (Production Ready & Migration-Safe)
-- Run this script in your Supabase Project: SQL Editor -> New Query -> Run
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- OPTIONAL CLEAN RESET:
-- If you want to wipe previous test tables and start completely fresh,
-- uncomment the lines below before running. Otherwise, the script will
-- automatically migrate your existing tables without data loss.
--
-- DROP TABLE IF EXISTS public.published_documents CASCADE;
-- DROP TABLE IF EXISTS public.pdf_templates CASCADE;
-- DROP TABLE IF EXISTS public.document_revisions CASCADE;
-- DROP TABLE IF EXISTS public.document_contents CASCADE;
-- DROP TABLE IF EXISTS public.documents CASCADE;
-- DROP TABLE IF EXISTS public.user_settings CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. AUTOMATIC SCHEMA MIGRATION SAFEGUARD
-- Upgrades existing V1 tables where documents.id was UUID to TEXT.
-- This ensures Dexie offline IDs (e.g. 'doc-getting-started') and UUIDs both work
-- seamlessly and resolves foreign key type mismatch errors (ERROR: 42804 & 0A000).
-- ------------------------------------------------------------------------------

-- 0a. Drop existing RLS policies that reference documents.id so Postgres allows type conversion
DROP POLICY IF EXISTS "Users can view own document contents" ON public.document_contents;
DROP POLICY IF EXISTS "Users can insert own document contents" ON public.document_contents;
DROP POLICY IF EXISTS "Users can update own document contents" ON public.document_contents;
DROP POLICY IF EXISTS "Users can delete own document contents" ON public.document_contents;

DROP POLICY IF EXISTS "Users can view own document revisions" ON public.document_revisions;
DROP POLICY IF EXISTS "Users can insert own document revisions" ON public.document_revisions;

DROP POLICY IF EXISTS "Users can view own documents or demo docs" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;

-- 0b. Drop foreign key constraints that depend on documents.id
ALTER TABLE IF EXISTS public.document_contents 
    DROP CONSTRAINT IF EXISTS document_contents_id_fkey;
    
ALTER TABLE IF EXISTS public.document_revisions 
    DROP CONSTRAINT IF EXISTS document_revisions_document_id_fkey;

ALTER TABLE IF EXISTS public.published_documents 
    DROP CONSTRAINT IF EXISTS published_documents_document_id_fkey;

-- 0c. Keep published_documents intact without dropping existing data
-- Table creation below uses CREATE TABLE IF NOT EXISTS

-- 0d. Perform column type conversion from UUID to TEXT
DO $$
BEGIN
    -- If documents table already exists and uses UUID for id, convert to TEXT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'documents' 
          AND column_name = 'id' 
          AND data_type = 'uuid'
    ) THEN

        -- 2. Convert public.documents.id from UUID to TEXT
        ALTER TABLE public.documents 
            ALTER COLUMN id DROP DEFAULT;
        ALTER TABLE public.documents 
            ALTER COLUMN id TYPE TEXT USING id::text;
        ALTER TABLE public.documents 
            ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

        -- 3. Convert public.document_contents.id from UUID to TEXT
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'document_contents' 
              AND column_name = 'id' 
              AND data_type = 'uuid'
        ) THEN
            ALTER TABLE public.document_contents 
                ALTER COLUMN id TYPE TEXT USING id::text;
        END IF;

        -- 4. Convert public.document_revisions id & document_id from UUID to TEXT
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'document_revisions' 
              AND column_name = 'id' 
              AND data_type = 'uuid'
        ) THEN
            ALTER TABLE public.document_revisions 
                ALTER COLUMN id DROP DEFAULT;
            ALTER TABLE public.document_revisions 
                ALTER COLUMN id TYPE TEXT USING id::text;
            ALTER TABLE public.document_revisions 
                ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'document_revisions' 
              AND column_name = 'document_id' 
              AND data_type = 'uuid'
        ) THEN
            ALTER TABLE public.document_revisions 
                ALTER COLUMN document_id TYPE TEXT USING document_id::text;
        END IF;

        -- 5. Restore foreign key constraints
        ALTER TABLE public.document_contents 
            ADD CONSTRAINT document_contents_id_fkey 
            FOREIGN KEY (id) REFERENCES public.documents(id) ON DELETE CASCADE;

        ALTER TABLE public.document_revisions 
            ADD CONSTRAINT document_revisions_document_id_fkey 
            FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Retain published_documents data cleanly

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (Linked to Supabase auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    email TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'team')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Ensure subscription_tier column exists if profiles table was created in V1
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name = 'subscription_tier'
    ) THEN
        ALTER TABLE public.profiles 
            ADD COLUMN subscription_tier TEXT DEFAULT 'free' 
            CHECK (subscription_tier IN ('free', 'pro', 'team'));
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. USER SETTINGS TABLE (Persistent editor and PDF export preferences)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    -- PDF Export Studio Defaults
    default_pdf_preset TEXT DEFAULT 'editorial',
    default_font_family TEXT DEFAULT 'sans',
    default_accent_color TEXT DEFAULT '#4f46e5',
    default_page_size TEXT DEFAULT 'a4',
    default_page_margins TEXT DEFAULT 'normal',
    include_cover_page BOOLEAN DEFAULT false,
    include_toc BOOLEAN DEFAULT false,
    include_page_numbers BOOLEAN DEFAULT true,
    watermark_text TEXT DEFAULT '',
    -- Editor Preferences
    typewriter_mode BOOLEAN DEFAULT false,
    default_view_mode TEXT DEFAULT 'split',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Backfill user_settings for existing profiles
INSERT INTO public.user_settings (user_id)
SELECT id FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. DOCUMENTS TABLE (Metadata & Snippets - supports text IDs for offline sync)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Document',
    snippet TEXT DEFAULT '',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_pinned BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    word_count INTEGER DEFAULT 0,
    size_bytes BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    last_opened_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4. DOCUMENT CONTENTS TABLE (Full Markdown document body)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.document_contents (
    id TEXT PRIMARY KEY REFERENCES public.documents(id) ON DELETE CASCADE,
    content TEXT DEFAULT '' NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 5. DOCUMENT REVISIONS TABLE (Snapshots for Time-Travel & Version History)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.document_revisions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    document_id TEXT REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    word_count INTEGER DEFAULT 0,
    change_summary TEXT DEFAULT 'Auto-save snapshot',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. CUSTOM PDF BRANDING TEMPLATES TABLE (Custom saved export presets)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pdf_templates (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    preset TEXT NOT NULL DEFAULT 'editorial',
    font_family TEXT NOT NULL DEFAULT 'sans',
    accent_color TEXT NOT NULL DEFAULT '#4f46e5',
    page_size TEXT NOT NULL DEFAULT 'a4',
    margins TEXT NOT NULL DEFAULT 'normal',
    include_cover_page BOOLEAN DEFAULT false,
    cover_subtitle TEXT DEFAULT '',
    cover_author TEXT DEFAULT '',
    cover_org TEXT DEFAULT '',
    include_toc BOOLEAN DEFAULT false,
    include_page_numbers BOOLEAN DEFAULT true,
    watermark_text TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 7. PUBLISHED DOCUMENTS TABLE (Instant Public Web Sharing & Password Protection)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.published_documents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    document_id TEXT REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    is_public BOOLEAN DEFAULT true,
    password_hash TEXT DEFAULT NULL,
    view_count INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 8. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON public.documents(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_is_pinned ON public.documents(is_pinned);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON public.documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_revisions_doc_id ON public.document_revisions(document_id);
CREATE INDEX IF NOT EXISTS idx_pdf_templates_user_id ON public.pdf_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_published_slug ON public.published_documents(slug);

-- ------------------------------------------------------------------------------
-- 9. AUTOMATIC TIMESTAMP TRIGGERS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER set_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_documents_updated_at ON public.documents;
CREATE TRIGGER set_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_document_contents_updated_at ON public.document_contents;
CREATE TRIGGER set_document_contents_updated_at
    BEFORE UPDATE ON public.document_contents
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_pdf_templates_updated_at ON public.pdf_templates;
CREATE TRIGGER set_pdf_templates_updated_at
    BEFORE UPDATE ON public.pdf_templates
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_published_documents_updated_at ON public.published_documents;
CREATE TRIGGER set_published_documents_updated_at
    BEFORE UPDATE ON public.published_documents
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 10. NEW USER REGISTRATION TRIGGER (Creates Profile and User Settings)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Create User Profile
    INSERT INTO public.profiles (id, display_name, avatar_url, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
        NEW.email
    )
    ON CONFLICT (id) DO NOTHING;

    -- 2. Initialize Default Settings
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.published_documents ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User Settings Policies
DROP POLICY IF EXISTS "Users can manage own settings" ON public.user_settings;
CREATE POLICY "Users can manage own settings"
    ON public.user_settings FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Documents Policies
DROP POLICY IF EXISTS "Users can view own documents or demo docs" ON public.documents;
CREATE POLICY "Users can view own documents or demo docs"
    ON public.documents FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
CREATE POLICY "Users can insert own documents"
    ON public.documents FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
CREATE POLICY "Users can update own documents"
    ON public.documents FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
CREATE POLICY "Users can delete own documents"
    ON public.documents FOR DELETE
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Document Contents Policies
DROP POLICY IF EXISTS "Users can view own document contents" ON public.document_contents;
CREATE POLICY "Users can view own document contents"
    ON public.document_contents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_contents.id
            AND (d.user_id = auth.uid() OR d.user_id IS NULL)
        )
    );

DROP POLICY IF EXISTS "Users can insert own document contents" ON public.document_contents;
CREATE POLICY "Users can insert own document contents"
    ON public.document_contents FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_contents.id
            AND (d.user_id = auth.uid() OR d.user_id IS NULL)
        )
    );

DROP POLICY IF EXISTS "Users can update own document contents" ON public.document_contents;
CREATE POLICY "Users can update own document contents"
    ON public.document_contents FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_contents.id
            AND (d.user_id = auth.uid() OR d.user_id IS NULL)
        )
    );

DROP POLICY IF EXISTS "Users can delete own document contents" ON public.document_contents;
CREATE POLICY "Users can delete own document contents"
    ON public.document_contents FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_contents.id
            AND (d.user_id = auth.uid() OR d.user_id IS NULL)
        )
    );

-- Revisions Policies
DROP POLICY IF EXISTS "Users can view own document revisions" ON public.document_revisions;
CREATE POLICY "Users can view own document revisions"
    ON public.document_revisions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_revisions.document_id
            AND (d.user_id = auth.uid() OR d.user_id IS NULL)
        )
    );

DROP POLICY IF EXISTS "Users can insert own document revisions" ON public.document_revisions;
CREATE POLICY "Users can insert own document revisions"
    ON public.document_revisions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_revisions.document_id
            AND (d.user_id = auth.uid() OR d.user_id IS NULL)
        )
    );

-- PDF Templates Policies
DROP POLICY IF EXISTS "Users can manage own PDF templates" ON public.pdf_templates;
CREATE POLICY "Users can manage own PDF templates"
    ON public.pdf_templates FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Published Documents Policies (Public reading for published notes)
DROP POLICY IF EXISTS "Anyone can read active public published documents" ON public.published_documents;
CREATE POLICY "Anyone can read active public published documents"
    ON public.published_documents FOR SELECT
    USING (is_public = true);

DROP POLICY IF EXISTS "Authors can manage their published documents" ON public.published_documents;
CREATE POLICY "Authors can manage their published documents"
    ON public.published_documents FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
