# Design Spec: Zero-Icon Mimo Modern Redesign for Admin Analytics & Telemetry

**Date:** 2026-11-14  
**Author:** Antigravity Architect  
**Status:** In Review  
**Target:** `src/components/admin/analytics/ActiveUserDashboard.tsx` & `src/components/admin/analytics/SmoothMountainChart.tsx`

---

## 1. Problem Statement & User Direction

The user requested an overhaul of the **Analytics & Telemetry** dashboard:
> *"mimo type but not icon used in entire page and sections"*

### Core Imperatives
1. **Zero Icons Policy:** No Lucide or decorative icon components anywhere in the entire tab (no `Users`, `PenTool`, `Clock`, `Zap`, `DownloadCloud`, `Sparkles`, `Layers`, `Activity`, `Sun`, `Moon`, `RefreshCw`, or colored icon boxes).
2. **Typography as Architecture:** Replace every visual crutch with intentional typography hierarchy, micro-tracking labels, monospace tabular data, rank numbers (`01`, `02`, `03`), and crisp hairline borders.
3. **Mimo Drawer Aesthetics:** Match Mimo Drawer's exact design language: `bg-white dark:bg-neutral-950`, hairline borders `border-neutral-200/80 dark:border-neutral-800/80`, `font-sans` (`Geist Variable`) for prose and navigation, and `font-mono tabular-nums` (`Geist Mono Variable`) for metrics, timestamps, and tags.
4. **Light & Dark Theme Parity:** Full dual-theme fidelity across both light mode and dark mode.
5. **No Em Dashes:** Strict compliance with Rule R-02 (zero `—` characters).

---

## 2. Component Architecture & Visual Specifications

### 2.1 Top Command Dock & Filter Bar
- **Title Block:** `Analytics & Telemetry` in `font-sans text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100`.
- **Live Status Chip:** Micro text badge `[LIVE]` or `LIVE SYNC` in `font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 rounded-md`. Zero icon dots.
- **Time Window Switcher:** Monospace pill buttons `7D`, `14D`, `30D` in `font-mono text-xs font-semibold px-3 py-1 rounded-lg`. Active button uses `bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950`.
- **Refresh Action:** Clean textual button `Refresh` / `Syncing...` in `font-mono text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white px-2.5 py-1 rounded-lg border border-neutral-200/80 dark:border-neutral-800/80`.

### 2.2 Top 4 KPI Metric Cards (Zero Icons)
Each card uses `p-4 rounded-xl bg-neutral-50/70 dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800/80`:
- **Card 1 (Total Visitors):**
  - Label: `TOTAL AUDIENCE` in `font-mono text-[10px] tracking-wider text-neutral-500 uppercase`.
  - Metric: `todayRecord.visitors` in `font-mono text-2xl font-bold tracking-tight tabular-nums text-neutral-900 dark:text-neutral-100`.
  - Delta/Split: `NEW: X • RETURNING: Y` in `font-mono text-[11px] text-neutral-600 dark:text-neutral-400`.
- **Card 2 (Active Writers DAU):**
  - Label: `ACTIVE WRITERS (DAU)` in `font-mono text-[10px] tracking-wider text-neutral-500 uppercase`.
  - Metric: `todayRecord.activeWriters` in `font-mono text-2xl font-bold tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400`.
  - Conversion: `X% session conversion rate` in `font-mono text-[11px] text-neutral-600 dark:text-neutral-400`.
- **Card 3 (Focused Writing Dwell):**
  - Label: `AVG WRITING DWELL` in `font-mono text-[10px] tracking-wider text-neutral-500 uppercase`.
  - Metric: `formatSeconds(avgPeriodSessionSeconds)` in `font-mono text-2xl font-bold tracking-tight tabular-nums text-neutral-900 dark:text-neutral-100`.
  - Subtext: `Total logged: X mins` in `font-mono text-[11px] text-neutral-600 dark:text-neutral-400`.
- **Card 4 (Top Feature Adoption):**
  - Label: `LEAD CAPABILITY` in `font-mono text-[10px] tracking-wider text-neutral-500 uppercase`.
  - Metric: `topFeature.name` in `font-sans text-base font-bold text-neutral-900 dark:text-neutral-100 truncate`.
  - Percentage: `X% of all actions (N uses)` in `font-mono text-[11px] text-neutral-600 dark:text-neutral-400`.

### 2.3 Interactive Smooth Mountain Spline (`SmoothMountainChart.tsx`)
- **Header & Cohort Filters:**
  - Title: `AUDIENCE VELOCITY & RETENTION SPLINE` in `font-mono text-xs uppercase tracking-wider text-neutral-500`.
  - Clickable Cohort Buttons: `ALL`, `NEW VISITORS`, `RETURNING`, `ACTIVE WRITERS`.
  - Clicking a cohort isolates or highlights that specific ridge in the SVG spline.
- **SVG Mountains:**
  - High-precision Catmull-Rom cubic Bezier curves (`generateSmoothSplinePath`).
  - Subtle translucent fills:
    - Sky (`#38bdf8`) for New Visitors.
    - Indigo (`#818cf8`) for Returning Users.
    - Emerald (`#34d399`) for Active Writers.
  - Baseline and horizontal ticks rendered in theme-aware subtle grays (`#e5e5e5` light / `#262626` dark).
- **Inspection Tooltip HUD (Zero Icons):**
  - Tooltip card styled like Mimo Drawer HUD (`bg-white/95 dark:bg-neutral-950/95 border border-neutral-200 dark:border-neutral-800 shadow-xl`).
  - Date header in `font-mono text-xs font-semibold`.
  - Clean 3-row tabular metrics:
    - `NEW VISITORS: [count]`
    - `RETURNING USERS: [count]`
    - `ACTIVE WRITERS: [count]`

### 2.4 Document Export Distribution Module (Zero Icons)
- **Header:** `DOCUMENT EXPORT RATIO` with total download count in `font-mono text-xs`.
- **3-Color Stacked Ratio Bar:** Clean progress bar segmenting PDF (Rose), Word (Blue), and Markdown (Emerald).
- **Format Metrics (3 Columns):**
  - Column 1: `PDF DOCUMENT` | count & percentage in `font-mono tabular-nums`.
  - Column 2: `WORD .DOCX` | count & percentage in `font-mono tabular-nums`.
  - Column 3: `MARKDOWN .MD` | count & percentage in `font-mono tabular-nums`.
  - Zero icons used.

### 2.5 Mimo AI Assists & Diurnal Activity Module (Zero Icons)
- **Header:** `MIMO AI ASSISTS & DIURNAL SPREAD` with total assists badge.
- **AI Metrics (2 Columns):**
  - Box 1: `AI CHAT QUERIES` in `font-mono text-base font-bold text-neutral-900 dark:text-neutral-100`.
  - Box 2: `SLASH COMMAND INSERTS` in `font-mono text-base font-bold text-neutral-900 dark:text-neutral-100`.
- **Diurnal Time Spread (4 Columns):**
  - `MORNING (06-12)` | percentage in `font-mono`.
  - `AFTERNOON (12-18)` | percentage in `font-mono`.
  - `EVENING (18-24)` | percentage in `font-mono`.
  - `NIGHT (00-06)` | percentage in `font-mono`.
  - Pure typographic labels; zero weather or sun/moon icons.

### 2.6 Feature Utilization Ranking (Zero Icons)
- **Header:** `FEATURE UTILIZATION RANKING` with `font-mono` total actions.
- **Ranked Telemetry List:**
  - Rank Badge: `01`, `02`, `03` in `font-mono text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 w-6`.
  - Feature Name: `font-sans text-xs font-medium text-neutral-900 dark:text-neutral-200`.
  - Distribution Bar: Clean horizontal track `h-1 rounded-full bg-neutral-200 dark:bg-neutral-800` with solid fill `bg-neutral-900 dark:bg-neutral-100`.
  - Usage Stats: `[count] uses • [percentage]%` in `font-mono tabular-nums text-[11px] text-neutral-600 dark:text-neutral-400`.
  - Zero colored icon container squares.

### 2.7 Filterable Real-Time Telemetry Stream (Zero Icons)
- **Header:** `LIVE TELEMETRY STREAM` with active count.
- **Filter Tabs:** Monospace chips `ALL`, `EXPORTS`, `AI ASSISTS`, `SESSIONS`.
- **Feed List:**
  - Timestamp in `font-mono text-[10px] text-neutral-400`.
  - Category Tag: `[EXPORT]`, `[AI]`, `[WRITE]`, `[SYSTEM]` in `font-mono text-[9px] uppercase px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400`.
  - Event Message: Clean `font-sans text-xs font-medium text-neutral-800 dark:text-neutral-200`.
  - Zero icons.

---

## 3. Testing & Verification Plan

1. **Automated Zero-Icon AST Audit:**
   - Write a unit test `tests/admin/zeroIconAnalytics.test.ts` that inspects `ActiveUserDashboard.tsx` and `SmoothMountainChart.tsx` to verify zero Lucide or SVG icon imports.
2. **Chart Spline Math Stability:**
   - Retain 100% pass on `tests/admin/SmoothMountainChart.test.ts` (smooth cubic Bezier without NaN or overshoots).
3. **Cohort Isolation Filter Test:**
   - Test that toggling cohort filters updates spline visibility without throwing errors.
4. **Theme Parity Check:**
   - Verify every card and text element possesses both light mode and dark mode utility classes.
5. **Full Suite & Production Build:**
   - `npm run test` (all 54+ tests pass).
   - `npm run build` (`tsc -b && vite build`) succeeds with zero errors.
