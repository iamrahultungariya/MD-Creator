-- ===================================================================================
-- MIGRATION: Remove Onboarding Surveys & Detail Gathering
-- Version: 20261031000000
-- ===================================================================================

-- 1. Drop user_surveys table and all attached policies, indexes, and constraints
DROP TABLE IF EXISTS public.user_surveys CASCADE;
