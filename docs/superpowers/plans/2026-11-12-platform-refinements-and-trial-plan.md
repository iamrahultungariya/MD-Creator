# Platform Refinements, Strict 14-Day Trial & Mimo Intelligence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Lifetime reservation email locking, strict 14-day Pro Studio trial with daily ending warnings, antislop minimal Mimo 3.5 Flash-Lite thinking accordion, low-spec smooth streaming, secure Web Crypto Gemini API key storage, custom `/privateDetail` markdown command, per-document Local-Only cloud sync, and 3.5 Flash-Lite next-operation suggestion chips.

**Architecture:** 
1. Checkout & Trial Subsystem: Supabase `early_bird_reservations` + `profiles` trial fields (`trial_started_at`, `pro_expires_at`) with strict 14-day client & RPC verification, 1-per-day warning banners on days 12-14, and day 15 deactivation.
2. Mimo Thinking UI: Replace the 5-step grid with an antislop minimal thinking indicator and dropdown chevron expanding into an animated vertical timeline.
3. Stream Throttler: RAF/40ms buffered token flushing to prevent remark/rehype re-render thrashing on mobile.
4. Security & Storage: Web Crypto AES-GCM vault for Gemini BYOK and skip redundant health checks on warm reloads.
5. Privacy, Sync & Follow-ups: Editor `/privateDetail` slash command with context engine exclusion, document `isLocalOnly` toggle, and quick next-step chips.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Zustand, Supabase Postgres/RLS, Web Crypto API, Lucide icons, Vitest / Node test runner.

**Spec:** `docs/superpowers/specs/2026-11-12-pricing-checkout-mimo-supabase-design.md`

## Global Constraints

- Enforce all Anti-AI Slop UI rules (R-01 to R-40): no em dashes (`—`) in UI copy, no decorative icon bloat, zero glassmorphism, no fake claims.
- Never use the word "unlimited" in any user-facing UI or service copy.
- Native `<dialog>` modal patterns must be preserved.
- Test-driven development is mandatory: write failing tests first, watch them fail, then implement.

## Review Focus

1. User closes and reopens Lifetime checkout after reserving: must show locked state, not an empty email field.
2. Pro Studio checkout: must offer 14-day free trial activation, never a confusing "price lock".
3. Pro trial expiration: strictly terminates on day 15; exactly 1 warning banner per day on days 12, 13, and 14.
4. Word "unlimited" must be completely eradicated across all components and services.
5. Mobile streaming must not drop frames or flicker due to unthrottled markdown AST re-parsing.

---

## Phase 1: Lifetime Reservation Lock, Strict 14-Day Pro Trial & "Unlimited" Eradication

### Task 1.1: Eradicate "Unlimited" Across All Files

**Files:**
- Modify: `src/components/home/PricingSection.tsx`
- Modify: `src/pages/PricingPage.tsx`
- Modify: `src/services/paymentService.ts`
- Modify: `src/features/mimo/components/MimoPrivacyModal.tsx`
- Modify: `src/features/mimo/components/drawer/MimoSettingsPopover.tsx`
- Test: `tests/home/pricing.test.ts`

**Interfaces:**
- Consumes: Existing pricing configurations and modal copy.
- Produces: Professional, honest phrasing ("Direct Provider Quota", "Continuous delta snapshots", "Device-bound storage").

- [ ] **Step 1: Write test verifying zero occurrences of "unlimited" in pricing copy**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Replace "unlimited" with professional phrasing in all target files**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit changes**

### Task 1.2: Lifetime Reservation Status Check & Persistent Modal Locking

**Files:**
- Modify: `src/services/paymentService.ts`
- Modify: `src/components/checkout/CheckoutModal.tsx`
- Test: `tests/services/paymentService.test.ts`
- Test: `tests/home/checkout.test.ts`

**Interfaces:**
- Consumes: `isSupabaseConfigured()`, `supabase.from('early_bird_reservations')`, `localStorage`.
- Produces: `isEmailReserved(email: string, planId?: SubscriptionPlanId): Promise<boolean>`, `getSavedReservationEmail(planId?: SubscriptionPlanId): string | null`.

- [ ] **Step 1: Write failing test for `isEmailReserved` and persistence**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `isEmailReserved` and integrate into `CheckoutModal` to display locked status on reopen**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit changes**

### Task 1.3: Pro Studio 14-Day Free Trial Activation & Strict Lifecycle Deactivation

**Files:**
- Modify: `src/services/paymentService.ts`
- Modify: `src/stores/useAuthStore.ts`
- Modify: `src/components/checkout/CheckoutModal.tsx`
- Create: `src/services/trialService.ts`
- Create: `src/components/common/TrialEndingBanner.tsx`
- Test: `tests/services/trialService.test.ts`

**Interfaces:**
- Consumes: `useAuthStore.getState().profile`.
- Produces: `activateProFreeTrial(email, planId)`, `checkTrialLifecycle(profile)` returning `{ status: 'active' | 'warning' | 'expired', remainingDays: number, shouldNotifyToday: boolean }`, `markTrialWarningNotifiedToday()`.

- [ ] **Step 1: Write failing tests for trial activation, 14-day calculation, day 12-14 warning triggers, and day 15 deactivation**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `trialService.ts`, update `useAuthStore.ts`, and wire into `CheckoutModal.tsx` for Pro Studio**
- [ ] **Step 4: Run tests to verify all trial lifecycle tests pass**
- [ ] **Step 5: Commit changes**

---

## Phase 2: Mimo 3.5 Flash-Lite Minimal Thinking & Timeline Accordion

### Task 2.1: Redesign `MimoExecutionTimeline.tsx` to Minimal Indicator + Dropdown Timeline
- Remove the 5-box grid and "5-step protocol" technical jargon.
- Render compact `Thinking...` / `Thought for Xs ▾`.
- On click, expand into a smooth vertical antislop timeline with hairline connectors.

---

## Phase 3: Smooth Streaming Engine for Mobile & Low-Spec Screens

### Task 3.1: RAF / 40ms Token Batching Buffer in `useMimoChatStream.ts`
- Batch incoming token chunks using `requestAnimationFrame` / 40ms throttle.
- Add CSS `contain: content` and optimized memoization in `MimoChatMessage.tsx` to prevent mobile flicker.

---

## Phase 4: Gemini API Key Security & Persistent Connection

### Task 4.1: Web Crypto AES-GCM Encrypted Client Storage & Skip Re-verify
- Stop automatic health checks on page refresh when key is already valid.
- Encrypt API key with browser-derived Web Crypto key before saving to localStorage.

---

## Phase 5: Privacy Exclusion Command, Local-Only Sync & Smart Next-Step Chips

### Task 5.1: Custom `/privateDetail` Command & Privacy Sanitizer Exclusion
- Add `/privateDetail` slash command in editor inserting `<privateDetail>...</privateDetail>`.
- Strip private blocks in `privacySanitizer.ts` & `contextEngine.ts` from AI context.

### Task 5.2: Per-Document Local-Only Cloud Sync Toggle
- Add `isLocalOnly` boolean to `DocumentMetadata` and skip Supabase sync when enabled.

### Task 5.3: 3.5 Flash-Lite Next-Operation Smart Suggestion Chips
- Generate 2-3 instant action chips below Mimo responses that run immediately on click.
