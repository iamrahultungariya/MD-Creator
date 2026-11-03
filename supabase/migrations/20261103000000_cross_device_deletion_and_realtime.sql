-- ===================================================================================
-- MIGRATION: Cross-Device Deletion Reconciliation & Supabase Realtime Parity
-- Version: 20261103000000
-- ===================================================================================

-- 1. Add Soft Deletion Columns to public.documents
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Performance Indexes for Realtime Filtering and Quick Sync
CREATE INDEX IF NOT EXISTS idx_documents_user_deleted 
ON public.documents(user_id, is_deleted, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_deleted_at 
ON public.documents(deleted_at) 
WHERE is_deleted = true;

-- 3. Set Replica Identity to FULL
-- Essential for Supabase Realtime so UPDATE and DELETE events broadcast full row data
ALTER TABLE public.documents REPLICA IDENTITY FULL;

-- 4. Enable Supabase Realtime Broadcast on documents table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'documents'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
  END IF;
END $$;

-- 5. Hardened Row Level Security (RLS) Policies
-- Ensure users have uninterrupted permission to read, insert, update (including soft-delete flags),
-- and hard-delete their own documents.

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Select Policy: User can read all their documents (active or soft-deleted for sync reconciliation)
DROP POLICY IF EXISTS "Users can read own documents" ON public.documents;
CREATE POLICY "Users can read own documents"
  ON public.documents
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Insert Policy: User can insert new documents
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
CREATE POLICY "Users can insert own documents"
  ON public.documents
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Update Policy: User can update their own documents (including is_deleted and deleted_at)
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
CREATE POLICY "Users can update own documents"
  ON public.documents
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Delete Policy: User can hard-delete their documents if permanently emptying trash
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
CREATE POLICY "Users can delete own documents"
  ON public.documents
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- 6. Helper Function: Cleanup Expired Trash Documents
-- Purges soft-deleted documents older than the retention period (default 30 days)
CREATE OR REPLACE FUNCTION public.purge_expired_trash_documents(days_retention INTEGER DEFAULT 30)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  purged_count INTEGER;
BEGIN
  DELETE FROM public.documents
  WHERE is_deleted = true 
    AND deleted_at < (now() - (days_retention || ' days')::INTERVAL);
  GET DIAGNOSTICS purged_count = ROW_COUNT;
  RETURN purged_count;
END;
$$;
