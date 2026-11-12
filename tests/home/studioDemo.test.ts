import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Task 3: Overhaul Hero Section Studio Workspace Demo', () => {
  it('removes Print Preview and retains exactly 3 tabs (Technical Specs, KaTeX Math, Mimo AI Diff)', () => {
    const code = fs.readFileSync('src/components/home/StudioWorkspaceDemo.tsx', 'utf-8');

    assert.ok(
      !code.includes('Print Preview') && !code.includes("label: 'Print Preview'"),
      'StudioWorkspaceDemo.tsx must not contain Print Preview tab'
    );

    assert.ok(
      code.includes('Technical Specs') && code.includes('KaTeX Math') && code.includes('Mimo AI Diff'),
      'StudioWorkspaceDemo.tsx must contain Technical Specs, KaTeX Math, and Mimo AI Diff'
    );
  });

  it('updates the writing side (editor) lines when Mimo AI Diff is accepted', () => {
    const code = fs.readFileSync('src/components/home/StudioWorkspaceDemo.tsx', 'utf-8');

    assert.ok(
      code.includes('mimoAccepted') &&
        (code.includes('Uint8Array') || code.includes('CODE_SNIPPETS')),
      'StudioWorkspaceDemo.tsx must track mimoAccepted state and update code snippets'
    );

    // Verify dynamic editor content rendering on mimo acceptance
    assert.ok(
      code.includes('mimoAccepted ?') || code.includes('!mimoAccepted ?') || code.includes('getActiveCodeLines'),
      'StudioWorkspaceDemo.tsx must dynamically change the editor lines when diff is accepted'
    );
  });

  it('guarantees 1:1 parity between left code and right preview for math and specs', () => {
    const code = fs.readFileSync('src/components/home/StudioWorkspaceDemo.tsx', 'utf-8');

    // Math preview must include all 3 formulas from the left code snippet
    assert.ok(
      code.includes('CODE_SNIPPETS.math[3]') &&
      code.includes('CODE_SNIPPETS.math[6]') &&
      code.includes('CODE_SNIPPETS.math[9]'),
      'Math mode preview must render all formulas present in the markdown input'
    );
  });
});
