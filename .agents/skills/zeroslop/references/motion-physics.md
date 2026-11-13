# Motion Physics & Choreography Playbook

> **Strict Motion Law:** Animations in professional frontend applications exist solely to **clarify spatial mental models, confirm user interaction, and guide visual focus**. Infinite floating, bouncing icons, and slow transitions (`transition-all duration-500`) are strictly banned.

---

## 1. The Core Motion Laws

1. **Ban `transition-all`:** Never use `transition-all`. Animate only the specific changing properties: `transition-[transform,opacity]`, `transition-colors`, or `transition-[border-color,background-color]`. Animating width, height, or padding triggers expensive browser layout reflows (causes jank).
2. **The 180ms Duration Cap:** Micro-interactions (hover, active, focus) must complete within **120ms–180ms** (`duration-150 ease-out`). Any hover transition taking longer than 200ms feels unresponsive and sluggish.
3. **No Gimmick Animations:**
   - ❌ `animate-bounce` on feature icons or buttons.
   - ❌ Floating/bobbing up-and-down image loops.
   - ❌ Neon glowing border pulses (`animate-pulse` on decorative badges).
   - ❌ Extreme button zoom (`hover:scale-110`).

---

## 2. Spring Physics Presets (Framer Motion)

Modern high-taste UIs replace linear or cubic-bezier easing with **physical spring dynamics**:

```ts
// Framer Motion Spring Presets
export const motionSprings = {
  // 1. SNAPPY: For modals, dropdowns, command palettes, and tooltips
  snappy: {
    type: "spring",
    stiffness: 400,
    damping: 30,
    mass: 0.8,
  },

  // 2. SMOOTH LAYOUT: For accordion expands, tab indicator shifts, and drawer panels
  smoothLayout: {
    type: "spring",
    stiffness: 300,
    damping: 28,
    mass: 1,
  },

  // 3. TACTILE TAP: For button clicks and card presses
  tactileTap: {
    scale: 0.98,
    transition: { duration: 0.1, ease: "easeOut" },
  },
} as const;
```

### Ready-to-Use Component Variants:
```tsx
import { motion } from 'framer-motion';

// Command Palette / Modal Enter Animation
export const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: -4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.12, ease: "easeIn" },
  },
};

// Staggered List Choreography
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 25 },
  },
};
```

---

## 3. Pure CSS / Tailwind v4 Choreography Tokens

When building lightweight interfaces without Framer Motion, use these exact Tailwind v4 utility tokens:

```tsx
// 1. Interactive Button Micro-Press
<button className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs rounded-md transition-[background-color,transform] duration-150 ease-out active:scale-[0.98] active:translate-y-[0.5px]">
  Save changes
</button>

// 2. Subtle Card Hover Shift (2px Lift, No Glow)
<div className="border border-white/[0.07] bg-[#111113] p-6 rounded-lg transition-[border-color,background-color] duration-150 ease-out hover:border-white/[0.14] hover:bg-[#141417]">
  ...
</div>

// 3. Sliding Active Tab Indicator
<div className="relative flex items-center gap-1 border-b border-white/[0.06] pb-px">
  <button className="px-3 py-2 text-xs font-medium text-zinc-100 border-b-2 border-white translate-y-px">
    Overview
  </button>
  <button className="px-3 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors">
    Audit Log
  </button>
</div>
```

---

## 4. Accessibility & Reduced Motion Mandate

All custom motion must respect the user's operating system preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

In Tailwind v4:
```tsx
<div className="transition-transform duration-150 motion-reduce:transition-none motion-reduce:transform-none">
  ...
</div>
```
