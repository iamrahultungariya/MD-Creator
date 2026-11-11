# P0 Security, Data Integrity & Session Resilience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remediate all 4 Critical (P0) security vulnerabilities and architecture flaws across MD Creator: password protection bypass in public documents, silent collaborative document destruction, missing auth state listener causing session zombie states, and broken local `image://` links on public URLs and cross-device access.

**Architecture:** 
1. Isolate public document metadata from raw content: never expose `document_contents` in unauthenticated fallback queries, strictly verifying password hashes before content release.
2. Enforce atomic RPC execution with pre-edit historical snapshots in `document_revisions` for collaborative edits, eliminating destructive unauthenticated client upserts.
3. Attach persistent `supabase.auth.onAuthStateChange` in `useAuthStore` to coordinate token refreshes, multi-tab auth transitions, and clear sensitive `queryClient` caches on sign-out.
4. Implement an `inlineStoredImagesInMarkdown` pipeline in `imageStorageService.ts` that expands local Dexie `image://img_xxx` URIs into self-contained compressed WebP Data URLs upon publishing or exporting, guaranteeing zero broken images across devices.

**Tech Stack:** React 19, TypeScript, Supabase JS Client, Dexie IndexedDB, TanStack Query, Tailwind CSS.

**Spec:** [`docs/comprehensive_functional_flows_and_bugs_audit.md`](file:///d:/do%20note%20delete/Desktop/MD%20Creator/docs/comprehensive_functional_flows_and_bugs_audit.md)

## Global Constraints
- Preserve documentation integrity and existing comments.
- Adhere strictly to `/anti-ai-slop-ui-architect` design rules (tactile feedback, zero visual slop).
- Every TypeScript change must compile cleanly with `npm run build` (`tsc -b && vite build`) with zero errors.

## Review Focus
1. Password bypass attempt: querying a password-protected document without password must return `status: 'password_required'` and `doc: null` with NO content in the network payload.
2. Incorrect password: must return `status: 'invalid_password'` and `doc: null`.
3. Anonymous collaborative edit: must call `submit_public_document_edit` and reject direct client writes if RPC fails.
4. Sign out: must completely clear `queryClient` cache so previous user document metadata is never visible in memory.
5. Image in published document: markdown with `image://img_xxx` must resolve to `data:image/webp;base64,...` before publishing to Supabase.

---

### Task 1: Secure Public Document Content & Prevent Password Bypass

**Files:**
- Modify: `src/services/publishService.ts:310-380`

**Execution Steps:**
- [ ] In `getPublicDocumentBySlug`: Inspect the fallback branch when RPC `get_published_document` is unavailable or errors.
- [ ] Replace `.select('*, documents(title), document_contents(content)')` with a safe metadata-only query: `.select('id, document_id, slug, password_hash, published_at, updated_at, view_count, permission_mode, is_public, documents(title)')`.
- [ ] If `directPub.password_hash` is present:
  - If no `providedPassword` was passed, return `{ status: 'password_required', doc: null }` WITHOUT querying `document_contents`.
  - If `providedPassword` was passed, verify password or invoke RPC. Never return content if verification fails.
- [ ] Only if the document has NO password (`!directPub.password_hash`) or after verified password match, fetch `document_contents` for that specific `document_id`.
- [ ] Verify `npm run build` succeeds.
- [ ] Commit with message: `fix(security): prevent password protection bypass in public document fallback query`

---

### Task 2: Lock Down Collaborative Edits & Eliminate Destructive Client Overwrites

**Files:**
- Modify: `src/services/publishService.ts:470-585`

**Execution Steps:**
- [ ] Inspect `submitPublicDocumentEdit` in `src/services/publishService.ts`.
- [ ] Ensure `supabase.rpc('submit_public_document_edit', ...)` is the authoritative path.
- [ ] In the fallback path (if RPC fails): Remove direct `.from('document_contents').upsert(...)` and `.from('documents').update(...)` calls by anonymous users.
- [ ] In fallback: Check `supabase.auth.getSession()`. If user is not authenticated or not authorized, return `{ success: false, error: 'Unauthorized: collaborative edits require verified server RPC execution.' }`.
- [ ] Verify `npm run build` succeeds.
- [ ] Commit with message: `fix(security): eliminate anonymous destructive document overwrite in collaborative edit fallback`

---

### Task 3: Global Supabase Auth State Listener & Query Cache Purge

**Files:**
- Modify: `src/stores/useAuthStore.ts:1-270`

**Execution Steps:**
- [ ] In `src/stores/useAuthStore.ts`, import `queryClient` from `../lib/queryClient`.
- [ ] Add an internal module reference `let authSubscription: { unsubscribe: () => void } | null = null;`.
- [ ] In `initializeAuth()`:
  - Unsubscribe any existing `authSubscription`.
  - Register `const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => ...);`.
  - Handle `SIGNED_IN`, `TOKEN_REFRESHED`, `USER_UPDATED`: Update user profile in Zustand store, and trigger `pullLatestCloudChanges(false)`.
  - Handle `SIGNED_OUT`: Set `user: null`, clear error/loading state, and execute `queryClient.clear()`.
  - Assign `authSubscription = subscription;`.
- [ ] In `signOut()`: Ensure `queryClient.clear()` is called explicitly to purge cached queries from memory.
- [ ] Verify `npm run build` succeeds.
- [ ] Commit with message: `fix(auth): register global onAuthStateChange listener and clear query cache on sign-out`

---

### Task 4: In-Line Compressed Image Resolver for Cloud Sync & Public Publishing

**Files:**
- Modify: `src/services/imageStorageService.ts:180-220`
- Modify: `src/services/publishService.ts:60-150`

**Execution Steps:**
- [ ] In `src/services/imageStorageService.ts`: Implement `export async function inlineStoredImagesInMarkdown(markdown: string): Promise<string>`.
  - Scans `markdown` for regex `image:\/\/(img_[a-z0-9_]+)`.
  - For each image ID, fetches `dataUrl` from `inMemoryImageCache` or `db.images.get(id)`.
  - Replaces `image://img_xxx` with the corresponding `dataUrl` (or keeps original if missing).
- [ ] In `src/services/publishService.ts`:
  - In `publishDocument(docId, options)`: Before pushing to Supabase `document_contents` or `published_documents`, run `content = await inlineStoredImagesInMarkdown(content);`.
  - In `publishDocumentBundle(docIds, options)`: Resolve and inline all stored images for every bundled document before publishing.
- [ ] Verify `npm run build` compiles with zero errors.
- [ ] Commit with message: `fix(images): inline compressed images on publish to prevent broken cross-device links`

---

### Task 5: End-to-End Build & Security Verification

**Files:**
- Verify: Full workspace compilation and linting

**Execution Steps:**
- [ ] Run `npx tsc -b`.
- [ ] Run `npm run build`.
- [ ] Verify all precached assets, service worker, and bundles build cleanly.
- [ ] Commit with message: `chore: complete p0 security and data integrity verification`
