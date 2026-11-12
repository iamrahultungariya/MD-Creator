# Homepage Redesign Specification (Craft Studio & Anti-AI Slop Architecture)

**Date:** 2026-11-11  
**Target Domain:** https://writermd.vercel.app  
**Design Paradigm:** Linear / Raycast Craft Studio (Approach A)  
**Engineering Standard:** Anti-AI Slop & Bespoke UI Protocol (`.agents/skills/anti-ai-slop-ui-architect/SKILL.md`)  

---

## 1. Intent & The Why

MD Writer has evolved into a high-performance, local-first plain-text studio with offline IndexedDB persistence, KaTeX math typesetting, and private Google Gemini 3.x BYOK assistance.

However, the previous landing page retained several legacy AI-design patterns:
* Repetitive 3-column generic bento boxes.
* Decorative icons sitting over headings without functional purpose.
* Tech jargon in headings rather than human-centered outcome copy.
* Disconnected sections that tell rather than show the studio's speed and tactile feel.

The goal of this redesign is to re-architect `HomePage.tsx` and its core modules from ground zero into a cohesive, high-density, bespoke workspace presentation inspired by tools like **Linear**, **Raycast**, and **Craft.do**—while strictly enforcing the **13 Laws of Anti-AI Slop Engineering**.

---

## 2. Global Constraints & Design System Tokens

### 2.1 Color Palette & Surfaces
* **Canvas Base:**
  * Dark mode (primary): `bg-neutral-950` (#0A0A0A)
  * Light mode: `bg-white` (#FFFFFF)
* **Elevated Surfaces:**
  * Dark mode: `bg-neutral-900` (#171717)
  * Light mode: `bg-neutral-50` (#FAFAFA)
* **Hover / Interactive:**
  * Dark mode: `hover:bg-neutral-800/80`
  * Light mode: `hover:bg-neutral-100`
* **Hairline Borders:**
  * Dark mode: `border-neutral-800` (1px solid)
  * Light mode: `border-neutral-200` (1px solid)
* **Brand Accent:**
  * Electric Violet: `brand-600` (`#6D3FE0`) for primary action buttons; `brand-500` (`#8257F5`) for active indicators.
  * No gradient text (`bg-clip-text text-transparent`), no ambient neon glow boxes, no translucent frosted glass (`backdrop-blur`). Flat, tactile, solid surfaces only.

### 2.2 Typographic Hierarchy
* **Primary UI & Headings:** `Geist Sans` (`--font-sans`).
  * Display titles: `tracking-[-0.03em]` or `tracking-tight`, font-semibold (`600`), high-contrast (`text-neutral-950 dark:text-white`).
  * Body copy: `text-neutral-600 dark:text-neutral-400`, `leading-relaxed`, line-length capped at `max-w-xl` or `max-w-2xl` (`60ch–70ch`).
* **Technical & Keyboard Metadata:** `Geist Mono` (`--font-mono`).
  * Used for keyboard shortcuts (`⌘K`, `/`, `Esc`), numerical metrics (`tabular-nums`), and version tags.
* **Editorial Accents (Optional):** `Literata Serif` (`--font-serif`) strictly for sample document prose inside previews.

### 2.3 Icon Discipline (Law 1 of Anti-AI Slop)
* **Zero Decorative Icons:** No generic Lucide icons perched atop feature cards, no spark icons next to buttons.
* **Allowed Icons:**
  * Navigation utility triggers (search, mobile menu toggle, theme toggle).
  * Direct status markers in data rows (check / dash).
  * Directional arrows where indicating external movement.

### 2.4 Copywriting Standard (Law 5 of Anti-AI Slop)
* Banned words: *"Unleash"*, *"Revolutionize"*, *"Supercharge"*, *"Next-Gen"*, *"Seamless"*, *"Elevate"*, *"Empower"*.
* Clear, outcome-driven language: Focus on offline reliability, zero-latency typing, data ownership, and direct Gemini 3.x key integration without token markup.

---

## 3. Section Architecture & Component Decomposition

The redesigned home page will consist of 8 cohesive, purpose-built components:

```
src/pages/HomePage.tsx
  ├── Navbar (Minimalist, solid surface, keyboard hint, Open Studio CTA)
  ├── HeroSection (Outcome headline, instant CTAs, local-first trust pill)
  ├── StudioWorkspaceDemo (Interactive dual-pane console with live KaTeX, tabs, and simulated Mimo diff)
  ├── CoreValuesSection (Dense 3-pillar architectural contrast: Local Storage, BYOK AI, Camera-Ready Export)
  ├── BenchmarkMatrixSection (Clean technical comparison table: MD Writer vs Cloud Suites vs Plugin Apps)
  ├── PricingSection (Annual/Monthly toggle, Free BYOK, $49 Lifetime Early-Bird, $8/mo Pro)
  ├── FaqSection (High-contrast 1px divided accordion for security, privacy, and export)
  ├── BottomCtaSection (Direct, quiet closing CTA)
  └── Footer (Developer metadata, copyright, keyboard shortcuts list, sitemap links)
```

---

## 4. Detailed Component Specifications

### 4.1 Navbar (`src/components/home/Navbar.tsx`)
* **Layout:** Fixed top bar with solid background (`bg-white dark:bg-neutral-950`), 1px bottom border (`border-b border-neutral-200 dark:border-neutral-800`). Height: `h-14` (56px).
* **Left:** Wordmark "MD Writer" in medium weight, accompanied by a small monospace pill `v2.3`.
* **Center Navigation:** Text-only anchor links: `Features`, `Architecture`, `Pricing`, `FAQ`.
  * Style: `text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors`.
* **Right Actions:**
  * Keyboard search hint `⌘K`.
  * Theme toggle button (Sun/Moon).
  * Primary Button: "Open Studio" (`bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium px-3.5 py-1.5 rounded-md active:translate-y-[1px] transition-all`).

### 4.2 Hero Section (`src/components/home/Hero.tsx`)
* **Layout:** Centered typographic stack with generous vertical breathing room (`pt-20 pb-12`).
* **Headline:**
  * Top kicker: Monospace micro-badge `LOCAL-FIRST • ZERO TELEMETRY • GEMINI 3.X BYOK`.
  * H1: `The plain text studio built for focused writing.` (48px–64px, font-semibold, tracking-tight).
* **Sub-copy:**
  * `No account required. Your documents stay in your browser's private local storage. Connect your own Google Gemini key for private, zero-markup AI editing.`
* **Action Cluster:**
  * Primary: "Create Document" (solid brand violet, routes to `/editor`).
  * Secondary: "Open Templates" (neutral solid border, opens `TemplatesModal`).
  * Tertiary: "Open Saved Documents" (plain text link, routes to `/documents`).
* **Social Proof / Guarantee:**
  * Single-line typographic reassurance: `100% private. Works completely offline. Export directly to PDF, Word, and Markdown.`

### 4.3 Studio Workspace Demo (`src/components/home/StudioWorkspaceDemo.tsx`)
* **Replaces the old isolated sandbox with a true "Linear-style" interactive console.**
* **Structure:**
  * Max width: `max-w-5xl mx-auto`.
  * Frame: 1px solid `border-neutral-800 bg-neutral-900 rounded-xl overflow-hidden shadow-2xl`.
  * Top bar:
    * Left: 3 window dots (`w-2.5 h-2.5 rounded-full bg-neutral-800`).
    * Center: Active file name `quantum_notes.md` with status `Saved locally (0ms)`.
    * Right: Interactive mode switcher:
      * `[Technical Specs]` | `[KaTeX Math]` | `[Mimo AI Diff]` | `[Print Preview]`.
  * Dual-Pane Content:
    * Left Pane (Editor): Syntax-highlighted Markdown with line numbers (1–14). Users can type directly into it.
    * Right Pane (Live Studio Output):
      * In `KaTeX Math` mode: Renders formula $\nabla \times \mathbf{E} = -\frac{\partial \mathbf{B}}{\partial t}$ and matrix calculations.
      * In `Technical Specs` mode: Renders clean tables, checkboxes, and task items.
      * In `Mimo AI Diff` mode: Shows side-by-side green/red insertion/deletion diff with an "Accept Edit" button.
  * Console Status Bar:
    * Left: `UTF-8 • Markdown • 412 words`.
    * Right: Monospace shortcut keys `Press / for Slash Commands`.

### 4.4 Core Values & Architectural Pillars (`src/components/home/CoreValuesSection.tsx`)
* **Layout:** Replaces generic bento boxes with a clean, 3-column asymmetric layout divided by 1px hairline rules.
* **Pillars:**
  1. **Zero-Cloud Local Storage:**
     * Heading: "Your thoughts stay on your machine."
     * Copy: "Documents are stored directly in your browser's IndexedDB. No remote servers reading your drafts, no mandatory account creation, and zero latency when typing."
  2. **Direct Gemini 3.x BYOK:**
     * Heading: "Pay zero markup on artificial intelligence."
     * Copy: "Connect your own Gemini API key. Use the free tier (15 requests/minute) or pay fractions of a cent directly to Google. MD Writer never sits between you and the model."
  3. **Camera-Ready Studio Exports:**
     * Heading: "Print-perfect output every single time."
     * Copy: "High-resolution PDF generation with proper pagination, mathematical typesetting via KaTeX, and clean Word `.docx` formatting for client deliverables."

### 4.5 Architectural Benchmark Matrix (`src/components/home/BenchmarkSection.tsx`)
* **Layout:** Structured technical table with high-contrast text and clean table borders.
* **Columns:**
  * Capability / Metric
  * **MD Writer** (Highlighted column)
  * Traditional Cloud Suites
  * Plugin-Heavy Desktop Apps
* **Rows:**
  * Data Storage: Local-First (Private) vs Centralized Cloud vs Local Filesystem
  * Startup Time: < 300ms vs 2–4s vs 3–8s
  * Account Requirement: None (Instant) vs Mandatory vs Optional
  * AI Integration: Gemini 3.x BYOK (Zero Markup) vs $20/mo bundled lock-in vs Complex 3rd-party community plugins
  * Math & Code: Native KaTeX + Highlighting vs Requires Add-ons vs Native with plugins
  * Export Fidelity: Direct Vector PDF, DOCX, MD vs Cloud PDF only vs Markdown only

### 4.6 Pricing Matrix (`src/components/home/PricingSection.tsx`)
* **Layout:** Clean 3-tier card layout with Monthly / Annual (-25%) billing switch.
* **Tiers:**
  1. **Free Forever (BYOK):**
     * Price: `$0`
     * Target: Writers, students, and engineers using their own Gemini key.
     * Features: Unlimited local documents, KaTeX math, slash commands, BYOK Gemini 3.x access, PDF/MD/DOCX exports.
  2. **Early-Bird Lifetime (Featured):**
     * Price: `$49` one-time payment.
     * Badge: `LIFETIME ACCESS • NO SUBSCRIPTION`.
     * Features: Everything in Free, plus all future desktop app builds, priority Studio Export templates, and early access to new Gemini 3.x models.
  3. **Pro Studio:**
     * Price: `$8/month` (or `$6/mo` billed annually).
     * Target: Power users who want zero-setup managed AI access without creating a Google Cloud console account.

### 4.7 FAQ Section (`src/components/home/FaqSection.tsx`)
* **Layout:** Single-column centered accordion with hairline dividers (`divide-y divide-neutral-200 dark:divide-neutral-800`).
* **Questions:**
  * Where are my documents saved?
  * How does the Gemini 3.x API key work?
  * Is an account required to write or export?
  * Can I use MD Writer without an internet connection?
  * How do I export to PDF with proper page breaks?
  * Can I export all my data if I decide to leave?

### 4.8 Footer (`src/components/home/Footer.tsx`)
* **Layout:** 4-column minimal technical footer:
  * Column 1: MD Writer branding, license (MIT), and privacy statement.
  * Column 2: Product (Studio Editor, Templates, Roadmap, Changelog).
  * Column 3: Resources (Documentation, Gemini Key Guide, Markdown Syntax, KaTeX Guide).
  * Column 4: System (Status: Operational, Version: v2.3.0, Keyboard Shortcuts: `⌘K`).

---

## 5. Review Focus & Failure Modes Avoidance

1. **Mobile Responsiveness:** Ensure the dual-pane Studio Demo collapses cleanly to a single tabbed view on screens `< 768px`.
2. **Theme Transitions:** Dark and light mode switches must execute without color flashing or unreadable text contrast.
3. **Typography Clipping:** Large headlines must use `tracking-tight` with appropriate line-height (`leading-tight`) to avoid line clipping on Safari/WebKit.
4. **Zero AI Slop Compliance:** Verify that zero decorative icons are added and no banned marketing words exist in copy.
5. **SEO & AEO Metadata:** Retain all Schema.org structured data, OpenGraph tags, and canonical links.

---

## 6. Approaches Evaluated & Decision Record

| Approach | Architecture | Pros | Cons | Decision |
|---|---|---|---|---|
| **A: Craft Studio (Linear/Raycast)** | High-density, obsidian-dark, interactive live console, zero decorative icons | Professional, appeals to technical writers and developers, shows real capability | Requires precision typing in demo console | **ACCEPTED** (Selected by user) |
| **B: Interactive Workspace First** | Embedded full-width mini-editor ribbon in hero | Immediate typing gratification | Clutters initial mobile viewport | Rejected |
| **C: Modern Editorial (Notion/Craft)** | Serif typography, narrative storytelling | Beautiful for book authors | Lacks technical punch for AI/KaTeX audience | Rejected |

---

## 7. Approval Gate

Per the **Brainstorming** and **Anti-AI Slop** protocols, implementation will not begin until this design specification is approved.
Once approved, the implementation plan will be created via `superpowers:writing-plans`.
