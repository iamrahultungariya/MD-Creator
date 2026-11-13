# Phase 2: System-Wide Modal Portal Architecture & Anti-Slop Transition Cleanup Design Doc

## Intent & The Why
In Phase 1, we permanently fixed `CreateDocumentModal` by rendering it through `createPortal`, locking body scroll, and eliminating the internal scrollbar. However, an architectural audit reveals that **12 other modals across the application** (`TemplatesModal`, `BulkShareModal`, `CloudSyncModal`, `ExportModal`, `PublishModal`, etc.) remain in-tree inside `<PageTransition>`, leaving them vulnerable to the same CSS containing block trap (`will-change: transform`). Additionally, **267 instances of `transition-all`** remain across components, which cause continuous layout recalculation and paint thrashing on hover and active clicks.

## Goals, Non-Goals & Anti-Goals
- **Goals:**
  1. Create a unified `<ModalPortal>` primitive (or lightweight hook) that mounts dialogs into `document.body` via `createPortal`, enforces body scroll lock (`overflow: hidden`), and guarantees viewport-centering across all 12 remaining modals.
  2. Upgrade the primary page-level modals to use this architecture:
     - `TemplatesModal.tsx`
     - `BulkShareModal.tsx`
     - `CloudSyncModal.tsx`
     - `QuickAuthModal.tsx`
     - `ExportModal.tsx`
     - `PublishModal.tsx`
     - `KatexFormulaModal.tsx`
     - `DocumentSwitcherModal.tsx`
     - `TableBuilderModal.tsx`
     - `ImageEmbedModal.tsx`
     - `LocalFolderDrawer.tsx`
     - `BlogCreateModal.tsx`
  3. Systematically replace `transition-all` across all pages (`DocumentsPage`, `HomePage`, `EditorPage`, `BlogPage`, `FeedbackPage`, `PricingPage`, `LegalPage`, etc.) with targeted transitions (`transition-colors duration-150` or `transition-transform duration-100`).
  4. Ensure `Escape` key dismisses open floating menus (such as the "Tools" popover in `DocumentsPage`).
  5. Pass 100% of the test suite and achieve a clean build with zero regressions.
- **Non-Goals:**
  - Redesigning visual themes, brand colors, or database schemas.
  - Rewriting markdown parser or AST engines.
- **Anti-Goals:**
  - Never mutate standard hyphens `-` in CSS classes (`flex-col`), Markdown syntax (`- item`), frontmatter, date formats, math operators, or regexes.
  - Never break table formatting dashes or test assertions.

## Approaches Considered
- **Approach A (Recommended — Shared `<ModalPortal>` Primitive + Phased Transition Cleanup):**
  - Implement a reusable `<ModalPortal>` component in `src/components/common/ModalPortal.tsx` that wraps `createPortal`, handles `useBodyScrollLock`, and adds `Escape` key support.
  - Migrate all modals to use `<ModalPortal>`, guaranteeing that no future modal can ever suffer from the containing block trap.
  - Run a targeted script/codemod to replace `transition-all` on buttons/links/cards with explicit `transition-colors duration-150`.
  - Tradeoff: Cleanest architecture, minimal code duplication, permanent immunity against containing block bugs.
- **Approach B (Manual In-File Portaling in Each Modal):**
  - Add `createPortal` and `useEffect` individually into all 12 modal files without a shared component.
  - Tradeoff: Repetitive boilerplate across 12 files, prone to inconsistencies.

## Chosen Architecture: Approach A
1. **Shared Primitive:** `src/components/common/ModalPortal.tsx`
   - Props: `isOpen: boolean`, `onClose?: () => void`, `children: React.ReactNode`, `className?: string`, `lockScroll?: boolean`.
   - Mounts to `document.body` via `createPortal`.
   - Automatically manages `document.body.style.overflow = 'hidden'`.
   - Listens for `keydown` (Escape) to trigger `onClose`.
2. **Modal Migration:**
   - Migrate `TemplatesModal`, `BulkShareModal`, `CloudSyncModal`, `ExportModal`, `PublishModal`, `KatexFormulaModal`, etc., to render their backdrops and dialogs through `<ModalPortal>`.
3. **Transition-All Replacement Rules:**
   - On interactive buttons, links, badges, and tabs: replace `transition-all` with `transition-colors duration-150`.
   - On scale/transform elements: replace `transition-all` with `transition-transform duration-100`.
   - Keep existing layout/padding styles untouched.
4. **Verification Gates:**
   - Automated unit tests (`npm test`).
   - Production bundle build (`npm run build`).
   - Zeroslop scanner verification (`scripts/verify-ui.mjs`).
