# Production UI Architect & Anti-AI Slop Design Document

**Date:** 2026-11-13  
**Status:** In Review / Design Proposal  
**Topic:** Autonomous Production-Grade Frontend Architect & Anti-AI Slop Skill Repository  

---

## 1. Intent & The "Why"

Current frontend coding agents often produce recognizable, low-effort "AI slop": generic blue-purple gradients, floating glassmorphism cards with rounded-3xl corners, unmotivated Lucide icons in colored circles, fake marketing statistics (`+124%`), and identical 3-column bento grids.

Existing solutions like `miqdadbadjuber/anti-slop` provide extensive negative constraints ("don't do X") but lack deterministic, copy-pasteable code replacements and JSX/Tailwind mathematical tokens. Meanwhile, `Leonxlnx/taste-skill` relies on subjective adjectives ("good taste", "minimalism") and focuses heavily on static marketing heroes, failing when applied to dense, interactive production dashboards, split panes, and living design systems.

**The Purpose of this Project:**  
To build an end-to-end, autonomous **Production UI Architect & Anti-Slop Skill Repository** that transforms any coding agent into a Principal Design Systems Architect and Senior Frontend Engineer. It replaces subjective vibes and negative bans with:
1. Mathematical tokens and design system synthesis (60-30-10, luminance stepping, 8pt grid, optical typography).
2. Category and domain intelligence (SaaS, DevTool, FinTech, E-commerce, Editorial, Local Business).
3. Tech stack auditing and modern standard recommendations (React 19, Next.js 15, Tailwind v4, Astro, etc.).
4. Strict enforcement of **35 essential UI/UX Laws** (Fitts's, Hick's, Miller's, WCAG AA 4.5:1, 44px targets, 4-state coverage, Doherty threshold, etc.).
5. Purpose-driven motion physics (springs, duration caps, no gimmick animations).
6. 6 battle-tested 2025–2026 layout blueprints (Architectural Grid, Live Sandbox Hero, 7:5 Swiss Editorial, Cropped Bleed, Seamless Cell Matrix, Sticky Index & Spec Sheet).

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
- **Autonomous Design System Synthesis:** Given a site description or category, calculate the exact semantic palette (primary, secondary, accent, surface luminance steps `#09090B` -> `#111113` -> `#18181B`), spacing scale, and optical typography math.
- **Strict UI/UX Laws Enforcement:** Directly encode 35 established psychological and visual UX laws into executable JSX/Tailwind patterns and verification checks.
- **Production-Ready Layout Library:** Provide full, copy-pasteable React 19 / Tailwind v4 implementations of 6 modern 2026 layouts.
- **Tech Stack Intelligence:** Automatically detect existing tooling, identify missing primitives, or suggest optimal modern stacks when none is specified.
- **Deterministic Banned -> Replacement Matrix:** Every prohibited AI pattern must have an exact, code-level replacement.
- **Universal Multi-Agent Compatibility:** Seamlessly function across Antigravity, Cursor (`.cursorrules` / `.cursor/rules`), Claude Code (`CLAUDE.md`), and Codex (`AGENTS.md`).

### Non-Goals
- Building a standalone npm library or runtime component library (this is an agent skill repository, not another Radix UI or shadcn/ui clone).
- Supporting legacy frameworks (e.g., jQuery, Bootstrap, React 16 class components). The target is modern production standards (React 18/19, Tailwind v3/v4, Next.js 14/15, Astro 4/5, modern CSS).

### Anti-Goals (What would make this a failure)
- Creating a skill full of vague adjectives ("make it clean", "give it breathing room") without exact tokens or CSS utilities.
- Forcing a generic dark-mode "clone of Linear" onto every project regardless of the client's actual industry (e.g., forcing dark neon cyberpunk onto an artisan bakery).
- Leaving the agent in a negative constraint trap where it knows what NOT to write, but invents new forms of slop because it lacks positive replacement blueprints.

---

## 3. Constraints

- **Platform Agnostic:** Must run purely through agent context loading (markdown instructions, reference guides, schema definitions).
- **Zero Token Bloat:** The root entry point (`SKILL.md`) must be direct and authoritative, offloading deep reference code to targeted markdown files (`references/`) to avoid context degradation.
- **Strict Verification Gate:** No output is considered delivered until all 4 verification blocks (Hard Gate, Purpose Gate, Liveliness Dials, UX Quality Locks) pass.

---

## 4. Approaches Considered

### Approach 1: Monolithic Single Master (`SKILL.md` All-in-One)
- Pack everything (protocol, 35 UX laws, 6 layout codes, design token tables) into a single 1500+ line `SKILL.md`.
- *Trade-off:* High risk of mid-context hallucination and attention drop; difficult to maintain.

### Approach 2: Deeply Modular Multi-Package Monorepo
- Split each feature into separate standalone skills (`skills/design-system`, `skills/ux-laws`, `skills/layouts`, `skills/tech-stack`).
- *Trade-off:* Requires cross-loading 4-5 skills for a single page; cumbersome setup and high token overhead.

### Approach 3: Two-Tier Hybrid Architecture (Master Engine + Targeted Reference Playbooks) — **[SELECTED]**
- A core authoritative `SKILL.md` as the orchestration engine, supported by 5 dedicated technical playbooks in `references/` for deep dive lookup:
  - `references/ux-laws-handbook.md` (All 35 UI/UX Laws with DO/DON'T code)
  - `references/design-system-math.md` (60-30-10, luminance stepping, optical formulas)
  - `references/layouts-2026.md` (Full TSX/Tailwind code for the 6 modern layout blueprints)
  - `references/motion-physics.md` (Spring configs, duration caps, choreography rules)
  - `references/tech-stack-advisor.md` (Stack decision trees, gap audits, modern tool recommendations)
- Plus root multi-agent configs (`.cursorrules`, `CLAUDE.md`, `AGENTS.md`) and package metadata.
- *Why Selected:* Industry-standard architecture that maximizes agent reliability, eliminates context clutter, and provides deep, deterministic code references on demand.

---

## 5. Architectural Specification & Subsystems

```
skill-maker/
├── SKILL.md                          <-- Core Orchestration Engine & Execution Protocol
├── README.md                         <-- Repository overview & Quick-start guide
├── AGENTS.md                         <-- AGY & Codex entry point
├── CLAUDE.md                         <-- Claude Code entry point
├── .cursorrules                      <-- Cursor IDE entry point
├── .cursor/
│   └── rules/
│       └── production-ui.mdc         <-- Cursor MDC rule format
├── references/
│   ├── ux-laws-handbook.md           <-- 35 UI/UX Laws with detailed code examples
│   ├── design-system-math.md         <-- Mathematical color, typography, and spacing tokens
│   ├── layouts-2026.md               <-- The 6 Modern Hero & Homepage Layout Blueprints
│   ├── motion-physics.md             <-- Spring physics, duration caps, and choreography
│   ├── tech-stack-advisor.md         <-- Tech stack auditing & modern recommendations
│   └── banned-replacements-matrix.md <-- Scannable Anti-Slop replacement table
└── scripts/
    └── verify-ui.mjs                 <-- Automated contrast, state, and gate verification helper
```

### Subsystem 1: 5-Phase Execution Lifecycle (in `SKILL.md`)
1. **Phase 1: Context & Category Scan:**  
   Determine domain (SaaS, DevTool, FinTech, E-Commerce, Editorial, Healthcare, Local Place), target audience, and primary conversion goal.
2. **Phase 2: Tech Stack Audit & Recommendation:**  
   Validate provided stack or prescribe optimal modern tooling (React 19 / Next.js 15 / Tailwind v4 / Motion / Lucide). Highlight missing primitives (e.g. lack of accessible dialog primitive or toast system).
3. **Phase 3: Autonomous Design System Synthesis:**  
   Calculate the 60-30-10 palette, surface luminance steps (`#09090B` -> `#111113` -> `#18181B`), 8pt spatial grid, $R_{\text{outer}} = R_{\text{inner}} + P$ radius hierarchy, and modular typography scale.
4. **Phase 4: Construction & 35 UX Laws Enforcement:**  
   Assemble layouts using the selected 2026 Layout Blueprint, ensuring strict compliance with all 35 laws (touch targets, optical alignment, 4-state completeness, line lengths, progressive disclosure).
5. **Phase 5: Pre-Flight Declaration & Delivery Gate:**  
   Output the 4-line Aesthetic Spec before generating code, and run the mandatory 4-block PASS/FAIL gate report before final delivery.

### Subsystem 2: The 35 UI/UX Laws Engine
Categorized into 4 actionable operational domains:
- **Visual Hierarchy & Spatial Layout (1-9):** Fitts's, Hick's, Proximity, 8pt Grid, Visual Hierarchy, Miller's Chunking, Structural Whitespace, F/Z Scans, Common Region.
- **Interaction, Navigation & Cognitive Load (10-18):** Jakob's, Progressive Disclosure, Tesler's, Recognition > Recall, 44px Touch Targets, Single Primary CTA, Aesthetic-Usability, Icon+Text Pairing, CLS Prevention.
- **Typography, Color & Accessibility (19-27):** WCAG AA 4.5:1 Contrast, 50-75ch Line Length, 60-30-10 Color Rule, Multi-cue Status, 1.4-1.6x Line Height, Modular Type Scale, Dark Mode Desaturation, Visible Focus Rings, Left-Aligned Body.
- **Feedback, Forms & Micro-UX (28-35):** Doherty <400ms Threshold, Shimmer Skeletons, Inline Form Validation, Actionable Empty States, Undo over Confirmations, Persistent Labels, Peak-End Polish, 100% 4-State Edge Coverage.

### Subsystem 3: 2025–2026 Modern Layout Blueprints
Full code templates for:
1. **The "Exposed Hairline" Architectural Grid:** Continuous 1px borders (`divide-white/[0.06]`), corner `+` crosshairs, zero shadows.
2. **The "Zero-Marketing" Live Sandbox Hero:** 30% header + 70% live interactive micro-workspace (interactive markdown, code diff, command palette).
3. **Asymmetric 7:5 Swiss Editorial Split:** 7-column oversized display heading + 5-column bottom-aligned dense subcopy with tabular metrics.
4. **The "Single-Workflow Zoom" Cropped Bleed Hero:** 1.25x magnified single active UI interaction nicely cropped off container boundaries.
5. **Seamless Cell Matrix (Anti-Bento):** 1px hairline divide grid with flush cells and subtle luminance shifts on hover.
6. **Sticky "Index & Spec Sheet" Layout:** Sticky 3-column numbered technical index + 9-column technical datasheet comparison.

### Subsystem 4: Motion Physics & Choreography
- Ban `transition-all` and generic bouncy loops.
- Hover/focus duration caps: 120ms–180ms (`ease-out`).
- Framer Motion Spring Presets:
  - *Snappy UI (Modals, Dropdowns, Command Bars):* `stiffness: 400, damping: 30, mass: 0.8`.
  - *Layout Shifts (Tabs, Accordions, Expansions):* `stiffness: 300, damping: 28`.

---

## 6. What's Left to the Builder (Implementation Tasks)
- Writing the comprehensive `SKILL.md` orchestration document.
- Writing each reference handbook in `references/` with full code implementations.
- Setting up the multi-agent entry files (`.cursorrules`, `CLAUDE.md`, `AGENTS.md`, `production-ui.mdc`).
- Creating the verification script `scripts/verify-ui.mjs` for validating color contrast, state coverage, and layout constraints.
- Documenting everything in `README.md`.
