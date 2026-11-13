# BANNED ➔ MANDATORY REPLACEMENT Matrix Playbook

> **Strict Architectural Rule:** LLMs fail when given negative constraints alone ("Don't use purple gradients"). Every negative rule in this matrix has an **exact, deterministic, copy-pasteable replacement** with modern Tailwind v4 and React 19 tokens.

---

## 1. Visual & Color Systems

| AI Slop Anti-Pattern (BANNED) | High-Taste Replacement (MANDATORY) | Tailwind v4 Code Replacement |
| :--- | :--- | :--- |
| **Multi-stop Text Gradient**<br>`bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent` | **Solid High-Contrast Typography**<br>High-contrast primary statement with muted secondary words. | `<h1 className="text-zinc-100 font-semibold tracking-[-0.03em]">Instant database sync <span className="text-zinc-500 font-normal">without manual migration scripts.</span></h1>` |
| **Excessive Glassmorphism**<br>`backdrop-blur-md bg-white/10 border-white/20` applied to all cards and navbars. | **Tactile Solid Surfaces**<br>Luminance stepping with 1px crisp hairline boundary. No blur haze. | `<div className="bg-[#111113] border border-white/[0.07] rounded-lg p-6">` |
| **Muddy Blue-Gray Dark Mode**<br>`bg-slate-900 border-slate-700` or `#1f2937` backgrounds. | **Pure Neutral Stepping**<br>Neutral Zinc canvas `#09090B`, elevated cell `#111113`, control `#18181B`. | `<div className="bg-[#09090B] text-zinc-200">`<br>`<section className="bg-[#111113] border border-white/[0.07]">` |
| **Neon Drop Shadows & Glow**<br>`shadow-xl shadow-indigo-500/50` or colored borders. | **Specular Highlight & Inset Border**<br>Simulate physical elevation via top light reflection. | `<div className="shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] border border-white/[0.07] bg-[#111113]">` |
| **Floating Background Orbs**<br>Blurred radial colored gradient circles behind the hero section. | **Clean Hairline Blueprint or Pure Canvas**<br>Crisp 1px grid guides or unpolluted solid matte surface. | `<div className="border-x border-b border-zinc-900/[0.08] dark:border-white/[0.07]">` |
| **5+ Scattered Colors**<br>Random buttons in blue, badges in yellow, cards in purple. | **60-30-10 Disciplined Palette**<br>60% neutral canvas, 30% structural surface, 10% high-contrast accent. | Canvas: `bg-[#09090B]`, Structural: `bg-[#111113] border-white/[0.07]`, Accent: `text-emerald-400 bg-emerald-400/10` |

---

## 2. Layout & Spatial Architecture

| AI Slop Anti-Pattern (BANNED) | High-Taste Replacement (MANDATORY) | Tailwind v4 Code Replacement |
| :--- | :--- | :--- |
| **3 Equal Rounded Feature Cards**<br>Floating cards with `rounded-2xl shadow-lg gap-6` and centered text. | **1px Hairline Divided Grid**<br>Zero-gap shared boundary grid with exposed corner nodes or crosshairs. | `<div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-white/[0.06] border border-zinc-200 dark:border-white/[0.07]">` |
| **Floating Pill Navbar**<br>`fixed top-4 inset-x-8 rounded-full backdrop-blur-md` floating randomly. | **Full-Width Structural Topbar**<br>Anchored 1px bottom-bordered topbar with exact 56px height. | `<header className="sticky top-0 z-50 h-14 w-full border-b border-zinc-200 dark:border-white/[0.06] bg-[#09090B]/90 backdrop-blur-sm px-6 flex items-center justify-between">` |
| **Generic Bento Grid**<br>Random bento boxes of varying aspect ratios just to look "app-like". | **Flush Cell Matrix or Asymmetric Swiss Split**<br>Architectural matrix with 1px border dividers and purposeful density. | `<div className="grid grid-cols-12 gap-px bg-zinc-200 dark:bg-white/[0.07] border border-zinc-200 dark:border-white/[0.07]">` |
| **Card-Inside-Card Nesting**<br>Nested Russian-doll containers (`border -> p-4 -> border -> p-4`). | **Single Container Boundary**<br>Internal groupings separated by whitespace or 1px hairline dividers. | `<div className="border border-white/[0.07] bg-[#111113] p-4"><div className="divide-y divide-white/[0.04]">...</div></div>` |
| **Arbitrary Spacing Guesswork**<br>Mixing `p-3`, `p-5`, `mt-7`, `gap-9` haphazardly across components. | **Strict 8pt Spatial Rhythm**<br>Multiples of 8px (`8px`, `16px`, `24px`, `32px`, `48px`, `64px`). | `p-4` (16px), `p-6` (24px), `py-12` (48px), `gap-4` (16px). Half-step `p-1` (4px) only for micro chips. |

---

## 3. Decorative & Component Discipline

| AI Slop Anti-Pattern (BANNED) | High-Taste Replacement (MANDATORY) | Tailwind v4 Code Replacement |
| :--- | :--- | :--- |
| **Icon in Colored Rounded Box**<br>`bg-indigo-500/10 text-indigo-400 p-3 rounded-xl` above every feature. | **Bare 16px Monochrome Icon with Micro Monospace Label**<br>Direct optical alignment with cap-height. | `<div className="flex items-center gap-2"><svg className="size-4 text-zinc-400" .../><span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">Latency</span></div>` |
| **Emoji & Sparkle AI Badges**<br>`✨ AI Powered`, `🚀 Version 2.0` with glowing borders. | **Changelog-Style Status Pill**<br>Monospace metadata pill with a solid 6px status dot. | `<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-white/[0.08] bg-zinc-100 dark:bg-white/[0.03] font-mono text-xs text-zinc-400"><span className="size-1.5 rounded-full bg-emerald-500" />v2.4 · 14ms latency</span>` |
| **Uniform Pill-Shaped Everything**<br>Buttons, inputs, cards, dialogs all using `rounded-full` or `rounded-2xl`. | **Hierarchical Radius Nesting Formula**<br>$R_{\text{outer}} = R_{\text{inner}} + \text{Padding}$. Interactive items `rounded-md`, containers `rounded-lg`. | Inner button: `rounded-md` (6px) with `p-2` (8px) inside Outer container: `rounded-xl` (14px). |
| **Decorative Button Arrows**<br>Arrows (`→`, `↗`) attached to every single button on the page. | **Functional Iconography Only**<br>Arrow only when indicating external link navigation or next pagination step. | `<button className="px-4 py-2 bg-zinc-100 dark:bg-white text-zinc-900 font-medium text-sm rounded-md hover:bg-zinc-200 transition-colors">Create deployment</button>` |

---

## 4. Copywriting & Data Realism

| AI Slop Anti-Pattern (BANNED) | High-Taste Replacement (MANDATORY) | Tailwind v4 / Copy Replacement |
| :--- | :--- | :--- |
| **Em Dash (—)**<br>"Fast, reliable — and built for scale." | **Natural Human Punctuation**<br>Use comma, colon, period, or parentheses. | `"Fast, reliable, and built for scale."` or `"Production deployment: built for zero downtime."` |
| **Marketing Hype in Tool UI**<br>"Supercharge your workflow with our next-gen cutting-edge AI engine." | **Direct Functional Outcome Copy**<br>Say exactly what the software does in plain human language. | `"Automated schema migration with zero connection locks."` |
| **Fake Statistics**<br>`10K+ Happy Teams`, `99.9% Uptime`, `300% Speed boost`. | **Verifiable Metrics or No Metric Box**<br>Real domain telemetry or omit statistical cards entirely. | `"p95 query response: 18ms"` or `"Tested against 4,200 production tables."` |
| **Fictional Avatars & Testimonials**<br>AI avatar face with "John Doe, Lead Architect at TechCorp". | **Customer Proof with Logo / Domain**<br>Verifiable company name, verified quote, or omit the section. | Real quotes with clean text attribution, or skip testimonials when none exist. |
| **Generic CTAs**<br>"Get Started", "Learn More", "Try Now", "Discover". | **Context-Specific Action Verbs**<br>Verb that matches user expectation. | `"Create free workspace"`, `"Read deployment docs"`, `"Download CLI binary"`. |

---

## 5. UI State Completeness (The 4-State Law)

Every component fetching or displaying data must implement all four states in code:

```tsx
// Example: Complete 4-State Data View
export function DeploymentList({ deployments, isLoading, error }: Props) {
  // 1. LOADING STATE: Shimmer skeleton matching real layout, no center spinners
  if (isLoading) {
    return (
      <div className="divide-y divide-white/[0.06] border border-white/[0.07] rounded-lg overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 flex items-center justify-between animate-pulse bg-white/[0.02]">
            <div className="h-4 w-48 bg-white/[0.06] rounded" />
            <div className="h-4 w-20 bg-white/[0.06] rounded" />
          </div>
        ))}
      </div>
    );
  }

  // 2. ERROR STATE: Clear explanation + retry CTA
  if (error) {
    return (
      <div className="p-6 border border-rose-500/20 bg-rose-500/[0.03] rounded-lg flex items-center justify-between">
        <p className="text-sm text-rose-400">Failed to load deployments: {error.message}</p>
        <button onClick={retry} className="text-xs font-mono text-zinc-300 border border-white/[0.1] px-3 py-1.5 rounded hover:bg-white/[0.05]">
          Retry request
        </button>
      </div>
    );
  }

  // 3. ZERO / EMPTY STATE: Purposeful onboarding, no cheesy illustrations
  if (deployments.length === 0) {
    return (
      <div className="p-12 border border-dashed border-white/[0.1] rounded-lg text-center">
        <p className="text-sm text-zinc-400 mb-1">No active deployments found.</p>
        <p className="text-xs text-zinc-600 mb-4 font-mono">Connect a git repository to trigger your first build.</p>
        <button className="px-4 py-2 bg-zinc-100 text-zinc-950 text-sm font-medium rounded-md hover:bg-white">
          Create first deployment <kbd className="ml-1.5 font-mono text-xs opacity-60">⌘N</kbd>
        </button>
      </div>
    );
  }

  // 4. HAPPY PATH + OVERFLOW PROTECTION
  return (
    <ul className="divide-y divide-white/[0.06] border border-white/[0.07] rounded-lg overflow-hidden bg-[#111113]">
      {deployments.map((d) => (
        <li key={d.id} className="p-4 flex items-center justify-between gap-4">
          <span className="text-sm text-zinc-200 font-medium truncate min-w-0">{d.commitMessage}</span>
          <span className="font-mono text-xs text-zinc-500 shrink-0 tabular-nums">{d.durationMs}ms</span>
        </li>
      ))}
    </ul>
  );
}
```
