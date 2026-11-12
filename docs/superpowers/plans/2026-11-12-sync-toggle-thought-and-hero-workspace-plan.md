# Cloud Sync Controls, Mimo Minimal Thought & Studio Workspace Demo Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement clear UI controls to toggle cloud sync off (local-only) on new and existing documents, eliminate distracting green dots in Mimo 3.5 Flash-Lite thought timeline, overhaul the Hero studio workspace demo (remove Print Preview, match left & right 1:1, make AI Diff accept update writing side), and add smooth page navigation across routes.

**Architecture:** 
1. Database & UI state: Add `setDocumentLocalOnly` in `src/db/index.ts` to update `isLocalOnly` and sync cross-device tombstone state. Provide toggle controls in `CreateDocumentModal`, `EditorHeader`, `DocumentGridCard`, and `DocumentListItem`.
2. Antislop timeline: Replace green dots in `MimoExecutionTimeline` with neutral monochrome indicators.
3. Hero demo: Prune Print Preview tab, synchronize code snippets and previews 1:1, and dynamically update the editor lines on AI Diff acceptance.
4. Navigation: Smooth page transition wrapping and view transition coordination in `App.tsx`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Lucide icons, Framer Motion, Dexie.js (IndexedDB), Vitest/Node test runner.

**Spec:** User request at 2026-11-12T15:14:34+05:30.

## Global Constraints
- Enforce Anti-AI Slop guidelines (R-01 to R-40): no em dashes (`—`), no decorative icon bloat, zero glassmorphism, flat borders, crisp typography.
- Never use the word "unlimited" anywhere in user-facing copy or services.
- Keep editor typing canvas at 0ms latency (zero animations or expensive re-renders on keystroke).
- TDD required: write failing tests first, observe failure, implement fix, verify tests pass, commit.

---

### Task 1: Cloud Sync Controls (Local-Only Toggle on Creation & Existing Documents)

**Files:**
- Modify: `src/db/index.ts`
- Modify: `src/components/document/CreateDocumentModal.tsx`
- Modify: `src/features/editor/components/EditorHeader.tsx`
- Modify: `src/components/documents/DocumentGridCard.tsx`
- Modify: `src/components/documents/DocumentListItem.tsx`
- Test: `tests/document/localOnlyControls.test.ts`

- [ ] Write failing test in `tests/document/localOnlyControls.test.ts` checking `setDocumentLocalOnly`, toggle switch in `CreateDocumentModal`, and sync button in `EditorHeader`, `DocumentGridCard`, and `DocumentListItem`.
- [ ] Implement `setDocumentLocalOnly(id, isLocalOnly)` in `src/db/index.ts` and update `saveDocument` to support initial `isLocalOnly`.
- [ ] Add "Keep Local Only (Disable Cloud Sync)" toggle in `CreateDocumentModal.tsx`.
- [ ] Add clickable Cloud Sync status badge (`Cloud Synced` ⇄ `Local Only`) in `EditorHeader.tsx`.
- [ ] Add cloud sync toggle button and `Local Only` badge in `DocumentGridCard.tsx` and `DocumentListItem.tsx`.
- [ ] Run test `npx tsx --test tests/document/localOnlyControls.test.ts` and verify it passes.
- [ ] Commit Task 1.

---

### Task 2: Remove Green Dots in Mimo 3.5 Flash-Lite Thought & Timeline

**Files:**
- Modify: `src/features/mimo/components/MimoExecutionTimeline.tsx`
- Test: `tests/mimo/timelineGreenDot.test.ts`

- [ ] Write failing test in `tests/mimo/timelineGreenDot.test.ts` asserting no `bg-emerald-*` classes exist for thought bullets in `MimoExecutionTimeline.tsx`.
- [ ] Update `MimoExecutionTimeline.tsx` to use sleek neutral styling (`bg-neutral-900 dark:bg-neutral-100` and `bg-neutral-600 dark:bg-neutral-300`) instead of emerald green dots.
- [ ] Run test `npx tsx --test tests/mimo/timelineGreenDot.test.ts` and verify it passes.
- [ ] Run `npx tsx --test tests/mimo/flashLiteProtocol.test.ts` to ensure full protocol regression passes.
- [ ] Commit Task 2.

---

### Task 3: Overhaul Hero Section Studio Workspace Demo

**Files:**
- Modify: `src/components/home/StudioWorkspaceDemo.tsx`
- Test: `tests/home/studioDemo.test.ts`

- [ ] Write failing test in `tests/home/studioDemo.test.ts` checking that Print Preview tab is removed, only 3 tabs exist, and accepting AI Diff updates the writing side code.
- [ ] In `StudioWorkspaceDemo.tsx`: Remove `export` ("Print Preview") mode.
- [ ] In `StudioWorkspaceDemo.tsx`: Align left markdown code snippets with right live engine output 1:1.
- [ ] In `StudioWorkspaceDemo.tsx`: Wire `mimoAccepted` state so when accepted, the left writing pane dynamically switches to the optimized `Uint8Array` code snippet, and clicking Revert restores the diff.
- [ ] Run test `npx tsx --test tests/home/studioDemo.test.ts` and verify it passes.
- [ ] Commit Task 3.

---

### Task 4: Smooth Page Navigation Transitions

**Files:**
- Modify: `src/App.tsx`
- Test: `tests/navigation/pageTransitions.test.ts`

- [ ] Write failing test in `tests/navigation/pageTransitions.test.ts` checking smooth transition configuration and route animation wrapper.
- [ ] Update `App.tsx` to eliminate the abrupt unmount cut when navigating between `/`, `/documents`, `/pricing`, and `/editor`, smoothly bridging pages while preserving 0ms editor canvas typing performance.
- [ ] Run test `npx tsx --test tests/navigation/pageTransitions.test.ts` and verify it passes.
- [ ] Run full test suite: `npm test`.
- [ ] Run production build: `npm run build` (`tsc -b && vite build`).
- [ ] Commit Task 4.
