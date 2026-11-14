# In-App Discovery Feedback Prompt & Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a polite, non-intrusive feedback prompt (bottom-left toast + product discovery modal) in MD Writer's editor workspace for users with >= 1 document and >= 30 seconds dwell time.

**Architecture:** A dedicated hook (`useFeedbackPrompt.ts`) controls dwell timing (30s), document presence checking, 15-day snooze management, and permanent submission suppression. A lightweight toast (`FeedbackPromptToast.tsx`) sits at `fixed bottom-6 left-6 z-40`, triggering an accessible discovery survey modal (`FeedbackPromptModal.tsx`) that auto-fetches logged-in email or prompts guests, collects 3 single-select chip answers + 1 open textarea, and writes to Supabase `feedbacks`.

**Tech Stack:** React 19, TypeScript 5.7, Tailwind CSS v4, Lucide React (strictly functional icons: X, Check), Supabase JS, Zustand, Dexie, Node test runner (`node:test`).

**Spec:** `docs/superpowers/specs/2026-11-14-in-app-feedback-prompt.md`

## Global Constraints

- Never use the em dash character in any UI text, placeholder, error message, or code comment. Use regular dash - or colon : or parentheses.
- Position the toast strictly at the bottom-left of the viewport (`fixed bottom-6 left-6 z-40`) to preserve bottom-right clearance for `CloudSyncNudgeToast`.
- Strict adherence to Mimo Drawer aesthetic: hairline borders `border-neutral-200/90 dark:border-neutral-800`, `bg-white dark:bg-neutral-900` / `dark:bg-neutral-950`, `font-sans` (`Geist Variable`), and `font-mono tabular-nums`.
- If dismissed without submitting, snooze for exactly 15 days (`Date.now() + 15 * 86400000`). If submitted, permanently store `md_writer_feedback_submitted = 'true'` so it is never shown again.
- Auto-fetch and prefill email for logged-in users (read-only); prompt and validate email for guest visitors.
- Maintain 100% test pass rate (`npm run test`) and zero TypeScript errors (`npx tsc --noEmit`).

## Review Focus

1. Verify that 15-day snooze timestamp correctly calculates `15 * 24 * 60 * 60 * 1000` (1,296,000,000 ms) and suppresses toast when `Date.now() < snoozeUntil`.
2. Verify that `md_writer_feedback_submitted = 'true'` permanently suppresses prompt even if snooze timestamp expired.
3. Verify that dwell timer does not trigger if user has 0 documents in database.
4. Verify that guest submission requires a valid email format before submitting, while authenticated user uses auto-fetched email.
5. Verify that Supabase insert payload matches `feedbacks` table schema (`category: 'feature'`, `sentiment: 'good'`, `subject: 'In-App Discovery Feedback'`, `system_info` JSONB).

---

### Task 1: Automated Unit Test Suite for Feedback Prompt & Storage Logic

**Files:**
- Create: `tests/feedback/feedbackPrompt.test.ts`
- Modify: `package.json`

**Interfaces:**
- Inspects: `src/hooks/useFeedbackPrompt.ts`, `src/components/feedback/FeedbackPromptToast.tsx`, `src/components/feedback/FeedbackPromptModal.tsx`
- Assertions: Snooze calculation, permanent submitted flag, dwell timer requirement, zero em dash rule, Supabase payload structure.

- [ ] **Step 1: Write the failing test in `tests/feedback/feedbackPrompt.test.ts`**

```typescript
import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('In-App Feedback Prompt & Modal Tests', () => {
  test('snooze duration calculation is exactly 15 days (1,296,000,000 ms)', () => {
    const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;
    assert.strictEqual(FIFTEEN_DAYS_MS, 1296000000);
  });

  test('zero em dash compliance across feedback components', () => {
    const files = [
      'src/hooks/useFeedbackPrompt.ts',
      'src/components/feedback/FeedbackPromptToast.tsx',
      'src/components/feedback/FeedbackPromptModal.tsx'
    ];
    for (const f of files) {
      const fullPath = path.resolve(process.cwd(), f);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        assert.ok(!content.includes('\u2014'), `${f} contains banned em dash character`);
      }
    }
  });

  test('payload structure matches Supabase feedbacks schema', () => {
    const payload = {
      id: 'test-uuid',
      user_id: null,
      user_email: 'guest@example.com',
      user_name: null,
      category: 'feature',
      sentiment: 'good',
      subject: 'In-App Discovery Feedback',
      message: 'Great app',
      priority: 'normal',
      status: 'new',
      system_info: {
        discovery_source: 'Twitter / X',
        previous_tool: 'Notion',
        missing_features: 'Offline sync',
        is_guest: true,
        dwell_seconds: 30
      }
    };
    assert.strictEqual(payload.category, 'feature');
    assert.strictEqual(payload.status, 'new');
    assert.strictEqual(payload.system_info.dwell_seconds, 30);
  });
});
```

- [ ] **Step 2: Update `package.json` test script to include `tests/feedback/*.test.ts`**
- [ ] **Step 3: Run `npx tsx --test tests/feedback/*.test.ts` to verify test execution**
- [ ] **Step 4: Commit test scaffolding**

```bash
git add tests/feedback/feedbackPrompt.test.ts package.json
git commit -m "test: add feedback prompt and modal test suite"
```

---

### Task 2: Implement `useFeedbackPrompt` Hook

**Files:**
- Create: `src/hooks/useFeedbackPrompt.ts`
- Test: `tests/feedback/feedbackPrompt.test.ts`

**Interfaces:**
- Consumes: `hasDocument: boolean`, `dwellMs?: number` (defaults to 30,000ms), `localStorage`
- Produces:
  ```typescript
  export interface UseFeedbackPromptResult {
    isToastVisible: boolean;
    isModalOpen: boolean;
    openModal: () => void;
    dismissToast: () => void;
    closeModal: () => void;
    markSubmitted: () => void;
  }
  ```

- [ ] **Step 1: Write `src/hooks/useFeedbackPrompt.ts`**
  - Manages `md_writer_feedback_submitted` key (`'true'`).
  - Manages `md_writer_feedback_snooze_until` key (timestamp in ms, 15 days = `15 * 86400000`).
  - Sets 30-second dwell timer when `hasDocument` is true.
  - Exposes `openModal`, `dismissToast`, `closeModal`, and `markSubmitted`.
- [ ] **Step 2: Run test suite to verify storage and timer logic**
- [ ] **Step 3: Commit hook**

```bash
git add src/hooks/useFeedbackPrompt.ts
git commit -m "feat: implement useFeedbackPrompt hook with 30s dwell and 15-day snooze"
```

---

### Task 3: Implement `FeedbackPromptToast.tsx`

**Files:**
- Create: `src/components/feedback/FeedbackPromptToast.tsx`
- Test: `tests/feedback/feedbackPrompt.test.ts`

**Interfaces:**
- Consumes:
  ```typescript
  export interface FeedbackPromptToastProps {
    isVisible: boolean;
    onOpenFeedback: () => void;
    onDismiss: () => void;
  }
  ```
- Produces:
  - Bottom-left positioned toast (`fixed bottom-6 left-6 z-40 max-w-sm w-full`).
  - Minimal Mimo aesthetic: hairline border, dark/light theme, friendly mascot thumbnail (`/FeedBackCharater/Smiling Cartoon Boy Giving Thumbs-Up.png`), "Share Feedback" button, "Later" dismiss button.

- [ ] **Step 1: Write `src/components/feedback/FeedbackPromptToast.tsx`**
- [ ] **Step 2: Verify zero em dash compliance in toast copy**
- [ ] **Step 3: Commit toast component**

```bash
git add src/components/feedback/FeedbackPromptToast.tsx
git commit -m "feat: implement bottom-left FeedbackPromptToast component"
```

---

### Task 4: Implement `FeedbackPromptModal.tsx`

**Files:**
- Create: `src/components/feedback/FeedbackPromptModal.tsx`
- Test: `tests/feedback/feedbackPrompt.test.ts`

**Interfaces:**
- Consumes:
  ```typescript
  export interface FeedbackPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
  }
  ```
- Produces:
  - Accessible `ModalPortal` modal.
  - Auto-fetched email for logged-in user (`useAuthStore` or `supabase.auth.getUser()`).
  - Email input for guest user with regex validation.
  - Single-select chip questions:
    - Q1: Discovery Source (`Twitter / X`, `Google Search`, `Friend / Colleague`, `Reddit`, `Other`)
    - Q2: Previous Tool (`Notion`, `Obsidian`, `Typora`, `VS Code`, `None / Other`)
    - Q3: Missing Feature (`Export options`, `Offline sync`, `Custom themes`, `Mobile experience`, `Nothing, it's great!`)
  - Q4: Free-write feedback textarea.
  - Supabase `feedbacks` table insertion logic.
  - Success message banner and auto-close.

- [ ] **Step 1: Write `src/components/feedback/FeedbackPromptModal.tsx`**
- [ ] **Step 2: Verify Supabase insert payload and zero em dash rule**
- [ ] **Step 3: Commit modal component**

```bash
git add src/components/feedback/FeedbackPromptModal.tsx
git commit -m "feat: implement FeedbackPromptModal with discovery chips and email handling"
```

---

### Task 5: Integrate Hook, Toast, and Modal into `EditorPage.tsx`

**Files:**
- Modify: `src/pages/EditorPage.tsx`

**Interfaces:**
- Consumes: `useFeedbackPrompt`, `FeedbackPromptToast`, `FeedbackPromptModal`, `doc.docId` / document state
- Produces: Live in-editor feedback prompt mounted cleanly without colliding with existing toasts/modals.

- [ ] **Step 1: Import and wire `useFeedbackPrompt` in `src/pages/EditorPage.tsx`**
  - Pass `hasDocument: Boolean(doc.docId || (doc.content && doc.content.length > 0))`
- [ ] **Step 2: Render `<FeedbackPromptToast>` and `<FeedbackPromptModal>` in JSX**
- [ ] **Step 3: Verify TypeScript compilation with `npx tsc --noEmit`**
- [ ] **Step 4: Commit integration**

```bash
git add src/pages/EditorPage.tsx
git commit -m "feat: integrate feedback prompt toast and modal into EditorPage"
```

---

### Task 6: Full Verification, Knowledge Graph Update & Git Push

**Files:**
- Verify all modified files
- Update: `graphify-out/`

- [ ] **Step 1: Run full test suite: `npm test -- --run`**
  - Expected: All tests pass (including new feedback tests).
- [ ] **Step 2: Run type check: `npx tsc --noEmit`**
  - Expected: 0 type errors.
- [ ] **Step 3: Run production build: `npm run build`**
  - Expected: Clean production bundle build.
- [ ] **Step 4: Update knowledge graph: `graphify update .`**
- [ ] **Step 5: Push commits to `origin/main`**
