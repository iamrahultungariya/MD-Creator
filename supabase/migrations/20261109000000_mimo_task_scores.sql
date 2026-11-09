-- ===================================================================================
-- MIGRATION: Mimo AI Intent Task Preference Scoreboard & Cross-Device Cloud Sync
-- Version: 20261109000000
-- Run this script directly in the Supabase Project: SQL Editor -> New Query -> Run
-- ===================================================================================

-- 1. Safeguard: Add is_ai_excluded column to documents table if missing
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS is_ai_excluded BOOLEAN NOT NULL DEFAULT false;

-- 2. Dedicated Table for Mimo Task Preference Scores
CREATE TABLE IF NOT EXISTS public.mimo_task_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task TEXT NOT NULL,
    label TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 1 CHECK (score >= 0),
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_mimo_task_user UNIQUE (user_id, task)
);

-- 3. Performance Indexes for Rapid Intent Weight Lookups
CREATE INDEX IF NOT EXISTS idx_mimo_task_scores_user 
    ON public.mimo_task_scores (user_id, score DESC, last_used_at DESC);

CREATE INDEX IF NOT EXISTS idx_mimo_task_scores_task 
    ON public.mimo_task_scores (task);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.mimo_task_scores ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: Strictly User-Owned (No Leakage Across Users)
DROP POLICY IF EXISTS "Users can view own mimo task scores" ON public.mimo_task_scores;
CREATE POLICY "Users can view own mimo task scores"
    ON public.mimo_task_scores 
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own mimo task scores" ON public.mimo_task_scores;
CREATE POLICY "Users can insert own mimo task scores"
    ON public.mimo_task_scores 
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own mimo task scores" ON public.mimo_task_scores;
CREATE POLICY "Users can update own mimo task scores"
    ON public.mimo_task_scores 
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own mimo task scores" ON public.mimo_task_scores;
CREATE POLICY "Users can delete own mimo task scores"
    ON public.mimo_task_scores 
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 6. Atomic Stored Procedure: sync_mimo_task_scores
-- Accepts a JSON array of task scores and performs atomic upsert with conflict resolution
-- Rules:
--   - Keeps highest score between local and cloud (GREATEST)
--   - Keeps latest last_used_at timestamp
--   - Completely idempotent & safe for repeated debounced pushes
CREATE OR REPLACE FUNCTION public.sync_mimo_task_scores(p_scores JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_item JSONB;
    v_count INT := 0;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthenticated user');
    END IF;

    IF p_scores IS NULL OR jsonb_array_length(p_scores) = 0 THEN
        RETURN jsonb_build_object('success', true, 'synced', 0);
    END IF;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_scores)
    LOOP
        IF v_item->>'task' IS NOT NULL AND trim(v_item->>'task') != '' THEN
            INSERT INTO public.mimo_task_scores (
                user_id,
                task,
                label,
                score,
                last_used_at,
                updated_at
            ) VALUES (
                v_user_id,
                v_item->>'task',
                COALESCE(v_item->>'label', v_item->>'task'),
                COALESCE((v_item->>'score')::INT, 1),
                COALESCE((v_item->>'lastUsedAt')::TIMESTAMPTZ, timezone('utc'::text, now())),
                timezone('utc'::text, now())
            )
            ON CONFLICT (user_id, task)
            DO UPDATE SET
                score = GREATEST(public.mimo_task_scores.score, EXCLUDED.score),
                label = COALESCE(EXCLUDED.label, public.mimo_task_scores.label),
                last_used_at = GREATEST(public.mimo_task_scores.last_used_at, EXCLUDED.last_used_at),
                updated_at = timezone('utc'::text, now());

            v_count := v_count + 1;
        END IF;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'synced', v_count);
END;
$$;

-- 7. Stored Procedure: get_mimo_task_scores
-- Returns user's preference scores for cross-device hydration
CREATE OR REPLACE FUNCTION public.get_mimo_task_scores()
RETURNS TABLE (
    task TEXT,
    label TEXT,
    score INT,
    last_used_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
    SELECT task, label, score, last_used_at
    FROM public.mimo_task_scores
    WHERE user_id = auth.uid()
    ORDER BY score DESC, last_used_at DESC;
$$;

-- 8. Explicit Permissions & Execution Grants
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.mimo_task_scores TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_mimo_task_scores(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_mimo_task_scores() TO authenticated;
