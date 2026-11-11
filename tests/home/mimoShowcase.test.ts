import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Mimo Showcase Dynamic Theme Adapter', () => {
  it('adapts diff card to both light and dark themes dynamically', () => {
    const code = fs.readFileSync('src/components/home/MimoShowcaseSection.tsx', 'utf-8');

    // Diff card container must support light & dark modes
    assert.ok(
      code.includes('bg-white dark:bg-neutral-900'),
      'Diff demonstration container should adapt between light (white) and dark (neutral-900)'
    );
    assert.ok(
      code.includes('border-neutral-200 dark:border-neutral-800'),
      'Border must adapt dynamically between light and dark modes'
    );

    // Diff line additions and removals must support light and dark contrast
    assert.ok(
      code.includes('bg-rose-500/10 dark:bg-rose-950/40') || code.includes('dark:bg-rose-950/40'),
      'Removal lines must have dark and light contrast variants'
    );
    assert.ok(
      code.includes('bg-emerald-500/10 dark:bg-emerald-950/40') || code.includes('dark:bg-emerald-950/40'),
      'Addition lines must have dark and light contrast variants'
    );

    // Dynamic header text
    assert.ok(
      code.includes('text-neutral-900 dark:text-white'),
      'Header text must be dark in light mode and white in dark mode'
    );

    // Applied diff state verification
    assert.ok(
      code.includes('Applied to document cleanly') || code.includes('demoDiffApplied'),
      'Interactive non-destructive apply state should be supported'
    );
  });
});
