# Phase 1: New Note Modal Portal & Scrollbar Elimination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the bottom-placement and vertical scrollbar bugs on the "New Note" modal by mounting it via `createPortal`, locking body scroll on open, compacting internal blueprint layout to remove inner vertical scrollbars, and replacing `transition-all` with targeted transitions.

**Architecture:** Render `CreateDocumentModal` into `document.body` via `createPortal`, isolating it from the `<PageTransition>` containing block. Use a clean React `useEffect` for body scroll locking (`overflow: hidden`). Refactor the modal form body into a compact 8pt grid with sleek 2-column blueprint tiles (~40px height) and zero `transition-all`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Lucide React, ReactDOM `createPortal`, Node Test Runner.

**Spec:** [docs/superpowers/specs/2026-11-13-new-note-modal-portal-and-scrollbar-fix-design.md](file:///c:/Users/Rahul/OneDrive/Desktop/md%20Writter/docs/superpowers/specs/2026-11-13-new-note-modal-portal-and-scrollbar-fix-design.md)

## Global Constraints

- Never mutate standard hyphens `-` in CSS classes (`flex-col`, `bg-neutral-900`), Markdown syntax, frontmatter, dates (`YYYY-MM-DD`), math, or regexes.
- Preserve all existing props on `CreateDocumentModal`: `isOpen: boolean`, `onClose: () => void`, `defaultFolderTag?: string`.
- Retain `isLocalOnly` state and user-facing copy matching `tests/document/localOnlyControls.test.ts`.
- Retain all template resolvers (`resolveTemplateContent`), tag management, and keyboard handling (Esc, Tab focus trap, Enter).
- Every test in `tests/**/*.test.ts` must pass without regressions.

## Review Focus

1. **Containing Block Isolation:** The modal overlay must be a direct child of `document.body` via `createPortal`, immune to parent `transform` or `will-change`.
2. **Scroll Lock Cleanup:** `document.body.style.overflow` must always be restored even if the component unmounts unexpectedly.
3. **No Unintentional Inner Scrollbar:** Form content height on initial load with 5 blueprint options must stay under 400px so standard laptop viewports never trigger `overflow-y-auto`.
4. **Keyboard Accessibility:** Esc key must cleanly invoke `onClose`, and Tab cycling must trap focus within the modal.
5. **Zero Banned Transitions:** No `transition-all` in `CreateDocumentModal.tsx`; use `transition-colors duration-150` or `transition-transform duration-100`.

---

### Task 1: Add Unit Tests for Modal Portal, Body Scroll Lock & Anti-Slop Hygiene

**Files:**
- Create: `tests/document/createDocumentModalPortal.test.ts`

**Interfaces:**
- Consumes: `src/components/document/CreateDocumentModal.tsx`
- Produces: Test verification suite for portal mounting, body scroll lock, zero `transition-all`, and local-only compliance.

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Task 1: CreateDocumentModal Portal & Anti-Slop Architecture', () => {
  const modalCode = fs.readFileSync('src/components/document/CreateDocumentModal.tsx', 'utf-8');

  it('uses createPortal to mount directly to document.body', () => {
    assert.ok(
      modalCode.includes('createPortal') && modalCode.includes('document.body'),
      'CreateDocumentModal.tsx must use createPortal to mount to document.body'
    );
  });

  it('implements body scroll lock on mount and clean restoration on unmount', () => {
    assert.ok(
      modalCode.includes('document.body.style.overflow'),
      'CreateDocumentModal.tsx must manage document.body.style.overflow'
    );
  });

  it('replaces all banned transition-all instances with explicit transitions', () => {
    assert.ok(
      !modalCode.includes('transition-all'),
      'CreateDocumentModal.tsx must not contain banned transition-all'
    );
  });

  it('maintains local-only storage toggle controls', () => {
    assert.ok(
      modalCode.includes('isLocalOnly'),
      'CreateDocumentModal.tsx must retain isLocalOnly control'
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/document/createDocumentModalPortal.test.ts`  
Expected: FAIL with "CreateDocumentModal.tsx must use createPortal to mount to document.body"

- [ ] **Step 3: Commit test file**

```bash
git add tests/document/createDocumentModalPortal.test.ts
git commit -m "test: add test suite for CreateDocumentModal portal and scroll lock"
```

---

### Task 2: Implement React Portal, Scroll Lock & Compact Layout in `CreateDocumentModal.tsx`

**Files:**
- Modify: `src/components/document/CreateDocumentModal.tsx`

**Interfaces:**
- Consumes: `createPortal` from `react-dom`
- Produces: Portaled, scroll-locked, compact modal component with zero `transition-all`.

- [ ] **Step 1: Import `createPortal` and add body scroll lock effect**
  - Add `import { createPortal } from 'react-dom';`.
  - Add `useEffect` hook locking `document.body.style.overflow = 'hidden'` when `isOpen` is true, and restoring original overflow on cleanup.

- [ ] **Step 2: Compact Form Layout & Blueprint Tiles**
  - Change outer dialog card max width from `max-w-xl` to `max-w-lg`.
  - Reduce form container padding from `p-6` to `p-4 sm:p-5`, and item gap from `space-y-5` to `space-y-3.5`.
  - Restructure Starter Blueprint cards:
    - Card padding: `p-2.5` instead of `p-3`.
    - Icon wrapper: `w-7 h-7` with `w-3.5 h-3.5` icon.
    - Card title: `text-xs font-semibold`.
    - Card desc: `text-[10px] text-neutral-500 line-clamp-1 mt-0.5`.
  - Streamline the Cloud Sync vs Local-Only row to a compact flex row.
  - Wrap return statement in `createPortal(modalContent, document.body)`.

- [ ] **Step 3: Replace all `transition-all` with targeted transitions**
  - Replace `transition-all` on buttons with `transition-colors duration-150` or `transition-transform duration-100`.
  - Replace `transition-all` on tag chips with `transition-colors duration-150`.
  - Replace `transition-all` on title input with `transition-colors duration-150`.

- [ ] **Step 4: Run unit tests to verify they pass**

Run: `npx tsx --test tests/document/createDocumentModalPortal.test.ts`  
Expected: PASS

- [ ] **Step 5: Run full project test suite**

Run: `npx tsx --test tests/**/*.test.ts`  
Expected: PASS (All tests passing, 0 failures)

- [ ] **Step 6: Commit changes**

```bash
git add src/components/document/CreateDocumentModal.tsx
git commit -m "fix(ui): portalize CreateDocumentModal, lock body scroll, and eliminate internal scrollbar"
```

---

### Task 3: Comprehensive Verification & Visual Audit Gate

**Files:**
- Inspect: `src/components/document/CreateDocumentModal.tsx`
- Run: `scripts/verify-ui.mjs`

- [ ] **Step 1: Run Zeroslop Verification Scanner on CreateDocumentModal**

Run: `node scripts/verify-ui.mjs src/components/document/CreateDocumentModal.tsx`  
Expected: 0 violations found.

- [ ] **Step 2: Build Verification**

Run: `npm run build`  
Expected: Build passes with zero TypeScript or bundling errors.

- [ ] **Step 3: Final Test Suite Run**

Run: `npm test`  
Expected: PASS
