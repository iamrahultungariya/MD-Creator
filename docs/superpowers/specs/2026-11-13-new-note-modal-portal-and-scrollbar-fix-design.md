# Phase 1: New Note Modal Portal & Scrollbar Elimination Design Doc

## Intent & The Why
When users click the "New Note" button on `DocumentsPage` (or "Create Document" on `HomePage`), the modal unexpectedly renders at the bottom of the page and forces the viewport to scroll down, accompanied by an internal vertical scrollbar inside the modal box.
The root cause is a CSS Containing Block trap: `App.tsx` wraps routes in `<PageTransition>`, which applies `transform` and `will-change: transform`. According to the CSS spec, `position: fixed; inset: 0` on child elements becomes relative to that transformed container rather than the browser window, expanding the modal overlay across the entire document height (~2000px). Additionally, the form content height (~480px) exceeds `max-h-[min(65vh,520px)]` on standard laptop screens, creating an unnecessary internal scrollbar.

## Goals, Non-Goals & Anti-Goals
- **Goals:**
  1. Mount `CreateDocumentModal` into `document.body` via `createPortal`, isolating it from any ancestor CSS transforms and positioning it dead-center in the viewport at all times.
  2. Implement an automatic body scroll lock (`document.body.style.overflow = 'hidden'`) while the modal is open, restoring it on close.
  3. Redesign and compact the internal form layout: compact 2-column blueprint tiles (~42px height), streamlined spacing (`space-y-3.5`), and a low-profile local sync toggle so the modal has **zero internal vertical scrollbar** on all standard 1080p and 768p displays.
  4. Replace `transition-all` with targeted `transition-colors` / `transition-transform` adhering to `zeroslop` standards.
  5. Ensure 100% of existing tests pass with zero functional regressions.
- **Non-Goals:**
  - Full codebase-wide sweep of all 290+ `transition-all` instances across other pages (reserved for Phase 2).
  - Touching other modals like `TemplatesModal` or `ExportModal` (reserved for Phase 2).
- **Anti-Goals:**
  - Modifying regular hyphens `-` (in CSS classes, Markdown lists, frontmatter, date formats, math operators, or regexes).
  - Changing document creation database schema, IndexedDB storage keys, or navigation routes.
  - Breaking any existing unit/integration tests in `tests/`.

## Approaches
- **Approach 1 (Chosen): React Portal + Body Scroll Lock + Compacted Blueprint Form:**
  - Wrap the modal JSX in `createPortal(modalContent, document.body)`.
  - Add `useEffect` to lock `document.body.style.overflow = 'hidden'`.
  - Compact blueprint cards from ~60px to ~42px, trim container padding from `p-6` to `p-5`, and reduce gap from `space-y-5` to `space-y-3.5`.
  - Result: Centered in true viewport, no page scroll jump, zero internal scrollbar, instant snappy feel.
- **Approach 2 (Rejected): In-tree positioning / removing transform from PageTransition:**
  - Fails because removing `transform` or `willChange` from `PageTransition` breaks navigation transition tests (`tests/navigation/pageTransitions.test.ts`) and still leaves the modal vulnerable to container clipping and z-index clashes.

## Decided Specifications
1. **Portal Target:** `document.body` via `ReactDOM.createPortal`.
2. **Scroll Lock:** Lock `overflow: hidden` on `document.body` when `isOpen === true`, restore original style on unmount or `isOpen === false`.
3. **Form Geometry & Layout:**
   - Modal wrapper: `max-w-lg` (compact from `max-w-xl`), `rounded-2xl`, `border border-neutral-200/90 dark:border-neutral-800`, specular top highlight `shadow-2xl`.
   - Header: height ~50px, title `text-sm font-bold`, subtitle `text-[11px] text-neutral-500`.
   - Form body: `p-4 sm:p-5 space-y-3.5`, `max-h-[80vh] overflow-y-auto`. Content fits within ~360px so vertical scrollbar does not appear unless user expands tags or viewport is <450px.
   - Blueprints: 2-column grid of 5 items with compact icon (w-3.5 h-3.5 in w-7 h-7 container), title text `text-xs font-semibold`, single-line desc `text-[10px]`.
   - Local-only toggle: sleek single-line flex row with clean checkbox.
4. **Transition Hygiene:**
   - Buttons: `transition-colors duration-150 active:scale-[0.98]`.
   - Tag chips: `transition-colors duration-150`.
   - No `transition-all`.

## What's Left to Implementer
- Exact markup structure in `src/components/document/CreateDocumentModal.tsx`.
- Verifying with automated tests in `tests/document/` and browser validation.
