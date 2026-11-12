# Pricing, Locked Checkout, Mimo 3.5 Flash-Lite Protocol & Supabase Cleanup Implementation Plan

> **For agentic workers:** Execute tasks sequentially with TDD verification (`npm test`, `npx tsc --noEmit`, `npm run build`) and Supabase advisor checks (`get_advisors`).
> **Spec:** [2026-11-12-pricing-checkout-mimo-supabase-design.md](file:///d:/do%20note%20delete/Desktop/MD%20Creator/docs/superpowers/specs/2026-11-12-pricing-checkout-mimo-supabase-design.md)

**Selected Architecture:** **A + 1**
- **A (Mimo 3.5 Flash-Lite):** Single-pass Expert Markdown Writing Assistant system prompt (`Understand -> Decompose -> Develop -> Verify -> Polish`) + deterministic Adaptive Depth selector + live 5-step execution timeline UI scoped strictly to `gemini-3.5-flash-lite` + anti-AI-slop redesign of Mimo Usage tab and `MimoQuotaRing`.
- **1 (Supabase Lean Core + Payment Base):** Drop unused tables/views/RPCs (`beta_tester_audit`, `mimo_user_usage`, `pdf_templates`, `user_settings`, `public_profiles`, waitlist/beta RPCs) after updating `handle_new_user()`, harden `profiles` + admin/telemetry RPCs, add `early_bird_reservations`, `payment_orders`, `promo_redemptions`, `document_revisions.change_summary`, and wire `documents.is_ai_excluded` & cloud `daily_analytics`/`activity_events` reads.

---

## Phase 5.1 & 5.2: Pricing Cards & Minimal Locked Checkout Flow

### Task 1: Environment-Safe Supabase & Auth Imports for Node Tests
- **Files:** `src/lib/supabase.ts`, `src/stores/useAuthStore.ts`
- **Changes:** Guard `import.meta.env` with optional chaining (`import.meta.env?.VITE_*`) so `npx tsx --test` can import service modules directly without browser Vite shims.

### Task 2: Staged Gateway Adapters & Reservation/Promo RPCs
- **Files:** `src/services/paymentService.ts`, `tests/home/checkoutFlow.test.ts`
- **Changes:**
  - Enrich `SUBSCRIPTION_PLANS` with `shortName`, `billingInterval`, `amountCentsUSD`, and `amountPaiseINR`.
  - Add typed `GatewayCheckoutResult` (`{ success: false, status: 'staged', message }`) on `initiateStripeCheckout` and `initiateRazorpayCheckout` while keeping payment gateways cleanly unintegrated.
  - Replace the broken `feedbacks` table write in `reserveEarlyBirdSpot` with `supabase.rpc('reserve_early_bird_spot', ...)`.
  - Update `redeemPromoCode` to invoke `supabase.rpc('redeem_promo_code', { p_code })` when authenticated, preserving local demo fallback.

### Task 3: Pro-Card-Scoped Billing Toggle & Zero-Icon Pricing Cards
- **Files:** `src/components/home/PricingSection.tsx`, `src/pages/PricingPage.tsx`, `tests/home/pricing.test.ts`
- **Changes:**
  - Remove global top-level billing toggles from landing pricing header and `/pricing` hero.
  - Embed the `Yearly -25%` / `Monthly` segmented control exclusively inside the **Pro Studio** card (`proInterval`).
  - Route Pro CTA clicks dynamically via `openCheckout(proInterval === 'annual' ? 'pro_annual' : 'pro_monthly')`.
  - Remove decorative `lucide-react` icons (`Check`, `Minus`, `Sparkles`) and glassmorphic `backdrop-blur-*` surfaces; use flat hairline borders, `tabular-nums` pricing typography, and `✓` / `—` table markers.

### Task 4: Minimal Locked-Plan Native `<dialog>` Checkout Flow
- **Files:** `src/stores/useCheckoutModalStore.ts`, `src/components/checkout/CheckoutModal.tsx`, `src/index.css`
- **Changes:**
  - Add `entryPlanGroup: 'lifetime' | 'pro'` derived from the clicked plan in `openCheckout`.
  - Rebuild `CheckoutModal` with native `<dialog closedby="any">`, `showModal()`/`close()` synchronization, `returnValue` reset on close, `autoFocus` on email, and Safari/fallback pointer-outside dismiss without custom `Esc` listeners or `role="dialog"`.
  - Add `dialog:modal` and `dialog::backdrop` overscroll containment styles in `src/index.css`.
  - Lock checkout summary to the clicked plan group (no Lifetime <-> Pro switcher inside modal; Pro shows inline Monthly/Annual toggle only).
  - Replace bright/boxed cards with quiet typographic summary, inline `"Have an invite or promo code?"` toggle, and zero decorative icons (close `X` only).

---

## Phase 5.3: Mimo `gemini-3.5-flash-lite` Protocol, 5-Step Timeline & Usage Redesign

### Task 5: Write Failing Unit & Component Source Tests for 5.3
- **File:** `tests/mimo/flashLiteProtocol.test.ts`
- **Assertions:**
  - `resolveAdaptiveDepth` returns `'simple'`, `'standard'`, `'detailed'`, or `'comprehensive'` accurately from prompt hints and selection context.
  - `buildFlashLiteExecutionProtocolPrompt` includes the 5-step internal workflow (`Understand`, `Decompose`, `Develop`, `Verify`, `Polish`), Adaptive Depth guidance, content quality rules, Markdown standards, and strict suppression of internal reasoning output.
  - `MimoChatMessage.tsx` renders `MimoExecutionTimeline` when `message.activity?.protocolTimeline` exists (regardless of `showThinking`) and hides `MimoThoughtBlock` for Flash-Lite protocol runs.
  - `MimoExecutionTimeline.tsx`, `MimoQuotaRing.tsx`, and `MimoSettingsPopover.tsx` Usage tab contain zero `animate-ping` classes and zero decorative Lucide icons (`Zap`, `Brain`, `BarChart3`, `Key`, `Sparkles`).
- **Verify:** Run `npx tsx --test tests/mimo/flashLiteProtocol.test.ts` and confirm failures before implementation.

### Task 6: Protocol Timeline Types & Adaptive Depth Router
- **Files:** `src/features/mimo/types/mimoTypes.ts`, `src/features/mimo/services/promptRouter.ts`
- **Changes:**
  - Add `MimoProtocolStepId = 'understand' | 'decompose' | 'develop' | 'verify' | 'polish'`, `MimoProtocolStepStatus = 'pending' | 'active' | 'done'`, `MimoProtocolStep`, and `MimoProtocolTimeline` (`enabled: boolean; currentStep: MimoProtocolStepId; steps: MimoProtocolStep[]; summaryLabel?: string`).
  - Attach `protocolTimeline?: MimoProtocolTimeline` to `ActivityTelemetry`.
  - Export `AdaptiveDepth` and `resolveAdaptiveDepth({ query, wordCount, hasSelection, intent })` in `promptRouter.ts`.

### Task 7: Single-Pass Flash-Lite Expert Markdown Prompt & Stream Stage Callbacks
- **Files:** `src/features/mimo/services/intentPromptService.ts`, `src/features/mimo/services/mimoGeminiService.ts`
- **Changes:**
  - Export `buildFlashLiteExecutionProtocolPrompt(intent, options)` incorporating the Expert Markdown Writing Assistant prompt (`Identity & Role`, 5-step internal `Execution Protocol`, `Content Quality Rules`, `Adaptive Depth`, `Markdown Standards`, `Output Rules`, `Final Quality Standard`) plus surgical diff/replacement format rules when `intent === 'DOC_TRANSFORM'`, document grounding for `DOC_QUERY`, and explicit suppression of private reasoning leakage.
  - Add `onProtocolStage?: (step: MimoProtocolStepId, status?: 'active' | 'done') => void` to `StreamCallbacks`.
  - Inside `mimoGeminiService.ts`, when `candidateModel.modelId === 'gemini-3.5-flash-lite'`: emit `'understand'` -> `'decompose'` -> `'develop'` (on first text chunk) -> `'verify'` -> `'polish'` (before final return), and use `buildFlashLiteExecutionProtocolPrompt(...)` as the primary system instruction while keeping `gemini-3.5-flash` and `gemini-3.8-flash` unchanged.

### Task 8: Hook Lifecycle & Minimal 5-Step Execution Timeline Component
- **Files:** `src/features/mimo/hooks/useMimoChatStream.ts`, `src/features/mimo/components/MimoExecutionTimeline.tsx`, `src/features/mimo/components/MimoChatMessage.tsx`
- **Changes:**
  - Initialize `protocolTimeline` (5 steps: `Understand`, `Decompose`, `Develop`, `Verify`, `Polish`) in `initialActivity` only when `selectedModel === 'gemini-3.5-flash-lite'`.
  - Wire `onProtocolStage` to advance step statuses cleanly, marking all 5 steps `'done'` upon stream completion.
  - Create `MimoExecutionTimeline.tsx`: hairline-bordered subtle bar displaying the 5 steps horizontally/compactly while streaming, auto-collapsing after completion into a single expandable summary line (`5-step protocol · <elapsed>s`), zero decorative icons or animations.
  - Render `MimoExecutionTimeline` in `MimoChatMessage.tsx` whenever `message.activity?.protocolTimeline` is defined (independent of `showThinking`), suppressing `MimoThoughtBlock` for those messages.

### Task 9: Minimal, Modern Redesign of Mimo Usage Tab & Quota Pill
- **Files:** `src/features/mimo/components/MimoQuotaRing.tsx`, `src/features/mimo/components/drawer/MimoSettingsPopover.tsx`
- **Changes:**
  - Simplify `MimoQuotaRing.tsx` into a clean inline status badge (`tabular-nums`, solid `w-1.5 h-1.5` status dot, zero `<Key />`, zero `animate-ping`).
  - Redesign `MimoSettingsPopover.tsx` Usage section with flat hairline dividers (`divide-y`), unified KPI strip (Remaining, Used Today, Daily Cap, Plan/Key status with `tabular-nums`), horizontal model fleet breakdown rows (`3.5 Flash-Lite`, `3.6 Flash`, `3.8 Flash`, unifying the `controls` tab label too), quiet token telemetry footer, and zero nested cards or decorative icons.
- **Verify:** Run `npm test && npx tsc --noEmit`.

---

## Phase 5.4: Supabase Cleanup, Security Hardening & Feature Connections

### Task 10: Author & Apply Lean Core + Payment Base Migration
- **File:** `supabase/migrations/20261112000000_cleanup_payment_and_feature_sync.sql`
- **SQL Steps:**
  1. Update `public.handle_new_user()` to insert only into `public.profiles` (stop inserting into `user_settings` before dropping it).
  2. Drop unused objects safely (`IF EXISTS`): view `public_profiles`; tables `beta_tester_audit`, `mimo_user_usage`, `pdf_templates`, `user_settings`; functions `join_waitlist()`, `check_user_waitlist_status()`, `check_user_waitlist_status(uuid)`, `get_waitlist_seats_remaining()`, `check_and_consume_mimo_quota(text,numeric,boolean,bigint)`, `apply_launch_beta_reward()`, `execute_beta_tester_cutoff(timestamptz)`.
  3. Alter `public.profiles`: add `subscription_tier text NOT NULL DEFAULT 'free' CHECK (...)`, `plan_id text`, `pro_expires_at timestamptz`, `stripe_customer_id text`, `razorpay_customer_id text`; drop overly broad `"Public profiles are readable by everyone"` policy and add owner-only SELECT + trigger `protect_profile_billing_columns` preventing client mutation of billing columns without `service_role`.
  4. Alter `public.document_revisions`: add `change_summary text`.
  5. Create `public.early_bird_reservations` (`user_id`, `email`, `plan_id`, `amount_usd`, `status`, `created_at`) + RLS + `reserve_early_bird_spot(p_email text, p_plan_id text)` `SECURITY DEFINER` RPC.
  6. Create `public.payment_orders` (`user_id`, `gateway`, `plan_id`, `gateway_order_id`, `gateway_payment_id`, `amount_minor`, `currency`, `status`, `metadata`, `created_at`, `updated_at`) + indexes + RLS (readable by owner, written via `service_role`).
  7. Create `public.promo_redemptions` (`user_id`, `code`, `granted_tier`, `pro_expires_at`, `redeemed_at`, unique `(user_id, code)`) + RLS + `redeem_promo_code(p_code text)` `SECURITY DEFINER` RPC.
  8. Harden security of `admin_approve_blog`, `admin_reject_blog`, `admin_approve_review`, `admin_reject_review`, `admin_update_feedback_status` (`IF NOT public.is_admin() THEN RAISE EXCEPTION` + `REVOKE ALL FROM anon`), lock down `make_user_admin` to `service_role` only, and add `SET search_path = public` to `is_admin`, `record_daily_telemetry`, and `purge_expired_trash_documents`.
- **Apply & Verify:** Execute via `supabase_mcp:apply_migration` on project `pbvxyiicjwbpjhzanssf`, then run `supabase_mcp:list_tables` and `supabase_mcp:get_advisors` (`type: "security"` and `"performance"`).

### Task 11: Wire Missing Client Connections (`is_ai_excluded` & Admin Analytics)
- **Files:** `src/lib/supabase.ts`, `src/services/telemetryService.ts`, `src/components/admin/analytics/ActiveUserDashboard.tsx`, `src/components/auth/ProfileDropdown.tsx`
- **Changes:**
  - Include `is_ai_excluded: Boolean(doc.isAiExcluded)` in `syncDocumentToSupabase` and map `isAiExcluded: Boolean(cloudDoc.is_ai_excluded)` in `pullCloudDocuments`, `pullLatestCloudChanges`, `fetchDocumentFromSupabase`, and `subscribeToUserDocumentChanges`.
  - Add async Supabase readers `fetchCloudDailyMetrics(days)` and `fetchCloudActivityFeed(limit)` in `telemetryService.ts` querying `daily_analytics` and `activity_events` (graceful localStorage fallback when unauthenticated), and call `supabase.rpc('record_daily_telemetry', ...)` on sync where appropriate.
  - Wire `ActiveUserDashboard.tsx` to load cloud metrics & activity feed on mount/refresh/timeRange change while keeping local instant preview before cloud hydration completes.
  - Optional polish: ensure `ProfileDropdown.tsx` Upgrade button uses consistent minimal styling matching 5.1/5.2.

### Task 12: Final Full Verification
- **Commands:** Run `npm test`, `npx tsc --noEmit`, and `npm run build`.
- **Gate:** Zero failures, zero TypeScript errors, zero unexpected security advisor regressions.
