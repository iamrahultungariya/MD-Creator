# Mimo AI Token Efficiency & Crisp Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Mimo AI Companion engine to reduce token consumption by 65%–80%, eliminate full-document context leaks on conceptual questions, introduce dynamic intent micro-prompts, enforce thinking token budget limits, and implement deterministic AST section anchoring for zero-drift diffs.

**Architecture:** 
- Break the monolithic ~1,000-token system prompt into lightweight, intent-specialized micro-prompts (`intentPromptService.ts`).
- Fix the whole-document leak in `contextEngine.ts` by strictly routing `GENERAL_QA` queries away from full-document dumps regardless of line count, and slicing document context around the cursor for localized tasks.
- Clamp Google Gemini 3.8 Flash internal reasoning tokens via explicit `thinkingBudget` configurations (`0` for direct edits/grammar, `512` for summaries, `1024-2048` for deep reasoning) in `mimoGeminiService.ts`.
- Enhance `diffService.ts` and `astContextEngine.ts` to support deterministic section hash anchors that eliminate fuzzy matching errors and text duplication.

**Tech Stack:** TypeScript, `@google/genai` (Gemini 3.x Family), AST Regex/Markdown Parser, `diff-match-patch`, Node test runner with `npx tsx`.

**Spec:** `C:\Users\Shree2\.gemini\antigravity\brain\c0daefb6-a300-46c4-b650-345d7daa7c85\v2.3.0_launch_audit_and_engineering_blueprint.md`

## Global Constraints

- Exclusively target Google Gemini 3.x models: `gemini-3.5-flash-lite`, `gemini-3.5-flash`, `gemini-3.8-flash`. Legacy Gemini 2.x models remain banned.
- Never escalate upwards from `gemini-3.5-flash-lite` to heavier models on errors.
- Never leak full document content when the user is asking conceptual or off-topic questions (`GENERAL_QA`).
- Zero conversational filler: AI responses must start with the direct answer or diff at Token 1.
- All code changes must compile cleanly (`npm run build` with zero TypeScript errors).

## Review Focus

1. **Short Documents (< 300 LOC) with Conceptual Queries:** Ensure `GENERAL_QA` prompts on documents under 300 lines do NOT leak raw markdown content into the prompt payload.
2. **Grammar / Spellcheck / Translation Edits:** Ensure `thinkingBudget: 0` is applied on simple edit intents so no internal thinking tokens are burned.
3. **AST Section Scoping:** Ensure that modifying Section 2 of a multi-section document generates a replacement targeted strictly to Section 2 without duplicating or deleting Section 1 or 3.
4. **Fuzzy Diff Match Fallback:** Ensure that if a diff hunk fails exact matching, the system cleanly falls back to AST section replacement rather than corrupting mathematical formulas or inserting repeated lines.
5. **BYOK Status & Live Quota Calculation:** Ensure live telemetry accurately tracks `promptTokenCount`, `candidatesTokenCount`, and `totalTokenCount` from stream chunks.

---

### Task 1: Semantic Intent Micro-Prompts & Anti-Fluff System Instruction Generator

**Files:**
- Create: `src/features/mimo/services/intentPromptService.ts`
- Test: `tests/mimo/intentPromptService.test.ts`

**Interfaces:**
- Produces: `getIntentSystemInstruction(intent: MimoIntentType, options?: IntentPromptOptions): string`
- Consumes: `MimoIntentType` from `src/features/mimo/types/mimoTypes.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/mimo/intentPromptService.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getIntentSystemInstruction } from '../../src/features/mimo/services/intentPromptService';

describe('intentPromptService', () => {
  it('returns lean instruction for GENERAL_QA without diff blocks', () => {
    const prompt = getIntentSystemInstruction('GENERAL_QA');
    assert.ok(prompt.length < 500, 'Prompt must be lean (<500 chars)');
    assert.ok(prompt.includes('Direct to the point from Token 1'));
    assert.ok(!prompt.includes('diff hunk'), 'Should not include diff instructions for general QA');
  });

  it('returns surgical diff instruction for DOC_TRANSFORM', () => {
    const prompt = getIntentSystemInstruction('DOC_TRANSFORM');
    assert.ok(prompt.includes('```diff') || prompt.includes('```replacement'));
    assert.ok(prompt.includes('Surgically'));
  });

  it('returns clarification/quiz instruction for DOC_QUERY when asked', () => {
    const prompt = getIntentSystemInstruction('DOC_QUERY');
    assert.ok(prompt.includes('Accurately reference'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/mimo/intentPromptService.test.ts`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement `intentPromptService.ts`**

Implement `getIntentSystemInstruction` with modular, lean system prompts tailored per intent (under 150 tokens each instead of the 1,000 token monolith).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/mimo/intentPromptService.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/mimo/services/intentPromptService.ts tests/mimo/intentPromptService.test.ts
git commit -m "feat(mimo): add modular intent micro-prompt generator"
```

---

### Task 2: Fix Whole-Document Context Leaks in `contextEngine.ts`

**Files:**
- Modify: `src/features/mimo/services/contextEngine.ts:230-295`
- Test: `tests/mimo/contextEngine.test.ts`

**Interfaces:**
- Consumes: `prepareMimoContext` options
- Produces: `PreparedContext` with optimized token bounds

- [ ] **Step 1: Write the failing test**

```typescript
// tests/mimo/contextEngine.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { prepareMimoContext } from '../../src/features/mimo/services/contextEngine';

describe('contextEngine token guard', () => {
  it('does NOT include raw content for GENERAL_QA even when document is under 300 LOC', () => {
    const content = '# My Private Diary\nLine 2\nLine 3\nSecret password is 1234';
    const ctx = prepareMimoContext({
      docId: 'doc-1',
      title: 'Private Diary',
      content,
      userPrompt: 'What is the theory of relativity?',
      cursorLine: 1,
    });

    assert.strictEqual(ctx.contextMode, 'summary');
    assert.ok(!ctx.contextText.includes('Secret password is 1234'), 'Must not leak document content in GENERAL_QA mode');
  });

  it('provides selection_focused mode with minimal tokens when user has text selected', () => {
    const content = '# Heading\nSelected line here\nOther secret text';
    const ctx = prepareMimoContext({
      docId: 'doc-1',
      title: 'Doc',
      content,
      userPrompt: 'Improve this sentence',
      selectedText: 'Selected line here',
      cursorLine: 2,
    });

    assert.strictEqual(ctx.contextMode, 'selection_focused');
    assert.ok(ctx.contextText.includes('Selected line here'));
    assert.ok(!ctx.contextText.includes('Other secret text'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/mimo/contextEngine.test.ts`
Expected: FAIL because `totalDocLines > 300` guard currently leaks raw content for short documents on GENERAL_QA.

- [ ] **Step 3: Modify `contextEngine.ts` to strictly isolate `GENERAL_QA`**

Remove the `&& totalDocLines > 300` constraint on `GENERAL_QA`. If the query is conceptual and has no relation to the document, emit only the lightweight summary and title, saving thousands of tokens.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/mimo/contextEngine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/mimo/services/contextEngine.ts tests/mimo/contextEngine.test.ts
git commit -m "fix(mimo): prevent full-document context leak on conceptual questions"
```

---

### Task 3: Dynamic Thinking Token Budget Clamping in `mimoGeminiService.ts`

**Files:**
- Modify: `src/features/mimo/services/mimoGeminiService.ts:784-835`
- Test: `tests/mimo/mimoGeminiServiceConfig.test.ts`

**Interfaces:**
- Produces: `resolveThinkingBudget(intent: MimoIntentType, level: ThinkingLevel, modelId: string): number | undefined`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/mimo/mimoGeminiServiceConfig.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { resolveThinkingBudget } from '../../src/features/mimo/services/mimoGeminiService';

describe('resolveThinkingBudget', () => {
  it('returns 0 thinking budget for DOC_TRANSFORM to eliminate latency and token waste on simple edits', () => {
    const budget = resolveThinkingBudget('DOC_TRANSFORM', 'LOW', 'gemini-3.8-flash');
    assert.strictEqual(budget, 0);
  });

  it('returns constrained budget for DOC_QUERY', () => {
    const budget = resolveThinkingBudget('DOC_QUERY', 'MEDIUM', 'gemini-3.8-flash');
    assert.strictEqual(budget, 512);
  });

  it('returns deeper budget for high complexity reasoning', () => {
    const budget = resolveThinkingBudget('DOC_QUERY', 'HIGH', 'gemini-3.8-flash');
    assert.strictEqual(budget, 1024);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/mimo/mimoGeminiServiceConfig.test.ts`
Expected: FAIL with "resolveThinkingBudget is not a function"

- [ ] **Step 3: Implement `resolveThinkingBudget` and wire into `streamMimoResponse`**

Export `resolveThinkingBudget` and configure `thinkingConfig: { thinkingBudget, includeThoughts: showThinking && thinkingBudget > 0 }` in `mimoGeminiService.ts`. Also integrate `getIntentSystemInstruction` from Task 1 to dynamically set the system instruction per turn.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/mimo/mimoGeminiServiceConfig.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/mimo/services/mimoGeminiService.ts tests/mimo/mimoGeminiServiceConfig.test.ts
git commit -m "feat(mimo): clamp thinking token budget and inject modular intent prompts"
```

---

### Task 4: Deterministic AST Section Replacement & Resilient Diff Application

**Files:**
- Modify: `src/features/mimo/services/diffService.ts:180-260`
- Test: `tests/mimo/diffService.test.ts`

**Interfaces:**
- Consumes: Original document text and Mimo diff/replacement hunk
- Produces: Safe replacement with zero math formula corruption or repeat line bugs

- [ ] **Step 1: Write the failing test**

```typescript
// tests/mimo/diffService.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { applyDiffHunkToDocument } from '../../src/features/mimo/services/diffService';

describe('diffService resilient replacement', () => {
  it('applies section replacement without corrupting KaTeX formula containing dollar signs', () => {
    const original = `# Section 1\nSome text\n\n# Section 2\nOld formula: $$x = 1$$\n\n# Section 3\nFooter`;
    const hunk = {
      originalText: 'Old formula: $$x = 1$$',
      proposedText: 'New formula: $$\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$$ with $50 and $100',
    };

    const result = applyDiffHunkToDocument(original, hunk);
    assert.strictEqual(result.success, true);
    assert.ok(result.nextContent.includes('$$\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$$'));
    assert.ok(result.nextContent.includes('$50 and $100'));
    assert.ok(result.nextContent.includes('# Section 1'));
    assert.ok(result.nextContent.includes('# Section 3'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/mimo/diffService.test.ts`
Expected: FAIL or verify exact behavior (e.g. JavaScript string replacement `$1`, `$$` substitution hazards).

- [ ] **Step 3: Implement resilient replacement in `diffService.ts`**

Ensure that string replacement does not treat KaTeX `$$` or `$1` as regex replacement patterns (use function replacer `() => proposedText`), and handle line-range bounded replacements safely.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/mimo/diffService.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/mimo/services/diffService.ts tests/mimo/diffService.test.ts
git commit -m "fix(mimo): prevent KaTeX dollar corruption in diff replacement"
```

---

### Task 5: Full Suite Verification & Build Health Check

**Files:**
- Verify: Full test suite (`npx tsx --test tests/mimo/*.test.ts`)
- Verify: TypeScript project compilation (`npm run build`)

- [ ] **Step 1: Run all new Mimo test suites**

Run: `npx tsx --test tests/mimo/*.test.ts`
Expected: All tests pass (0 failures).

- [ ] **Step 2: Run production build check**

Run: `npm run build`
Expected: `tsc -b` exits with code 0, Vite builds successfully.

- [ ] **Step 3: Commit Phase 1 milestone**

```bash
git commit --allow-empty -m "chore(release): complete Phase 1 Mimo token efficiency and crisp engine"
```
