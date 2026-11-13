# The 35 UI/UX Laws Comprehensive Handbook

> **Core Philosophy:** True frontend engineering unites psychological human perception with mathematical design systems. Every rule below includes a **Theoretical Rationale**, **Banned Anti-Pattern (DON'T)**, and **Production React 19 / Tailwind v4 Implementation (DO)**.

---

## Domain 1: Visual Hierarchy & Spatial Layout

### 1. Fitts's Law
- **Principle:** The time required to rapidly acquire a target is a function of the ratio between the distance to the target and the width of the target.
- **DON'T:** Tiny 12px text links or microscopic 24px icon buttons tucked away in upper desktop corners on mobile devices.
- **DO:** Size primary interactive targets to at least 44×44px. Anchor critical mobile actions in the natural thumb reach zone (bottom 30% of viewport).
```tsx
// DO: Mobile-accessible floating action bar in thumb zone
<div className="fixed bottom-4 inset-x-4 z-40 sm:static sm:inset-auto">
  <button className="w-full sm:w-auto h-12 px-6 bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-sm rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors active:scale-[0.98]">
    <span>Deploy changes</span>
    <kbd className="hidden sm:inline font-mono text-xs opacity-60">⌘↵</kbd>
  </button>
</div>
```

### 2. Hick's Law
- **Principle:** The time it takes to make a decision increases logarithmically with the number and complexity of choices.
- **DON'T:** A navigation bar with 9 dropdown menus, or pricing tiers with 6 different columns and 30 unorganized bullet points.
- **DO:** Strip non-essential options. Cap primary navigation to 4–5 links. Cap pricing to 2–3 transparent tiers.
```tsx
// DO: Streamlined primary navigation
<nav className="flex items-center gap-6">
  <a href="#features" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">Features</a>
  <a href="#pricing" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">Pricing</a>
  <a href="#docs" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">Documentation</a>
  <a href="/login" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors ml-auto">Sign In</a>
  <a href="/signup" className="text-sm font-medium text-zinc-950 bg-zinc-100 hover:bg-white px-3.5 py-1.5 rounded-md transition-colors">
    Start Free
  </a>
</nav>
```

### 3. Law of Proximity
- **Principle:** Objects that are near, or proximate to each other, tend to be grouped together.
- **DON'T:** Equal spacing between input labels, inputs, helper text, and neighboring form fields (e.g. `margin-bottom: 16px` everywhere).
- **DO:** Use tight spacing (4px–6px) between a label and its associated input; use larger spacing (20px–24px) between separate field groups.
```tsx
// DO: Proximity-calibrated form field
<div className="space-y-6">
  <div className="space-y-1.5">
    <label htmlFor="apiKey" className="block text-xs font-medium text-zinc-300">API Key Secret</label>
    <input id="apiKey" type="password" className="w-full h-9 px-3 rounded-md bg-[#111113] border border-white/[0.08] text-sm text-zinc-100 focus:outline-none focus:border-zinc-400" />
    <p className="text-[11px] text-zinc-500">Encrypted at rest using AES-256 GCM.</p>
  </div>
</div>
```

### 4. The 8pt Spatial Grid
- **Principle:** Consistent spacing multiples create a subconscious rhythm and eliminate arbitrary visual friction.
- **DON'T:** Arbitrary CSS values like `margin: 13px; padding: 21px; gap: 17px;`.
- **DO:** Base all padding, margin, gaps, and heights on multiples of 8px (`8px`, `16px`, `24px`, `32px`, `48px`, `64px`, `96px`). Reserve 4px only for compact chips and badges.
```tsx
// DO: 8pt spatial container
<section className="py-16 px-6 sm:px-8 max-w-6xl mx-auto space-y-12">
  <div className="space-y-4 max-w-xl">
    <h2 className="text-2xl font-semibold tracking-[-0.02em] text-zinc-100">Audit logs</h2>
    <p className="text-sm text-zinc-400 leading-[1.6]">Full tamper-evident ledger of workspace actions.</p>
  </div>
</section>
```

### 5. Visual Hierarchy via Scale and Weight
- **Principle:** Users scan interfaces in descending order of visual dominance rather than reading sequentially.
- **DON'T:** Making headlines, labels, and text all 16px bold or relying on bright colored backgrounds to force prominence.
- **DO:** Construct clear jumps in font size (`48px` -> `20px` -> `14px`), font weight (`600` -> `500` -> `400`), and contrast opacity (`text-zinc-100` -> `text-zinc-400` -> `text-zinc-600`).
```tsx
// DO: Triple-tier hierarchy
<div className="space-y-2">
  <span className="font-mono text-xs uppercase tracking-wider text-emerald-400">Production Ready</span>
  <h1 className="text-4xl sm:text-5xl font-semibold tracking-[-0.035em] text-zinc-100 leading-tight">
    Zero-latency edge routing.
  </h1>
  <p className="text-base text-zinc-400 leading-relaxed max-w-lg">
    Distribute compute across 300+ edge nodes with automatic rollback on fatal exceptions.
  </p>
</div>
```

### 6. Miller's Law (Chunking)
- **Principle:** The average human can only hold 7 (± 2) items in working memory at one time.
- **DON'T:** Unbroken 15-field checkout forms or unchunked 40-item preference lists.
- **DO:** Group dense information into cohesive clusters of 3 to 5 items with distinct subheadings or step divisions.
```tsx
// DO: Multi-step chunked checkout or settings
<div className="divide-y divide-white/[0.06] border border-white/[0.07] rounded-lg bg-[#111113]">
  <div className="p-6 space-y-4">
    <h3 className="text-sm font-medium text-zinc-200">1. Cluster Environment</h3>
    {/* 3 clean inputs */}
  </div>
  <div className="p-6 space-y-4">
    <h3 className="text-sm font-medium text-zinc-200">2. Replicas & Autoscaling</h3>
    {/* 3 clean inputs */}
  </div>
</div>
```

### 7. Whitespace Is an Active Structural Tool
- **Principle:** Negative space guides attention and communicates elegance.
- **DON'T:** Cramming every square pixel with decorative widgets, icons, gradients, and boxes to avoid "empty space".
- **DO:** Use generous padding (`py-20`, `px-8`) to frame high-priority value propositions without surrounding borders.
```tsx
// DO: Structural whitespace framing
<div className="py-24 text-center space-y-6">
  <h2 className="text-3xl font-medium tracking-tight text-zinc-100">Simplicity is the final layer.</h2>
  <p className="text-sm text-zinc-400 max-w-md mx-auto">No telemetry bloat. No background daemon overhead.</p>
</div>
```

### 8. F-Pattern and Z-Pattern Scanning
- **Principle:** Users scan content-heavy pages in an F-pattern (top horizontal, second horizontal, vertical left sweep) and landing pages in a Z-pattern.
- **DON'T:** Putting vital labels or primary CTAs in unpredictable bottom-right dead zones where eyes never track.
- **DO:** Align critical value props and navigational anchors along natural F/Z scan paths.
```tsx
// DO: Top-left to top-right Z-pattern header
<div className="flex items-center justify-between pb-8 border-b border-white/[0.06]">
  <div className="flex items-center gap-3">
    <span className="font-mono font-bold text-sm text-zinc-100">ANTISLOP//</span>
    <span className="text-xs text-zinc-500 font-mono">v3.0</span>
  </div>
  <button className="text-xs font-mono uppercase tracking-wider px-3 py-1.5 border border-white/[0.1] rounded text-zinc-200 hover:bg-white/[0.04]">
    Connect Terminal
  </button>
</div>
```

### 9. Law of Common Region
- **Principle:** Elements tend to be perceived into groups if they are sharing an area with a clearly defined boundary.
- **DON'T:** Over-nesting cards inside cards inside cards (Russian-doll syndrome).
- **DO:** Use a single shared container boundary (`border border-white/[0.07] bg-[#111113]`) and group internal items with subtle dividers or whitespace.
```tsx
// DO: Single common region with internal divide-y
<div className="border border-white/[0.07] bg-[#111113] rounded-lg overflow-hidden">
  <div className="p-4 border-b border-white/[0.06] bg-white/[0.02]">
    <h3 className="text-xs font-mono uppercase text-zinc-400">Active API Keys</h3>
  </div>
  <div className="divide-y divide-white/[0.06]">
    <div className="p-4 flex justify-between text-sm text-zinc-200">...</div>
    <div className="p-4 flex justify-between text-sm text-zinc-200">...</div>
  </div>
</div>
```

---

## Domain 2: Interaction, Navigation & Cognitive Load

### 10. Jakob's Law
- **Principle:** Users expect your site to work like all the other sites they already know.
- **DON'T:** Inventing bizarre custom navigation patterns (e.g. putting the site search bar at the bottom-left or reversing modal close button conventions).
- **DO:** Place search in the header (`⌘K`), logo on the top-left, user avatar on the top-right, and close buttons on dialog top-rights.
```tsx
// DO: Universal command search pattern
<button className="flex items-center gap-3 px-3 py-1.5 rounded-md border border-white/[0.08] bg-white/[0.02] text-xs text-zinc-400 hover:border-white/[0.15] transition-colors">
  <SearchIcon className="size-3.5 text-zinc-500" />
  <span>Search documentation...</span>
  <kbd className="font-mono text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded text-zinc-400">⌘K</kbd>
</button>
```

### 11. Progressive Disclosure
- **Principle:** Only show users what they need right now; defer advanced or edge-case configuration to secondary disclosures.
- **DON'T:** Displaying 40 advanced database tuning parameters immediately on initial cluster creation.
- **DO:** Show 3 essential fields (Name, Region, Tier) with an expandable "Advanced Network Configuration" disclosure.
```tsx
// DO: Clean disclosure pattern
<details className="group border border-white/[0.06] rounded-md p-3 [&_summary::-webkit-details-marker]:hidden">
  <summary className="flex items-center justify-between cursor-pointer text-xs font-medium text-zinc-400 hover:text-zinc-200">
    <span>Advanced VPC Peering Settings</span>
    <ChevronDownIcon className="size-3.5 transition-transform group-open:rotate-180" />
  </summary>
  <div className="pt-3 space-y-3">
    {/* Advanced fields */}
  </div>
</details>
```

### 12. Tesler's Law (Conservation of Complexity)
- **Principle:** Every application has an inherent amount of complexity that cannot be removed, only shifted to developer code or user burden.
- **DON'T:** Forcing users to enter raw ISO timestamps, calculate timezones, or manually format currency inputs.
- **DO:** Auto-detect timezones, format currency on blur, and provide sensible defaults for every optional field.
```tsx
// DO: Auto-calculated intelligent default
<input
  defaultValue={Intl.DateTimeFormat().resolvedOptions().timeZone}
  className="h-9 px-3 bg-[#111113] border border-white/[0.08] rounded text-sm text-zinc-200"
/>
```

### 13. Recognition Over Recall
- **Principle:** Minimize cognitive memory load by making elements, actions, and options visible.
- **DON'T:** Hiding filter criteria inside hidden modals so users forget what query filters are currently active.
- **DO:** Display active filter pills with 1-click removal tags directly above data tables.
```tsx
// DO: Active filter pills
<div className="flex items-center gap-2 flex-wrap mb-4">
  <span className="text-xs text-zinc-500">Filtered by:</span>
  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-xs text-zinc-300">
    Status: Failed
    <button onClick={clearFilter} className="hover:text-white">×</button>
  </span>
</div>
```

### 14. Minimum 44×44px Touch Targets
- **Principle:** Small interactive targets lead to user frustration and mis-taps.
- **DON'T:** Standalone 16px icon buttons with zero hit area padding.
- **DO:** Ensure all clickable targets measure at least 44×44px on touch viewports via padding or minimum sizing.
```tsx
// DO: 44px minimum tap target with compact visual icon
<button className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05] transition-colors">
  <SettingsIcon className="size-4" />
</button>
```

### 15. One Primary Action Per View
- **Principle:** Multiple high-contrast buttons create visual conflict and decision paralysis.
- **DON'T:** Rendering three different solid bright buttons side by side ("Save", "Export", "Deploy").
- **DO:** Render exactly ONE high-contrast primary filled button; downgrade secondary actions to outline or ghost buttons.
```tsx
// DO: Primary + Secondary hierarchy
<div className="flex items-center gap-3">
  <button className="h-9 px-4 rounded-md border border-white/[0.08] bg-transparent text-xs text-zinc-300 hover:bg-white/[0.04] transition-colors">
    Save draft
  </button>
  <button className="h-9 px-4 rounded-md bg-zinc-100 text-zinc-950 text-xs font-medium hover:bg-white transition-colors shadow-sm">
    Publish to Production
  </button>
</div>
```

### 16. Aesthetic-Usability Effect
- **Principle:** Users perceive visually polished interfaces as more usable and trustworthy.
- **DON'T:** Sloppy typography alignments, inconsistent borders, and mismatched margins.
- **DO:** Crisp 1px hairline borders, optical alignment, and balanced typography scales.

### 17. Pair Icons With Text Labels
- **Principle:** Beyond search, home, and close, most standalone icons are ambiguous.
- **DON'T:** A row of 8 unexplained icons in a toolbar forcing users to hover to reveal tooltips.
- **DO:** Always pair navigation icons with concise text labels.
```tsx
// DO: Icon + Text pairing
<button className="flex items-center gap-2 text-xs text-zinc-300 hover:text-white px-2.5 py-1.5 rounded hover:bg-white/[0.04]">
  <TerminalIcon className="size-3.5 text-zinc-500" />
  <span>SSH Terminal</span>
</button>
```

### 18. Prevent Cumulative Layout Shift (CLS)
- **Principle:** Sudden shifts while images and async data load cause accidental clicks.
- **DON'T:** Rendering dynamic banners or images without fixed aspect ratios or reserved placeholders.
- **DO:** Reserve explicit aspect ratios (`aspect-video`, `aspect-square`) and skeleton blocks before async content arrives.
```tsx
// DO: Reserved aspect-ratio container
<div className="w-full aspect-[16/9] bg-white/[0.03] border border-white/[0.06] rounded-lg overflow-hidden relative">
  <img src="/hero-preview.webp" width={1280} height={720} alt="Product UI" className="object-cover w-full h-full" fetchPriority="high" />
</div>
```

---

## Domain 3: Typography, Color & Accessibility

### 19. WCAG Contrast Ratios (4.5:1 Minimum)
- **Principle:** Text must remain legible across diverse displays and ambient lighting.
- **DON'T:** Using light gray text (`text-zinc-600`) on dark gray backgrounds (`#18181B`), resulting in a 2.1:1 ratio.
- **DO:** Ensure body text maintains at least 4.5:1 contrast against its background (`text-zinc-200` on `#09090B` yields 13.5:1).

### 20. Optimal Line Length (50–75 Characters)
- **Principle:** Lines that stretch edge-to-edge across a 1440px display cause the eye to lose its anchor on return sweeps.
- **DON'T:** Unconstrained paragraphs spreading full-width across large screens (`w-full`).
- **DO:** Constrain body containers to roughly 65 characters (`max-w-[65ch]` or `max-w-prose`).
```tsx
<p className="text-sm sm:text-base text-zinc-400 leading-[1.6] max-w-[65ch]">
  Deterministic token synthesis ensures that every generated component aligns with established design systems rather than defaulting to arbitrary LLM hallucinations.
</p>
```

### 21. The 60-30-10 Color Rule
- **Principle:** 60% neutral canvas, 30% structural surface, 10% high-contrast accent.
- (Full mathematical breakdown implemented in `references/design-system-math.md`).

### 22. Never Rely on Color Alone
- **Principle:** Roughly 8% of males experience color vision deficiency.
- **DON'T:** Relying solely on red vs. green circles to denote error vs. success states.
- **DO:** Pair color with distinct icons and explicit textual status labels.
```tsx
// DO: Multi-cue accessible status indicator
<div className="flex items-center gap-2">
  <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
  <span className="font-mono text-xs text-zinc-300">Healthy (0 errors)</span>
</div>
```

### 23. Generous Line Height (1.4x–1.6x)
- **Principle:** Cramped vertical text makes long reading exhausting; loose headline text looks disconnected.
- **DO:** Body text: `leading-[1.6]`. Large headings: `leading-[1.08]`.

### 24. Disciplined Modular Type Scale
- **Principle:** Arbitrary font sizes create visual clutter.
- **DO:** Lock scale to: `11px` (micro), `12px` (meta), `14px` (body-sm), `16px` (body), `20px` (h3), `24px` (h2), `36px` (h1), `48px` (display). Cap font families to maximum 2 (Primary Sans + Monospace).

### 25. Desaturate Colors in Dark Mode
- **Principle:** Pure saturated neons against pitch-black backgrounds cause optical vibration (halation).
- **DO:** Slightly desaturate accent colors in dark mode (e.g. `emerald-400` instead of saturated `emerald-600`).

### 26. Visible Keyboard Focus Rings
- **Principle:** Removing focus rings makes keyboard navigation impossible.
- **DON'T:** `outline: none` without custom replacement.
- **DO:** Distinct focus ring: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B]`.

### 27. Left-Align Body Copy
- **Principle:** Centered multi-line paragraphs create ragged left edges that disrupt reading flow.
- **DON'T:** Centering multi-line body descriptions or feature summaries.
- **DO:** Left-align all paragraphs exceeding 2 lines; reserve center alignment strictly for short hero titles.

---

## Domain 4: Feedback, Forms & Micro-UX

### 28. Doherty Threshold (Under 400ms Response)
- **Principle:** When computer and user interact at a pace under 400ms, productivity and flow peak.
- **DO:** Use optimistic UI updates for likes, toggles, and status updates, reverting gracefully only on server failure.
```tsx
// DO: Optimistic state update
function toggleFavorite(id: string) {
  setOptimisticStarred((prev) => !prev);
  api.updateStar(id).catch(() => setOptimisticStarred((prev) => !prev));
}
```

### 29. Skeleton Screens Over Spinners
- **Principle:** Centered loading spinners highlight wait times; skeleton shimmers preview incoming layouts.
- **DO:** Layout-matching shimmers using `bg-white/[0.04] animate-pulse`.

### 30. Inline, Constructive Form Validation
- **Principle:** Dumping a list of 10 errors after form submission causes abandonment.
- **DO:** Validate fields on blur (`onBlur`), highlight the specific border in subtle red (`border-rose-500/50`), and display a constructive fix hint directly below.

### 31. Purposeful Empty States
- **Principle:** A blank white box leaves new users stranded.
- **DO:** A 1px dashed container explaining what belongs there, along with a primary creation CTA and keyboard shortcut badge.

### 32. Prefer Undo Over Confirmation Modals
- **Principle:** Habitual "Are you sure?" dialogs train users to blindly click Yes.
- **DO:** Execute non-catastrophic actions immediately, surfacing a 5-second toast notification with an [Undo] button.
```tsx
// DO: Timed toast with undo action
toast("Deployment archived", {
  action: {
    label: "Undo",
    onClick: () => restoreDeployment(id),
  },
});
```

### 33. Placeholders Are Not Labels
- **Principle:** Placeholder text inside an input vanishes the second the user types, destroying context.
- **DO:** Always keep persistent `<label>` tags above inputs. Use placeholder text solely for formatting hints (e.g., `e.g. postgresql://user:pass@host/db`).

### 34. Peak-End Rule
- **Principle:** Users judge an entire experience by its emotional peak and its final moment.
- **DO:** Add tactile polish to key completion milestones (e.g., smooth success state after checkout, fast one-click copy on generated API keys).

### 35. Design Every Edge State Upfront
- **Principle:** Happy paths represent only 60% of real production usage.
- **DO:** Every view must explicitly implement: **Empty State**, **Loading Skeleton**, **Error Boundary with Retry**, **Offline Indicator**, and **Long Text Truncation (`truncate min-w-0`)**.
