# Admin Panel Mimo Redesign & Smooth Mountain Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the MD Writer Admin Suite with a mathematical smooth mountain spline chart (New, Returning, and Active users), high-value workflow analytics (exports ratio, Mimo AI velocity), and the minimalist, premium aesthetic of Mimo Drawer.

**Architecture:** Component-driven refactoring in React 19 + TypeScript + Tailwind CSS v4, introducing an isolated SVG Bezier spline generator (`SmoothMountainChart.tsx`) and privacy-preserving visitor cohort tracking in `telemetryService.ts`.

**Tech Stack:** React 19, TypeScript 5.7, Tailwind CSS v4, SVG Cubic Splines, Lucide React, Vitest/Node test runner.

**Spec:** `docs/superpowers/specs/2026-11-14-admin-mimo-redesign-and-smooth-analytics.md`

## Global Constraints

- Never use em dash character (`—`) in UI copy or labels (R-02).
- Zero decorative glow orbs, blur-3xl backdrops, or unjustified accent effects (antislop Part 1).
- Strict adherence to Mimo Drawer design tokens: `bg-white dark:bg-neutral-950`, hairline borders `border-neutral-200/80 dark:border-neutral-800/80`, and `font-mono tabular-nums`.
- Telemetry must remain 100% anonymous (no IP logging, no cookies, no PII).
- Maintain 100% passing test suite (`npm run test`) and zero TypeScript errors (`npx tsc --noEmit`).

## Review Focus

1. Verify that `SmoothMountainChart` handles empty or single-point datasets without NaN coordinates or broken paths.
2. Verify that Bezier control point calculations do not overshoot negative Y boundaries or clip below SVG viewport.
3. Verify that anonymous first-time visitor detection works offline and survives localStorage quotas.
4. Verify that legacy/cloud analytics data without `newVisitors` gracefully calculates fallback cohort estimates.
5. Verify that all components render with high information density, sleek typography, and zero visual slop.

---

### Task 1: Telemetry Data Model Expansion for User Cohorts

**Files:**
- Modify: `src/services/telemetryService.ts`
- Create: `tests/admin/telemetryCohorts.test.ts`

**Interfaces:**
- Consumes: `DailyMetricRecord`, `localStorage`
- Produces: `DailyMetricRecord.newVisitors`, `DailyMetricRecord.returningVisitors`

- [x] **Step 1: Write the failing test for cohort classification**

```typescript
// tests/admin/telemetryCohorts.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { telemetryService, DailyMetricRecord } from '../../src/services/telemetryService';

test('telemetry cohorts: separates new and returning visitors', () => {
  const metrics = telemetryService.getDailyMetrics(7);
  assert.equal(metrics.length, 7);
  for (const day of metrics) {
    assert.ok(typeof day.newVisitors === 'number', 'newVisitors should be a number');
    assert.ok(typeof day.returningVisitors === 'number', 'returningVisitors should be a number');
    assert.ok(day.newVisitors + day.returningVisitors >= day.visitors || day.visitors === 0);
  }
});
```

- [x] **Step 2: Run test to verify it fails**
  Run: `npx tsx --test tests/admin/telemetryCohorts.test.ts`
  Expected: FAIL with missing properties or undefined.

- [x] **Step 3: Update `DailyMetricRecord` and implement anonymous cohort tracking in `telemetryService.ts`**
  - Add `newVisitors: number` and `returningVisitors: number` to `DailyMetricRecord`.
  - In `initSession()`, check `localStorage.getItem('md_writer_visitor_first_seen')`. If absent, mark `isNew = true` and set current date.
  - Increment `today.newVisitors` if new, else `today.returningVisitors`.
  - In `getDailyMetrics()` and `fetchCloudDailyMetrics()`, provide fallback math when properties are undefined.

- [x] **Step 4: Run test to verify it passes**
  Run: `npx tsx --test tests/admin/telemetryCohorts.test.ts`
  Expected: PASS

- [x] **Step 5: Commit Task 1**
  ```bash
  git add src/services/telemetryService.ts tests/admin/telemetryCohorts.test.ts
  git commit -m "feat(telemetry): add anonymous new vs returning visitor cohort tracking"
  ```

---

### Task 2: Smooth Mountain Spline SVG Generator (`SmoothMountainChart`)

**Files:**
- Create: `src/components/admin/analytics/SmoothMountainChart.tsx`
- Create: `tests/admin/SmoothMountainChart.test.ts`

**Interfaces:**
- Consumes: `data: DailyMetricRecord[]`, `height?: number`, `width?: number`
- Produces: `<SmoothMountainChart />` with 3 mountain layers and hover tooltip

- [x] **Step 1: Write unit test for Bezier spline path generator**

```typescript
// tests/admin/SmoothMountainChart.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSmoothSplinePath } from '../../src/components/admin/analytics/SmoothMountainChart';

test('generateSmoothSplinePath: generates smooth cubic bezier commands without NaN', () => {
  const points = [{ x: 0, y: 100 }, { x: 50, y: 40 }, { x: 100, y: 80 }, { x: 150, y: 20 }];
  const { linePath, areaPath } = generateSmoothSplinePath(points, 180);
  assert.ok(linePath.startsWith('M 0,100 C'));
  assert.ok(!linePath.includes('NaN'));
  assert.ok(areaPath.endsWith('Z'));
});
```

- [x] **Step 2: Run test to verify it fails**
  Run: `npx tsx --test tests/admin/SmoothMountainChart.test.ts`
  Expected: FAIL with module not found.

- [x] **Step 3: Implement `SmoothMountainChart.tsx`**
  - Export `generateSmoothSplinePath(points, baselineY)` implementing Catmull-Rom cubic Bezier spline math.
  - Render 3 overlapping area layers:
    1. New Visitors (Sky 400 gradient)
    2. Returning Users (Indigo 400 gradient)
    3. Active Writers (Emerald 400 gradient)
  - Render subtle horizontal gridlines and month/day labels.
  - Render interactive hover crosshair and sleek Mimo-style floating badge with tabular data.

- [x] **Step 4: Run test to verify it passes**
  Run: `npx tsx --test tests/admin/SmoothMountainChart.test.ts`
  Expected: PASS

- [x] **Step 5: Commit Task 2**
  ```bash
  git add src/components/admin/analytics/SmoothMountainChart.tsx tests/admin/SmoothMountainChart.test.ts
  git commit -m "feat(admin): implement smooth mountain bezier spline telemetry chart"
  ```

---

### Task 3: High-Value Analytics Panels in `ActiveUserDashboard`

**Files:**
- Modify: `src/components/admin/analytics/ActiveUserDashboard.tsx`

**Interfaces:**
- Consumes: `telemetryService`, `<SmoothMountainChart />`
- Produces: Integrated dashboard with format export breakdown, Mimo AI metrics, writing dwell velocity, and peak diurnal activity

- [x] **Step 1: Embed `<SmoothMountainChart />` and cohort KPI stats**
  - Replace legacy straight-line SVG with `<SmoothMountainChart data={dailyMetrics} />`.
  - Add summary pills for New Visitors, Returning Users, and Active Writers.

- [x] **Step 2: Add New Analytics Sections**
  - **Export Format Ratio:** Stacked progress bar displaying PDF vs DOCX vs MD source downloads.
  - **Mimo AI Collaboration Velocity:** AI companion assists count, inline diff acceptance rate, and prompt volume.
  - **Writing Depth & Focus Velocity:** Total hours spent drafting and average dwell time per active writer.
  - **Diurnal Activity Heatmap:** Morning (06-12), Afternoon (12-18), Evening (18-24), Night (00-06) activity distribution.

- [x] **Step 3: Verify TypeScript compilation**
  Run: `npx tsc --noEmit`
  Expected: PASS with 0 errors.

- [x] **Step 4: Commit Task 3**
  ```bash
  git add src/components/admin/analytics/ActiveUserDashboard.tsx
  git commit -m "feat(admin): add export ratio, mimo ai velocity, and diurnal telemetry analytics"
  ```

---

### Task 4: Mimo Drawer Aesthetic Overhaul across Admin Suite

**Files:**
- Modify: `src/components/admin/AdminHeader.tsx`
- Modify: `src/components/admin/AdminStatsCards.tsx`
- Modify: `src/components/admin/AdminOverviewTab.tsx`
- Modify: `src/pages/AdminPage.tsx`

**Interfaces:**
- Consumes: Admin components
- Produces: Harmonious Mimo Drawer aesthetic (`bg-neutral-950`, `border-neutral-800/80`, `rounded-2xl`, tabular-nums, zero glow orbs)

- [x] **Step 1: Refactor `AdminHeader.tsx` to Mimo Drawer header standard**
  - Clean border-b divider `border-neutral-800/80`.
  - Tab pills with muted active state (`bg-neutral-800 text-white font-semibold text-xs rounded-xl`).
  - Refresh button and live status badge with micro-dot indicator (`w-2 h-2 rounded-full bg-emerald-400`).

- [x] **Step 2: Refactor `AdminStatsCards.tsx` & `AdminOverviewTab.tsx`**
  - Modernize KPI cards to Mimo activity card aesthetic: flat `bg-neutral-900/60`, hairline `border-neutral-800/80`, `rounded-2xl`, tabular-nums.
  - Clean overview activity queues with subtle hover borders.

- [x] **Step 3: Refactor container styling in `AdminPage.tsx`**
  - Ensure background and typography align with Mimo Drawer dark aesthetic.

- [x] **Step 4: Verify TypeScript compilation**
  Run: `npx tsc --noEmit`
  Expected: PASS with 0 errors.

- [x] **Step 5: Commit Task 4**
  ```bash
  git add src/components/admin/AdminHeader.tsx src/components/admin/AdminStatsCards.tsx src/components/admin/AdminOverviewTab.tsx src/pages/AdminPage.tsx
  git commit -m "style(admin): apply mimo drawer minimal modern aesthetic across admin dashboard"
  ```

---

### Task 5: End-to-End Verification, Production Build, & Git Sync

**Files:**
- Modify: `docs/superpowers/plans/2026-11-14-admin-mimo-redesign-and-smooth-analytics.md`

- [x] **Step 1: Run complete automated test suite**
  Run: `npm run test`
  Expected: All tests PASS with 0 failures.

- [x] **Step 2: Run full production build**
  Run: `npm run build`
  Expected: PASS with 0 errors, PWA service worker and precache generated.

- [x] **Step 3: Update knowledge graph**
  Run: `graphify update .`
  Expected: Graph updated with new symbols and nodes.

- [x] **Step 4: Commit and push changes**
  ```bash
  git push origin main
  ```
