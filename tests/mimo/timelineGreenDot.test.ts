import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Task 2: Remove Green Dots in Mimo 3.5 Flash-Lite Thought & Timeline', () => {
  it('strictly excludes green/emerald dot styling in MimoExecutionTimeline.tsx', () => {
    const code = fs.readFileSync('src/features/mimo/components/MimoExecutionTimeline.tsx', 'utf-8');

    assert.ok(
      !code.includes('bg-emerald') && !code.includes('text-emerald') && !code.includes('border-emerald'),
      'MimoExecutionTimeline.tsx must not contain any emerald/green dot styling'
    );
  });

  it('uses clean monochrome/neutral styling for thought status and completed nodes', () => {
    const code = fs.readFileSync('src/features/mimo/components/MimoExecutionTimeline.tsx', 'utf-8');

    assert.ok(
      code.includes('bg-neutral') || code.includes('dark:bg-neutral') || code.includes('bg-white'),
      'MimoExecutionTimeline.tsx must use neutral antislop styling'
    );
  });
});
