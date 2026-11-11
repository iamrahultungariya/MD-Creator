-- Add public.document_contents to realtime publication
-- This allows real-time broadcasts for note text content changes across devices

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'document_contents'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.document_contents;
  END IF;
END $$;

ALTER TABLE public.document_contents REPLICA IDENTITY FULL;
