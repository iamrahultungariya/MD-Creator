# Phase 2: System-Wide Modal Portal Architecture & Anti-Slop Transition Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a reusable `<ModalPortal>` primitive, upgrade all remaining page-level dialogs/modals to portal into `document.body` with body scroll lock, replace `transition-all` with targeted transitions, verify with automated tests and production build, and push to GitHub.

**Architecture:** Create `src/components/common/ModalPortal.tsx` wrapping `ReactDOM.createPortal` with an automatic `document.body.style.overflow = 'hidden'` lock and `Escape` key handler. Migrate existing dialogs to use `<ModalPortal>`. Clean `transition-all` occurrences to use `transition-colors duration-150` or `transition-transform duration-100`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Lucide React, ReactDOM `createPortal`, Node Test Runner.

**Spec:** [docs/superpowers/specs/2026-11-13-phase-2-systemwide-modal-portal-and-anti-slop-transitions-design.md](file:///c:/Users/Rahul/OneDrive/Desktop/md%20Writter/docs/superpowers/specs/2026-11-13-phase-2-systemwide-modal-portal-and-anti-slop-transitions-design.md)

## Global Constraints

- Never mutate standard hyphens `-` in CSS classes (`flex-col`, `bg-neutral-900`), Markdown syntax, frontmatter, dates (`YYYY-MM-DD`), math, or regexes.
- Preserve all existing modal props, callbacks, and internal business logic.
- Keep table formatting and pricing table dashes (`—`) intact.
- Every test in `tests/**/*.test.ts` must pass without regressions.

## Review Focus

1. **Clean Unmounting & Scroll Lock Restoration:** When any modal closes or unmounts, `document.body.style.overflow` must reliably return to its previous value.
2. **Keyboard Trapping & Escape Listener:** Pressing Escape must close modals without side effects.
3. **No Containing Block Traps:** All modals must render outside `<PageTransition>` in `document.body`.
4. **Targeted Transitions:** Buttons and interactive elements must not trigger layout recalculations via `transition-all`.
5. **Zero Broken Layouts:** Replacing transitions must not alter visual appearance or layout geometry.

---

### Task 1: Create & Test Reusable `<ModalPortal>` Primitive

**Files:**
- Create: `tests/common/modalPortal.test.ts`
- Create: `src/components/common/ModalPortal.tsx`

**Interfaces:**
- Consumes: `createPortal` from `react-dom`
- Produces: `<ModalPortal isOpen={isOpen} onClose={onClose} lockScroll={true}>{children}</ModalPortal>`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Task 1: ModalPortal Primitive', () => {
  it('creates ModalPortal with createPortal, body scroll lock, and escape handler', () => {
    assert.ok(
      fs.existsSync('src/components/common/ModalPortal.tsx'),
      'src/components/common/ModalPortal.tsx must exist'
    );
    const code = fs.readFileSync('src/components/common/ModalPortal.tsx', 'utf-8');
    assert.ok(code.includes('createPortal'), 'ModalPortal must use createPortal');
    assert.ok(code.includes('document.body.style.overflow'), 'ModalPortal must manage body scroll lock');
    assert.ok(code.includes('Escape'), 'ModalPortal must handle Escape key');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/common/modalPortal.test.ts`  
Expected: FAIL with "src/components/common/ModalPortal.tsx must exist"

- [ ] **Step 3: Implement `src/components/common/ModalPortal.tsx`**

```tsx
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  lockScroll?: boolean;
}

export const ModalPortal: React.FC<ModalPortalProps> = ({
  isOpen,
  onClose,
  children,
  lockScroll = true,
}) => {
  useEffect(() => {
    if (!isOpen || !lockScroll || typeof document === 'undefined') return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, lockScroll]);

  useEffect(() => {
    if (!isOpen || !onClose || typeof window === 'undefined') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(children, document.body);
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/common/modalPortal.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/common/modalPortal.test.ts src/components/common/ModalPortal.tsx
git commit -m "feat(ui): add reusable ModalPortal primitive with body scroll lock and escape listener"
```

---

### Task 2: Migrate Page-Level Modals to `<ModalPortal>`

**Files:**
- Create: `tests/common/allModalsPortaled.test.ts`
- Modify: `src/components/home/TemplatesModal.tsx`
- Modify: `src/components/share/BulkShareModal.tsx`
- Modify: `src/components/common/CloudSyncModal.tsx`
- Modify: `src/components/auth/QuickAuthModal.tsx`
- Modify: `src/components/editor/ExportModal.tsx`
- Modify: `src/components/editor/PublishModal.tsx`
- Modify: `src/components/editor/DocumentSwitcherModal.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Task 2: Primary Modals Portaled Check', () => {
  const modalFiles = [
    'src/components/home/TemplatesModal.tsx',
    'src/components/share/BulkShareModal.tsx',
    'src/components/common/CloudSyncModal.tsx',
    'src/components/auth/QuickAuthModal.tsx',
    'src/components/editor/ExportModal.tsx',
    'src/components/editor/PublishModal.tsx',
  ];

  for (const file of modalFiles) {
    it(`verifies ${file} uses ModalPortal or createPortal`, () => {
      const code = fs.readFileSync(file, 'utf-8');
      assert.ok(
        code.includes('ModalPortal') || code.includes('createPortal'),
        `${file} must use ModalPortal or createPortal`
      );
    });
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/common/allModalsPortaled.test.ts`  
Expected: FAIL

- [ ] **Step 3: Wrap modals in `<ModalPortal>`**
  - Wrap `TemplatesModal` with `<ModalPortal isOpen={isOpen} onClose={onClose}>`
  - Wrap `BulkShareModal` with `<ModalPortal isOpen={isOpen} onClose={onClose}>`
  - Wrap `CloudSyncModal` with `<ModalPortal isOpen={isOpen} onClose={onClose}>`
  - Wrap `QuickAuthModal` with `<ModalPortal isOpen={isOpen} onClose={onClose}>`
  - Wrap `ExportModal` with `<ModalPortal isOpen={isOpen} onClose={onClose}>`
  - Wrap `PublishModal` with `<ModalPortal isOpen={isOpen} onClose={onClose}>`
  - Wrap `DocumentSwitcherModal` with `<ModalPortal isOpen={isOpen} onClose={onClose}>`

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/common/allModalsPortaled.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/common/allModalsPortaled.test.ts src/components/
git commit -m "refactor(ui): migrate primary modals to ModalPortal"
```

---

### Task 3: Clean `transition-all` Across Primary Pages & Components

**Files:**
- Modify: `src/pages/DocumentsPage.tsx`
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/pages/AuthPage.tsx`
- Modify: `src/pages/FeedbackPage.tsx`
- Modify: `src/pages/PricingPage.tsx`
- Modify: `src/pages/BlogPage.tsx`
- Modify: `src/pages/PublicDocumentPage.tsx`
- Modify: `src/components/home/TemplatesModal.tsx`
- Modify: `src/components/share/BulkShareModal.tsx`

- [ ] **Step 1: Replace `transition-all` with targeted `transition-colors duration-150` on buttons, tabs, links, and cards**
  - Ensure zero disruption to CSS classes, hyphens, or markdown syntax.
  - Add Escape key listener to `moreActionsRef` popover in `DocumentsPage.tsx`.

- [ ] **Step 2: Run test suite to verify 0 regressions**

Run: `npx tsx --test tests/**/*.test.ts`  
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/
git commit -m "perf(ui): replace transition-all with targeted transitions across primary pages"
```

---

### Task 4: Production Build Verification & Push to GitHub

**Files:**
- Run: `npm run build`
- Run: `git push origin main`

- [ ] **Step 1: Run production build**

Run: `npm run build`  
Expected: `✓ built in ...` with zero TypeScript errors.

- [ ] **Step 2: Run full test suite**

Run: `npm test`  
Expected: All tests passing.

- [ ] **Step 3: Push commits to GitHub repository**

Run: `git push origin main`  
Expected: Pushed successfully to `git@github.com:...` or `https://github.com/iamrahultungariya/zeroslop.git` / `origin`.
