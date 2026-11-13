# Production UI Architect & Anti-AI Slop Skill Repository

> **Autonomous Production-Grade Frontend Architect & Anti-AI Slop System** for coding agents (Antigravity, Cursor, Claude Code, Codex).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Standards: 2025-2026](https://img.shields.io/badge/Standards-2025--2026-emerald.svg)]()
[![WCAG: AA 4.5:1](https://img.shields.io/badge/WCAG-AA%204.5%3A1-success.svg)]()

---

## Why This Exists

Most AI coding agents produce recognizable **"AI Slop"**:
- Purple/blue multi-stop text gradients
- Frosted glassmorphism cards with heavy drop-shadows
- Lucide icons inside colored rounded squares above every feature
- Identical 3-column bento grids and centered stacked heroes
- Fake statistics (`+124%`) and marketing hype ("Supercharge your workflow")

Existing anti-slop tools either stay trapped in **negative constraints** ("don't do X" without positive replacements) or rely on **vague adjectives** ("minimalist", "breathing room") that fail in dense, interactive dashboards.

**Production UI Architect** replaces vibes and negative bans with **mathematical design systems, physical spring dynamics, 35 psychological UX laws, and 6 battle-tested modern layout blueprints**.

---

## Repository Architecture

```
├── SKILL.md                          <-- Core Orchestration Engine & Execution Protocol
├── README.md                         <-- Overview & usage documentation
├── AGENTS.md                         <-- AGY & Codex entry point
├── CLAUDE.md                         <-- Claude Code entry point
├── .cursorrules                      <-- Cursor IDE root configuration
├── .cursor/
│   └── rules/
│       └── production-ui.mdc         <-- Cursor MDC rule format
├── references/
│   ├── banned-replacements-matrix.md <-- Scannable BANNED ➔ MANDATORY REPLACEMENT table
│   ├── design-system-math.md         <-- 60-30-10 palette, luminance stepping, 8pt grid, radius math
│   ├── ux-laws-handbook.md           <-- All 35 UI/UX Laws with React 19/Tailwind v4 code
│   ├── layouts-2026.md               <-- 6 Modern Hero & Homepage Layout Blueprints
│   ├── motion-physics.md             <-- Physical springs, duration caps, and choreography
│   └── tech-stack-advisor.md         <-- Domain stack matrix & user package diagnostics
└── scripts/
    └── verify-ui.mjs                 <-- Automated CLI scanner & WCAG contrast checker
```

---

## The 6 Modern 2025–2026 Layout Blueprints

Full copy-pasteable TSX implementations in [`references/layouts-2026.md`](references/layouts-2026.md):
1. **The "Exposed Hairline" Architectural Grid:** Continuous 1px outer lines (`border-x border-white/[0.07]`) with corner `+` crosshairs.
2. **The "Zero-Marketing" Live Sandbox Hero:** 30% crisp header + 70% live interactive micro-workspace (markdown/code playground).
3. **Asymmetric 7:5 Swiss Editorial Split:** 7-column giant editorial heading + 5-column bottom-aligned dense subcopy with tabular metrics.
4. **The "Single-Workflow Zoom" Cropped Bleed Hero:** 1.25x magnified single active UI component nicely cropped at boundaries.
5. **Seamless Cell Matrix (Anti-Bento Grid):** Flush cells divided by `gap-px bg-white/[0.07]` with subtle hover luminance shift.
6. **Sticky "Index & Spec Sheet" Homepage Layout:** 3-column sticky numbered navigation index + 9-column technical datasheet.

---

## Mathematical Design System Rules

Detailed formulas in [`references/design-system-math.md`](references/design-system-math.md):
- **The 60-30-10 Law:** 60% neutral canvas (`#09090B`), 30% structural surfaces (`#111113` + `border-white/[0.07]`), 10% high-contrast accent.
- **Luminance Stepping:** Canvas `#09090B` -> Card `#111113` -> Elevated `#18181B` -> Top specular highlight `shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]`.
- **The 8pt Spatial Grid:** Strict multiples of 8px (`8px`, `16px`, `24px`, `32px`, `48px`, `64px`, `96px`).
- **The Nested Radius Formula:** $\mathbf{R_{\text{outer}} = R_{\text{inner}} + \text{Padding}}$. Eliminates pinched corner radii.
- **Optical Typography:** Size-based tracking (`tracking-[-0.035em]` for display, `tracking-normal` for body) + mandatory `tabular-nums`.

---

## Automated Verification CLI

Verify your project against AI slop patterns and test color contrast:

```bash
# Scan directory for AI slop anti-patterns
node scripts/verify-ui.mjs src/components

# Verify WCAG AA contrast ratio between two hex colors
node scripts/verify-ui.mjs --contrast "#09090B" "#E4E4E7"
```

---

## License

MIT License. Crafted for high-taste frontend developers and autonomous coding agents.
