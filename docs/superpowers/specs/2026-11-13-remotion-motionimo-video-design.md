# MD Writer Motionimo-Grade Video Generation Engine Specification

**Date:** 2026-11-13  
**Target Output:** 4K / 1080p 60FPS MP4 & Web Player Preview  
**Paradigm:** 100% Automated Code-Driven Motion Graphics (Remotion + React + Tailwind + Spring Physics)  
**Style Reference:** [Motionimo.xyz Inspirations](https://motionimo.xyz/) (Linear, Raycast, Apple-style product reveal)  

---

## 1. Intent & The Why

MD Writer is a precision, local-first markdown studio with real-time KaTeX math, Mermaid diagrams, and private Gemini AI assistance. To showcase MD Writer effectively on Product Hunt, Twitter/X, GitHub, and landing pages, high-retention video assets are needed.

Manual screen recordings often suffer from shaky cursor movements, inconsistent pacing, low contrast, and tedious editing cycles. By implementing a **100% automated, code-driven video generator using Remotion**, we achieve:
1. **Deterministic Quality:** Pixel-perfect 60 FPS rendering at 1080p / 4K.
2. **Zero Manual Recording:** Keystrokes, cursor paths, window tilts, and streaming AI responses are simulated mathematically via code.
3. **Instant Reusability:** Any future UI updates or new features can be regenerated in seconds by rerunning a script.

---

## 2. Approaches Considered & Trade-off Analysis

### Approach 1: Desktop Screen Recording (Recordly / Screen Studio) + Assembly
* *Pros:* Captures real native OS window and live user interaction.
* *Cons:* Requires human recording; cursor pacing can vary; hard to automate in CI/CD; cannot programmatically inject kinetic 3D typography or custom spring animations easily.

### Approach 2: 100% Automated Remotion Engine (Selected)
* *Pros:* 100% programmatic in React. Leverages existing Tailwind design tokens and UI mock components. Perfectly reproducible, renders 60fps MP4 without recording overhead, supports both in-browser `@remotion/player` preview and headless CLI rendering.
* *Cons:* Requires coding the mock keystroke timeline and simulated cursor paths.
* *Selection Reason:* Exactly satisfies user requirement for an automated, reproducible Motionimo-style video without manual recording.

### Approach 3: Blender 3D Procedural Pipeline
* *Pros:* True photorealistic 3D raytraced glass and metallic laptop shaders.
* *Cons:* Higher render time per frame, requires 3D mesh pipelines, less agile for quick UI copy edits.

---

## 3. Video Architecture & Storyboard (40 Seconds @ 60 FPS = 2400 Frames)

```
0s                  5s                 15s                 25s                 33s                40s
|----- Scene 1 -----|----- Scene 2 -----|----- Scene 3 -----|----- Scene 4 -----|----- Scene 5 -----|
  Kinetic Hook        2.5D Studio Tilt     MIMO AI & Cursor    Feature Blitz       Hero Outro & CTA
  Spring Typography   Live Auto-Typing     Spring Drawer       Snappy Cards        MD Writer Logo
```

### Scene 1: Kinetic Hook (Frames 0 - 300 / 0s - 5s)
* **Background:** Deep dark canvas (`#09090b`) with animated ambient radial illumination (`brand-500` / violet-blue gradient orb pulsing slowly).
* **Typography:** Kinetic spring reveal:
  * Line 1: *"Writing in Markdown..."* (Spring stagger from `opacity: 0, translateY: 30px`).
  * Line 2: *"...should feel like pure craft."* (High-contrast white with subtle shimmer gradient).
* **Pacing:** Fast, confident, high retention.

### Scene 2: 2.5D Perspective Window & Auto-Typing (Frames 300 - 900 / 5s - 15s)
* **Window Frame:** macOS-style frosted dark frame with traffic-light window controls (`#FF5F56`, `#FFBD2E`, `#27C93F`), hairline border (`border-neutral-800`), and deep drop shadow (`shadow-2xl`).
* **3D Perspective Camera:** Dynamic CSS 3D transform (`perspective(1200px)` with interpolated `rotateX(8deg) -> rotateX(0deg)` and `rotateY(-12deg) -> rotateY(0deg)` easing in).
* **Auto-Typing Simulation:**
  * Animated typing engine that prints markdown characters sequentially with realistic human cadence (25-45ms variance).
  * Heading 1: `# Q3 Product Architecture`
  * Math formula: `$$\mathcal{L}_{total} = \lambda_1 \mathcal{L}_{recon} + \lambda_2 \mathcal{L}_{kl}$$`
  * Instant dual-pane rendering with live KaTeX rendering.

### Scene 3: MIMO AI & Smooth Cursor Glide (Frames 900 - 1500 / 15s - 25s)
* **Animated Cursor:** Sleek SVG cursor smoothly tracking a cubic-bezier path from bottom-left to the "Ask Mimo" trigger button.
* **Click Physics:** Cursor scale dips (`scale(0.85)`), emitting an expanding radial ring ripple (`ring-2 ring-brand-500/50`).
* **MIMO Drawer Animation:** Slides in from the right edge with spring damping (`stiffness: 120, damping: 14`).
* **AI Streaming Response:** Animated token stream: *"Refactoring document structure & generating Mermaid flow..."* followed by a rendered interactive diagram card.

### Scene 4: Feature Blitz (Frames 1500 - 1980 / 25s - 33s)
* Rapid 3-card snap transitions with camera panning:
  1. **Card 1: 100% Local-First** — IndexedDB badge, 0ms latency, zero cloud leaks.
  2. **Card 2: LaTeX & Mermaid Native** — Precision typesetting preview.
  3. **Card 3: Universal Export** — Clean badges for PDF, DOCX, and HTML export.

### Scene 5: Hero Outro & Call to Action (Frames 1980 - 2400 / 33s - 40s)
* **Camera:** Smooth zoom out to centered studio showcase.
* **Logo Assembly:** Glowing MD Writer emblem with animated draw-stroke.
* **Tagline:** *"MD Writer 2.3 — The High-Density Markdown Studio."*
* **CTA Pill:** *"Available now on Web & Desktop • GitHub Open Source"* with glowing border highlight.

---

## 4. Technical Stack & Component Design

* **Remotion Core:** `remotion`, `@remotion/player`, `@remotion/cli`
* **Styling:** Tailwind CSS (`@remotion/tailwind` or utility classes)
* **Physics Engine:** Remotion native `spring()` and `interpolate()`
* **Resolution Configurations:**
  * `Landscape1080p`: 1920x1080, 60fps, 2400 frames (40s)
  * `PortraitShorts`: 1080x1920, 60fps, 1800 frames (30s)

---

## 5. Constraints & Quality Gates
* **No External Video Recording:** All visual elements are pure React/SVG/HTML.
* **Strict Performance:** Zero lag during preview, deterministically renders to MP4 via Chromium headless in Remotion CLI.
* **Anti-AI Slop Aesthetic:** Dark mode palette, neutral gray tones (`neutral-950`, `neutral-900`), electric violet accent (`#8257F5`), no garish multi-colored neon gradients.
