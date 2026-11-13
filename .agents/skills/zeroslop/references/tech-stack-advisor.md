# Tech Stack Recommendation & Audit Playbook

> **Strict Architectural Protocol:** A high-taste frontend cannot exist on top of an obsolete, conflicting, or incomplete foundation. When a user requests an interface, the agent must **audit their existing stack** or **prescribe an optimal production stack** tailored specifically to the project's category.

---

## 1. Domain-Specific Production Stacks (2025–2026 Standards)

| Project Category | Core Framework | Styling & Tokens | Component Primitives | State & Data Fetching | Motion & Icons |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SaaS / Web App / Split-Pane Dashboards** | **Next.js 15 (App Router)** or **Vite + React 19** | Tailwind CSS v4 (or v3.4) | Radix UI Primitives / shadcn/ui | TanStack Query v5 + Zustand | Motion (Framer) + Lucide (monochrome) |
| **Editorial / Content / Documentation** | **Astro 5** (or Next.js SSG) | Tailwind CSS v4 | Native HTML5 semantic elements | Minimal client state / Content Collections | Pure CSS micro-transitions |
| **Developer Tools / Cloud Infrastructure** | **Vite + React 19 + TypeScript** | Tailwind CSS v4 | Radix UI + Monaco Editor | TanStack Table + WebAssembly | Lucide React + Terminal fonts |
| **High-Conversion Marketing / Launch** | **Next.js 15 / Astro 5** | Tailwind CSS v4 | Custom Architectural Grid primitives | React Hook Form + Zod | Motion spring presets |

---

## 2. The User Stack Diagnostic Audit

Before writing or modifying UI components in an existing codebase, run this **6-point diagnostic audit** on `package.json`:

### Check 1: React & Framework Runtime
- **Verify:** React 18+ or React 19.
- **Red Flag:** React 16/17 class components, outdated Next.js Pages router (`pages/` directory when creating new apps).
- **Remedy:** Use modern React hooks, Server Components (if Next.js App Router), and standard TypeScript interfaces.

### Check 2: Styling & CSS Architecture
- **Verify:** Tailwind CSS v3.4 or v4 with `@tailwindcss/postcss`.
- **Red Flag:** Mixing Tailwind with raw global CSS classes, conflicting CSS-in-JS libraries (styled-components runtime overhead), or legacy Sass files.
- **Remedy:** Consolidate into standard Tailwind utility tokens and CSS variables.

### Check 3: Accessible Primitives Audit (Missing Components)
- **Verify:** Are accessible dialogs, dropdowns, and tooltips powered by an unstyled primitive library (e.g., `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@headlessui/react`)?
- **Red Flag:** Custom hand-rolled `<div onClick=...>` modals that fail WCAG keyboard accessibility, lack focus trapping, and do not close on `Escape`.
- **Remedy:** Recommend installing the missing primitive:
  ```bash
  npm i @radix-ui/react-dialog @radix-ui/react-dropdown-menu
  ```

### Check 4: Iconography Coherence
- **Verify:** Exactly **one** icon system (preferably `lucide-react`).
- **Red Flag:** Mixing multiple icon sets (e.g. FontAwesome + React Icons + Heroicons) leading to mismatched stroke weights and visual discord.
- **Remedy:** Standardize on Lucide React with explicit `size-4` (16px) or `size-5` (20px) tokens.

### Check 5: Form Handling & Validation
- **Verify:** `zod` paired with `react-hook-form`.
- **Red Flag:** Unvalidated HTML forms dumping raw alerts or submitting without client-side blur validation.
- **Remedy:** Prescribe standard Zod schema resolution:
  ```bash
  npm i react-hook-form @hookform/resolvers zod
  ```

### Check 6: Animation System
- **Verify:** Lightweight `framer-motion` (or `@motionone/dom` / pure CSS).
- **Red Flag:** Bulky obsolete animation packages (e.g. Animate.css, Velocity.js) or unconstrained `transition-all`.
- **Remedy:** Direct adoption of `references/motion-physics.md` spring presets.

---

## 3. Intelligent Stack Prescription (When User Does Not Specify)

If the user asks: *"Build me a dashboard for tracking edge compute logs"* without specifying tools, announce the **Architectural Stack Recommendation**:

> **Recommended Production Stack:**
> - **Framework:** Next.js 15 (React 19, TypeScript)
> - **Styling:** Tailwind CSS v4 with neutral zinc luminance stepping
> - **Primitives:** Radix UI (`@radix-ui/react-dialog`, `@radix-ui/react-popover`)
> - **Icons:** Lucide React (monochrome 16px)
> - **Data & Tables:** TanStack Table v8 (virtualized row performance)
> - **Motion:** Framer Motion spring physics (`stiffness: 400, damping: 30`)
