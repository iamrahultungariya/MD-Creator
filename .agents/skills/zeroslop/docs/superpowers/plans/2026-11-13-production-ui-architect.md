# Production UI Architect & Anti-AI Slop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, production-grade autonomous Frontend Architect & Anti-AI Slop Skill Repository that synthesizes mathematical design systems, enforces 35 UI/UX laws, audits tech stacks, and provides 6 modern 2025–2026 layout blueprints.

**Architecture:** Two-Tier Hybrid Architecture. A high-density root orchestration engine (`SKILL.md`) that drives a 5-phase lifecycle, paired with 6 dedicated reference playbooks in `references/` containing deterministic mathematical formulas, full TSX/Tailwind code, and an automated verification script in `scripts/verify-ui.mjs`.

**Tech Stack:** Markdown (Agents Skill format, Cursor MDC, Claude Code, AGY), Node.js (verification script), React 19 / Tailwind v4 / Framer Motion (reference code implementations).

**Spec:** [2026-11-13-production-ui-architect-design.md](file:///D:/do%20note%20delete/Downloads/Skill%20maker/docs/superpowers/specs/2026-11-13-production-ui-architect-design.md)

## Global Constraints

- Every negative rule must carry a deterministic, copy-pasteable positive replacement with exact Tailwind v4 tokens.
- All 35 UI/UX Laws must be explicitly documented with practical DO vs DON'T code blocks.
- Spacing must strictly adhere to the 8pt Spatial Grid (4pt micro-steps only for badges/chips).
- All dark mode surfaces must use luminance stepping (`#09090B` -> `#111113` -> `#18181B`) with no muddy blue-gray (`slate` / `gray-700`).
- No generic bouncy/floating animations; motion must use exact spring physics or 120–180ms duration caps.
- Universal compatibility across Cursor (`.cursorrules`, `.cursor/rules/*.mdc`), Claude Code (`CLAUDE.md`), Antigravity (`AGENTS.md`, global skill config), and Codex.

## Review Focus

- Missing deterministic code tokens in replacement tables (causing LLM to fall back to default Tailwind classes).
- Incomplete 4-state coverage in layout/component blueprints (empty, shimmer skeleton, error, overflow).
- Contrast violations in dark mode token stepping failing WCAG AA (4.5:1 text, 3:1 borders).
- Generic animations slipping through (e.g. `transition-all duration-500` instead of explicit properties with spring physics).
- Disconnect between `SKILL.md` orchestration and the reference playbooks in `references/`.

---

### Task 1: BANNED ➔ MANDATORY REPLACEMENT Matrix Playbook

**Files:**
- Create: `references/banned-replacements-matrix.md`

**Interfaces:**
- Produces: Comprehensive lookup table of AI slop anti-patterns mapped to deterministic Tailwind v4 and React 19 replacement patterns used by all subsequent modules.

- [x] **Step 1: Define Visual & Color Replacements**
- [x] **Step 2: Define Layout & Component Replacements**
- [x] **Step 3: Define Decorative & Copywriting Replacements**
- [x] **Step 4: Verify Content Completeness**
- [x] **Step 5: Commit**
  ```bash
  git add references/banned-replacements-matrix.md
  git commit -m "feat: add banned-to-replacement matrix playbook"
  ```

---

### Task 2: Mathematical Design System & Token Synthesizer Playbook

**Files:**
- Create: `references/design-system-math.md`

**Interfaces:**
- Produces: Mathematical algorithms and token tables for 60-30-10 palettes, surface luminance stepping, 8pt spatial grid, optical typography, and nested border radius formulas.

- [x] **Step 1: Color System & Luminance Stepping Algorithms**
  Document the 60-30-10 color balance rules, dark mode neutral stepping (Canvas: `#09090B`, Cell/Card: `#111113`, Elevated/Control: `#18181B`, Specular border: `rgba(255,255,255,0.07)`), and light mode counterpart (`#FAF8F5` / `#FFFFFF` / `border-zinc-950/[0.06]`).

- [x] **Step 2: Spatial Grid & Geometry Math**
  Formalize the 8pt grid (`4px`, `8px`, `16px`, `24px`, `32px`, `48px`, `64px`, `96px`). Formulate the nested border radius law: $R_{\text{outer}} = R_{\text{inner}} + \text{Padding}$. Ban card-inside-card nested borders.

- [x] **Step 3: Optical & Typographic Math**
  Specify the size-based tracking formula:
  - Display (>32px): `tracking-[-0.03em]` to `tracking-[-0.04em]`, `leading-[1.08]`.
  - Subheadings (18-24px): `tracking-[-0.015em]`, `leading-[1.3]`.
  - Body (14-16px): `tracking-normal`, `leading-[1.6]`, `max-w-[65ch]`.
  - Micro Labels (11-12px): `font-mono uppercase tracking-[0.06em]`.
  Mandate `tabular-nums` for all numbers, metrics, timestamps, and pricing tables.

- [x] **Step 4: Verify Token Consistency**
  Verify mathematical formulas and Tailwind v4 arbitrary property syntax.

- [x] **Step 5: Commit**
  ```bash
  git add references/design-system-math.md
  git commit -m "feat: add design system mathematical token playbook"
  ```

---

### Task 3: The 35 UI/UX Laws Comprehensive Handbook

**Files:**
- Create: `references/ux-laws-handbook.md`

**Interfaces:**
- Produces: Detailed specifications, practical DO/DON'T guidelines, and copy-pasteable React 19 / Tailwind v4 patterns for all 35 UI/UX laws.

- [x] **Step 1: Domain 1 — Visual Hierarchy & Spatial Layout (Laws 1–9)**
- [x] **Step 2: Domain 2 — Interaction, Navigation & Cognitive Load (Laws 10–18)**
- [x] **Step 3: Domain 3 — Typography, Color & Accessibility (Laws 19–27)**
- [x] **Step 4: Domain 4 — Feedback, Forms & Micro-UX (Laws 28–35)**
- [x] **Step 5: Verify Coverage**
- [x] **Step 6: Commit**
  ```bash
  git add references/ux-laws-handbook.md
  git commit -m "feat: add 35 ui/ux laws comprehensive handbook"
  ```

---

### Task 4: 2025–2026 Modern Layout Blueprints Playbook

**Files:**
- Create: `references/layouts-2026.md`

**Interfaces:**
- Produces: 6 complete, production-grade TSX/Tailwind v4 layout components ready for immediate agent use.

- [x] **Step 1: Layout 1 & 2 (Exposed Hairline Grid & Live Sandbox Hero)**
- [x] **Step 2: Layout 3 & 4 (7:5 Swiss Editorial Split & Cropped Bleed Single-Workflow)**
- [x] **Step 3: Layout 5 & 6 (Seamless Cell Matrix & Sticky Index Spec Sheet)**
- [x] **Step 4: Verify Component Syntax**
- [x] **Step 5: Commit**
  ```bash
  git add references/layouts-2026.md
  git commit -m "feat: add 2026 modern layout blueprints playbook"
  ```

---

### Task 5: Motion Physics & Choreography Playbook

**Files:**
- Create: `references/motion-physics.md`

**Interfaces:**
- Produces: Motion tokens, Framer Motion spring presets, CSS transition utilities, and anti-jank interaction rules.

- [x] **Step 1: Motion Rules & Caps**
- [x] **Step 2: Spring Physics Configuration**
- [x] **Step 3: Choreography & Accessibility**
- [x] **Step 4: Verify Motion Tokens**
- [x] **Step 5: Commit**
  ```bash
  git add references/motion-physics.md
  git commit -m "feat: add motion physics and choreography playbook"
  ```

---

### Task 6: Tech Stack Recommendation & Audit Playbook

**Files:**
- Create: `references/tech-stack-advisor.md`

**Interfaces:**
- Produces: Decision trees for modern frontend stacks, compatibility checks, and gap analysis for user-provided stacks.

- [x] **Step 1: Domain-Specific Stack Matrix**
- [x] **Step 2: User Stack Audit Protocol**
- [x] **Step 3: Verify Tooling Recommendations**
- [x] **Step 4: Commit**
  ```bash
  git add references/tech-stack-advisor.md
  git commit -m "feat: add tech stack recommendation and audit playbook"
  ```

---

### Task 7: Root Orchestration Engine (`SKILL.md`)

**Files:**
- Create: `SKILL.md`

**Interfaces:**
- Produces: The primary agent entry point orchestrating the 5-phase lifecycle, the Pre-Flight Aesthetic Spec declaration, and the Delivery Gate.
- Consumes: All playbooks in `references/`.

- [x] **Step 1: YAML Frontmatter & Core Persona**
- [x] **Step 2: 5-Phase Execution Protocol**
- [x] **Step 3: Pre-Flight Aesthetic Spec Declaration**
- [x] **Step 4: Scannable BANNED ➔ REPLACEMENT Quick Table**
- [x] **Step 5: Mandatory 4-Block Delivery Gate**
- [x] **Step 6: Verify SKILL.md Formatting**
- [x] **Step 7: Commit**
  ```bash
  git add SKILL.md
  git commit -m "feat: add root orchestration engine skill"
  ```

---

### Task 8: Automated Verification Tooling (`scripts/verify-ui.mjs`)

**Files:**
- Create: `scripts/verify-ui.mjs`

**Interfaces:**
- Produces: A Node.js CLI script that checks contrast ratios, scans source files for banned slop tokens (e.g. `bg-gradient-to-r`, `transition-all`, `rounded-3xl` everywhere), and validates 4-state component completeness.

- [x] **Step 1: Write Token Scanner and AST/Regex Rules**
- [x] **Step 2: Write WCAG Contrast Ratio Checker**
- [x] **Step 3: Test Script Execution**
- [x] **Step 4: Commit**
  ```bash
  git add scripts/verify-ui.mjs
  git commit -m "feat: add automated ui verification script"
  ```

---

### Task 9: Cross-Agent Adapters, Documentation & Global Sync

**Files:**
- Create: `README.md`
- Create: `.cursorrules`
- Create: `.cursor/rules/production-ui.mdc`
- Create: `CLAUDE.md`
- Create: `AGENTS.md`
- Modify: `C:\Users\Shree2\.gemini\config\skills\anti-ai-slop-ui-architect\SKILL.md` (sync updated master skill)

**Interfaces:**
- Produces: Instant out-of-the-box support for Cursor, Claude Code, Antigravity, and Codex.

- [x] **Step 1: Create Cursor Rules (.cursorrules & .cursor/rules/production-ui.mdc)**
- [x] **Step 2: Create CLAUDE.md & AGENTS.md**
- [x] **Step 3: Create README.md**
- [x] **Step 4: Sync to Global Antigravity Config**
- [x] **Step 5: Verify All Cross-Agent Pointers**
- [x] **Step 6: Commit**
  ```bash
  git add README.md .cursorrules .cursor/ CLAUDE.md AGENTS.md
  git commit -m "feat: add cross-agent entry points and documentation"
  ```

---

## Self-Review

1. **Spec Coverage:** Every subsystem in the design document (lifecycle, 35 UX laws, 6 layouts, design system math, motion physics, stack advisor, banned matrix, automated verification, cross-agent support) maps to Tasks 1 through 9.
2. **Step Scan:** Every step has an unambiguous checkable deliverable with specific files, tokens, and verification targets.
3. **Type Consistency:** Tokens and property names (`tabular-nums`, `#09090B`, `stiffness: 400`, `max-w-[65ch]`) remain consistent across all task descriptions and files.
4. **Review Focus:** Addressed all 5 review focus items (deterministic replacements, 4-state completeness, WCAG contrast, spring physics, and playbook cross-linking).
5. **Proportion:** Clear task boundaries with exact requirements and no transcript padding.
