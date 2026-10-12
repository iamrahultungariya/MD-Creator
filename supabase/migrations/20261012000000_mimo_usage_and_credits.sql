-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 20261012000000_mimo_usage_and_credits.sql
-- Description: Server-Side Quota & Credit Management for Mimo AI Companion
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.mimo_user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint TEXT,
  daily_usage_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (daily_usage_percent >= 0 AND daily_usage_percent <= 100),
  monthly_doc_gen_count INT NOT NULL DEFAULT 0,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_month_reset TEXT NOT NULL DEFAULT to_char(CURRENT_DATE, 'YYYY-MM'),
  tokens_consumed BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_mimo_usage_user UNIQUE (user_id),
  CONSTRAINT uq_mimo_usage_device UNIQUE (device_fingerprint)
);

-- Indices for rapid lookup
CREATE INDEX IF NOT EXISTS idx_mimo_usage_user_id ON public.mimo_user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_mimo_usage_device ON public.mimo_user_usage(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_mimo_usage_reset_date ON public.mimo_user_usage(last_reset_date);

-- Enable RLS
ALTER TABLE public.mimo_user_usage ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own usage
CREATE POLICY "Users can view own mimo usage"
  ON public.mimo_user_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow anonymous or authenticated to view by device_fingerprint via security definer RPC
-- (Direct write is restricted to server RPC functions for tamper-proof enforcement)

-- ─────────────────────────────────────────────────────────────────────────────
-- Stored Procedure: check_and_consume_mimo_quota
-- Atomic server-side capacity check and quota deduction
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.check_and_consume_mimo_quota(
  p_device_id TEXT,
  p_cost_percent NUMERIC,
  p_is_doc_gen BOOLEAN DEFAULT false,
  p_tokens BIGINT DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_record RECORD;
  v_today DATE := CURRENT_DATE;
  v_this_month TEXT := to_char(CURRENT_DATE, 'YYYY-MM');
  v_current_percent NUMERIC(5, 2) := 0.00;
  v_current_doc_gen INT := 0;
  v_new_percent NUMERIC(5, 2);
  v_new_doc_gen INT;
BEGIN
  -- Validate cost parameter
  IF p_cost_percent <= 0 THEN
    p_cost_percent := 3.00;
  END IF;

  -- Locate existing usage record by user_id or device_fingerprint
  IF v_user_id IS NOT NULL THEN
    SELECT * INTO v_record FROM public.mimo_user_usage WHERE user_id = v_user_id FOR UPDATE;
  ELSE
    SELECT * INTO v_record FROM public.mimo_user_usage WHERE device_fingerprint = p_device_id FOR UPDATE;
  END IF;

  -- Initialize record if none exists
  IF v_record IS NULL THEN
    INSERT INTO public.mimo_user_usage (
      user_id,
      device_fingerprint,
      daily_usage_percent,
      monthly_doc_gen_count,
      last_reset_date,
      last_month_reset,
      tokens_consumed
    ) VALUES (
      v_user_id,
      CASE WHEN v_user_id IS NULL THEN p_device_id ELSE NULL END,
      0.00,
      0,
      v_today,
      v_this_month,
      0
    )
    RETURNING * INTO v_record;
  END IF;

  -- Automatic daily reset at midnight
  IF v_record.last_reset_date < v_today THEN
    v_record.daily_usage_percent := 0.00;
    v_record.last_reset_date := v_today;
  END IF;

  -- Automatic monthly reset
  IF v_record.last_month_reset <> v_this_month THEN
    v_record.monthly_doc_gen_count := 0;
    v_record.last_month_reset := v_this_month;
  END IF;

  v_current_percent := v_record.daily_usage_percent;
  v_current_doc_gen := v_record.monthly_doc_gen_count;

  -- Check monthly full doc generation limit (max 3/month)
  IF p_is_doc_gen AND v_current_doc_gen >= 3 THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'current_usage_percent', v_current_percent,
      'remaining_percent', GREATEST(0, 100 - v_current_percent),
      'monthly_doc_gen', v_current_doc_gen,
      'reason', 'Monthly document generation quota reached (3/month on free tier). Connect your personal Gemini key for unlimited generation.'
    );
  END IF;

  -- Check daily capacity limit (100%)
  IF (v_current_percent + p_cost_percent) > 100.00 THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'current_usage_percent', v_current_percent,
      'remaining_percent', GREATEST(0, 100 - v_current_percent),
      'monthly_doc_gen', v_current_doc_gen,
      'reason', 'Daily AI capacity reached (100%). Resets at midnight, or connect your personal free Gemini API key for unlimited deep thinking.'
    );
  END IF;

  -- Deduct capacity atomically
  v_new_percent := LEAST(100.00, v_current_percent + p_cost_percent);
  v_new_doc_gen := CASE WHEN p_is_doc_gen THEN v_current_doc_gen + 1 ELSE v_current_doc_gen END;

  UPDATE public.mimo_user_usage
  SET
    daily_usage_percent = v_new_percent,
    monthly_doc_gen_count = v_new_doc_gen,
    last_reset_date = v_today,
    last_month_reset = v_this_month,
    tokens_consumed = tokens_consumed + p_tokens,
    updated_at = NOW()
  WHERE id = v_record.id;

  RETURN jsonb_build_object(
    'allowed', true,
    'current_usage_percent', v_new_percent,
    'remaining_percent', GREATEST(0, 100 - v_new_percent),
    'monthly_doc_gen', v_new_doc_gen,
    'reason', null
  );
END;
$$;
