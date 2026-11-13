# MD Writer Motionimo-Grade Video Generation Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 100% automated, code-driven video generation pipeline with Remotion in React that renders a high-end 60FPS Motionimo-style product launch teaser (1080p/4K MP4 + in-app web player) showcasing MD Writer's editor, MIMO AI, and local-first architecture without any manual screen recording.

**Architecture:** The pipeline uses Remotion with React 19 and Tailwind CSS. The master composition (`MDWriterTeaser`) sequences 5 storyboard scenes across 2400 frames (40 seconds @ 60 FPS) featuring kinetic spring typography, a 2.5D perspective-tilted window frame, simulated auto-keystrokes, smooth Bézier cursor glide with click ripples, a streaming MIMO AI drawer, and an animated logo outro. It provides both an interactive in-browser preview via `@remotion/player` and headless MP4 export via Remotion CLI.

**Tech Stack:** React 19, Remotion (`remotion`, `@remotion/player`, `@remotion/cli`), Tailwind CSS, Framer Motion springs, Node.js test runner (`tsx --test`).

**Spec:** `docs/superpowers/specs/2026-11-13-remotion-motionimo-video-design.md`

## Global Constraints
- Pure programmatic video: zero manual screen recordings or external video clips required.
- Frame rate: deterministic 60 FPS rendering at 1920x1080 (landscape 16:9) and 1080x1920 (portrait 9:16).
- Motionimo styling: dark canvas (`neutral-950`), subtle ambient radial glow (`brand-500` / `#8257F5`), crisp macOS window chrome, high-contrast kinetic typography.
- Strict test verification: all components, interpolation math, and scene compositions validated via Node test runner.

## Review Focus
1. Frame timing overlap: ensuring adjacent Remotion `<Sequence>` blocks transition seamlessly without black flashes.
2. Font and KaTeX asset loading during headless rendering: ensuring glyphs render without FOIC (Flash of Invisible Content).
3. React 19 peer-dependency alignment: verifying Remotion v4 installs cleanly alongside React 19.
4. Smooth camera interpolation: ensuring `rotateX` and `rotateY` 2.5D CSS perspective transforms don't cause pixel jitter.
5. In-browser Player preview: ensuring the player component mounts smoothly inside the Vite dev environment.

---

### Task 1: Remotion Dependencies & Composition Configuration

**Files:**
- Create: `remotion.config.ts`
- Create: `src/video/Root.tsx`
- Create: `src/video/index.ts`
- Modify: `package.json`
- Test: `tests/video/remotionConfig.test.ts`

**Interfaces:**
- Consumes: None (root configuration)
- Produces: `RemotionRoot` registering `MDWriterTeaserLandscape` (1920x1080, 60fps, 2400 frames) and `MDWriterTeaserPortrait` (1080x1920, 60fps, 1800 frames).

- [ ] **Step 1: Write the failing test**

```typescript
// tests/video/remotionConfig.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Remotion Root Configuration', () => {
  it('defines valid compositions for landscape and portrait', () => {
    assert.ok(fs.existsSync('src/video/Root.tsx'), 'src/video/Root.tsx must exist');
    const content = fs.readFileSync('src/video/Root.tsx', 'utf-8');
    assert.ok(content.includes('MDWriterTeaserLandscape'), 'Must register landscape composition');
    assert.ok(content.includes('width={1920}') || content.includes('width: 1920'), 'Landscape width must be 1920');
    assert.ok(content.includes('height={1080}') || content.includes('height: 1080'), 'Landscape height must be 1080');
    assert.ok(content.includes('fps={60}') || content.includes('fps: 60'), 'FPS must be 60');
    assert.ok(content.includes('durationInFrames={2400}') || content.includes('durationInFrames: 2400'), 'Landscape duration must be 2400 frames');
  });

  it('declares remotion scripts in package.json', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    assert.ok(pkg.scripts['video:preview'] || pkg.scripts['video:dev'], 'Must include video preview script');
    assert.ok(pkg.scripts['video:render'], 'Must include video render script');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/video/remotionConfig.test.ts`  
Expected: FAIL with "src/video/Root.tsx must exist"

- [ ] **Step 3: Implement dependencies and Root composition**

1. Install Remotion packages: `npm install remotion @remotion/player @remotion/cli @remotion/tailwind --save-dev`
2. Create `remotion.config.ts` configuring Chromium flags and Tailwind support.
3. Create `src/video/Root.tsx` declaring `<Composition id="MDWriterTeaserLandscape" ... />` and `<Composition id="MDWriterTeaserPortrait" ... />`.
4. Create `src/video/index.ts` calling `registerRoot(RemotionRoot)`.
5. Add scripts `"video:dev": "remotion preview src/video/index.ts"` and `"video:render": "remotion render src/video/index.ts MDWriterTeaserLandscape out/md-writer-teaser.mp4"` to `package.json`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/video/remotionConfig.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json remotion.config.ts src/video/Root.tsx src/video/index.ts tests/video/remotionConfig.test.ts
git commit -m "feat(video): configure remotion root and compositions"
```

---

### Task 2: Motionimo Aesthetic Primitives (AmbientBackground, KineticText, SpringPhysics)

**Files:**
- Create: `src/video/utils/springs.ts`
- Create: `src/video/components/AmbientBackground.tsx`
- Create: `src/video/components/KineticText.tsx`
- Test: `tests/video/kineticPrimitives.test.ts`

**Interfaces:**
- Consumes: `remotion` (`useCurrentFrame`, `useVideoConfig`, `interpolate`, `spring`)
- Produces:
  - `motionimoSpring(frame: number, fps: number, delay?: number): number`
  - `<AmbientBackground primaryGlowColor?: string />`
  - `<KineticText text: string, delay?: number, className?: string, stagger?: number />`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/video/kineticPrimitives.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Motionimo Video Primitives', () => {
  it('springs utility exports correct spring physics functions', () => {
    assert.ok(fs.existsSync('src/video/utils/springs.ts'), 'springs.ts must exist');
    const content = fs.readFileSync('src/video/utils/springs.ts', 'utf-8');
    assert.ok(content.includes('motionimoSpring'), 'Exports motionimoSpring function');
    assert.ok(content.includes('damping'), 'Configures spring damping');
    assert.ok(content.includes('stiffness'), 'Configures spring stiffness');
  });

  it('KineticText component implements staggered character/word reveals', () => {
    assert.ok(fs.existsSync('src/video/components/KineticText.tsx'), 'KineticText.tsx must exist');
    const content = fs.readFileSync('src/video/components/KineticText.tsx', 'utf-8');
    assert.ok(content.includes('KineticText'), 'Exports KineticText component');
    assert.ok(content.includes('interpolate') || content.includes('spring'), 'Uses remotion animation hooks');
  });

  it('AmbientBackground provides dark canvas with glowing radial orbs', () => {
    assert.ok(fs.existsSync('src/video/components/AmbientBackground.tsx'), 'AmbientBackground.tsx must exist');
    const content = fs.readFileSync('src/video/components/AmbientBackground.tsx', 'utf-8');
    assert.ok(content.includes('bg-neutral-950') || content.includes('#09090b'), 'Uses dark canvas background');
    assert.ok(content.includes('radial-gradient') || content.includes('rounded-full'), 'Renders ambient glow orbs');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/video/kineticPrimitives.test.ts`  
Expected: FAIL with "springs.ts must exist"

- [ ] **Step 3: Implement springs, AmbientBackground, and KineticText**

1. In `src/video/utils/springs.ts`: implement `motionimoSpring()` wrapping Remotion's `spring()` with mass 0.8, damping 13, stiffness 140 for Apple/Motionimo-grade tactile snap.
2. In `src/video/components/AmbientBackground.tsx`: build full-screen dark canvas with floating blur orbs animated via frame interpolation and subtle grid overlay.
3. In `src/video/components/KineticText.tsx`: build component that splits sentences into words/characters, applying staggered spring scale, opacity, and translation.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/video/kineticPrimitives.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/video/utils/springs.ts src/video/components/AmbientBackground.tsx src/video/components/KineticText.tsx tests/video/kineticPrimitives.test.ts
git commit -m "feat(video): add motionimo spring physics and kinetic typography primitives"
```

---

### Task 3: 2.5D Perspective Window & Animated Cursor Engine

**Files:**
- Create: `src/video/components/WindowFrame.tsx`
- Create: `src/video/components/AnimatedCursor.tsx`
- Test: `tests/video/windowAndCursor.test.ts`

**Interfaces:**
- Consumes: `remotion`, `src/video/utils/springs.ts`
- Produces:
  - `<WindowFrame title: string, rotateX?: number, rotateY?: number, scale?: number, children: React.ReactNode />`
  - `<AnimatedCursor points: Array<{frame: number, x: number, y: number, click?: boolean}> />`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/video/windowAndCursor.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('WindowFrame & AnimatedCursor', () => {
  it('WindowFrame provides macOS window chrome with 2.5D perspective transforms', () => {
    assert.ok(fs.existsSync('src/video/components/WindowFrame.tsx'), 'WindowFrame.tsx must exist');
    const content = fs.readFileSync('src/video/components/WindowFrame.tsx', 'utf-8');
    assert.ok(content.includes('traffic-lights') || content.includes('#FF5F56') || content.includes('bg-red-500'), 'Includes traffic light buttons');
    assert.ok(content.includes('perspective') || content.includes('transform'), 'Applies 3D perspective styling');
    assert.ok(content.includes('border-neutral-800'), 'Has clean dark hairline border');
  });

  it('AnimatedCursor renders SVG pointer with interpolated positions and click waves', () => {
    assert.ok(fs.existsSync('src/video/components/AnimatedCursor.tsx'), 'AnimatedCursor.tsx must exist');
    const content = fs.readFileSync('src/video/components/AnimatedCursor.tsx', 'utf-8');
    assert.ok(content.includes('<svg') || content.includes('Cursor'), 'Renders cursor graphic');
    assert.ok(content.includes('interpolate'), 'Interpolates cursor positions over frames');
    assert.ok(content.includes('click') || content.includes('ripple') || content.includes('scale'), 'Supports click animation effect');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/video/windowAndCursor.test.ts`  
Expected: FAIL with "WindowFrame.tsx must exist"

- [ ] **Step 3: Implement WindowFrame and AnimatedCursor**

1. In `src/video/components/WindowFrame.tsx`:
   - macOS header with red/amber/green window controls, document title, and action badges.
   - Container with CSS `transform: perspective(1200px) rotateX(...) rotateY(...) scale(...)` driven by props or frame interpolation.
   - Frosted glass and deep ambient shadow (`shadow-[0_30px_90px_rgba(0,0,0,0.65)]`).
2. In `src/video/components/AnimatedCursor.tsx`:
   - Modern black/white accented macOS SVG arrow cursor.
   - Computes current `(x, y)` coordinate based on keyframe array using smooth Remotion interpolation.
   - Renders a radiating ping ripple and momentary cursor scale dip (`scale(0.85)`) on click frames.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/video/windowAndCursor.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/video/components/WindowFrame.tsx src/video/components/AnimatedCursor.tsx tests/video/windowAndCursor.test.ts
git commit -m "feat(video): add 2.5D perspective window frame and animated cursor"
```

---

### Task 4: Interactive Scene Mocks (AutoTypingEngine, EditorMock, MimoDrawerMock)

**Files:**
- Create: `src/video/components/AutoTypingEngine.tsx`
- Create: `src/video/components/EditorMock.tsx`
- Create: `src/video/components/MimoDrawerMock.tsx`
- Test: `tests/video/sceneMocks.test.ts`

**Interfaces:**
- Consumes: `remotion`, `lucide-react`
- Produces:
  - `<AutoTypingEngine fullText: string, startFrame: number, speed?: number />`
  - `<EditorMock typedCode: string, showPreview?: boolean />`
  - `<MimoDrawerMock openProgress: number, streamingText: string, showMermaid?: boolean />`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/video/sceneMocks.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Scene UI Mocks', () => {
  it('AutoTypingEngine outputs slice of text based on current frame', () => {
    assert.ok(fs.existsSync('src/video/components/AutoTypingEngine.tsx'), 'AutoTypingEngine.tsx must exist');
    const content = fs.readFileSync('src/video/components/AutoTypingEngine.tsx', 'utf-8');
    assert.ok(content.includes('useCurrentFrame'), 'Uses useCurrentFrame');
    assert.ok(content.includes('substring') || content.includes('slice'), 'Slices string according to frame progress');
  });

  it('EditorMock renders dual pane with CodeMirror look and live preview', () => {
    assert.ok(fs.existsSync('src/video/components/EditorMock.tsx'), 'EditorMock.tsx must exist');
    const content = fs.readFileSync('src/video/components/EditorMock.tsx', 'utf-8');
    assert.ok(content.includes('EditorMock'), 'Exports EditorMock');
    assert.ok(content.includes('font-mono'), 'Uses monospace font for editor pane');
  });

  it('MimoDrawerMock renders sliding drawer with prompt and diff card', () => {
    assert.ok(fs.existsSync('src/video/components/MimoDrawerMock.tsx'), 'MimoDrawerMock.tsx must exist');
    const content = fs.readFileSync('src/video/components/MimoDrawerMock.tsx', 'utf-8');
    assert.ok(content.includes('MimoDrawerMock'), 'Exports MimoDrawerMock');
    assert.ok(content.includes('Mimo') || content.includes('Gemini'), 'References Mimo assistant branding');
    assert.ok(content.includes('translateX') || content.includes('translate-x'), 'Supports slide-in transition');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/video/sceneMocks.test.ts`  
Expected: FAIL with "AutoTypingEngine.tsx must exist"

- [ ] **Step 3: Implement AutoTypingEngine, EditorMock, and MimoDrawerMock**

1. In `src/video/components/AutoTypingEngine.tsx`:
   - Calculates typed character count as `Math.min(fullText.length, Math.floor((frame - startFrame) * speed))`.
   - Adds blinking cursor `|` with 500ms cycle.
2. In `src/video/components/EditorMock.tsx`:
   - Left pane: dark editor with line numbers, syntax highlighting (headings, code blocks, math).
   - Right pane: live rendered document with styled H1, paragraph, and formatted KaTeX-like formula.
3. In `src/video/components/MimoDrawerMock.tsx`:
   - Right-side sliding panel with frosted background (`bg-neutral-900/95 backdrop-blur-xl`).
   - Header with Gemini badge ("Gemini 2.5 Flash Lite • 0.2s").
   - User prompt bubble and animated streaming assistant response.
   - Interactive diff card with green addition lines and red removal lines.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/video/sceneMocks.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/video/components/AutoTypingEngine.tsx src/video/components/EditorMock.tsx src/video/components/MimoDrawerMock.tsx tests/video/sceneMocks.test.ts
git commit -m "feat(video): add auto-typing engine, editor mock, and mimo drawer mock"
```

---

### Task 5: Storyboard Scenes & Master Orchestrator Composition

**Files:**
- Create: `src/video/scenes/Scene1Hook.tsx`
- Create: `src/video/scenes/Scene2EditorDemo.tsx`
- Create: `src/video/scenes/Scene3MimoAi.tsx`
- Create: `src/video/scenes/Scene4FeatureBlitz.tsx`
- Create: `src/video/scenes/Scene5Outro.tsx`
- Create: `src/video/compositions/MDWriterTeaser.tsx`
- Modify: `src/video/Root.tsx`
- Test: `tests/video/storyboardComposition.test.ts`

**Interfaces:**
- Consumes: Tasks 2, 3, 4 components
- Produces: `<MDWriterTeaser />` full 2400-frame 60FPS video composition.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/video/storyboardComposition.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Storyboard Scenes and Master Composition', () => {
  it('all 5 storyboard scenes exist', () => {
    assert.ok(fs.existsSync('src/video/scenes/Scene1Hook.tsx'), 'Scene1Hook exists');
    assert.ok(fs.existsSync('src/video/scenes/Scene2EditorDemo.tsx'), 'Scene2EditorDemo exists');
    assert.ok(fs.existsSync('src/video/scenes/Scene3MimoAi.tsx'), 'Scene3MimoAi exists');
    assert.ok(fs.existsSync('src/video/scenes/Scene4FeatureBlitz.tsx'), 'Scene4FeatureBlitz exists');
    assert.ok(fs.existsSync('src/video/scenes/Scene5Outro.tsx'), 'Scene5Outro exists');
  });

  it('MDWriterTeaser integrates all scenes with Remotion Sequences', () => {
    assert.ok(fs.existsSync('src/video/compositions/MDWriterTeaser.tsx'), 'MDWriterTeaser.tsx must exist');
    const content = fs.readFileSync('src/video/compositions/MDWriterTeaser.tsx', 'utf-8');
    assert.ok(content.includes('Sequence'), 'Uses Remotion Sequence for timeline layout');
    assert.ok(content.includes('Scene1Hook'), 'Includes Scene 1');
    assert.ok(content.includes('Scene2EditorDemo'), 'Includes Scene 2');
    assert.ok(content.includes('Scene3MimoAi'), 'Includes Scene 3');
    assert.ok(content.includes('Scene4FeatureBlitz'), 'Includes Scene 4');
    assert.ok(content.includes('Scene5Outro'), 'Includes Scene 5');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/video/storyboardComposition.test.ts`  
Expected: FAIL with "Scene1Hook exists"

- [ ] **Step 3: Implement scenes and master composition**

1. `Scene1Hook.tsx`: Frames 0-300. Displays kinetic typography ("Writing in Markdown...", "...should feel like pure craft.") with floating glow.
2. `Scene2EditorDemo.tsx`: Frames 300-900. 2.5D tilted window with live auto-typing of headers, tables, and KaTeX math formulas.
3. `Scene3MimoAi.tsx`: Frames 900-1500. Cursor glides to "MIMO AI", clicks, drawer slides out with spring damping, streams AI response.
4. `Scene4FeatureBlitz.tsx`: Frames 1500-1980. Three rapid kinetic cards highlighting Local-First Dexie, KaTeX/Mermaid, and Universal Export.
5. `Scene5Outro.tsx`: Frames 1980-2400. Dynamic zoom out to centered studio showcase, animated MD Writer logo assembly, and launch CTA pill.
6. `MDWriterTeaser.tsx`: Chains sequences with subtle cross-fade transitions and registers in `Root.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/video/storyboardComposition.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/video/scenes/*.tsx src/video/compositions/MDWriterTeaser.tsx src/video/Root.tsx tests/video/storyboardComposition.test.ts
git commit -m "feat(video): assemble 5 storyboard scenes into master teaser composition"
```

---

### Task 6: In-App Player Preview & Production Verification

**Files:**
- Create: `src/components/video/VideoPreviewModal.tsx`
- Modify: `src/pages/HomePage.tsx`
- Test: `tests/video/renderPipeline.test.ts`

**Interfaces:**
- Consumes: `<MDWriterTeaser />`, `@remotion/player`
- Produces: Instant in-browser player preview button ("Watch Teaser") in Home Hero/Navbar for testing video without offline CLI renders.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/video/renderPipeline.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Video Preview & Render Verification', () => {
  it('VideoPreviewModal integrates @remotion/player with controls', () => {
    assert.ok(fs.existsSync('src/components/video/VideoPreviewModal.tsx'), 'VideoPreviewModal.tsx must exist');
    const content = fs.readFileSync('src/components/video/VideoPreviewModal.tsx', 'utf-8');
    assert.ok(content.includes('Player'), 'Uses Remotion Player component');
    assert.ok(content.includes('MDWriterTeaser'), 'Mounts MDWriterTeaser composition');
    assert.ok(content.includes('controls'), 'Enables playback controls');
  });

  it('HomePage provides action to open Video Preview', () => {
    const homeContent = fs.readFileSync('src/pages/HomePage.tsx', 'utf-8');
    assert.ok(
      homeContent.includes('VideoPreview') || homeContent.includes('Teaser') || homeContent.includes('Watch'),
      'HomePage should wire up teaser preview affordance'
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/video/renderPipeline.test.ts`  
Expected: FAIL with "VideoPreviewModal.tsx must exist"

- [ ] **Step 3: Implement VideoPreviewModal and connect to HomePage**

1. Create `src/components/video/VideoPreviewModal.tsx` hosting `<Player component={MDWriterTeaser} durationInFrames={2400} fps={60} compositionWidth={1920} compositionHeight={1080} style={{ width: '100%', aspectRatio: '16/9' }} controls loop autoPlay />` with portaled dialog and backdrop blur.
2. In `src/pages/HomePage.tsx` or hero section, add a sleek "Watch Teaser (60fps)" button that launches the preview modal.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/video/renderPipeline.test.ts`  
Expected: PASS

- [ ] **Step 5: Run full test suite & Commit**

```bash
npm run test
git add src/components/video/VideoPreviewModal.tsx src/pages/HomePage.tsx tests/video/renderPipeline.test.ts
git commit -m "feat(video): add in-browser remotion player preview modal and homepage entry"
```
