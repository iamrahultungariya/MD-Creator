# Design Specification: MD Writer Comprehensive UI/UX, Animation & Design System Audit

> **Status:** Approved / Ready for Plan  
> **Author:** Antigravity Architect (with Builder Review integration)  
> **Date:** 2026-11-13  
> **Skill Standard:** ZeroSlop Anti-AI-Slop Frontend Architecture (React 19 / Tailwind v4)

---

## 1. Intent & The "Why"
MD Writer is a high-performance, local-first technical Markdown studio equipped with Google Gemini 3.x AI, KaTeX LaTeX math, and Mermaid diagrams. Following the successful completion of Phase 1 and Phase 2 (which resolved the modal portal containing block trap and cleaned core page route transitions), the objective is to execute an exhaustive, uncompromising audit of the **entire application** against the 35 UI/UX Laws, mathematical design tokens, motion physics, and anti-AI-slop standards.

This design document establishes the architecture, methodology, audit matrix, and remediation roadmap for delivering:
1. **Immediate Deliverable (Stage 1):** The definitive **Comprehensive Diagnostic Audit Report** (`docs/audit/2026-11-13-comprehensive-ui-ux-design-system-audit-report.md`) evaluating all 12 view groups against the 35 UI/UX laws, contrast ratios, and motion metrics.
2. **Subsequent Execution (Stage 2):** Phased implementation plans (Phase 3 through Phase 5) derived directly from the empirical audit findings.

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
1. **Exhaustive 360° Audit:** Inspect all 12 view groups in `src/` (Editor, Documents, Modals, Admin, Share, Home, Auth, PDF Export, Presentation, Blog, Mimo, Theme engine).
2. **35 UI/UX Laws Compliance Scorecard:** Evaluate the codebase against all 35 empirical UI/UX laws (Fitts's Law, Hick's Law, Miller's Law, Doherty Threshold, Jakob's Law, Law of Proximity, etc.).
3. **Design System & Contrast Rigor:** Verify Tailwind v4 design tokens (`src/index.css`), surface hierarchies, typography scales (Geist Sans, Geist Mono, Literata Serif), and WCAG AA contrast across light and dark palettes.
4. **Motion Physics & GPU Hygiene:** Catalog every instance of unbounded `transition-all` (~230 instances across 12 component folders) and map them to targeted GPU transitions (`transform`, `opacity`, `background-color`, `border-color`).
5. **Actionable Remediation Roadmap:** Group all findings into prioritized, discrete phases (P0 Critical, P1 Performance, P2 Polish) that can be executed safely with zero regression.

### Non-Goals
1. **Changing Application Core Storage:** No modifications to Dexie/IndexedDB database schemas, Web Crypto encryption algorithms, or Supabase synchronization protocols.
2. **Altering Markdown Syntax or Data:** Zero changes to markdown AST parsing, KaTeX math delimiting, or user note content.
3. **Re-architecting Working Modals:** Modals already portaled in Phase 1 & 2 (`CreateDocumentModal`, `TemplatesModal`, `BulkShareModal`, `CloudSyncModal`, `QuickAuthModal`, `ExportModal`, `PublishModal`, `DocumentSwitcherModal`) remain intact.

### Anti-Goals (What would make this fail)
1. **Breaking Hyphens (`-`):** Accidentally replacing or stripping regular hyphens in Tailwind class names (`flex-col`, `gap-2`), markdown lists (`- list`), frontmatter, regexes, math formulas, or dates (`YYYY-MM-DD`).
2. **Generic AI Fluff / Vague Feedback:** Outputting generic design advice like "improve typography" without exact file paths, line numbers, contrast ratios, and before/after code blocks.
3. **Big-Bang Destructive Edits:** Attempting to edit 200+ files in a single pass without test gates, leading to build breakage or visual regressions.

---

## 3. Constraints
- **Framework & Tooling:** React 19, Tailwind CSS v4, Vite 6, Node 24 test runner (`npx tsx --test`).
- **Accessibility:** Strict WCAG 2.2 Level AA compliance (minimum 4.5:1 for normal text, 3.0:1 for large/bold text).
- **Performance Budget:**
  - Micro-interactions capped at 120ms–180ms.
  - Keypress-to-render latency under 16ms (60fps) / 8ms (120fps).
  - Page transition frame budget: 0 dropped frames; strictly zero layout thrashing (`transition-all` banned on properties affecting layout geometry like `width`, `height`, `margin`, `padding`).
- **Zero Regressions:** Full test suite (75+ tests) must pass at 100% at every milestone.

---

## 4. Approaches Considered

### Approach 1: Comprehensive Diagnostic Artifact + Phased Remediation Matrix (Chosen)
- **Description:** Produce an exhaustive, permanent Markdown audit report documenting empirical measurements (contrast ratios, violation telemetry, UX law scores, state coverage) and establish an explicit 3-phase execution roadmap.
- **Trade-offs:** Requires deep initial analysis, but provides 100% visibility, eliminates guesswork, and guarantees zero unintended regressions during implementation.

### Approach 2: Inline Audit & Immediate Bulk Refactor
- **Description:** Run the automated scanner and immediately attempt to rewrite all 230+ component files inline without a formal audit document or phased review gates.
- **Trade-offs:** High risk of syntax regressions, uncoordinated component changes, and difficult git rollbacks. Rejected.

---

## 5. Architectural Breakdown of Audit Domains

### Domain 1: Mathematical Design System & Tokens
```
Base Canvas:
  Dark:  #0E0B14 (Deep Violet Noir)
  Light: #FBFAFD (Warm Crisp Alabaster)

Elevated Surfaces:
  Dark:  #15111E (Surface) → #1D1829 (Elevated Cards/Modals) → #251F33 (Popovers)
  Light: #FFFFFF (Surface) → #F3F0F9 (Elevated Cards/Modals) → #F0EDF6 (Popovers)

Borders & Specular Highlights:
  Dark:  border #2A2338 / border-subtle #1F1A2A / border-strong #3D3352
  Light: border #E7E3F0 / border-subtle #F0EDF6 / border-strong #D4CEE2
  Highlights: 1px top specular inset (rgba(255, 255, 255, 0.06))

Typography Ramps:
  UI Body:      Geist Sans Variable
  Code/Metrics: Geist Mono Variable (with font-variant-numeric: tabular-nums)
  Prose/Essay:  Literata Serif Variable
```

#### Key Audit Measurement: WCAG AA Contrast Analysis
| Surface / Background | Text Token | Hex Value | Calculated Contrast | WCAG AA Normal (>= 4.5:1) | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Dark Canvas (`#0E0B14`) | Primary Text (`--text`) | `#EDEAF5` | **16.43:1** | ✅ PASS | Optimal |
| Dark Canvas (`#0E0B14`) | Muted Text (`--muted`) | `#9A93AD` | **6.64:1** | ✅ PASS | Good |
| Dark Canvas (`#0E0B14`) | Brand Accent (`--color-brand-500`) | `#8257F5` | **4.30:1** | ❌ **FAIL** (< 4.5:1) | **Needs Brand-400 (`#9E7EFF`, 6.39:1)** |
| Light Canvas (`#FBFAFD`) | Primary Text (`--text`) | `#1B1626` | **16.98:1** | ✅ PASS | Optimal |
| Light Canvas (`#FBFAFD`) | Muted Text (`--muted`) | `#6B6480` | **5.37:1** | ✅ PASS | Good |
| Light Canvas (`#FBFAFD`) | Brand Accent (`--color-brand-600`) | `#6D3FE0` | **5.87:1** | ✅ PASS | Good |

---

### Domain 2: Motion Physics & Animation Engineering
1. **Transition-All Elimination Matrix (Complete 230 Instances Mapped):**
   - **Phase 3 Scope (Admin, Common, Auth, Blog, Share - 75 instances):**
     - `components/common/`: 33 instances
     - `components/admin/`: 23 instances
     - `components/auth/`: 9 instances
     - `components/blog/`: 7 instances
     - `components/share/`: 3 instances
   - **Phase 4 Scope (Editor, Mimo, Presentation, PDF Export - 145 instances):**
     - `components/editor/`: 54 instances
     - `features/editor/`: 40 instances
     - `features/mimo/`: 28 instances
     - `features/presentation/`: 12 instances
     - `features/pdf-export/`: 7 instances
     - `components/home/`: 4 instances
   - **Phase 5 Scope (Documents & Final Polish - 10 instances):**
     - `components/documents/`: 10 instances
2. **Spring Physics Calibration:**
   - Modals & Command Palettes: `stiffness: 400, damping: 30` (natural settling without bounce slop).
   - Tooltips & Popovers: `duration: 120ms, ease: [0.16, 1, 0.3, 1]`.
   - Micro-buttons & Tabs: `transition-colors duration-150 active:translate-y-[1px]`.
3. **Motion Hygiene:**
   - Universal `@media (prefers-reduced-motion: reduce)` support to zero out transforms and infinite marquees for sensitive users.

---

### Domain 3: 35 UI/UX Laws Comprehensive Audit Focus

1. **Fitts's Law:**
   - *Current State:* Desktop controls are well-sized, but on mobile viewports (<640px), the editor toolbar icons are 28×28px with 4px hit margins, making thumb tapping error-prone.
   - *Target:* Expand touch targets to a minimum of 44×44px hit-box using pseudo-elements (`after:inset-[-8px]`) or sticky thumb action bar.
2. **Hick's Law:**
   - *Current State:* Editor header and toolbar present 18+ unsegmented actions at once.
   - *Target:* Group into contextual clusters: Formatting, Insert (Math, Table, Image), AI Pair-Writer, Document Actions.
3. **Miller's Law (Chunking):**
   - *Current State:* Export PDF modal and Editor Preferences have long vertical stacks.
   - *Target:* Enforce 3–5 item chunking with distinct subheadings and 1px hairline dividers.
4. **Doherty Threshold (<120ms):**
   - *Current State:* Typing is zero-latency via CodeMirror 6. Modal openings are instantaneous via Portals.
   - *Target:* Verify Mimo stream chunk batching (16ms RAF) and instantaneous local-first save indicators.
5. **Jakob's Law:**
   - Standard technical keyboard shortcuts (`⌘S`, `⌘Z`, `⌘⇧Z`, `⌘B`, `⌘I`, `⌘K`, `⌘P`, `Esc`) must have 1:1 parity with standard engineering tools.
6. **Peak-End Rule:**
   - Document creation, export completion, and file sync must end on satisfying, crisp feedback (subtle success toasts, haptic micro-cues, zero nagging prompts).
7. **Law of Proximity:**
   - Form fields in modals must follow the 6px label-to-input gap vs 24px inter-group gap.
8. **100% 4-State Coverage (Empty, Loading, Error, Success):**
   - Replace any remaining spinner wheels with structured shimmer skeletons.
   - Ensure all empty list states feature 1px dashed hairlines, domain copy, and primary action shortcuts.

---

## 6. Phased Remediation Roadmap (Execution Strategy)

- **Stage 1: Comprehensive Diagnostic Audit Report (`docs/audit/2026-11-13-comprehensive-ui-ux-design-system-audit-report.md`)**
  - Full static analysis across all 12 views.
  - Complete 35 UI/UX Laws scorecard with line-by-line evidence.
  - Full contrast table and motion transition inventory.
- **Stage 2: Implementation via `writing-plans` (Upon Audit Approval)**
  - **Phase 3: Admin Dashboard, Secondary Modals & Dialogs**
    - Complete modal portalization across `EditorModalsContainer` (`KatexFormulaModal`, `ImageEmbedModal`, `TableBuilderModal`, `ToolbarSettingsModal`, `RevisionHistoryModal`, `ExportPdfModal`) and secondary dialogs (`PreferencesModal`, `StorageDetailsModal`, `BlogCreateModal`, `AvatarPickerModal`).
    - Eradicate `transition-all` across 75 instances in `admin`, `common`, `auth`, `blog`, and `share`.
  - **Phase 4: Editor Canvas, Mimo AI Drawer & Floating Toolbars**
    - Modernize mobile touch targets (Fitts's Law 44px).
    - Clean `transition-all` across 145 instances in `editor`, `mimo`, `presentation`, `pdf-export`, and `home`.
    - Enforce Hick's Law clustering on the main editor toolbar.
  - **Phase 5: Design Token Uniformity, Contrast Fixes & 4-State Audit**
    - Correct `text-brand-500` to `text-brand-400` in dark mode for WCAG AA compliance.
    - Implement UI-level deferred execution timer (5s timed undo toast) for destructive deletions (zero changes to Dexie storage/sync).
    - Clean remaining 10 `transition-all` in `components/documents/`.
    - Standardize shimmer skeletons across all loading views.

---

## 7. What is Left to the Builder
- Detailed task-by-task test definitions in `writing-plans`.
- Exact line replacements for secondary modals and admin tabs.
- Creation of automated regression tests for touch target sizes and contrast rules.
