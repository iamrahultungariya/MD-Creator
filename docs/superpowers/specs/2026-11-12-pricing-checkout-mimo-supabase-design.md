# Unified Platform Refinement Specification: Pricing, Checkout, Mimo Flash-Lite Pipeline & Supabase Cleanup

**Date:** 2026-11-12  
**Project:** MD Writer (`https://writermd.vercel.app`)  
**Supabase Project:** `MD Writter` (`pbvxyiicjwbpjhzanssf`)  
**Design Standard:** Linear / Raycast Craft Studio + Anti-AI Slop UI Architect (`.agents/skills/anti-ai-slop-ui-architect/SKILL.md`)

---

## 1. Intent & Why

MD Writer v2.3.0 introduced a Craft Studio homepage, a dedicated `/pricing` page, a pre-launch `CheckoutModal`, and a token-optimized Mimo AI engine. However, four concrete friction points remain:

1. **Pricing Card Ambiguity & Icon Clutter:** The Monthly/Annual billing switcher currently sits above all three tiers in `PricingSection.tsx` and `PricingPage.tsx`, visually suggesting it applies to **Free Forever** and **Early-Bird Lifetime ($49)** as well. Clicking **Pro Studio** while Annual is active also wrongly opens `pro_monthly`, and every card feature list renders decorative `<Check />` icons.
2. **Checkout Modal Plan-Switch Confusion & Visual Bloat:** Opening `CheckoutModal.tsx` after clicking **Get Lifetime Access** forces users to stare at a Lifetime ↔ Pro Studio switcher, decorative icons (`Sparkles`, `CreditCard`, `Gift`, `Lock`, `CheckCircle2`), and nested bordered cards. Stripe and Razorpay keys are not live yet, so the pre-launch flow must feel minimal, modern, and locked to the clicked plan while keeping a clean gateway-ready base.
3. **Mimo `gemini-3.5-flash-lite` Quality & Usage Tab Bloat:** Users gravitate to slower/costlier `3.6 Flash` / `3.8 Flash` (`gemini-3.5-flash` / `gemini-3.8-flash`) because `3.5 Flash-Lite` uses a minimal system prompt with zero execution timeline visibility when `Show Thinking` is off. Meanwhile, the Mimo **Usage** tab (`MimoSettingsPopover.tsx`) and `MimoQuotaRing.tsx` suffer from nested card borders, decorative icons, pulsing dots, and inconsistent `3.5 Flash` vs `3.6 Flash` naming.
4. **Live Supabase Schema Drift, Dead Tables & Unwired Features:** The live `MD Writter` database contains 4 unused tables (`beta_tester_audit`, `mimo_user_usage`, `pdf_templates`, `user_settings`), 1 unused view (`public_profiles`), 7 dead/broken RPCs, and 6 `SECURITY DEFINER` admin functions exposed to `anon` without `is_admin()` checks. Simultaneously:
   - `public.profiles` is missing `subscription_tier` and `pro_expires_at` (breaking `useAuthStore.ts` queries and live triggers).
   - `paymentService.ts` attempts to insert early-bird reservations into `feedbacks` with non-existent columns (`rating`, `email`, `client_info`, `category: 'other'`), failing silently.
   - `public.document_revisions` is missing `change_summary`, breaking collaborative shared-edit snapshots.
   - `src/lib/supabase.ts` omits `is_ai_excluded` during sync, and `ActiveUserDashboard.tsx` reads localStorage instead of cloud `daily_analytics` / `activity_events`.

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
- Eliminate billing interval confusion by scoping the Monthly/Annual toggle strictly inside the **Pro Studio** card and fixing `pro_annual` checkout routing.
- Strip all decorative icons from pricing cards (`PricingSection.tsx`, `PricingPage.tsx`) and `CheckoutModal.tsx`.
- Lock `CheckoutModal.tsx` to the clicked plan with a native `<dialog>` top-layer modal, single-column reservation flow, quiet collapsible promo redemption, and gateway-ready adapters (`initiateStripeCheckout`, `initiateRazorpayCheckout`).
- Upgrade `gemini-3.5-flash-lite` with the full **Markdown Writing Assistant Execution Protocol** behind the scenes and surface a sleek 5-step **Execution Timeline** (`Understand` → `Decompose` → `Develop` → `Verify` → `Polish`) **exclusively for `3.5 Flash-Lite`**, while keeping output token 1 clean (zero leaked reasoning).
- Redesign Mimo's **Usage** tab (`MimoSettingsPopover.tsx`) and `MimoQuotaRing.tsx` with flat surfaces, `1px` hairline dividers, `tabular-nums`, and zero decorative icons.
- Clean up unused Supabase tables/views/RPCs, fix schema drift and security advisor alerts, add payment/reservation/promo tables, and connect missing feature syncs (`is_ai_excluded`, cloud admin analytics).

### Non-Goals
- Integrating live Stripe or Razorpay merchant credentials, server webhooks, or third-party payment SDK scripts (`@stripe/stripe-js`, `checkout.js`) right now.
- Syncing editor preferences (`usePreferencesStore`), Mimo StyleDNA (`useStyleDnaStore`), or PDF Studio presets (`pdf_templates`) to Supabase (explicitly kept local-first under Decision 2: Approach 1).
- Enabling multi-call LLM planning loops on `gemini-3.5-flash-lite` (explicitly kept single-pass under Decision 1: Approach A).
- Redesigning unrelated pages (`AdminPage` tabs outside analytics cloud fetch, `EditorWorkspace`, `BlogPage`, `HomePage` sections other than `PricingSection`).

### Anti-Goals
- **No Anti-AI Slop Regression:** Zero `backdrop-blur` glassmorphism on checkout/pricing/usage surfaces, zero `animate-ping` pulsing dots, zero Russian-doll nested card borders, zero decorative Lucide icons on feature lists or KPI cards, zero marketing clichés.
- **No Model Escalation or Context Leak:** `gemini-3.5-flash-lite` must never silently escalate to `3.5-flash` or `3.8-flash`, and `GENERAL_QA` queries must still strictly respect `contextEngine.ts` document isolation.
- **No Unprotected Destructive DB Changes:** Dropping `user_settings` must happen only after updating `handle_new_user()` trigger so user signups never fail.

---

## 3. Global Constraints

- **Anti-AI Slop Compliance:** Enforce all 13 laws in `.agents/skills/anti-ai-slop-ui-architect/SKILL.md` across all modified/created UI components (`PricingSection.tsx`, `PricingPage.tsx`, `CheckoutModal.tsx`, `MimoExecutionTimeline.tsx`, `MimoSettingsPopover.tsx` Usage tab, `MimoQuotaRing.tsx`).
- **Modern Web Standards:**
  - `CheckoutModal` uses native `<dialog>` + `showModal()` + `closedby="any"` (with `pointerdown`/`pointerup` bounds fallback for Safari), `aria-labelledby`, `autofocus` on the email field, and `overscroll-behavior: contain` on `dialog:modal` and `dialog::backdrop` in `src/index.css` (never `overflow: hidden` on `body`).
  - Segmented billing toggle and Usage/Model tabs maintain single-row layout without dimension-shifting `font-weight` or `padding` jumps on selection.
- **Design Tokens:** Use existing tokens in `src/index.css` (`brand-500` `#8257F5`, `brand-600` `#6D3FE0`, `neutral-950`/`white` surfaces, `Geist Variable` sans, `Geist Mono Variable` mono, `tabular-nums` for numbers).
- **Gemini 3.x Policy:** Only `gemini-3.5-flash-lite`, `gemini-3.5-flash` (UI label: `3.6 Flash` / `Gemini 3.6 Flash` where already established, unified cleanly), and `gemini-3.8-flash`. Zero Gemini 2.x models.
- **Verification Floor:** Existing test suite (`npm test`) and production build (`npm run build`) must pass with zero errors, plus new unit tests for pricing/checkout, Mimo `3.5 Flash-Lite` protocol & timeline, and Supabase schema/advisors verified via MCP.

---

## 4. Approaches Evaluated & Selected Architecture (A + 1)

### Decision 1: Mimo `3.5 Flash-Lite` Protocol & Timeline Execution
| Approach | Mechanism | Trade-offs | Decision |
|---|---|---|---|
| **Approach A: Single-Pass Protocol + Lifecycle Timeline** | Inject the full Expert Markdown Protocol + Adaptive Depth into `gemini-3.5-flash-lite`'s system instruction (with strict "no private reasoning in output" rule) and drive the 5 timeline steps (`Understand`, `Decompose`, `Develop`, `Verify`, `Polish`) from deterministic pre-flight, stream-in-flight, and post-flight verification phases. | **Pros:** 1 API call per turn, 0ms extra latency, protects 15 RPM burst guard, keeps fast TTFT. **Cons:** `Understand`/`Decompose` labels reflect deterministic client intent/depth/section analysis rather than hidden LLM thoughts. | **SELECTED (Approach A)** |
| **Approach B: Two-Pass Plan-then-Write** | Run a hidden `3.5 Flash-Lite` outline call before streaming the final answer. | **Pros:** Explicit LLM-generated outline per query. **Cons:** Burns 2× RPM quota and adds 1–2s TTFT lag. | Rejected |

### Decision 2: Supabase Schema Scope
| Approach | Scope | Trade-offs | Decision |
|---|---|---|---|
| **Approach 1: Lean Core + Payment Base** | Drop `beta_tester_audit`, `mimo_user_usage`, `pdf_templates`, `user_settings`, `public_profiles`, and 7 dead/broken RPCs. Fix `profiles` (`subscription_tier`, `pro_expires_at`, `plan_id`, customer IDs), `document_revisions.change_summary`, and `admin_*` security holes. Add `early_bird_reservations`, `payment_orders`, `promo_redemptions` (+ RPCs). Wire `documents.is_ai_excluded` sync and cloud `daily_analytics`/`activity_events` reads in Admin. | **Pros:** Minimal, fast schema; zero unnecessary cloud writes for local editor/StyleDNA/PDF settings; fixes every broken production table/RPC. **Cons:** Preferences, StyleDNA, and custom PDF settings remain browser-local. | **SELECTED (Approach 1)** |
| **Approach 2: Full Cross-Device Sync** | Everything in Approach 1, plus keep/upgrade `user_settings` and wire `pdf_templates` to `ExportPdfModal`. | **Pros:** Syncs preferences and custom PDF templates across devices. **Cons:** Extra sync conflicts and background writes not needed right now. | Rejected |

---

## 5. Detailed Design by Subsystem

### 5.1 Pricing Cards & Pro-Scoped Toggle (`PricingSection.tsx`, `PricingPage.tsx`)
- **Shared Pricing Data Source:** Both `PricingSection.tsx` and `PricingPage.tsx` read canonical plan prices/copy from `SUBSCRIPTION_PLANS` (or shared tier config in `paymentService.ts`) so `$0`, `$49`, `$8/mo`, and `$6/mo ($72/yr)` cannot drift.
- **Section Header Cleanup:** Remove the global `Annual (Save 25%) / Monthly` toggle from the section header in `PricingSection.tsx` and the hero area of `PricingPage.tsx`.
- **Pro Studio Card Embedded Toggle:**
  - Inside the **Pro Studio** card, directly beside/above the price readout, place a compact 2-option segmented switcher: `Annual · Save 25%` (`'annual'`, default) and `Monthly` (`'monthly'`).
  - Updating it only affects the Pro Studio card price (`$6/month`, subtitle `Billed annually ($72/yr)` vs `$8/month`, subtitle `Billed monthly`).
  - **CTA Routing Fix:** Clicking **Get Lifetime Access** calls `openCheckout('lifetime')`. Clicking **Start 14-Day Trial** / **Continue with Pro** calls `openCheckout(billingInterval === 'annual' ? 'pro_annual' : 'pro_monthly')`.
- **Zero-Icon Cards:**
  - Remove `Check` from `lucide-react` in `PricingSection.tsx`. Render capability rows as clean typography separated by subtle spacing or hairline `divide-y divide-neutral-100 dark:divide-neutral-900` (no checkmark icons, no colored circles).
  - In `PricingPage.tsx`, remove `<Check />` from all three tier cards. In the `Full Feature Comparison` table, replace `<Check />` / `<Minus />` Lucide icons with crisp plain-text indicators (`Included` or `✓` / `—`) matching `BenchmarkSection.tsx`, and replace `bg-white/80 backdrop-blur-md` on the sticky header with solid `bg-white dark:bg-neutral-950`.

### 5.2 Minimal, Locked-Plan Checkout Flow (`useCheckoutModalStore.ts`, `CheckoutModal.tsx`, `paymentService.ts`)
- **Store (`useCheckoutModalStore.ts`):**
  - Keep `isOpen`, `selectedPlanId`, `openCheckout(planId = 'lifetime')`, `closeCheckout()`, `setSelectedPlanId(planId)`.
  - Add `entryPlanGroup: 'lifetime' | 'pro'` derived or set in `openCheckout(planId)` (`planId === 'lifetime' ? 'lifetime' : 'pro'`). When `entryPlanGroup === 'lifetime'`, the modal is strictly locked to `'lifetime'` (no Pro switcher shown). When `entryPlanGroup === 'pro'`, the modal is strictly locked to Pro Studio (never shows Lifetime), offering only an understated inline `Monthly ($8/mo)` ↔ `Annual ($6/mo)` switch in the plan summary row.
- **ProfileDropdown Alignment (`src/components/auth/ProfileDropdown.tsx`):**
  - Existing `"Upgrade to Pro ($49 Deal)"` calls `openCheckout('lifetime')`, which now opens the locked Lifetime modal directly (also remove the decorative `<Sparkles />` icon inside that upgrade row if updating nearby or leave minimal — builder's choice to keep `ProfileDropdown` consistent).
- **Modal Architecture (`CheckoutModal.tsx`):**
  - **Native `<dialog>`:** Render `<dialog ref={dialogRef} closedby="any" aria-labelledby="checkout-dialog-title" className="...">`. Open/close via `useEffect` calling `showModal()` / `close()` synced to `isOpen`, plus `onClose` handler and Safari `pointerdown`/`pointerup` light-dismiss bounds check when `!('closedBy' in HTMLDialogElement.prototype)`.
  - **Zero Decorative Icons & Single Surface:** Remove `Sparkles`, `CreditCard`, `Gift`, `Lock`, `CheckCircle2`, `ArrowRight`. Keep only a clean `X` close button (`aria-label="Close checkout"`) in the header.
  - **Minimal Layout:**
    1. **Header:** Title (`Early-Bird Lifetime` or `Pro Studio`) + `X` button.
    2. **Plan Summary Row (Hairline-bordered, no Russian-doll nested boxes):** Plan name & concise 1-line outcome + right-aligned `tabular-nums` price (`$49 one-time` or `$72/year ($6/mo)` / `$8/month`), plus 3 compact single-line inclusions separated by middle dots or clean list, and—only if `entryPlanGroup === 'pro'`—a subtle 2-pill inline billing interval switch (`Annual -25%` / `Monthly`).
    3. **Primary Action Form:** Email `<input type="email" autoFocus ... />` (pre-filled from `user?.email`) + solid high-contrast CTA (`Reserve Early-Bird Spot — $49` or `Lock In Pro Rate`).
    4. **Quiet Promo Code Disclosure:** Below the submit button, a minimal text toggle button `"Have an invite or promo code?"` expands an inline code input + `"Apply"` button (no heavy top tab bar).
    5. **Launch Note Footer:** Clean single-line muted text: `"Stripe and Razorpay checkout are staged for launch. Reserving locks your rate with zero charge today."`
- **Gateway-Ready Service (`paymentService.ts`):**
  - Extend `PlanConfig` with `amountCentsUSD: number`, `amountPaiseINR: number`, and `billingInterval: 'one_time' | 'monthly' | 'annual'`.
  - **`reserveEarlyBirdSpot(email, planId, gatewayPreference = 'early_bird')`:**
    - Validates email, caches locally in `localStorage`, and calls Supabase RPC `reserve_early_bird_spot(p_email, p_plan_id, p_gateway, p_client_info)` (falling back gracefully if offline/unconfigured). Removes the broken `feedbacks` insert completely.
  - **`redeemPromoCode(code)`:**
    - Checks Supabase RPC `redeem_promo_code(p_code)` first when authenticated & configured (updating `profiles.subscription_tier` and refreshing `useAuthStore.refreshProfile()`), with local `VALID_PROMO_CODES` fallback (`setLocalProUnlocked(true)`) for offline/guest mode.
  - **`initiateStripeCheckout` & `initiateRazorpayCheckout`:**
    - Clean typed stubs returning `{ success: false, status: 'staged', message: ... }` ready to swap in `/api/create-checkout-session` or Razorpay `order_id` without changing UI contracts.

### 5.3 Mimo `3.5 Flash-Lite` Protocol, 5-Step Timeline & Usage Redesign
- **Backend/Prompt Layer (`intentPromptService.ts`, `promptRouter.ts`, `mimoGeminiService.ts`):**
  - Add `AdaptiveDepth = 'Simple' | 'Standard' | 'Detailed' | 'Comprehensive'` and `resolveAdaptiveDepth(prompt: string, intent: MimoIntentType, totalDocLines: number): AdaptiveDepth` in `promptRouter.ts`.
  - Add `buildFlashLiteExecutionProtocolPrompt(intent: MimoIntentType, options?: IntentPromptOptions & { depth?: AdaptiveDepth; language?: DetectedLanguage }): string` in `intentPromptService.ts` without breaking `getIntentSystemInstruction()` (keeping existing tests green).
  - The `3.5 Flash-Lite` system instruction embeds the user's complete Markdown Writing Assistant specification:
    - `# Identity & Role` (expert Markdown writing assistant, high information density, zero verbosity)
    - `# Execution Protocol` (1. Understand → 2. Decompose → 3. Develop → 4. Verify → 5. Polish, plus *"Do not expose internal analysis or private reasoning. Return the useful result."*)
    - `# Content Quality Rules` (practical examples, concrete specifics, zero fabricated citations/facts, zero repetition)
    - `# Adaptive Depth` (explicitly passes the resolved target depth: `Simple` / `Standard` / `Detailed` / `Comprehensive`)
    - `# Markdown Standards` (consistent H1/H2/H3, semantic lists, tables, blockquotes, fenced code blocks, bold terms; no decorative clutter)
    - `# Output Rules` & `# Final Quality Standard`
    - **Functional Preservation Clause:** Appends concise intent-specific output formatting ONLY when needed (`DOC_TRANSFORM`: emit clean ```` ```diff ```` or ```` ```replacement ```` scoped to the target section; `DOC_QUERY` quizzes: emit ```` ```json:mimo-clarification ````; Language adaptation for Hinglish/Hindi/English).
  - In `mimoGeminiService.ts`:
    - When `candidateModel.modelId === 'gemini-3.5-flash-lite'`, use `buildFlashLiteExecutionProtocolPrompt(...)` instead of the lean prompt + `GLOBAL_THINKING_PROVIDER_GUIDANCE`.
    - Add a new callback `onProtocolStage?: (stage: 'understand' | 'decompose' | 'develop' | 'verify' | 'polish', status: 'active' | 'done', detail?: string) => void` to `StreamCallbacks` (invoked ONLY for `gemini-3.5-flash-lite`!).
    - Keep `gemini-3.5-flash` (`3.6 Flash`) and `gemini-3.8-flash` unchanged in behavior and prompt pipeline.
- **Types & Timeline UI (`mimoTypes.ts`, `useMimoChatStream.ts`, `MimoExecutionTimeline.tsx`, `MimoChatMessage.tsx`):**
  - Add `MimoProtocolStepId = 'understand' | 'decompose' | 'develop' | 'verify' | 'polish'`, `MimoProtocolStep`, and `MimoProtocolTimeline` (`modelId: 'gemini-3.5-flash-lite'`, `depth: AdaptiveDepth`, `steps: MimoProtocolStep[]`) to `mimoTypes.ts` and attach `protocolTimeline?: MimoProtocolTimeline` on `ActivityTelemetry`.
  - In `useMimoChatStream.ts`, initialize `protocolTimeline` ONLY when `selectedModel === 'gemini-3.5-flash-lite'` and update each stage synchronously via `onProtocolStage` callbacks during pre-flight (`Understand` → `Decompose`), stream start/chunk (`Develop`), and post-stream verification/sanitization (`Verify` → `Polish`).
  - Create `src/features/mimo/components/MimoExecutionTimeline.tsx`:
    - Renders **only** when `activity?.protocolTimeline` exists (never rendered on `3.6 Flash` / `3.8 Flash`, and independent of `showThinking`).
    - **Visual Design (Anti-AI Slop):** Flat surface, `1px` border (`border-neutral-200 dark:border-neutral-800`), `rounded-lg`, zero decorative Lucide icons, zero glowing dots.
    - While in-flight (`!isDone`): displays compact 5-step vertical hairline timeline (`6px` status dots connected by `1px` vertical line, `Geist Mono` stage names + concise 1-line context detail, live `tabular-nums` elapsed seconds).
    - Once completed (`isDone`): auto-collapses into a crisp single-line summary bar (`Understand → Decompose → Develop → Verify → Polish · 1.2s`) that toggles open on click to inspect each step's detail and resolved depth.
  - In `MimoChatMessage.tsx`: render `<MimoExecutionTimeline activity={message.activity} />` when `message.activity?.protocolTimeline` is present, and suppress `MimoThoughtBlock` for `3.5 Flash-Lite` messages that already display `MimoExecutionTimeline` (avoiding duplicate timelines).
- **Mimo Usage Section Redesign (`MimoSettingsPopover.tsx` Usage Tab + `MimoQuotaRing.tsx`):**
  - Standardize model labels across `MimoSettingsPopover.tsx` (`controls` + `usage` tabs) and `MimoInputDock.tsx` (`Gemini 3.5 Flash-Lite`, `Gemini 3.6 Flash`, `Gemini 3.8 Flash` mapped to `gemini-3.5-flash-lite`, `gemini-3.5-flash`, `gemini-3.8-flash`).
  - **Redesign `activeTab === 'usage'` in `MimoSettingsPopover.tsx`:**
    - Replace nested `rounded-xl border` cards with a single flat surface container using `divide-y divide-neutral-200 dark:divide-neutral-800` hairline separators.
    - **Row 1 — API Status:** Solid `6px` status dot (emerald/amber/neutral — **no** `animate-ping`), clear status label (`Gemini API Connected` / `Shared Demo Quota`), `tabular-nums` latency (`84ms`), and quiet `"Check"` button (plain text / functional `RefreshCw` spinner while checking).
    - **Row 2 — Daily Telemetry (2-column hairline split):**
      - Left: `Requests` (`14 / 1,500` or `14 / 45`) + thin `2px` bar.
      - Right: `Tokens` (`18.4k`) with dual-segment In/Out `2px` bar + `In / Out` numeric legend (`tabular-nums`).
    - **Row 3 — Model Fleet Breakdown:** Clean hairline-divided rows for `3.5 Flash-Lite`, `3.6 Flash`, and `3.8 Flash` showing today's request count, token count (`tabular-nums`), thin proportional `2px` bar, and text-only `Active` indicator or `Use` button. Zero decorative `Zap` / `Brain` / `Sparkles` icons.
    - **Row 4 — Monthly Doc Generator (shown only when `!userApiKey`):** Crisp 3-bar segment (`x / 3 used`).
  - **Redesign `MimoQuotaRing.tsx`:**
    - Strip `animate-ping` dot and `Key` icon; render a clean flat monospace pill (`14 reqs · 84ms` when BYOK active, or clean SVG ring + `58%` when shared demo reaches ≥50%).

### 5.4 Supabase Schema Cleanup, Hardening & Feature Connections
- **Migration File:** `supabase/migrations/20261112000000_cleanup_payment_and_feature_sync.sql` (applied directly to live `MD Writter` project `pbvxyiicjwbpjhzanssf` via Supabase MCP, then verified with `get_advisors`).
- **Pre-Drop Trigger Fix:**
  - Update `public.handle_new_user()` so it inserts ONLY into `public.profiles` (removing `INSERT INTO public.user_settings`).
- **Drops (Dead/Unused Objects):**
  - Tables: `DROP TABLE IF EXISTS public.beta_tester_audit, public.mimo_user_usage, public.pdf_templates, public.user_settings CASCADE;`
  - View: `DROP VIEW IF EXISTS public.public_profiles CASCADE;`
  - Dead/Broken RPCs: `join_waitlist()`, `check_user_waitlist_status()`, `check_user_waitlist_status(uuid)`, `get_waitlist_seats_remaining()`, `check_and_consume_mimo_quota(text,numeric,boolean,bigint)`, `apply_launch_beta_reward()`, `execute_beta_tester_cutoff(timestamptz)`.
- **Schema Fixes on Existing Tables:**
  - `public.profiles`: Add `subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'team'))`, `plan_id TEXT NOT NULL DEFAULT 'free' CHECK (plan_id IN ('free', 'lifetime', 'pro_monthly', 'pro_annual'))`, `pro_expires_at TIMESTAMPTZ`, `stripe_customer_id TEXT`, `razorpay_customer_id TEXT`. Backfill existing rows cleanly.
  - `public.document_revisions`: Add `change_summary TEXT NOT NULL DEFAULT 'Auto-save snapshot'`.
- **New Payment & Checkout Base Tables:**
  - `public.early_bird_reservations`: `(id, user_id, email, plan_id, preferred_gateway, status, client_info, created_at, updated_at)` with unique index on `(lower(email), plan_id)` and RLS (`SELECT`/`UPDATE`/`DELETE` for `is_admin()` or own `user_id`; public/authenticated reservation via validated `reserve_early_bird_spot` RPC).
  - `public.payment_orders`: `(id, user_id, email, plan_id, gateway, gateway_order_id, gateway_payment_id, amount_cents, currency, status, metadata, created_at, updated_at)` with RLS (`SELECT` own rows or `is_admin()`; write access locked to `service_role`/server webhooks).
  - `public.promo_redemptions`: `(id, user_id, email, code, granted_tier, expires_at, created_at)` with unique `(user_id, code)` and `redeem_promo_code(p_code TEXT)` RPC (`SECURITY DEFINER`, `SET search_path = public, auth`, requires `auth.uid() IS NOT NULL` for DB unlock).
  - Indexes on all FK and query columns (`user_id`, `email`, `status`, `created_at DESC`) per Postgres best practices.
- **Security Hardening:**
  - Enforce `IF NOT public.is_admin() THEN RAISE EXCEPTION 'Unauthorized'; END IF;` inside `admin_approve_blog`, `admin_reject_blog`, `admin_approve_review`, `admin_reject_review`, `admin_update_feedback_status`.
  - `REVOKE EXECUTE` from `PUBLIC, anon` on all `admin_*` functions and `activate_user_pro`; `REVOKE EXECUTE` from `PUBLIC, anon, authenticated` on `make_user_admin` (service_role / SQL editor only).
  - Add explicit `SET search_path = public, auth, extensions` to `is_admin()`, `record_daily_telemetry()`, `purge_expired_trash_documents()`.
- **Client Sync & Telemetry Wiring:**
  - `src/lib/supabase.ts`: Include `is_ai_excluded: Boolean(doc.isAiExcluded)` on `syncDocumentToSupabase` upsert and map `isAiExcluded: Boolean(doc.is_ai_excluded)` in `pullCloudDocuments`, `pullLatestCloudChanges`, `fetchDocumentFromSupabase`, and `subscribeToUserDocumentChanges`.
  - `src/services/telemetryService.ts` + `src/components/admin/analytics/ActiveUserDashboard.tsx`: Add `fetchCloudDailyMetrics(daysCount)` and `fetchCloudActivityFeed(limit)` querying `daily_analytics` and `activity_events`, and update `saveDailyMetrics` / `trackFeatureUsed` to invoke `record_daily_telemetry` RPC cleanly with localStorage cache fallback.

---

## 6. What Is Left to the Implementer

- Exact CSS spacing classes (`p-4`, `gap-3`, hairline colors) consistent with `src/index.css` tokens.
- Graceful fallback copy when Supabase is offline or unconfigured during local dev/tests.
- Updating `tests/home/pricing.test.ts` (if assertions check card markup) and adding targeted tests under `tests/home/`, `tests/mimo/`, and `tests/services/` for locked-plan checkout state, `3.5 Flash-Lite` protocol prompt/timeline, and `paymentService` payloads.
