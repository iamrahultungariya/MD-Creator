# Admin Suite Modernization & Anti-Slop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernize the MD Writer Admin Suite by eliminating AI slop (em dashes, decorative glow blobs, buzzwords), adding bulk moderation to Blogs and Feedback tabs, enabling in-modal blog approval, and ensuring WCAG accessible tab navigation.

**Architecture:** Component-level refactoring within React 19 + TypeScript + Tailwind CSS v4, reusing existing `useConfirmStore` and `useAdminData` patterns without backend schema changes.

**Tech Stack:** React 19, TypeScript 5.7, Tailwind CSS v4, Lucide React, Supabase Client.

**Spec:** `docs/superpowers/specs/2026-11-14-admin-modernization-design.md`

## Global Constraints

- Never use em dash character (`—`) in UI copy or labels (R-02).
- Zero decorative glow orbs, blur-3xl backdrops, or unjustified accent effects (antislop Part 1).
- Every interactive element must be functional and keyboard navigable with visible focus states (C-2, C-4).
- Keep all existing test suites passing (`npm run test`) and maintain zero TypeScript errors (`npx tsc --noEmit`).

## Review Focus

1. Verify that bulk actions in `AdminBlogsTab` handle empty selection without crashing or sending empty requests.
2. Verify that `BlogReaderModal` closes cleanly after in-modal approval or rejection and updates parent list state.
3. Verify that `AdminHeader` arrow key navigation cycles tabs without breaking URL query parameters (`?tab=...`).
4. Verify that bulk operations in `AdminFeedbackTab` prompt for confirmation on destructive batch actions (Archive / Delete).
5. Verify that all copy is natural, human-written, and free from tech buzzwords or AI marketing hype.

---

### Task 1: Anti-Slop Copy & Visual Cleanup (`AdminOverviewTab`, `AdminAccessDenied`)

**Files:**
- Modify: `src/components/admin/AdminOverviewTab.tsx`
- Modify: `src/components/admin/AdminAccessDenied.tsx`

**Interfaces:**
- Consumes: `AdminStats`, `Article`, `UserReview`, `AdminTab`
- Produces: Polished overview without em dashes or decorative glow blobs

- [x] **Step 1: Replace em dashes and buzzword headline in `AdminOverviewTab.tsx`**
  - Change `Moderation & Telemetry Command Center` to `Admin & Moderation Overview`.
  - Change `All Clear — No Pending Submissions` to `All Clear: No Pending Submissions`.
  - Change `All Clear — No Pending Reviews` to `All Clear: No Pending Reviews`.
  - Remove decorative `New` capsule badge from Telemetry Banner.

- [x] **Step 2: Remove decorative glow blob in `AdminAccessDenied.tsx`**
  - Remove `<div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />`.

- [x] **Step 3: Verify TypeScript compilation**
  Run: `npx tsc --noEmit`
  Expected: PASS with 0 errors.

- [x] **Step 4: Commit Task 1**
  ```bash
  git add src/components/admin/AdminOverviewTab.tsx src/components/admin/AdminAccessDenied.tsx
  git commit -m "style(admin): eliminate em dashes, glow orbs, and buzzword headlines"
  ```

---

### Task 2: WCAG Accessible Tab Navigation in `AdminHeader`

**Files:**
- Modify: `src/components/admin/AdminHeader.tsx`

**Interfaces:**
- Consumes: `AdminTab`, `AdminStats`, `lastRefreshedAt`
- Produces: Accessible `tablist` with `role="tab"` and arrow key navigation

- [x] **Step 1: Add `role="tablist"` and `role="tab"` with `aria-selected`**
  - On the `<nav>` wrapper, set `role="tablist"` and `aria-label="Admin Navigation Tabs"`.
  - On each tab button, add `role="tab"`, `aria-selected={isActive}`, and `id={`tab-${tab.id}`}`.
  - Add `onKeyDown` handler to allow cycling through tabs using `ArrowRight` and `ArrowLeft` keys.

- [x] **Step 2: Verify TypeScript compilation**
  Run: `npx tsc --noEmit`
  Expected: PASS with 0 errors.

- [x] **Step 3: Commit Task 2**
  ```bash
  git add src/components/admin/AdminHeader.tsx
  git commit -m "feat(admin): add accessible tablist and arrow key navigation to admin header"
  ```

---

### Task 3: In-Modal Editorial Decision in `BlogReaderModal` & `AdminPage`

**Files:**
- Modify: `src/components/blog/BlogReaderModal.tsx`
- Modify: `src/pages/AdminPage.tsx`

**Interfaces:**
- Consumes: `onApprove?: (id: string) => Promise<void>`, `onReject?: (id: string) => Promise<void>`
- Produces: Direct editorial decision toolbar inside the article preview modal

- [x] **Step 1: Update `BlogReaderModalProps` with `onApprove` and `onReject`**
  - Add `onApprove?: (articleId: string) => Promise<void>` and `onReject?: (articleId: string) => Promise<void>`.
  - Render action buttons at modal footer:
    - If article is pending: "Approve & Publish Live" and "Reject Submission".
    - If article is published: "Unpublish" and external link to live blog `/blog/${slug}`.
  - Call `onClose()` after successful action.

- [x] **Step 2: Pass handlers from `AdminPage.tsx` into `BlogReaderModal`**
  - Connect `handleApproveBlog` and `handleRejectBlog` to `<BlogReaderModal />`.

- [x] **Step 3: Verify TypeScript compilation**
  Run: `npx tsc --noEmit`
  Expected: PASS with 0 errors.

- [x] **Step 4: Commit Task 3**
  ```bash
  git add src/components/blog/BlogReaderModal.tsx src/pages/AdminPage.tsx
  git commit -m "feat(admin): enable in-modal blog approval and rejection workflows"
  ```

---

### Task 4: Bulk Batch Moderation in `AdminBlogsTab`

**Files:**
- Modify: `src/components/admin/AdminBlogsTab.tsx`

**Interfaces:**
- Consumes: `articles: Article[]`, `onApprove`, `onReject`
- Produces: Multi-select state, "Select All" toggle, and batch action toolbar

- [x] **Step 1: Implement selection state & handlers**
  - Add `selectedIds: Set<string>` state and `isBulkProcessing: boolean`.
  - Add `toggleSelectArticle(id: string)` and `handleSelectAllVisible()`.
  - Add `handleBulkApprove()` and `handleBulkReject()` with confirmation dialog.

- [x] **Step 2: Render selection checkbox on each article row and Bulk Action Toolbar**
  - Checkbox per article card.
  - Floating/inline bulk action bar with `Approve Selected (N)` and `Reject Selected (N)`.
  - "Select All" toggle button in the filter header.

- [x] **Step 3: Verify TypeScript compilation**
  Run: `npx tsc --noEmit`
  Expected: PASS with 0 errors.

- [x] **Step 4: Commit Task 4**
  ```bash
  git add src/components/admin/AdminBlogsTab.tsx
  git commit -m "feat(admin): add bulk approve and reject actions to blogs moderation tab"
  ```

---

### Task 5: Bulk Batch Actions in `AdminFeedbackTab`

**Files:**
- Modify: `src/components/admin/AdminFeedbackTab.tsx`

**Interfaces:**
- Consumes: `feedbacks: FeedbackItem[]`, `onUpdateStatus`, `onDelete`
- Produces: Multi-select state and batch resolution/archiving toolbar

- [x] **Step 1: Implement selection state & handlers**
  - Add `selectedIds: Set<string>` and `isBulkProcessing: boolean`.
  - Add `toggleSelectFeedback(id: string)` and `handleSelectAllVisible()`.
  - Add `handleBulkResolve()` and `handleBulkArchive()`.

- [x] **Step 2: Render selection checkbox on feedback cards and Bulk Action Toolbar**
  - Checkbox per feedback item.
  - Bulk action bar with `Mark Selected Resolved (N)` and `Archive Selected (N)`.
  - "Select All" toggle button in the filter header.

- [x] **Step 3: Verify TypeScript compilation and production build**
  Run: `npm run build`
  Expected: PASS with 0 errors and successful PWA bundle generation.

- [x] **Step 4: Commit Task 5**
  ```bash
  git add src/components/admin/AdminFeedbackTab.tsx
  git commit -m "feat(admin): add bulk resolve and archive actions to feedback triage desk"
  ```
