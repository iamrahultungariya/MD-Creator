# Mathematical Design System & Token Synthesizer Playbook

> **Strict Architectural Principle:** High-taste frontend design is not subjective vibe; it is **mathematical consistency**. This document establishes the exact algorithmic formulas for color distribution, dark mode luminance stepping, optical typography, spatial geometry, and nested border radii.

---

## 1. Color System Architecture (The 60-30-10 Law)

Every production interface must distribute color mass using the **60-30-10 ratio**:

```
┌─────────────────────────────────────────────────────────────┐
│ 60% NEUTRAL CANVAS                                          │
│ Base backdrop & negative space                              │
│ Dark: #09090B | Light: #FAF8F5 or #FFFFFF                   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ 30% STRUCTURAL SURFACES & CONTAINERS                │   │
│   │ Cards, split-panes, dividers, table headers         │   │
│   │ Dark: #111113 + border-white/[0.07]                 │   │
│   │ Light: #FFFFFF + border-zinc-900/[0.08]             │   │
│   │                                                     │   │
│   │   ┌─────────────────────────────────────────────┐   │   │
│   │   │ 10% HIGH-CONTRAST ACCENT (FOCAL POINT)      │   │   │
│   │   │ Primary CTA button, active status dot, link │   │   │
│   │   │ Emerald / Amber / Blue / Monochrome Inverted│   │   │
│   │   └─────────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### A. Dark Mode Luminance Stepping
Ban Tailwind's default `slate` (`#0f172a`) and `gray` (`#111827`) dark modes. They introduce muddy blue-gray tinting. Use **neutral zinc luminance stepping**:

| Elevation Layer | Hex Value | Tailwind v4 Token | Purpose |
| :--- | :--- | :--- | :--- |
| **Layer 0: Canvas** | `#09090B` | `bg-[#09090B]` | Ground canvas, root background |
| **Layer 1: Structural Surface** | `#111113` | `bg-[#111113]` | Cards, table bodies, toolbars |
| **Layer 2: Elevated Surface** | `#18181B` | `bg-[#18181B]` | Modals, popovers, dropdown menus |
| **Layer 3: Interactive / Hover** | `#222226` | `hover:bg-[#222226]` | Button hover, list item selected |
| **Hairline Structural Border** | `rgba(255,255,255,0.07)` | `border-white/[0.07]` | Crisp 1px container boundary |
| **Top Specular Highlight** | `rgba(255,255,255,0.06)` | `shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]` | Simulated physical overhead light |

### B. Light Mode Stepping (Warm Swiss vs. Clean Modern)
- **Palette A (Warm Paper / Swiss Editorial):**
  - Canvas: `#FAF8F5`
  - Surface: `#FFFFFF`
  - Text: `#141413`
  - Border: `rgba(20,20,19,0.08)` (`border-[#141413]/[0.08]`)
- **Palette B (Crisp Modern):**
  - Canvas: `#F9FAFB`
  - Surface: `#FFFFFF`
  - Text: `#09090B`
  - Border: `rgba(9,9,11,0.08)` (`border-zinc-900/[0.08]`)

### C. Accent Color Tint & Shade Generation
When choosing an accent color, construct a 4-tier semantic family:
1. **Base Interactive (100%):** e.g., Emerald `#10B981` (`bg-emerald-500 text-white`)
2. **Subtle Surface (8–10%):** `bg-emerald-500/10` (pill badges, active tab background)
3. **Muted Border (20%):** `border-emerald-500/20` (subtle emphasis indicator)
4. **Readable Text (Accessible):** Dark mode: `text-emerald-400` (meets 4.5:1 contrast against `#09090B`)

---

## 2. Spatial Geometry & The 8pt Rhythm

All margins, paddings, and heights must strictly derive from multiples of **8px**. Half-step **4px** is reserved solely for micro badges, chips, and tight input padding.

```
4px   (0.5) ➔ Micro badges, status pills, inner icon gaps (`p-1`, `gap-1`)
8px   (1.0) ➔ Compact button padding, list item gaps (`p-2`, `gap-2`)
16px  (2.0) ➔ Default card padding, component grid gap (`p-4`, `gap-4`)
24px  (3.0) ➔ Spacious container padding (`p-6`, `gap-6`)
32px  (4.0) ➔ Large section dividers, modal padding (`p-8`, `gap-8`)
48px  (6.0) ➔ Section vertical padding on mobile (`py-12`)
64px  (8.0) ➔ Standard section vertical padding on desktop (`py-16`)
96px  (12.0)➔ Hero breathing room and major structural dividers (`py-24`)
```

### The Nested Border Radius Law ($R_{\text{outer}} = R_{\text{inner}} + \text{Padding}$)
When elements are nested inside each other, **identical border radii look broken and misaligned**. To maintain concentric curvature:

$$\mathbf{R_{\text{outer}} = R_{\text{inner}} + \text{Padding}}$$

```
WRONG (Uniform radii):
┌─────────────────────────┐  Outer radius: 12px
│   ┌─────────────────┐   │  Padding: 8px
│   │                 │   │  Inner radius: 12px  ❌ (Corners clash and pinch)
│   └─────────────────┘   │
└─────────────────────────┘

CORRECT (Concentric radii):
┌─────────────────────────┐  Outer radius: 16px (8px + 8px)
│   ┌─────────────────┐   │  Padding: 8px
│   │                 │   │  Inner radius: 8px   ✅ (Perfect optical concentricity)
│   └─────────────────┘   │
└─────────────────────────┘
```

#### Tailwind v4 Implementation Table:
| Inner Component Radius | Container Padding | Required Outer Container Radius |
| :--- | :--- | :--- |
| `rounded-sm` (4px) | `p-1` (4px) | `rounded-md` (8px) |
| `rounded-md` (6px) | `p-2` (8px) | `rounded-xl` (14px or 16px) |
| `rounded-lg` (8px) | `p-3` (12px) | `rounded-2xl` (20px) |
| `rounded-lg` (8px) | `p-4` (16px) | `rounded-3xl` (24px) |

---

## 3. Optical & Typographic Math

### A. Size-Based Letter Spacing (Tracking) & Line Height Formula
Large text spreads out optically; small text clumps together. Never apply uniform tracking across all font sizes.

```
Display (> 32px)    ➔ tracking-[-0.03em] to tracking-[-0.04em] | leading-[1.05-1.1]
Subheading (18-24px)➔ tracking-[-0.015em]                      | leading-[1.25-1.3]
Body (14-16px)      ➔ tracking-normal                          | leading-[1.5-1.6]
Micro Label (11-12px)➔ tracking-[0.06em] font-mono uppercase   | leading-none
```

#### Exact Tailwind v4 Typography Spec:
```tsx
// 1. Display H1
<h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.035em] leading-[1.08] text-zinc-100">
  Continuous delivery for local-first systems.
</h1>

// 2. Section Subheading
<h2 className="text-xl sm:text-2xl font-medium tracking-[-0.015em] leading-[1.25] text-zinc-200">
  Sub-millisecond query execution.
</h2>

// 3. Body Copy (Optimal 60-70 character width)
<p className="text-sm sm:text-base text-zinc-400 leading-[1.6] tracking-normal max-w-[65ch]">
  Engineered with write-ahead log persistence and zero lock contention across concurrent edge processes.
</p>

// 4. Micro Metadata / Metric Label
<span className="font-mono text-[11px] uppercase tracking-[0.06em] text-zinc-500">
  MEM_USAGE_P99
</span>
```

### B. Tabular Numerals Mandate (`tabular-nums`)
All numbers, percentages, pricing columns, timers, and metric counters **MUST** use `font-variant-numeric: tabular-nums` (Tailwind class: `tabular-nums`). Without tabular numbers, values jitter and misalign on updates.

```tsx
// Correct Metric Counter
<span className="font-mono text-xl text-zinc-100 tabular-nums">
  99.98<span className="text-xs text-zinc-500">%</span>
</span>
```

### C. Optical Alignment vs. Geometric Centering
- **Play Buttons / Triangles:** The visual weight of a play triangle is skewed to the left. Shift the SVG icon `1px` to `2px` right (`translate-x-[1.5px]`) so it appears optically centered inside a circle.
- **Icon + Label Alignment:** Align icon to the **cap-height** of the text, not the flex bounding box:
  ```tsx
  <div className="flex items-center gap-2">
    <CheckIcon className="size-4 text-emerald-400 shrink-0 translate-y-[-0.5px]" />
    <span className="text-sm text-zinc-200">Zero connection pooling overhead</span>
  </div>
  ```
