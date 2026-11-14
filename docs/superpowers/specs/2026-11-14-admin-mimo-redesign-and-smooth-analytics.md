# Design Specification: Admin Panel Modern Redesign & Smooth Mountain Analytics

**Date:** 2026-11-14  
**Author:** MD Writer Architecture Team  
**Status:** Approved  
**Approach:** Approach A (Multi-Layered Smooth Spline Mountain Chart + Mimo Drawer Minimalist Redesign + Advanced Content Analytics)

---

## 1. Executive Summary

MD Writer's Admin Suite requires a comprehensive aesthetic and analytical upgrade:
1. **Mathematical Smooth Mountain Chart:** Replacing rigid straight-line SVG segments (`L x y`) with cubic Bezier / Catmull-Rom spline curves that render three overlapping rolling "mountain ridges" (New Users, Returning/Already Users, and Active Writers) with multi-stop vertical gradients.
2. **New Content & Workflow Analytics:** Expanding telemetry to capture export format distributions (PDF vs DOCX vs MD), Mimo AI collaboration velocity (prompts and diffs), writing duration depth, and diurnal activity peak distributions.
3. **Mimo Drawer Aesthetic Standard:** Purging bloated card padding and AI-slop visual artifacts in favor of Mimo Drawer's proven design language: `bg-white dark:bg-neutral-950`, hairline borders (`border-neutral-200/80 dark:border-neutral-800/80`), `font-mono tabular-nums`, and crisp `tracking-tight` typography.

---

## 2. Telemetry & Data Layer Specification

### 2.1 Schema & Interface Enhancements

In `src/services/telemetryService.ts`:
```typescript
export interface DailyMetricRecord {
  date: string; // YYYY-MM-DD
  visitors: number;
  newVisitors: number;
  returningVisitors: number;
  activeWriters: number;
  totalSessionSeconds: number;
  featureUsage: Record<string, number>;
}
```

### 2.2 First-Time vs Returning Visitor Detection

- Telemetry remains **100% privacy-first and anonymous** (zero cookies, zero IP logging).
- Uses a local timestamp token in `localStorage` (`md_writer_visitor_first_seen`):
  - If `md_writer_visitor_first_seen` is absent, the user is classified as a **New Visitor** for today's session, and the key is set.
  - If `md_writer_visitor_first_seen` exists and was set prior to today, the user is classified as a **Returning User** ("Already User").
- Fallback for historical/cloud records without explicit `newVisitors`:
  - `newVisitors = Math.round(visitors * 0.45)`
  - `returningVisitors = Math.max(0, visitors - newVisitors)`

---

## 3. Mathematical Spline Generation (Smooth Mountain Curve)

### 3.1 Catmull-Rom to Cubic Bezier Conversion

Given $N$ coordinate pairs $(x_i, y_i)$:
For each segment between $(x_i, y_i)$ and $(x_{i+1}, y_{i+1})$ with tension parameter $k \approx 0.2$:
- Control Point 1:
  $$cp1_x = x_i + \frac{x_{i+1} - x_{i-1}}{6}$$
  $$cp1_y = y_i + \frac{y_{i+1} - y_{i-1}}{6}$$
- Control Point 2:
  $$cp2_x = x_{i+1} - \frac{x_{i+2} - x_i}{6}$$
  $$cp2_y = y_{i+1} - \frac{y_{i+2} - y_i}{6}$$

The resulting SVG path command is:
`C cp1_x,cp1_y cp2_x,cp2_y x_{i+1},y_{i+1}`

The closed area path connects the last point down to $(x_N, \text{baseline})$ and across to $(x_0, \text{baseline})$ with `Z`.

### 3.2 Visual Ridge Hierarchy

| Series | Stroke Color | Gradient Top Fill | Gradient Bottom Fill | Meaning |
|---|---|---|---|---|
| **New Visitors** | `#38bdf8` (Sky 400) | `rgba(56, 189, 248, 0.28)` | `rgba(56, 189, 248, 0.0)` | Fresh visits / first session |
| **Returning Users** | `#818cf8` (Indigo 400) | `rgba(129, 140, 248, 0.22)` | `rgba(129, 140, 248, 0.0)` | Retained community writers |
| **Active Writers (DAU)** | `#34d399` (Emerald 400) | `rgba(52, 211, 153, 0.35)` | `rgba(52, 211, 153, 0.0)` | Interactive keystrokes & saves |

---

## 4. New Analytics Modules

1. **Format Export Ratio:** Stacked visual breakdown of PDF vs DOCX vs MD downloads, with percentage shares.
2. **Mimo AI Collaboration Velocity:** AI companion interactions, acceptance rate of inline diffs, and query volume.
3. **Focus Session Duration & Velocity:** Total active editing hours, mean session dwell time, and sprint velocity.
4. **Diurnal Activity Spread:** Morning, Afternoon, Evening, and Night usage proportions.

---

## 5. Mimo Drawer Aesthetic Standard

- **Surface Tokens:**
  - Background: `bg-neutral-950` (or `bg-white` in light mode).
  - Cards: `bg-neutral-900/60` with `border border-neutral-800/80` and `rounded-2xl`.
  - Headers & Tabs: `px-4 py-2.5`, `border-b border-neutral-800/80`, `tracking-tight`.
- **Typography & Data:**
  - Numbers: `font-mono tabular-nums`.
  - Labels: `text-[11px] font-medium text-neutral-400`.
  - Badges: `text-[10px] font-semibold px-2 py-0.5 rounded-md border border-neutral-800 bg-neutral-900`.
- **Zero AI-Slop Enforcement:**
  - No em dashes (`—`).
  - No decorative glow orbs (`blur-3xl`, `bg-*-500/10` blobs).
  - No generic marketing buzzwords (`Supercharge`, `Next-gen`, `Cutting-edge`).
