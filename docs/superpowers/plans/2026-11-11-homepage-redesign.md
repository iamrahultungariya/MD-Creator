# Homepage Redesign (Craft Studio & Anti-AI Slop) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completely redesign the MD Writer homepage from ground zero into a high-density, Linear/Raycast-inspired Craft Studio interface adhering strictly to the Anti-AI Slop engineering protocol.

**Architecture:** Re-architect `HomePage.tsx` into 8 modular, purpose-built components utilizing solid high-contrast surfaces (`bg-neutral-950` dark / `bg-white` light), 1px solid hairline borders (`border-neutral-800`), zero decorative icon bloat, an interactive multi-mode dual-pane studio console, and human-centric outcome copywriting.

**Tech Stack:** React 19, TypeScript 5.7, Tailwind CSS v4, Lucide React (functional utility icons only), KaTeX (equations), Geist Sans & Mono fonts.

**Spec:** `docs/superpowers/specs/2026-11-11-homepage-redesign-design.md`

## Global Constraints

- **Color Palette:** Canvas `bg-neutral-950` dark / `bg-white` light; Elevated `bg-neutral-900` dark / `bg-neutral-50` light; Borders `border-neutral-800` dark / `border-neutral-200` light; Brand Accent `brand-600` (`#6D3FE0`) for primary buttons and `brand-500` (`#8257F5`) for active indicators.
- **No Glassmorphism & No Gradients:** No `backdrop-blur`, no `bg-clip-text text-transparent`, no neon drop shadows. Solid, tactile surfaces only.
- **Zero Decorative Icons:** No glowing icon boxes atop headings or redundant icons on action buttons. Use icons exclusively for utility triggers (search, close, theme toggle) or table status checks.
- **Typography:** `Geist Sans` (`tracking-[-0.03em]` headings, `leading-relaxed` body), `Geist Mono` for keys (`⌘K`, `/`, `Esc`) and metrics (`tabular-nums`).
- **No Marketing Clichés:** Ban *"Unleash"*, *"Revolutionize"*, *"Supercharge"*, *"Next-Gen"*, *"Seamless"*, *"Elevate"*, *"Empower"*.
- **Domain & Trademarks:** Production domain is `https://writermd.vercel.app`. Retain generic category labels in comparisons (*Traditional Cloud Suites*, *Plugin-Heavy Desktop Apps*).

## Review Focus

1. **Dual-Pane Responsiveness:** On mobile viewports (< 768px), the interactive studio console must collapse gracefully to a single tabbed pane without horizontal overflow.
2. **Accessible Contrast:** In both dark mode (`bg-neutral-950`) and light mode (`bg-white`), all body text must maintain >= 4.5:1 WCAG contrast ratio.
3. **No Unused TypeScript Exports / Imports:** Ensure zero `TS6133` unused variables and zero `any` types across all updated files.
4. **Interactive Sandbox State Transitions:** Toggling between `Technical Specs`, `KaTeX Math`, `Mimo AI Diff`, and `Print Preview` must cleanly swap code and rendered views without unmounting state errors.
5. **SEO & Metadata Integrity:** All existing Schema.org `WebApplication` and `FAQPage` rich snippet data in `index.html` must remain 100% aligned with the redesigned sections.

---

### Task 1: Modernize Navbar (`src/components/home/Navbar.tsx`)

**Files:**
- Modify: `src/components/home/Navbar.tsx`
- Test: `tests/home/navbar.test.ts`

**Interfaces:**
- Consumes: `onOpenTemplates: () => void`, `onOpenFeatures: () => void`
- Produces: `<Navbar onOpenTemplates={...} onOpenFeatures={...} />`

- [ ] **Step 1: Write unit test verifying Navbar structure and anti-slop rules**
- [ ] **Step 2: Run test to verify it fails before modification**
- [ ] **Step 3: Implement clean Craft Studio Navbar**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 2: Re-Architect Hero Section (`src/components/home/Hero.tsx`)

**Files:**
- Modify: `src/components/home/Hero.tsx`
- Test: `tests/home/hero.test.ts`

**Interfaces:**
- Consumes: `onOpenCreateDoc: () => void`, `onOpenTemplates: () => void`
- Produces: `<Hero onOpenCreateDoc={...} onOpenTemplates={...} />`

- [ ] **Step 1: Write unit test verifying Hero copy and structure**
- [ ] **Step 2: Run test to verify initial state**
- [ ] **Step 3: Implement redesigned Hero component**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 3: Build Interactive Studio Workspace Console (`src/components/home/StudioWorkspaceDemo.tsx`)

**Files:**
- Create: `src/components/home/StudioWorkspaceDemo.tsx`
- Test: `tests/home/studioDemo.test.ts`

**Interfaces:**
- Produces: `<StudioWorkspaceDemo onOpenEditor={() => void} />`
- State: `activeTab: 'specs' | 'math' | 'mimo' | 'export'`

- [ ] **Step 1: Write unit test for Studio Workspace Demo modes**
- [ ] **Step 2: Run test to verify it fails before creation**
- [ ] **Step 3: Implement `StudioWorkspaceDemo.tsx`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 4: Replace Bento with Core Values Section (`src/components/home/CoreValuesSection.tsx`)

**Files:**
- Create: `src/components/home/CoreValuesSection.tsx`
- Replace usage in: `src/pages/HomePage.tsx`
- Test: `tests/home/coreValues.test.ts`

**Interfaces:**
- Produces: `<CoreValuesSection />`

- [ ] **Step 1: Write unit test verifying architectural pillars**
- [ ] **Step 2: Run test to verify initial failure**
- [ ] **Step 3: Implement `CoreValuesSection.tsx`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 5: Overhaul Benchmark Comparison Matrix (`src/components/home/BenchmarkSection.tsx`)

**Files:**
- Modify: `src/components/home/BenchmarkSection.tsx`
- Test: `tests/home/benchmark.test.ts`

**Interfaces:**
- Produces: `<BenchmarkSection />`

- [ ] **Step 1: Write unit test for Benchmark table styling & legal safety**
- [ ] **Step 2: Run test to check current compliance**
- [ ] **Step 3: Refactor `BenchmarkSection.tsx` to Craft Studio standards**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 6: Modernize Pricing Matrix (`src/components/home/PricingSection.tsx`)

**Files:**
- Modify: `src/components/home/PricingSection.tsx`
- Test: `tests/home/pricing.test.ts`

**Interfaces:**
- Produces: `<PricingSection />`
- State: `billingInterval: 'monthly' | 'annual'`

- [ ] **Step 1: Write unit test for Pricing tiers and copy**
- [ ] **Step 2: Run test to verify compliance**
- [ ] **Step 3: Refactor `PricingSection.tsx` to Craft Studio aesthetics**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 7: Refine FAQ Accordion (`src/components/home/FaqSection.tsx`)

**Files:**
- Modify: `src/components/home/FaqSection.tsx`
- Test: `tests/home/faq.test.ts`

**Interfaces:**
- Produces: `<FaqSection />`

- [ ] **Step 1: Write unit test for FAQ items and zero-slop layout**
- [ ] **Step 2: Run test to verify state**
- [ ] **Step 3: Refactor `FaqSection.tsx`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 8: Update Footer & Clean Up Dead Components (`src/components/home/Footer.tsx`)

**Files:**
- Modify: `src/components/home/Footer.tsx`
- Delete if unreferenced: `src/components/home/InteractiveStudioShowcase.tsx` (superseded by `StudioWorkspaceDemo.tsx`), `src/components/home/WritingHoverTrigger.tsx` (if obsolete)
- Test: `tests/home/footer.test.ts`

**Interfaces:**
- Produces: `<Footer />`

- [ ] **Step 1: Write unit test for Footer metadata and sitemap compliance**
- [ ] **Step 2: Run test to verify initial state**
- [ ] **Step 3: Implement Craft Studio Footer**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 9: Assemble Redesigned `HomePage.tsx` & Complete Verification

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Test: Full TypeScript typecheck and test suite verification

**Interfaces:**
- Mounts: `<Navbar>`, `<Hero>`, `<StudioWorkspaceDemo>`, `<CoreValuesSection>`, `<BenchmarkSection>`, `<PricingSection>`, `<FaqSection>`, `<Footer>`

- [ ] **Step 1: Update `src/pages/HomePage.tsx` to mount the redesigned component tree**
- [ ] **Step 2: Run all home test suites**
- [ ] **Step 3: Run TypeScript compiler check**
- [ ] **Step 4: Commit and finalize**
