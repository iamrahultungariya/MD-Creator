import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Navbar Anti-AI Slop Compliance', () => {
  it('does not contain banned marketing clichés or glassmorphism', () => {
    const code = fs.readFileSync('src/components/home/Navbar.tsx', 'utf-8');
    assert.ok(!code.includes('backdrop-blur'), 'Should not use glassmorphism backdrop-blur');
    assert.ok(!code.includes('bg-gradient-to-r'), 'Should not use text gradients');
    assert.ok(code.includes('v2.3'), 'Should display v2.3 version indicator');
    assert.ok(code.includes('Open Studio'), 'Should provide tactile Open Studio button');
  });
});
