import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Core Values Section Anti-Slop Check', () => {
  it('implements 3 distinct architectural pillars without icon boxes', () => {
    const code = fs.readFileSync('src/components/home/CoreValuesSection.tsx', 'utf-8');
    assert.ok(code.includes('Your thoughts stay on your machine'), 'Local storage pillar');
    assert.ok(code.includes('zero markup on artificial intelligence'), 'BYOK AI pillar');
    assert.ok(code.includes('Print-perfect output every single time'), 'Export pillar');
    assert.ok(!code.includes('h-12 w-12 rounded-xl bg-violet-500/20'), 'No glowing AI icon boxes');
  });
});
