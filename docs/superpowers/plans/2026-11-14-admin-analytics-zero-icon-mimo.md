# Admin Analytics Zero-Icon Mimo Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the Admin Analytics & Telemetry tab (`ActiveUserDashboard.tsx` and `SmoothMountainChart.tsx`) to match the minimal, premium, zero-icon aesthetic of Mimo Drawer with dual light/dark theme parity and interactive cohort filtering.

**Architecture:** Pure typography and tabular layout without a single decorative or Lucide icon. Interactive spline filtering in `SmoothMountainChart.tsx`, clean ranked feature adoption lists with sequence tags (`01`, `02`), and a filterable monospace real-time telemetry stream.

**Tech Stack:** React 19, TypeScript 5.7, Tailwind CSS v4, Catmull-Rom SVG Bezier curves, Node test runner (`node:test`).

**Spec:** `docs/superpowers/specs/2026-11-14-admin-analytics-zero-icon-mimo.md`

## Global Constraints

- Absolutely zero Lucide icons or decorative SVG icons in `ActiveUserDashboard.tsx` and `SmoothMountainChart.tsx`.
- Never use the em dash character (`—`) anywhere in UI strings, labels, or documentation (R-02).
- Strict adherence to Mimo Drawer design tokens: `bg-white dark:bg-neutral-950`, hairline borders `border-neutral-200/80 dark:border-neutral-800/80`, `font-sans` (`Geist Variable`), and `font-mono tabular-nums` (`Geist Mono Variable`).
- Full dual light/dark theme parity across every card, surface, text label, and progress track.
- Maintain 100% passing test suite (`npm run test`) and zero TypeScript errors (`npx tsc --noEmit`).

## Review Focus

1. Verify that `ActiveUserDashboard.tsx` and `SmoothMountainChart.tsx` import zero icon packages (`lucide-react` or similar).
2. Verify that `SmoothMountainChart` cohort isolation toggles (`ALL`, `NEW`, `RETURNING`, `ACTIVE`) correctly highlight or hide curves without throwing NaN or breaking spline coordinates.
3. Verify that all typography respects `font-sans` for labels/copy and `font-mono tabular-nums` for numbers, percentages, and timestamps.
4. Verify that light mode does not render dark-only surfaces (e.g. replacing hardcoded `bg-neutral-900` or `text-white` with theme-aware classes).
5. Verify that live activity feed filtering operates cleanly across all categories (`ALL`, `EXPORTS`, `AI ASSISTS`, `SESSIONS`).

---

### Task 1: Automated Zero-Icon AST / Source Compliance Test

**Files:**
- Create: `tests/admin/zeroIconAnalytics.test.ts`

**Interfaces:**
- Inspects: `src/components/admin/analytics/ActiveUserDashboard.tsx`, `src/components/admin/analytics/SmoothMountainChart.tsx`
- Assertions: Zero icon imports from `lucide-react`, zero icon element usages (`<Users`, `<PenTool`, etc.)

- [x] **Step 1: Write the failing test for zero-icon compliance**
- [x] **Step 2: Run test to verify it fails on existing files**

---

### Task 2: Redesign `SmoothMountainChart.tsx` (Zero-Icon, Interactive Cohorts, Theme-Aware)

**Files:**
- Modify: `src/components/admin/analytics/SmoothMountainChart.tsx`
- Test: `tests/admin/SmoothMountainChart.test.ts`

**Interfaces:**
- Consumes: `DailyMetricRecord[]`, active cohort filter state (`'all' | 'new' | 'returning' | 'active'`)
- Produces: Theme-aware SVG mountain ridges, interactive cohort isolation buttons, zero-icon Mimo inspection HUD

- [x] **Step 1: Add cohort isolation filter prop and interactive toggle**
- [x] **Step 2: Remove any decorative icon or neon references in SVG defs and tooltip**
- [x] **Step 3: Add light/dark theme grid line and axis styles**
- [x] **Step 4: Verify test suite `npx tsx --test tests/admin/SmoothMountainChart.test.ts` passes**

---

### Task 3: Overhaul `ActiveUserDashboard.tsx` to Pure Zero-Icon Mimo Architecture

**Files:**
- Modify: `src/components/admin/analytics/ActiveUserDashboard.tsx`

**Key Sections:**
1. **Command Dock:** Micro text badge `LIVE SYNC`, clean text range buttons `7D`, `14D`, `30D`, and text refresh action `Refresh` / `Syncing...` (no icons).
2. **Top 4 KPI Metric Cards:** Micro-tracking uppercase labels, bold tabular numbers, cohort deltas, zero icons.
3. **Document Export Ratio:** Clean 3-color progress bar with typographic metric columns (`PDF DOCUMENT`, `WORD .DOCX`, `MARKDOWN .MD`), zero icons.
4. **Mimo AI & Diurnal Schedule:** Typography-driven AI assistance tallies and 4-quadrant diurnal text distribution (`MORNING 06-12`, `AFTERNOON 12-18`, etc.), zero weather icons.
5. **Ranked Feature Adoption:** Numbered sequence indicators (`01`, `02`, `03`), clean monochrome distribution bars, zero colorful square icon boxes.
6. **Filterable Real-Time Stream:** Monospace terminal stream with filter chips (`ALL`, `EXPORTS`, `AI ASSISTS`, `SESSIONS`), exact timestamps, and mono tags (`[EXPORT]`, `[AI]`, `[WRITE]`), zero icons.
7. **Dual-Theme Support:** Every card and background styled with `bg-white dark:bg-neutral-950`, `bg-neutral-50/70 dark:bg-neutral-900/40`, and `border-neutral-200/80 dark:border-neutral-800/80`.

- [x] **Step 1: Remove all `lucide-react` imports from `ActiveUserDashboard.tsx`**
- [x] **Step 2: Implement Zero-Icon Top Command Dock & Filter Bar**
- [x] **Step 3: Implement Zero-Icon Top 4 KPI Metric Cards**
- [x] **Step 4: Implement Zero-Icon Export Ratio & Mimo AI Diurnal Modules**
- [x] **Step 5: Implement Zero-Icon Ranked Feature Adoption List**
- [x] **Step 6: Implement Filterable Terminal Activity Stream**
- [x] **Step 7: Run `tests/admin/zeroIconAnalytics.test.ts` to verify zero icons pass**

---

### Task 4: End-to-End Verification, Production Build, & Git Commit

**Files:**
- Modify: `docs/superpowers/plans/2026-11-14-admin-analytics-zero-icon-mimo.md`

- [x] **Step 1: Run type checking (`npx tsc --noEmit`)**
- [x] **Step 2: Run all unit tests (`npm run test` and `npx tsx --test tests/admin/*.test.ts`)**
- [x] **Step 3: Run production build (`npm run build`)**
- [x] **Step 4: Update knowledge graph (`graphify update .`)**
- [x] **Step 5: Commit and push changes to remote**
